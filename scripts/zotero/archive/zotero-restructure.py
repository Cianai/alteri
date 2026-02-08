#!/usr/bin/env python3
"""
Zotero Collection Restructure Script

Migrates 227 collections to ~50 simplified structure:
- Alteri, Limerence Research, Thesis (root-level projects)
- Coursework (KCL Psychology, Harvard ALM, Archive)
- Methods (Network Analysis with subtypes, Psychometrics, etc.)
- Domains (Attachment & Relationships with priority subcollections, etc.)
- AI & Technology (Digital Mental Health, AI Safety & Ethics, HCI & Design)
- Reference (Classics, Books, Frameworks)
- Personal, Triage, xAssignment, Pinned (preserved)

Usage:
    python zotero-restructure.py --dry-run    # Preview changes
    python zotero-restructure.py --execute    # Apply changes
"""

import argparse
import json
import logging
from pathlib import Path
from typing import Optional
from pyzotero import zotero

# Configuration - from environment variables
import os
LIBRARY_ID = os.environ.get("ZOTERO_LIBRARY_ID", "YOUR_LIBRARY_ID")
LIBRARY_TYPE = "user"  # or "group"
API_KEY = os.environ.get("ZOTERO_API_KEY", "YOUR_API_KEY")

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("zotero-restructure.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# =============================================================================
# NEW COLLECTION STRUCTURE
# =============================================================================
# Format: {parent: children} where children can be:
#   - None: no subcollections
#   - list: simple subcollections
#   - dict: subcollections with their own children

NEW_STRUCTURE = {
    # Root-level active projects (no parent folder)
    # Alteri subcollections from screenshot (marked with arrows + existing)
    "Alteri": [
        # Marked with arrows (retain)
        "Alignment",
        "Avatar & Multimodal",
        "Benchmark & Frameworks",
        "Gamified Tasks & Tests",
        "NetworkScales",
        "SocialNetworkAnalysis",
        # Existing key subcollections
        "DepressionDetection",
        "TherapyTech",
        # Other visible subcollections to retain
        "AI for Scales & Quals",
        "AI/AR/HCI",
        "Borsboom",
        "Data & Integration",
        "Decision Support",
        "Effective, Ethics & Risk",
        "Interpretability",
        "Methods",
        "Networks: PSYNETS & UaB",
        "NLP & Social Synthetic",
        "SelfReflectionNetwork",
        "SimilarInspiration",
        "Theory, Tools & Tutorials",
    ],
    "Limerence Research": ["Preprint", "Websites"],
    "Thesis": None,

    # Coursework with course-specific subcollections
    "Coursework": ["KCL Psychology", "Harvard ALM", "Archive"],

    # Methods with Network Analysis having subtypes
    "Methods": {
        "Network Analysis": ["NetworkPsychopathology", "Multilayer", "Ego & Idiographic", "EMA"],
        "Psychometrics": None,
        "Longitudinal & ESM": None,
        "Meta-Analysis": None,
        "AI & NLP": None,
    },

    # Domains with priority areas having subcollections
    "Domains": {
        "Attachment & Relationships": ["AttachmentNetwork", "AttTrauma", "Relationship Science"],
        "Mood Disorders": None,
        "Trauma & ACE": None,
        "Cognition & Processing": ["Social & Interpersonal", "Biases & Heuristics", "Memory & Attention"],
        "Neuroscience": None,
        "Development": None,
        "Transdiagnostic": None,
        "Other Clinical": None,
    },

    "AI & Technology": ["Digital Mental Health", "AI Safety & Ethics", "HCI & Design"],
    "Reference": ["Classics & Foundational", "Books", "Frameworks & Theory"],
}

# Collections to preserve at root (don't archive, don't nest)
PRESERVE_COLLECTIONS = {"Personal", "Triage", "Pinned", "Books", "Meta-Analysis", "xAssignment"}

# Collections Claude should monitor weekly
CLAUDE_MONITORED = {"Triage", "xAssignment"}

# =============================================================================
# MIGRATION MAPPING
# =============================================================================
# Format: (patterns, target_path)
# Order matters - first match wins
# More specific patterns must come BEFORE general ones

MIGRATION_MAP = [
    # === ROOT-LEVEL PROJECTS ===
    # Alteri project - specific subcollections first (more specific before general)
    (["Alignment"], "Alteri/Alignment"),
    (["Avatar & Multimodal"], "Alteri/Avatar & Multimodal"),
    (["Benchmark & Frameworks"], "Alteri/Benchmark & Frameworks"),
    (["Gamified Tasks & Tests"], "Alteri/Gamified Tasks & Tests"),
    (["NetworkScales"], "Alteri/NetworkScales"),
    (["SocialNetworkAnalysis"], "Alteri/SocialNetworkAnalysis"),
    (["DepressionDetection"], "Alteri/DepressionDetection"),
    (["TherapyTech"], "Alteri/TherapyTech"),
    (["AI for Scales & Quals"], "Alteri/AI for Scales & Quals"),
    (["AI/AR/HCI"], "Alteri/AI/AR/HCI"),
    (["Borsboom"], "Alteri/Borsboom"),
    (["Data & Integration"], "Alteri/Data & Integration"),
    (["Decision Support"], "Alteri/Decision Support"),
    (["Effective, Ethics & Risk"], "Alteri/Effective, Ethics & Risk"),
    (["Interpretability"], "Alteri/Interpretability"),
    (["Networks: PSYNETS & UaB"], "Alteri/Networks: PSYNETS & UaB"),
    (["NLP & Social Synthetic"], "Alteri/NLP & Social Synthetic"),
    (["SelfReflectionNetwork"], "Alteri/SelfReflectionNetwork"),
    (["SimilarInspiration"], "Alteri/SimilarInspiration"),
    (["Theory, Tools & Tutorials"], "Alteri/Theory, Tools & Tutorials"),
    # General Alteri match last
    (["Alteri", "CIA-"], "Alteri"),
    # Note: "Mindfulness & AI" parent will be archived, but Alteri subcollection retained

    # Limerence Research (root level) - use exact key match, not "LA" which matches Multilayer
    (["Limerence", "K84WCA7T"], "Limerence Research"),

    # === COURSEWORK ===
    (["Mattering", "Ireland CMH", "Ireland MH", "Resilience", "Reslience", "ReslienceReadings",
      "CSLP", "CaseStudiesReadings"], "Coursework/KCL Psychology"),
    (["Harvard", "ALM"], "Coursework/Harvard ALM"),

    # === METHODS - Network Analysis with preserved subtypes ===
    (["NetworkPsychopathology", "NetworkPscyhopathology"], "Methods/Network Analysis/NetworkPsychopathology"),
    (["Multilayer"], "Methods/Network Analysis/Multilayer"),
    (["Ego & Idiographic"], "Methods/Network Analysis/Ego & Idiographic"),
    (["EMA"], "Methods/Network Analysis/EMA"),
    # General network methods go to parent
    (["FamilyNetworks", "LonelyNetworks", "SocialNetworkAnalysis"], "Methods/Network Analysis"),

    # Methods - Other
    (["Measures & Scales", "Psychometrics", "IRT", "TransScales", "Trait", "Self", "Social"], "Methods/Psychometrics"),
    (["Longitudinal", "Dyadic"], "Methods/Longitudinal & ESM"),
    (["Meta-Analysis"], "Methods/Meta-Analysis"),
    (["NLP", "ML", "AI for Scales", "AI Scales"], "Methods/AI & NLP"),
    (["NetworkTool"], "Methods/Network Analysis"),

    # === DOMAINS - Attachment with preserved priority subcollections ===
    (["AttachmentNetwork"], "Domains/Attachment & Relationships/AttachmentNetwork"),
    (["AttTrauma"], "Domains/Attachment & Relationships/AttTrauma"),
    (["Relationship Science"], "Domains/Attachment & Relationships/Relationship Science"),
    # General attachment/love papers go to parent
    (["Attachment", "Attraction & Love", "Love", "Romantic", "Bonds", "Singlehood",
      "Friends", "Peers", "FOMO", "Ghosting", "Rejection", "Loneliness", "AttractionInteraction"], "Domains/Attachment & Relationships"),

    # === DOMAINS - Cognition with merged subcollections ===
    (["Social Cognition", "Interpersonal", "Groups", "Incel"], "Domains/Cognition & Processing/Social & Interpersonal"),
    (["Heuristics", "Bias", "Forecasting", "Beliefs"], "Domains/Cognition & Processing/Biases & Heuristics"),
    (["Memory", "Attention", "DMN"], "Domains/Cognition & Processing/Memory & Attention"),
    # General cognition papers
    (["Metacognition", "Decision", "Interpretation", "Perception", "Processing",
      "Aberrant Salience", "Curiosity", "ImaginationFantasy", "State"], "Domains/Cognition & Processing"),

    # === DOMAINS - Other (flat) ===
    (["MDD", "Bipolar", "BFMH", "Anxiety", "ASAD", "Depression"], "Domains/Mood Disorders"),
    (["ACE", "Trauma", "Intergenerational", "Interegenerational"], "Domains/Trauma & ACE"),
    (["Basal Ganglia", "Dopamine", "Neuro", "fMRI", "HES Rewards", "Cui", "Neurophenomen"], "Domains/Neuroscience"),
    (["Child", "Adolescent", "Youth", "Family", "Maternal", "Paternal", "Parental",
      "Development", "Developmental", "Teen", "Heritability"], "Domains/Development"),
    (["Transdiagnostic", "RNT", "Rumination", "Emotion Regulation", "Emotional Regulation", "Executive Function",
      "IoU", "Compulsivity", "Impulsivity", "Implusivity", "Avoidance", "Motivation & Goals",
      "Stress", "Risk", "Pleasure", "Emotion", "Mindfullness", "Mindfulness"], "Domains/Transdiagnostic"),
    (["OCD", "Addiction", "Grief", "Suicide", "MBI", "Psychopathic", "Psyhcopathic", "Schema",
      "Defense Mechanisms", "Intervention", "Treatment", "Stigma", "Therapy", "Disorganized",
      "ADHD/Autism", "ADHD", "Autism", "Disorder", "Precision"],
     "Domains/Other Clinical"),
    (["Personality", "Agency & Identity"], "Domains/Cognition & Processing"),
    (["Affective"], "Domains/Mood Disorders"),

    # === AI & TECHNOLOGY ===
    (["Digital Mental Health", "Chatbot", "App"], "AI & Technology/Digital Mental Health"),
    (["AI Safety", "Ethics", "Alignment", "Effective"], "AI & Technology/AI Safety & Ethics"),
    (["HCI", "Avatar", "Multimodal", "AR", "Gamified"], "AI & Technology/HCI & Design"),

    # === REFERENCE ===
    (["Classics", "Foundational"], "Reference/Classics & Foundational"),
    (["Books"], "Reference/Books"),
    (["Theory", "Foundations", "Frameworks", "Models"], "Reference/Frameworks & Theory"),

    # === COURSEWORK/ARCHIVE - GPT and old assignment collections ===
    (["GPT", "ToGPT", "GPTIntro", "1-liners", "Shortlist", "Lenses", "Methods & Measurement",
      "Preprints", "Other", "Networks", "New1812", "Rhea"], "Coursework/Archive"),
]

# Collections that should NOT be migrated (keep as-is at root)
SKIP_MIGRATION = {"xAssignment", "Triage", "Pinned", "Personal"}

# Collections to DELETE entirely (items moved to trash)
DELETE_COLLECTIONS = {"BD", "Circadian", "Stern", "Stern Sources", "iPSC", "iPSC & Disorders"}


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def find_migration_target(collection_name: str) -> Optional[str]:
    """Find the target collection path for a given collection name."""
    name_lower = collection_name.lower()
    for patterns, target in MIGRATION_MAP:
        for pattern in patterns:
            if pattern.lower() in name_lower:
                return target
    return None


def create_new_structure(zot: zotero.Zotero, dry_run: bool = True) -> dict[str, str]:
    """
    Create new collection structure with up to 3 levels.
    Returns mapping of collection path → collection key.
    """
    logger.info("Creating new collection structure...")

    # Get existing collections
    existing = {c['data']['name']: c['data']['key'] for c in zot.collections()}
    logger.info(f"Found {len(existing)} existing collections")

    path_to_key = {}

    def create_or_get(name: str, parent_key: str = None, indent: str = "") -> str:
        """Helper to create collection or return existing key."""
        if name in existing:
            key = existing[name]
            logger.info(f"{indent}[EXISTS] {name} ({key})")
            return key
        elif dry_run:
            key = f"DRY-{name[:8]}"
            logger.info(f"{indent}[WOULD CREATE] {name}")
            return key
        else:
            payload = {'name': name}
            if parent_key:
                payload['parentCollection'] = parent_key
            result = zot.create_collections([payload])
            key = result['successful']['0']['key']
            logger.info(f"{indent}[CREATED] {name} ({key})")
            return key

    for parent_name, children in NEW_STRUCTURE.items():
        # Create parent (root level)
        parent_key = create_or_get(parent_name, None, "  ")
        path_to_key[parent_name] = parent_key

        if children is None:
            continue

        # Handle children - could be list (simple) or dict (with grandchildren)
        if isinstance(children, list):
            # Simple list of subcollections
            for child_name in children:
                child_key = create_or_get(child_name, parent_key, "    ")
                path_to_key[f"{parent_name}/{child_name}"] = child_key

        elif isinstance(children, dict):
            # Dict with potential grandchildren
            for child_name, grandchildren in children.items():
                child_key = create_or_get(child_name, parent_key, "    ")
                path_to_key[f"{parent_name}/{child_name}"] = child_key

                if grandchildren:
                    for grandchild_name in grandchildren:
                        grandchild_key = create_or_get(grandchild_name, child_key, "      ")
                        path_to_key[f"{parent_name}/{child_name}/{grandchild_name}"] = grandchild_key

    logger.info(f"Structure mapping complete: {len(path_to_key)} paths")
    return path_to_key


def migrate_items(zot: zotero.Zotero, path_to_key: dict[str, str], dry_run: bool = True) -> dict:
    """
    Migrate items from old collections to new structure.
    Returns stats dict.
    """
    logger.info("Migrating items to new collections...")

    stats = {"migrated": 0, "skipped": 0, "no_match": 0, "preserved": 0}
    collections = zot.collections()

    for coll in collections:
        coll_name = coll['data']['name']
        coll_key = coll['data']['key']

        # Skip collections that should not be migrated
        if coll_name in SKIP_MIGRATION:
            stats["preserved"] += 1
            logger.info(f"  [PRESERVE - NO MIGRATE] {coll_name}")
            continue

        # Skip collections marked for deletion (handled separately)
        if coll_name in DELETE_COLLECTIONS:
            logger.info(f"  [MARKED FOR DELETE] {coll_name}")
            continue

        # Skip preserved collections (but these may receive items)
        if coll_name in PRESERVE_COLLECTIONS:
            logger.debug(f"  [PRESERVE] {coll_name}")
            continue

        # Find migration target
        target_path = find_migration_target(coll_name)
        if not target_path:
            stats["no_match"] += 1
            logger.warning(f"  [NO MATCH] {coll_name}")
            continue

        target_key = path_to_key.get(target_path)
        if not target_key:
            logger.error(f"  [ERROR] Target path not found: {target_path}")
            continue

        # Get items in this collection
        items = zot.collection_items(coll_key, itemType="-attachment")
        if not items:
            logger.debug(f"  [EMPTY] {coll_name}")
            continue

        logger.info(f"  {coll_name} → {target_path} ({len(items)} items)")

        for item in items:
            if dry_run:
                logger.debug(f"    [WOULD MIGRATE] {item['data'].get('title', 'Untitled')[:50]}")
            else:
                # Add to new collection (items can be in multiple collections)
                try:
                    # Ensure item has collections field
                    if 'collections' not in item['data']:
                        item['data']['collections'] = []
                    zot.addto_collection(target_key, item)
                except Exception as e:
                    logger.error(f"    [ERROR] Failed to migrate {item['data'].get('title', 'Untitled')[:50]}: {e}")
                    stats["skipped"] += 1
                    continue
            stats["migrated"] += 1

    logger.info(f"Migration stats: {stats}")
    return stats


def delete_marked_collections(zot: zotero.Zotero, dry_run: bool = True) -> dict:
    """
    Delete collections and items marked for deletion.
    Returns stats dict.
    """
    logger.info("Deleting marked collections and items...")

    stats = {"collections_deleted": 0, "items_deleted": 0}
    collections = zot.collections()

    for coll in collections:
        coll_name = coll['data']['name']
        coll_key = coll['data']['key']

        if coll_name not in DELETE_COLLECTIONS:
            continue

        # Get items in this collection
        items = zot.collection_items(coll_key, itemType="-attachment")

        logger.info(f"  [DELETE] {coll_name} ({len(items)} items)")

        if dry_run:
            stats["items_deleted"] += len(items)
            stats["collections_deleted"] += 1
        else:
            # Delete items (move to trash)
            for item in items:
                try:
                    zot.delete_item(item)
                    stats["items_deleted"] += 1
                except Exception as e:
                    logger.error(f"    [ERROR] Failed to delete item: {e}")

            # Delete the collection
            try:
                zot.delete_collection(coll)
                stats["collections_deleted"] += 1
            except Exception as e:
                logger.error(f"    [ERROR] Failed to delete collection: {e}")

    logger.info(f"Deletion stats: {stats}")
    return stats


def archive_old_collections(zot: zotero.Zotero, path_to_key: dict[str, str], dry_run: bool = True):
    """
    Move old collections under _Archive parent.
    """
    logger.info("Archiving old collections...")

    # Create _Archive if needed
    existing = {c['data']['name']: c['data']['key'] for c in zot.collections()}

    if "_Archive" in existing:
        archive_key = existing["_Archive"]
        logger.info(f"  [EXISTS] _Archive ({archive_key})")
    elif dry_run:
        archive_key = "DRY-ARCHIVE"
        logger.info("  [WOULD CREATE] _Archive")
    else:
        result = zot.create_collections([{'name': '_Archive'}])
        archive_key = result['successful']['0']['key']
        logger.info(f"  [CREATED] _Archive ({archive_key})")

    # Get top-level collections to archive
    new_top_level = set(NEW_STRUCTURE.keys()) | PRESERVE_COLLECTIONS | {"_Archive"}
    collections = zot.collections()

    archived_count = 0
    for coll in collections:
        coll_name = coll['data']['name']
        parent = coll['data'].get('parentCollection')

        # Only archive top-level collections not in new structure
        if parent:  # Has parent, skip
            continue
        if coll_name in new_top_level:
            continue

        if dry_run:
            logger.info(f"  [WOULD ARCHIVE] {coll_name}")
        else:
            coll['data']['parentCollection'] = archive_key
            zot.update_collection(coll)
            logger.info(f"  [ARCHIVED] {coll_name}")

        archived_count += 1

    logger.info(f"Archived {archived_count} top-level collections")


# =============================================================================
# MAIN
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Restructure Zotero collections from 227 to ~50",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python zotero-restructure.py --dry-run    # Preview all changes
    python zotero-restructure.py --execute    # Apply changes to library
    python zotero-restructure.py --test-map   # Test migration mappings
        """
    )
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without applying")
    parser.add_argument("--execute", action="store_true", help="Apply changes to library")
    parser.add_argument("--test-map", action="store_true", help="Test migration mapping with sample names")
    args = parser.parse_args()

    if args.test_map:
        # Test migration mapping
        test_names = [
            "AttachmentNetwork", "MDD", "Social Cognition", "Alteri",
            "NetworkPsychopathology", "xAssignment", "RandomName",
            "EMA", "Multilayer", "Trauma", "Limerence"
        ]
        logger.info("Testing migration mappings:")
        for name in test_names:
            target = find_migration_target(name)
            status = "SKIP" if name in SKIP_MIGRATION else (target or "NO MATCH")
            logger.info(f"  {name} → {status}")
        return

    if not args.dry_run and not args.execute:
        parser.error("Must specify --dry-run, --execute, or --test-map")

    # Validate credentials
    if LIBRARY_ID == "YOUR_LIBRARY_ID" or API_KEY == "YOUR_API_KEY":
        logger.error("Please update LIBRARY_ID and API_KEY with your Zotero credentials")
        logger.error("Get them from: https://www.zotero.org/settings/keys")
        return

    zot = zotero.Zotero(LIBRARY_ID, LIBRARY_TYPE, API_KEY)
    logger.info(f"Connected to Zotero library {LIBRARY_ID}")

    if args.dry_run:
        logger.info("=" * 60)
        logger.info("=== DRY RUN MODE - No changes will be made ===")
        logger.info("=" * 60)

    # Step 1: Delete marked collections first
    delete_stats = delete_marked_collections(zot, dry_run=args.dry_run)

    # Step 2: Create new structure
    path_to_key = create_new_structure(zot, dry_run=args.dry_run)
    logger.info(f"Structure ready: {len(path_to_key)} collection paths")

    # Step 3: Migrate items
    stats = migrate_items(zot, path_to_key, dry_run=args.dry_run)

    # Note: archive_old_collections() disabled - old collections will remain
    # but items have been copied to new structure

    logger.info("=" * 60)
    logger.info("=== Restructure complete ===")
    logger.info(f"Migration stats: {stats}")
    logger.info(f"Deletion stats: {delete_stats}")
    logger.info("=" * 60)

    if args.dry_run:
        logger.info("\nTo apply changes, run with --execute flag")
        logger.info("Make sure to backup your library first!")


if __name__ == "__main__":
    main()
