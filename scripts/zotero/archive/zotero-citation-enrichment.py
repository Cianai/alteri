#!/usr/bin/env python3
"""
Zotero Citation Enrichment Script
=================================
Fetches citation counts from Semantic Scholar API for audit prioritisation.

Usage:
    python3 zotero-citation-enrichment.py --batch 50 --output /tmp/audit-batch.json
    python3 zotero-citation-enrichment.py --doi "10.1037/0022-3514.52.3.511"  # Single lookup

Rate limit: 1 request/second with API key (100/5min without)

Author: Claude Code (for Cian O'Sullivan)
Date: 31 January 2026
"""

import argparse
import json
import os
import sqlite3
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

import requests

# Configuration
SEMANTIC_SCHOLAR_API_KEY = os.environ.get("SEMANTIC_SCHOLAR_API_KEY", "")
ZOTERO_DB_PATH = Path.home() / "Zotero" / "zotero.sqlite"
OUTPUT_DIR = Path("/tmp")
RATE_LIMIT_DELAY = 1.1  # seconds between requests (with API key)

# Semantic Scholar API
S2_BASE_URL = "https://api.semanticscholar.org/graph/v1"


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
    params = {"fields": "title,citationCount,influentialCitationCount,year,venue,isOpenAccess"}

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


def get_pre2023_papers(limit: int = 50, offset: int = 0) -> List[Dict]:
    """Query Zotero SQLite for pre-2023 journal articles."""
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
    conn.close()
    return papers


def enrich_batch(papers: List[Dict], verbose: bool = True) -> List[Dict]:
    """Enrich a batch of papers with Semantic Scholar data."""
    enriched = []
    total = len(papers)

    for i, paper in enumerate(papers, 1):
        doi = paper.get("doi")
        if verbose:
            print(f"[{i}/{total}] Processing: {paper.get('title', 'Unknown')[:50]}...")

        s2_data = fetch_paper_by_doi(doi) if doi else {"error": "no_doi"}

        enriched_paper = {
            **paper,
            "s2_citation_count": s2_data.get("citationCount") if s2_data and "error" not in s2_data else None,
            "s2_influential_citations": s2_data.get("influentialCitationCount") if s2_data and "error" not in s2_data else None,
            "s2_is_open_access": s2_data.get("isOpenAccess") if s2_data and "error" not in s2_data else None,
            "s2_error": s2_data.get("error") if s2_data and "error" in s2_data else None,
            "enriched_at": datetime.now().isoformat()
        }
        enriched.append(enriched_paper)

        if verbose and s2_data and "citationCount" in s2_data:
            print(f"    → Citations: {s2_data['citationCount']}, Influential: {s2_data.get('influentialCitationCount', 0)}")
        elif verbose and s2_data and "error" in s2_data:
            print(f"    → Error: {s2_data['error']}")

        # Rate limiting
        if i < total:
            time.sleep(RATE_LIMIT_DELAY)

    return enriched


def apply_audit_criteria(papers: List[Dict]) -> List[Dict]:
    """Apply GRADE-style audit criteria to enriched papers."""
    for paper in papers:
        citations = paper.get("s2_citation_count")
        year_str = paper.get("pub_date", "")[:4]

        try:
            year = int(year_str) if year_str.isdigit() else 0
        except ValueError:
            year = 0

        # Apply audit criteria
        audit_flags = []
        audit_recommendation = "review"  # Default

        # Age-based criteria
        if year < 2000:
            audit_flags.append("classic_paper")
            audit_recommendation = "keep_if_seminal"
        elif year < 2020:
            audit_flags.append("age_5plus_years")

        # Citation-based criteria
        if citations is not None:
            if citations < 5:
                audit_flags.append("low_citations")
                audit_recommendation = "archive_candidate"
            elif citations > 100:
                audit_flags.append("highly_cited")
                audit_recommendation = "keep"
            elif citations > 50:
                audit_flags.append("moderately_cited")
                audit_recommendation = "keep"
        else:
            audit_flags.append("no_citation_data")

        # Has abstract (AI classifiable)
        if paper.get("abstract"):
            audit_flags.append("has_abstract")
        else:
            audit_flags.append("no_abstract")

        paper["audit_flags"] = audit_flags
        paper["audit_recommendation"] = audit_recommendation

    return papers


