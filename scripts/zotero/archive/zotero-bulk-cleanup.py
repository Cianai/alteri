#!/usr/bin/env python3
"""
Zotero Bulk Cleanup Script
==========================
Performs one-time metadata cleanup operations on the Zotero library.

Operations:
1. Extract status markers (❌🚫⛔) from tags to Extra field
2. Selective tag reset (preserve specified tags, clear others)
3. Pin cite keys via Better BibTeX (if available)
4. Apply semantic tags from ChromaDB clustering (optional)

Usage:
    python3 zotero-bulk-cleanup.py --report               # Generate cleanup report
    python3 zotero-bulk-cleanup.py --extract-markers      # Move status markers to Extra
    python3 zotero-bulk-cleanup.py --reset-tags           # Reset tags (interactive)
    python3 zotero-bulk-cleanup.py --pin-citekeys         # Pin Better BibTeX cite keys
    python3 zotero-bulk-cleanup.py --all --dry-run        # Full cleanup, dry run

Author: Claude Code (for Cian O'Sullivan)
Date: 17 January 2026
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional, Set

try:
    from pyzotero import zotero
except ImportError:
    print("ERROR: pyzotero not installed. Run: pip3 install pyzotero")
    sys.exit(1)

# =============================================================================
# CONFIGURATION
# =============================================================================

ZOTERO_LIBRARY_ID = os.environ.get("ZOTERO_LIBRARY_ID")
ZOTERO_LIBRARY_TYPE = "user"
ZOTERO_API_KEY = os.environ.get("ZOTERO_API_KEY")

# Status markers to extract from tags
STATUS_MARKERS = ['❌', '🚫', '⛔', '✅', '⚠️', '🔄', '📌']

# Output paths
REPORT_DIR = Path.home() / "Documents" / "ObsidianVault" / "System" / "Research-Architecture"
LOG_DIR = Path.home() / "scripts" / "logs"
BACKUP_DIR = Path.home() / "scripts" / "backups"

# Default tags to preserve (user can add more interactively)
DEFAULT_PRESERVE_TAGS = set()  # Will be populated from user input

# =============================================================================
# ZOTERO OPERATIONS
# =============================================================================

def connect_zotero() -> zotero.Zotero:
    """Establish connection to Zotero API."""
    return zotero.Zotero(ZOTERO_LIBRARY_ID, ZOTERO_LIBRARY_TYPE, ZOTERO_API_KEY)


def get_all_items(zot: zotero.Zotero) -> list[dict]:
    """Get all top-level items from library."""
    print("Fetching all items from Zotero...")
    items = zot.everything(zot.top())
    print(f"  Retrieved {len(items)} items")
    return items


def get_all_tags(zot: zotero.Zotero) -> dict[str, int]:
    """Get all tags with their usage counts."""
    print("Fetching all tags...")
    tags = zot.tags()
    tag_counts = {}
    for tag in tags:
        # pyzotero returns tags as dicts or strings depending on version
        if isinstance(tag, dict):
            name = tag.get('tag', '')
            count = tag.get('meta', {}).get('numItems', 1)
        else:
            name = str(tag)
            count = 1
        tag_counts[name] = count
    print(f"  Found {len(tag_counts)} unique tags")
    return tag_counts


# =============================================================================
# STATUS MARKER EXTRACTION
# =============================================================================

def extract_status_markers(items: list[dict], dry_run: bool = True) -> dict:
    """
    Extract status markers from tags and move to Extra field.

    Args:
        items: List of Zotero items
        dry_run: If True, don't actually update

    Returns:
        Statistics about the operation
    """
    print("\n=== Extracting Status Markers ===\n")

    stats = {"processed": 0, "modified": 0, "markers_found": {}}

    zot = connect_zotero()

    for item in items:
        data = item.get("data", {})
        item_type = data.get("itemType", "")

        if item_type in ["attachment", "note", "annotation"]:
            continue

        tags = data.get("tags", [])
        extra = data.get("extra", "")

        # Find tags with status markers
        marker_tags = []
        clean_tags = []

        for tag_obj in tags:
            tag = tag_obj.get("tag", "")
            has_marker = any(m in tag for m in STATUS_MARKERS)

            if has_marker:
                marker_tags.append(tag)
                for m in STATUS_MARKERS:
                    if m in tag:
                        stats["markers_found"][m] = stats["markers_found"].get(m, 0) + 1
            else:
                clean_tags.append(tag_obj)

        stats["processed"] += 1

        if marker_tags:
            # Build new Extra content
            marker_line = f"Status Tags: {', '.join(marker_tags)}"

            if extra:
                new_extra = f"{extra}\n{marker_line}"
            else:
                new_extra = marker_line

            print(f"  [{item.get('key')}] Found markers: {marker_tags}")

            if not dry_run:
                try:
                    item["data"]["tags"] = clean_tags
                    item["data"]["extra"] = new_extra
                    zot.update_item(item)
                    stats["modified"] += 1
                except Exception as e:
                    print(f"    Error updating: {e}")
            else:
                stats["modified"] += 1

    print(f"\nProcessed: {stats['processed']}")
    print(f"Items with markers: {stats['modified']}")
    print(f"Markers found: {stats['markers_found']}")

    return stats


# =============================================================================
# TAG RESET
# =============================================================================

def get_tags_to_preserve() -> Set[str]:
    """
    Interactively get list of tags to preserve.

    Returns:
        Set of tag prefixes/names to preserve
    """
    print("\n=== Tag Preservation Configuration ===\n")
    print("Enter tags or tag prefixes to PRESERVE (one per line).")
    print("Examples:")
    print("  - '#method/' - preserves all tags starting with #method/")
    print("  - 'limerence' - preserves the exact tag 'limerence'")
    print("  - '!important' - preserves tags containing '!important'")
    print("\nEnter 'done' when finished, or 'skip' to preserve no tags.\n")

    preserve = set()

    while True:
        try:
            tag = input("Preserve tag: ").strip()
        except EOFError:
            break

        if tag.lower() == 'done':
            break
        elif tag.lower() == 'skip':
            return set()
        elif tag:
            preserve.add(tag)
            print(f"  Added: {tag}")

    return preserve


def should_preserve_tag(tag: str, preserve_patterns: Set[str]) -> bool:
    """
    Check if a tag should be preserved.

    Args:
        tag: The tag to check
        preserve_patterns: Set of patterns to preserve

    Returns:
        True if tag should be preserved
    """
    for pattern in preserve_patterns:
        if pattern.endswith('/'):
            # Prefix match
            if tag.startswith(pattern):
                return True
        elif pattern.startswith('!'):
            # Contains match
            if pattern[1:] in tag:
                return True
        else:
            # Exact match
            if tag == pattern:
                return True
    return False


def reset_tags(items: list[dict], preserve_patterns: Set[str], dry_run: bool = True) -> dict:
    """
    Reset tags on all items, preserving specified patterns.

    Args:
        items: List of Zotero items
        preserve_patterns: Tags/prefixes to preserve
        dry_run: If True, don't actually update

    Returns:
        Statistics about the operation
    """
    print("\n=== Resetting Tags ===\n")
    print(f"Preserving patterns: {preserve_patterns}")

    stats = {
        "processed": 0,
        "modified": 0,
        "tags_removed": 0,
        "tags_preserved": 0
    }

    zot = connect_zotero()

    for item in items:
        data = item.get("data", {})
        item_type = data.get("itemType", "")

        if item_type in ["attachment", "note", "annotation"]:
            continue

        tags = data.get("tags", [])

        if not tags:
            continue

        # Split into preserve and remove
        preserved = []
        removed = []

        for tag_obj in tags:
            tag = tag_obj.get("tag", "")
            if should_preserve_tag(tag, preserve_patterns):
                preserved.append(tag_obj)
            else:
                removed.append(tag)

        stats["processed"] += 1
        stats["tags_removed"] += len(removed)
        stats["tags_preserved"] += len(preserved)

        if removed:
            if not dry_run:
                try:
                    item["data"]["tags"] = preserved
                    zot.update_item(item)
                    stats["modified"] += 1
                except Exception as e:
                    print(f"    Error updating {item.get('key')}: {e}")
            else:
                stats["modified"] += 1

        # Progress indicator
        if stats["processed"] % 500 == 0:
            print(f"  Processed {stats['processed']} items...")

    print(f"\nProcessed: {stats['processed']}")
    print(f"Items modified: {stats['modified']}")
    print(f"Tags removed: {stats['tags_removed']}")
    print(f"Tags preserved: {stats['tags_preserved']}")

    return stats


# =============================================================================
# CITE KEY PINNING
# =============================================================================

def pin_citekeys(items: list[dict], dry_run: bool = True) -> dict:
    """
    Pin Better BibTeX cite keys by extracting current keys and adding to Extra.

    Note: This reads existing cite keys from the Extra field if present,
    otherwise generates a basic cite key from author+year.

    Args:
        items: List of Zotero items
        dry_run: If True, don't actually update

    Returns:
        Statistics about the operation
    """
    print("\n=== Pinning Cite Keys ===\n")

    stats = {"processed": 0, "already_pinned": 0, "newly_pinned": 0, "no_key": 0}

    zot = connect_zotero()

    for item in items:
        data = item.get("data", {})
        item_type = data.get("itemType", "")

        if item_type in ["attachment", "note", "annotation"]:
            continue

        extra = data.get("extra", "")

        # Check if already has a cite key
        if "Citation Key:" in extra:
            stats["already_pinned"] += 1
            stats["processed"] += 1
            continue

        # Generate a basic cite key from author + year
        creators = data.get("creators", [])
        date = data.get("date", "")

        first_author = ""
        if creators:
            first = creators[0]
            first_author = first.get("lastName", first.get("name", "unknown"))

        year = ""
        if date:
            year_match = re.search(r'\d{4}', date)
            if year_match:
                year = year_match.group()

        if first_author and year:
            cite_key = f"{first_author.lower()}{year}"
            # Clean up the key
            cite_key = re.sub(r'[^a-z0-9]', '', cite_key)

            new_extra = f"Citation Key: {cite_key}"
            if extra:
                new_extra = f"{extra}\n{new_extra}"

            stats["newly_pinned"] += 1

            if not dry_run:
                try:
                    item["data"]["extra"] = new_extra
                    zot.update_item(item)
                except Exception as e:
                    print(f"    Error updating {item.get('key')}: {e}")
        else:
            stats["no_key"] += 1

        stats["processed"] += 1

        # Progress
        if stats["processed"] % 500 == 0:
            print(f"  Processed {stats['processed']} items...")

    print(f"\nProcessed: {stats['processed']}")
    print(f"Already pinned: {stats['already_pinned']}")
    print(f"Newly pinned: {stats['newly_pinned']}")
    print(f"Could not generate key: {stats['no_key']}")

    return stats


# =============================================================================
# REPORTING
# =============================================================================

def generate_cleanup_report(items: list[dict], tags: dict[str, int]) -> str:
    """
    Generate a cleanup report showing what needs attention.

    Args:
        items: List of Zotero items
        tags: Dictionary of tag -> count

    Returns:
        Markdown report content
    """
    # Count items with status markers
    marker_items = []
    for item in items:
        data = item.get("data", {})
        item_tags = [t.get("tag", "") for t in data.get("tags", [])]
        for tag in item_tags:
            if any(m in tag for m in STATUS_MARKERS):
                marker_items.append(item.get("key"))
                break

    # Count faceted tags
    faceted_tags = [t for t in tags.keys() if t.startswith('#') and '/' in t]

    # Find most common tags
    sorted_tags = sorted(tags.items(), key=lambda x: x[1], reverse=True)

    report = f"""# Zotero Cleanup Report

