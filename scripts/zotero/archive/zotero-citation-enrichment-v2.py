#!/usr/bin/env python3
"""
Zotero Citation Enrichment Script v2 - Domain-Aware Hybrid Scoring
==================================================================
Improved version with domain relevance scoring for Alteri research platform.

Scoring Formula (REVISED - Citation-Primary):
    Final Score = (Citation × 0.50) + (Domain × 0.25) + (Recency × 0.10) + (Collection × 0.15)

Thresholds:
    - Score > 60: KEEP
    - Score 35-60: REVIEW
    - Score < 35: ARCHIVE CANDIDATE

Note: Highly-cited papers (>1000 citations) auto-KEEP regardless of domain match.

Usage:
    python3 zotero-citation-enrichment-v2.py --batch 100 --output /tmp/audit-final.json
    python3 zotero-citation-enrichment-v2.py --reprocess /tmp/audit-batch-*.json --output /tmp/audit-rescored.json

Author: Claude Code (for Cian O'Sullivan)
Date: 31 January 2026
"""

import argparse
import json
import math
import os
import re
import sqlite3
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import requests

# Configuration
SEMANTIC_SCHOLAR_API_KEY = os.environ.get("SEMANTIC_SCHOLAR_API_KEY", "")
ZOTERO_DB_PATH = Path.home() / "Zotero" / "zotero.sqlite"
OUTPUT_DIR = Path("/tmp")
RATE_LIMIT_DELAY = 1.1  # seconds between requests (with API key)

# Semantic Scholar API
S2_BASE_URL = "https://api.semanticscholar.org/graph/v1"

# =============================================================================
# DOMAIN KEYWORDS FOR ALTERI RELEVANCE SCORING
# =============================================================================

DOMAIN_KEYWORDS = {
    "limerence": {
        "weight": 1.0,
        "keywords": [
            "limerence", "infatuation", "unrequited love", "obsessive love",
            "romantic obsession", "tennov", "passionate love", "love addiction",
            "romantic attachment", "attachment style", "anxious attachment",
            "avoidant attachment", "secure attachment", "hazan", "shaver",
            "adult attachment", "romantic relationship", "love scale",
            "desperate love", "intrusive thinking", "emotional dependency"
        ]
    },
    "ai_ethics": {
        "weight": 1.0,
        "keywords": [
            "ai ethics", "artificial intelligence ethics", "machine ethics",
            "alignment", "value alignment", "ai safety", "constitutional ai",
            "rlhf", "reinforcement learning human feedback", "helpful harmless",
            "anthropic", "openai", "deepmind", "ai governance", "ai regulation",
            "algorithmic fairness", "ai bias", "explainable ai", "xai",
            "ai transparency", "ai accountability", "beneficial ai"
        ]
    },
    "mental_health": {
        "weight": 0.8,
        "keywords": [
            "depression", "anxiety", "wellbeing", "well-being", "mental health",
            "therapy", "psychotherapy", "cbt", "cognitive behavioral",
            "resilience", "emotion regulation", "mood disorder", "bipolar",
            "obsessive compulsive", "ocd", "ptsd", "trauma", "mindfulness",
            "self-compassion", "psychological distress", "rumination",
            "intrusive thoughts", "psychiatric", "clinical psychology"
        ]
    },
    "methods": {
        "weight": 0.7,
        "keywords": [
            "network analysis", "social network", "ego network", "multilevel",
            "hierarchical linear", "hlm", "structural equation", "sem",
            "factor analysis", "psychometrics", "scale development",
            "longitudinal", "cross-sectional", "meta-analysis", "systematic review",
            "bayesian", "mixed methods", "qualitative", "grounded theory",
            "experience sampling", "ecological momentary", "ema"
        ]
    },
    "developmental": {
        "weight": 0.6,
        "keywords": [
            "developmental psychology", "attachment theory", "bowlby", "ainsworth",
            "strange situation", "infant attachment", "child development",
            "adolescent", "emerging adult", "lifespan", "intergenerational"
        ]
    }
}