def main():
    parser = argparse.ArgumentParser(description="Enrich Zotero papers with Semantic Scholar citations")
    parser.add_argument("--batch", type=int, default=50, help="Number of papers to process")
    parser.add_argument("--offset", type=int, default=0, help="Offset for pagination")
    parser.add_argument("--output", type=str, default="/tmp/audit-batch.json", help="Output file path")
    parser.add_argument("--doi", type=str, help="Single DOI lookup")
    parser.add_argument("--quiet", action="store_true", help="Suppress progress output")
    args = parser.parse_args()

    if args.doi:
        # Single DOI lookup
        result = fetch_paper_by_doi(args.doi)
        print(json.dumps(result, indent=2))
        return

    # Batch processing
    print(f"Fetching {args.batch} pre-2023 papers (offset: {args.offset})...")
    papers = get_pre2023_papers(limit=args.batch, offset=args.offset)
    print(f"Retrieved {len(papers)} papers from Zotero")

    if not papers:
        print("No papers found!")
        return

    print(f"\nEnriching with Semantic Scholar data (rate: {RATE_LIMIT_DELAY}s/request)...")
    enriched = enrich_batch(papers, verbose=not args.quiet)

    print(f"\nApplying audit criteria...")
    audited = apply_audit_criteria(enriched)

    # Summary statistics
    keep_count = sum(1 for p in audited if p["audit_recommendation"] == "keep")
    archive_count = sum(1 for p in audited if p["audit_recommendation"] == "archive_candidate")
    review_count = sum(1 for p in audited if p["audit_recommendation"] in ("review", "keep_if_seminal"))

    print(f"\n" + "=" * 60)
    print("AUDIT SUMMARY")
    print("=" * 60)
    print(f"Total papers:     {len(audited)}")
    print(f"Keep:             {keep_count} (highly/moderately cited)")
    print(f"Archive candidate:{archive_count} (low citations)")
    print(f"Review:           {review_count} (uncertain)")

    # Save results
    output_path = Path(args.output)
    with open(output_path, "w") as f:
        json.dump(audited, f, indent=2)
    print(f"\nResults saved to: {output_path}")

    # Also save a human-readable summary
    summary_path = output_path.with_suffix(".md")
    with open(summary_path, "w") as f:
        f.write(f"# Audit Batch Summary\n\n")
        f.write(f"**Generated:** {datetime.now().isoformat()}\n")
        f.write(f"**Papers:** {len(audited)}\n\n")

        f.write("## Keep (Highly Cited)\n\n")
        for p in sorted([p for p in audited if p["audit_recommendation"] == "keep"],
                       key=lambda x: x.get("s2_citation_count", 0) or 0, reverse=True):
            f.write(f"- **{p['title'][:60]}** ({p.get('pub_date', '?')[:4]}) - {p.get('s2_citation_count', '?')} citations\n")

        f.write("\n## Archive Candidates (Low Citations)\n\n")
        for p in [p for p in audited if p["audit_recommendation"] == "archive_candidate"]:
            f.write(f"- {p['title'][:60]} ({p.get('pub_date', '?')[:4]}) - {p.get('s2_citation_count', '?')} citations\n")

        f.write("\n## Review Required\n\n")
        for p in [p for p in audited if p["audit_recommendation"] in ("review", "keep_if_seminal")]:
            f.write(f"- {p['title'][:60]} ({p.get('pub_date', '?')[:4]}) - {p.get('s2_citation_count', '?')} citations - {', '.join(p.get('audit_flags', []))}\n")

    print(f"Summary saved to: {summary_path}")


if __name__ == "__main__":
    main()