**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M')}

## Summary

| Metric | Value |
|--------|-------|
| Total items | {len(items)} |
| Items with status markers | {len(marker_items)} |
| Total unique tags | {len(tags)} |
| Faceted tags (#prefix/) | {len(faceted_tags)} |

## Status Markers in Tags

Items with status markers (❌🚫⛔✅⚠️🔄📌) in their tags: **{len(marker_items)}**

These should be moved to the Extra field before tag cleanup.

## Most Common Tags (Top 30)

| Tag | Count |
|-----|-------|
"""

    for tag, count in sorted_tags[:30]:
        # Escape pipes for markdown
        safe_tag = tag.replace('|', '\\|')
        report += f"| {safe_tag} | {count} |\n"

    report += f"""

## Faceted Tags (#prefix/)

Found **{len(faceted_tags)}** faceted tags. Examples:

"""
    for tag in sorted(faceted_tags)[:20]:
        report += f"- `{tag}`\n"

    report += """

## Recommended Cleanup Steps

1. **Extract status markers** - Move markers from tags to Extra field
2. **Identify tags to preserve** - Review faceted tags and decide which to keep
3. **Reset tags** - Clear non-preserved tags
4. **Apply semantic tags** - Use ChromaDB clustering to apply new tags
5. **Pin cite keys** - Ensure Better BibTeX keys are pinned

"""

    return report


# =============================================================================
# BACKUP
# =============================================================================

def backup_current_state(items: list[dict]):
    """
    Create a backup of current tags and metadata.

    Args:
        items: List of Zotero items
    """
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)

    backup_data = []
    for item in items:
        data = item.get("data", {})
        if data.get("itemType") in ["attachment", "note", "annotation"]:
            continue

        backup_data.append({
            "key": item.get("key"),
            "title": data.get("title", "")[:100],
            "tags": [t.get("tag") for t in data.get("tags", [])],
            "extra": data.get("extra", "")
        })

    backup_file = BACKUP_DIR / f"zotero-backup-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
    with open(backup_file, "w") as f:
        json.dump(backup_data, f, indent=2)

    print(f"Backup saved to: {backup_file}")
    return backup_file


# =============================================================================
# MAIN
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Bulk cleanup operations for Zotero library"
    )

    parser.add_argument(
        "--report", "-r",
        action="store_true",
        help="Generate cleanup report"
    )

    parser.add_argument(
        "--extract-markers", "-e",
        action="store_true",
        help="Extract status markers from tags to Extra field"
    )

    parser.add_argument(
        "--reset-tags", "-t",
        action="store_true",
        help="Reset tags (interactive - will prompt for tags to preserve)"
    )

    parser.add_argument(
        "--pin-citekeys", "-c",
        action="store_true",
        help="Pin Better BibTeX cite keys"
    )

    parser.add_argument(
        "--all", "-a",
        action="store_true",
        help="Run all cleanup operations"
    )

    parser.add_argument(
        "--dry-run", "-n",
        action="store_true",
        help="Preview changes without updating Zotero"
    )

    parser.add_argument(
        "--no-backup",
        action="store_true",
        help="Skip backup before making changes"
    )

    parser.add_argument(
        "--preserve-tags",
        type=str,
        help="Comma-separated list of tag patterns to preserve"
    )

    args = parser.parse_args()

    # Default to report if no action specified
    if not any([args.report, args.extract_markers, args.reset_tags, args.pin_citekeys, args.all]):
        args.report = True

    print("=" * 60)
    print("ZOTERO BULK CLEANUP")
    print("=" * 60)

    if args.dry_run:
        print("MODE: Dry run (no changes will be made)\n")

    # Connect and fetch data
    zot = connect_zotero()
    items = get_all_items(zot)

    if args.report or args.reset_tags or args.all:
        tags = get_all_tags(zot)
    else:
        tags = {}

    # Create backup unless skipped
    if not args.dry_run and not args.no_backup and not args.report:
        print("\nCreating backup before changes...")
        backup_current_state(items)

    # Generate report
    if args.report:
        report = generate_cleanup_report(items, tags)
        REPORT_DIR.mkdir(parents=True, exist_ok=True)
        report_file = REPORT_DIR / f"Zotero-Cleanup-Report-{datetime.now().strftime('%Y%m%d')}.md"
        with open(report_file, "w") as f:
            f.write(report)
        print(f"\nReport saved to: {report_file}")

    # Extract markers
    if args.extract_markers or args.all:
        extract_status_markers(items, dry_run=args.dry_run)

    # Reset tags
    if args.reset_tags or args.all:
        if args.preserve_tags:
            preserve = set(args.preserve_tags.split(','))
        else:
            preserve = get_tags_to_preserve()
        reset_tags(items, preserve, dry_run=args.dry_run)

    # Pin cite keys
    if args.pin_citekeys or args.all:
        pin_citekeys(items, dry_run=args.dry_run)

    print("\n" + "=" * 60)
    print("CLEANUP COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()