# Collections that auto-keep (high value regardless of citations)
AUTO_KEEP_COLLECTIONS = [
    "classics", "reference", "seminal", "foundational", "coursework",
    "thesis", "dissertation", "phd", "masters"
]

# Collections that suggest lower priority
ARCHIVE_PRONE_COLLECTIONS = [
    "to-read", "maybe", "peripheral", "tangential"
]

# =============================================================================
# CLASSIC PAPERS - Auto-KEEP regardless of citation data
# =============================================================================
# These are foundational works that may not have DOIs or citation tracking
CLASSIC_PAPER_AUTHORS = [
    "goffman", "bandura", "bowlby", "ainsworth", "tennov", "hazan", "shaver",
    "harlow", "lorenz", "erikson", "piaget", "vygotsky", "freud", "jung",
    "maslow", "rogers", "skinner", "pavlov", "watson", "james", "wundt"
]

CLASSIC_PAPER_TITLES = [
    "presentation of self", "bobo doll", "strange situation", "attachment",
    "limerence", "romantic love", "love scale", "passionate love",
    "social learning", "operant conditioning", "hierarchy of needs",
    "visual cliff", "imprinting", "object permanence",
    # Additional foundational works
    "transmission of aggression", "companionate love", "emotional development",
    "social development in young children", "self-determination theory",
    "need to belong", "positive psychology", "behavioral inhibition",
    "measurement of romantic", "ambivalence, passion", "lovers wear rose"
]

# Limerence-specific terms - ALWAYS keep papers matching these
LIMERENCE_CORE_TERMS = [
    "limerence", "tennov", "desperate love", "unrequited love",
    "obsessive love", "love addiction", "romantic obsession",
    "intrusive thoughts about partner", "emotional dependency"
]

# =============================================================================
# COURSEWORK RELEVANCE - Keep papers matching these terms
# Based on KCL + Harvard ALM syllabi (Spring 2026 semester)
# =============================================================================
COURSEWORK_TERMS = [
    # User-specified priority topics
    "ireland", "irish",
    "adhd", "attention deficit", "hyperactivity",
    "attachment", "attachment style", "attachment theory",
    "ptsd", "post-traumatic", "posttraumatic", "trauma",
    "dyad", "dyadic", "couple", "partner",
    "network", "network analysis", "social network", "ego network",
    "lifespan", "life span", "developmental",
    "social identity", "identity theory", "self-concept",
    "the self", "self and identity", "self-esteem",
    # From Harvard courses
    "resilience", "psychological resilience",
    "close relationships", "intimate relationship",
    "happiness", "wellbeing", "well-being", "positive psychology",
    "ocd", "obsessive-compulsive", "obsessive compulsive",
    "addiction", "substance use", "reward",
    "mindfulness", "meditation",
    "case study", "narrative", "biography",
    "psychometrics", "scale development", "measurement",
    # From KCL courses
    "community mental health", "community psychiatry",
    "peer support", "recovery model",
    "neuroscience", "neuroimaging", "fmri", "eeg",
    "affective disorder", "mood disorder", "depression", "bipolar",
    "global mental health",
    # Methods relevant to thesis
    "multilevel", "hierarchical linear", "hlm",
    "structural equation", "sem", "latent variable",
    "longitudinal", "time series"
]


def get_headers() -> Dict[str, str]:
    """Get API headers with optional API key."""
    headers = {"Accept": "application/json"}
    if SEMANTIC_SCHOLAR_API_KEY:
        headers["x-api-key"] = SEMANTIC_SCHOLAR_API_KEY
    return headers


def fetch_paper_by_doi(doi: str) -> Optional[Dict]:
    """Fetch paper metadata from Semantic Scholar by DOI."""
    if not doi:
        return None

    url = f"{S2_BASE_URL}/paper/DOI:{doi}"
    params = {"fields": "title,citationCount,influentialCitationCount,year,venue,isOpenAccess,fieldsOfStudy"}

    try:
        response = requests.get(url, headers=get_headers(), params=params, timeout=10)
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404:
            return {"error": "not_found", "doi": doi}
        else:
            return {"error": f"http_{response.status_code}", "doi": doi}
    except requests.RequestException as e:
        return {"error": str(e), "doi": doi}


def calculate_citation_score(citations: Optional[int], year: int) -> float:
    """
    Calculate normalised citation score (0-100).
    Accounts for paper age - older papers expected to have more citations.
    """
    if citations is None:
        return 25.0  # Neutral score for unknown citations

    current_year = 2026
    age = max(1, current_year - year)

    # Expected citations per year varies by field, but rough heuristic:
    # - Psychology papers: ~5-10 citations/year for decent papers
    # - Highly cited: >20/year
    citations_per_year = citations / age

    if citations_per_year >= 50:
        return 100.0
    elif citations_per_year >= 20:
        return 90.0
    elif citations_per_year >= 10:
        return 80.0
    elif citations_per_year >= 5:
        return 70.0
    elif citations_per_year >= 2:
        return 50.0
    elif citations_per_year >= 1:
        return 30.0
    elif citations > 0:
        return 20.0
    else:
        return 10.0


def calculate_domain_relevance(title: str, abstract: str, tags: List[str] = None) -> Tuple[float, List[str]]:
    """
    Calculate domain relevance score (0-100) based on keyword matching.
    Returns score and list of matched domains.
    """
    text = f"{title} {abstract}".lower()
    tags_text = " ".join(tags or []).lower()

    matched_domains = []
    total_score = 0.0
    max_possible = 0.0

    for domain, config in DOMAIN_KEYWORDS.items():
        weight = config["weight"]
        keywords = config["keywords"]
        max_possible += weight * 100

        matches = sum(1 for kw in keywords if kw.lower() in text or kw.lower() in tags_text)
        if matches > 0:
            # Logarithmic scaling - diminishing returns for many matches
            domain_score = min(100, 30 * math.log2(matches + 1)) * weight
            total_score += domain_score
            matched_domains.append(domain)

    # Normalise to 0-100
    if max_possible > 0:
        normalised_score = (total_score / max_possible) * 100
    else:
        normalised_score = 0.0

    # Boost if multiple domains match (interdisciplinary relevance)
    if len(matched_domains) >= 2:
        normalised_score = min(100, normalised_score * 1.2)

    return normalised_score, matched_domains


def calculate_recency_score(year: int) -> float:
    """
    Calculate recency bonus (0-20).
    Recent papers get benefit of doubt for low citations.
    """
    current_year = 2026

    if year >= current_year:
        return 20.0  # Current year
    elif year >= current_year - 1:
        return 18.0  # Last year
    elif year >= current_year - 2:
        return 15.0  # 2 years ago
    elif year >= current_year - 3:
        return 10.0  # 3 years ago (audit threshold)
    elif year >= current_year - 5:
        return 5.0   # 4-5 years ago
    elif year >= current_year - 10:
        return 2.0   # 6-10 years ago
    else:
        return 0.0   # Older papers - no recency bonus


def calculate_collection_score(collections: List[str]) -> float:
    """
    Calculate collection-based bonus/penalty (0-20).
    """
    collections_lower = [c.lower() for c in collections]

    # Check for auto-keep collections
    for keep_term in AUTO_KEEP_COLLECTIONS:
        if any(keep_term in c for c in collections_lower):
            return 20.0

    # Check for archive-prone collections
    for archive_term in ARCHIVE_PRONE_COLLECTIONS:
        if any(archive_term in c for c in collections_lower):
            return 5.0

    # Default - neutral
    return 10.0


def calculate_final_score(paper: Dict) -> Dict:
    """
    Calculate final hybrid score for a paper.
    Returns enriched paper dict with scores.
    """
    # Extract data
    citations = paper.get("s2_citation_count")
    year_str = paper.get("pub_date", "")[:4]
    title = paper.get("title", "")
    abstract = paper.get("abstract", "")
    collections = paper.get("collections", [])
    tags = paper.get("tags", [])

    try:
        year = int(year_str) if year_str.isdigit() else 2020
    except ValueError:
        year = 2020

    # Calculate component scores
    citation_score = calculate_citation_score(citations, year)
    domain_score, matched_domains = calculate_domain_relevance(title, abstract, tags)
    recency_score = calculate_recency_score(year)
    collection_score = calculate_collection_score(collections)

    # REVISED Weighted final score - Citation-Primary
    final_score = (
        citation_score * 0.50 +
        domain_score * 0.25 +
        recency_score * 0.10 +
        collection_score * 0.15
    )

    # Check for classic paper override
    title_lower = title.lower()
    text_combined = f"{title} {abstract}".lower()

    is_classic = False
    is_limerence_core = False
    override_reason = None

    # Check for classic authors
    for author in CLASSIC_PAPER_AUTHORS:
        if author in text_combined:
            is_classic = True
            override_reason = f"classic_author:{author}"
            break

    # Check for classic paper titles
    if not is_classic:
        for classic_title in CLASSIC_PAPER_TITLES:
            if classic_title in title_lower:
                is_classic = True
                override_reason = f"classic_title:{classic_title}"
                break

    # Check for limerence core terms (highest priority)
    for term in LIMERENCE_CORE_TERMS:
        if term in text_combined:
            is_limerence_core = True
            override_reason = f"limerence_core:{term}"
            break

    # Check for coursework relevance (move from archive to review)
    is_coursework_relevant = False
    coursework_match = None
    for term in COURSEWORK_TERMS:
        if term in text_combined:
            is_coursework_relevant = True
            coursework_match = term
            break

    # Determine recommendation with overrides
    if is_limerence_core:
        recommendation = "keep"
        final_score = max(final_score, 85.0)
        matched_domains.append("limerence_core")
    elif is_classic:
        recommendation = "keep"
        final_score = max(final_score, 75.0)
        matched_domains.append("classic_paper")
    elif citations is not None and citations > 1000:
        recommendation = "keep"
        final_score = max(final_score, 80.0)
        override_reason = "high_citations"
    elif is_coursework_relevant:
        # Coursework papers: at minimum go to REVIEW, not archive
        recommendation = "review" if final_score < 60 else "keep"
        final_score = max(final_score, 40.0)  # Ensure above archive threshold
        matched_domains.append("coursework")
        override_reason = f"coursework:{coursework_match}"
    elif final_score > 60:
        recommendation = "keep"
    elif final_score >= 35:
        recommendation = "review"
    else:
        recommendation = "archive_candidate"

    # Add scores to paper
    paper["scores"] = {
        "citation": round(citation_score, 1),
        "domain": round(domain_score, 1),
        "recency": round(recency_score, 1),
        "collection": round(collection_score, 1),
        "final": round(final_score, 1)
    }
    paper["matched_domains"] = matched_domains
    paper["audit_recommendation_v2"] = recommendation
    if override_reason:
        paper["override_reason"] = override_reason

    return paper


def get_pre2023_papers(limit: int = 50, offset: int = 0) -> List[Dict]:
    """Query Zotero SQLite for pre-2023 journal articles with collections."""
    conn = sqlite3.connect(ZOTERO_DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    query = """
    WITH paper_data AS (
        SELECT DISTINCT
            i.key,
            i.itemID,
            MAX(CASE WHEN f.fieldName = 'title' THEN v.value END) as title,
            MAX(CASE WHEN f.fieldName = 'date' THEN v.value END) as pub_date,
            MAX(CASE WHEN f.fieldName = 'DOI' THEN v.value END) as doi,
            SUBSTR(MAX(CASE WHEN f.fieldName = 'abstractNote' THEN v.value END), 1, 500) as abstract
        FROM items i
        JOIN itemTypes it ON i.itemTypeID = it.itemTypeID
        LEFT JOIN itemData id ON i.itemID = id.itemID
        LEFT JOIN fields f ON id.fieldID = f.fieldID
        LEFT JOIN itemDataValues v ON id.valueID = v.valueID
        WHERE it.typeName = 'journalArticle'
        AND i.itemID NOT IN (SELECT itemID FROM deletedItems)
        GROUP BY i.itemID
    )
    SELECT key, title, pub_date, doi, abstract
    FROM paper_data
    WHERE CAST(SUBSTR(pub_date, 1, 4) AS INTEGER) < 2023
    ORDER BY pub_date ASC
    LIMIT ? OFFSET ?
    """

    cursor.execute(query, (limit, offset))
    papers = [dict(row) for row in cursor.fetchall()]

    # Get collections for each paper
    for paper in papers:
        coll_query = """
        SELECT c.collectionName
        FROM collections c
        JOIN collectionItems ci ON c.collectionID = ci.collectionID
        JOIN items i ON ci.itemID = i.itemID
        WHERE i.key = ?
        """
        cursor.execute(coll_query, (paper["key"],))
        paper["collections"] = [row["collectionName"] for row in cursor.fetchall()]

        # Get tags
        tag_query = """
        SELECT t.name
        FROM tags t
        JOIN itemTags it ON t.tagID = it.tagID
        JOIN items i ON it.itemID = i.itemID
        WHERE i.key = ?
        """
        cursor.execute(tag_query, (paper["key"],))
        paper["tags"] = [row["name"] for row in cursor.fetchall()]

    conn.close()
    return papers


def enrich_batch(papers: List[Dict], verbose: bool = True) -> List[Dict]:
    """Enrich a batch of papers with Semantic Scholar data and domain scoring."""
    enriched = []
    total = len(papers)

    for i, paper in enumerate(papers, 1):
        doi = paper.get("doi")
        if verbose:
            print(f"[{i}/{total}] Processing: {paper.get('title', 'Unknown')[:50]}...")

        # Fetch Semantic Scholar data
        s2_data = fetch_paper_by_doi(doi) if doi else {"error": "no_doi"}

        enriched_paper = {
            **paper,
            "s2_citation_count": s2_data.get("citationCount") if s2_data and "error" not in s2_data else None,
            "s2_influential_citations": s2_data.get("influentialCitationCount") if s2_data and "error" not in s2_data else None,
            "s2_is_open_access": s2_data.get("isOpenAccess") if s2_data and "error" not in s2_data else None,
            "s2_fields_of_study": s2_data.get("fieldsOfStudy") if s2_data and "error" not in s2_data else None,
            "s2_error": s2_data.get("error") if s2_data and "error" in s2_data else None,
            "enriched_at": datetime.now().isoformat()
        }

        # Calculate domain-aware scores
        enriched_paper = calculate_final_score(enriched_paper)

        if verbose:
            scores = enriched_paper.get("scores", {})
            domains = enriched_paper.get("matched_domains", [])
            rec = enriched_paper.get("audit_recommendation_v2", "?")
            print(f"    → Score: {scores.get('final', '?'):.1f} [{rec.upper()}] Domains: {', '.join(domains) or 'none'}")

        enriched.append(enriched_paper)

        # Rate limiting
        if i < total and doi:  # Only delay if we made an API call
            time.sleep(RATE_LIMIT_DELAY)

    return enriched


def reprocess_existing(input_files: List[str]) -> List[Dict]:
    """Reprocess existing enrichment files with domain-aware scoring."""
    all_papers = []

    for filepath in input_files:
        with open(filepath) as f:
            papers = json.load(f)
            for paper in papers:
                # Recalculate scores with domain awareness
                paper = calculate_final_score(paper)
            all_papers.extend(papers)

    return all_papers


def main():
    parser = argparse.ArgumentParser(description="Domain-aware Zotero citation enrichment")
    parser.add_argument("--batch", type=int, default=100, help="Number of papers to process")
    parser.add_argument("--offset", type=int, default=0, help="Offset for pagination")
    parser.add_argument("--output", type=str, default="/tmp/audit-v2.json", help="Output file path")
    parser.add_argument("--reprocess", type=str, nargs="+", help="Reprocess existing JSON files with new scoring")
    parser.add_argument("--quiet", action="store_true", help="Suppress progress output")
    args = parser.parse_args()

    if args.reprocess:
        # Reprocess mode - just rescore existing data
        print(f"Reprocessing {len(args.reprocess)} files with domain-aware scoring...")
        papers = reprocess_existing(args.reprocess)
    else:
        # Fresh enrichment mode
        print(f"Fetching {args.batch} pre-2023 papers (offset: {args.offset})...")
        papers = get_pre2023_papers(limit=args.batch, offset=args.offset)
        print(f"Retrieved {len(papers)} papers from Zotero")

        if not papers:
            print("No papers found!")
            return

        print(f"\nEnriching with Semantic Scholar data + domain scoring...")
        papers = enrich_batch(papers, verbose=not args.quiet)

    # Summary statistics by recommendation
    keep_count = sum(1 for p in papers if p.get("audit_recommendation_v2") == "keep")
    review_count = sum(1 for p in papers if p.get("audit_recommendation_v2") == "review")
    archive_count = sum(1 for p in papers if p.get("audit_recommendation_v2") == "archive_candidate")

    # Domain coverage
    domain_counts = {}
    for p in papers:
        for d in p.get("matched_domains", []):
            domain_counts[d] = domain_counts.get(d, 0) + 1

    print(f"\n" + "=" * 60)
    print("AUDIT SUMMARY (v2 - Domain-Aware)")
    print("=" * 60)
    print(f"Total papers:      {len(papers)}")
    print(f"KEEP:              {keep_count} (score > 70)")
    print(f"REVIEW:            {review_count} (score 40-70)")
    print(f"ARCHIVE CANDIDATE: {archive_count} (score < 40)")

    print(f"\nDomain Coverage:")
    for domain, count in sorted(domain_counts.items(), key=lambda x: -x[1]):
        print(f"  {domain}: {count} papers")

    # Score distribution
    scores = [p.get("scores", {}).get("final", 0) for p in papers]
    if scores:
        print(f"\nScore Distribution:")
        print(f"  Min: {min(scores):.1f}")
        print(f"  Max: {max(scores):.1f}")
        print(f"  Avg: {sum(scores)/len(scores):.1f}")

    # Save results
    output_path = Path(args.output)
    with open(output_path, "w") as f:
        json.dump(papers, f, indent=2)
    print(f"\nResults saved to: {output_path}")

    # Also save human-readable summary
    summary_path = output_path.with_suffix(".md")
    with open(summary_path, "w") as f:
        f.write(f"# Domain-Aware Audit Summary (v2)\n\n")
        f.write(f"**Generated:** {datetime.now().isoformat()}\n")
        f.write(f"**Papers:** {len(papers)}\n")
        f.write(f"**Scoring:** Citation (30%) + Domain (40%) + Recency (15%) + Collection (15%)\n\n")

        f.write("## KEEP (Score > 70)\n\n")
        for p in sorted([p for p in papers if p.get("audit_recommendation_v2") == "keep"],
                       key=lambda x: x.get("scores", {}).get("final", 0), reverse=True)[:30]:
            scores = p.get("scores", {})
            domains = ", ".join(p.get("matched_domains", [])) or "none"
            f.write(f"- **{p['title'][:60]}** ({p.get('pub_date', '?')[:4]}) - Score: {scores.get('final', '?'):.1f} - Domains: {domains}\n")

        f.write("\n## REVIEW (Score 40-70)\n\n")
        for p in sorted([p for p in papers if p.get("audit_recommendation_v2") == "review"],
                       key=lambda x: x.get("scores", {}).get("final", 0), reverse=True)[:20]:
            scores = p.get("scores", {})
            f.write(f"- {p['title'][:60]} ({p.get('pub_date', '?')[:4]}) - Score: {scores.get('final', '?'):.1f}\n")

        f.write("\n## ARCHIVE CANDIDATES (Score < 40)\n\n")
        for p in [p for p in papers if p.get("audit_recommendation_v2") == "archive_candidate"]:
            scores = p.get("scores", {})
            f.write(f"- {p['title'][:60]} ({p.get('pub_date', '?')[:4]}) - Score: {scores.get('final', '?'):.1f}\n")

    print(f"Summary saved to: {summary_path}")


if __name__ == "__main__":
    main()
