#!/usr/bin/env python3
"""
Zotero Abstract Enrichment Script
==================================
Fetches missing abstracts for Zotero items using DOI lookups.

Sources (in priority order):
1. Semantic Scholar API - best coverage for academic papers
2. CrossRef API - fallback for items not in Semantic Scholar

Usage:
    python3 zotero-enrich-abstracts.py --dry-run          # Preview what would be updated
    python3 zotero-enrich-abstracts.py --limit 50         # Process first 50 items
    python3 zotero-enrich-abstracts.py                    # Process all items
    python3 zotero-enrich-abstracts.py --report           # Generate report only

Author: Claude Code (for Cian O'Sullivan)
Date: 17 January 2026
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Optional

try:
    from pyzotero import zotero
except ImportError:
    print("ERROR: pyzotero not installed. Run: pip3 install pyzotero")
    sys.exit(1)

try:
    import requests
except ImportError:
    print("ERROR: requests not installed. Run: pip3 install requests")
    sys.exit(1)

# =============================================================================
# CONFIGURATION
# =============================================================================

ZOTERO_LIBRARY_ID = os.environ.get("ZOTERO_LIBRARY_ID")
ZOTERO_LIBRARY_TYPE = "user"
ZOTERO_API_KEY = os.environ.get("ZOTERO_API_KEY")

# API endpoints
SEMANTIC_SCHOLAR_API = "https://api.semanticscholar.org/graph/v1/paper/DOI:{doi}"
CROSSREF_API = "https://api.crossref.org/works/{doi}"
OPENALEX_API = "https://api.openalex.org/works/doi:{doi}"

# Rate limiting
SEMANTIC_SCHOLAR_DELAY = 1.1  # 1 request per second (free tier)
CROSSREF_DELAY = 0.5  # Generous rate for CrossRef
OPENALEX_DELAY = 0.1  # OpenAlex polite pool (no strict limit with mailto)

# Output paths
REPORT_DIR = Path.home() / "Documents" / "ObsidianVault" / "System" / "Research-Architecture"
LOG_DIR = Path.home() / "scripts" / "logs"

# =============================================================================
# API CLIENTS
# =============================================================================

def fetch_abstract_from_semantic_scholar(doi: str) -> Optional[str]:
    """
    Fetch abstract from Semantic Scholar API.

    Args:
        doi: The DOI to look up

    Returns:
        Abstract text if found, None otherwise
    """
    url = SEMANTIC_SCHOLAR_API.format(doi=doi)
    headers = {
        "User-Agent": "ZoteroEnrichment/1.0 (cianosullivan@gmail.com)"
    }

    try:
        response = requests.get(url, headers=headers, params={"fields": "abstract"}, timeout=10)

        if response.status_code == 200:
            data = response.json()
            abstract = data.get("abstract")
            if abstract and len(abstract.strip()) > 50:
                return abstract.strip()
        elif response.status_code == 404:
            pass  # Paper not found - expected for some DOIs
        elif response.status_code == 429:
            print("    Rate limited by Semantic Scholar, waiting...")
            time.sleep(60)

    except requests.RequestException as e:
        print(f"    Semantic Scholar error: {e}")

    return None


def fetch_abstract_from_crossref(doi: str) -> Optional[str]:
    """
    Fetch abstract from CrossRef API.

    Args:
        doi: The DOI to look up

    Returns:
        Abstract text if found, None otherwise
    """
    url = CROSSREF_API.format(doi=doi)
    headers = {
        "User-Agent": "ZoteroEnrichment/1.0 (mailto:cianosullivan@gmail.com)"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code == 200:
            data = response.json()
            message = data.get("message", {})
            abstract = message.get("abstract")
            if abstract and len(abstract.strip()) > 50:
                # CrossRef abstracts may contain JATS XML tags
                import re
                clean = re.sub(r'<[^>]+>', '', abstract)
                return clean.strip()

    except requests.RequestException as e:
        print(f"    CrossRef error: {e}")

    return None


def fetch_abstract_from_openalex(doi: str) -> Optional[str]:
    """
    Fetch abstract from OpenAlex API.
    OpenAlex stores abstracts as inverted indexes which need reconstruction.

    Args:
        doi: The DOI to look up

    Returns:
        Abstract text if found, None otherwise
    """
    url = OPENALEX_API.format(doi=doi)
    headers = {
        "User-Agent": "mailto:cianosullivan@gmail.com"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code == 200:
            data = response.json()
            abstract_inv = data.get("abstract_inverted_index")
            if abstract_inv:
                # Reconstruct abstract from inverted index
                positions = {}
                for word, pos_list in abstract_inv.items():
                    for pos in pos_list:
                        positions[pos] = word
                abstract = " ".join([positions[i] for i in sorted(positions.keys())])
                if len(abstract.strip()) > 50:
                    return abstract.strip()

    except requests.RequestException as e:
        print(f"    OpenAlex error: {e}")

    return None


def fetch_abstract(doi: str) -> tuple[Optional[str], str]:
    """
    Fetch abstract from available sources.

    Args:
        doi: The DOI to look up

    Returns:
        Tuple of (abstract, source) where source is 'semantic_scholar', 'crossref', 'openalex', or 'not_found'
    """
    # Try Semantic Scholar first (best quality)
    abstract = fetch_abstract_from_semantic_scholar(doi)
    if abstract:
        return abstract, "semantic_scholar"

    time.sleep(SEMANTIC_SCHOLAR_DELAY)

    # Try OpenAlex second (good coverage, fast, no strict rate limit)
    abstract = fetch_abstract_from_openalex(doi)
    if abstract:
        return abstract, "openalex"

    time.sleep(OPENALEX_DELAY)

    # Fallback to CrossRef
    abstract = fetch_abstract_from_crossref(doi)
    if abstract:
        return abstract, "crossref"

    time.sleep(CROSSREF_DELAY)

    return None, "not_found"


# =============================================================================
# ZOTERO OPERATIONS
# =============================================================================

def connect_zotero() -> zotero.Zotero:
    """Establish connection to Zotero API."""
    return zotero.Zotero(ZOTERO_LIBRARY_ID, ZOTERO_LIBRARY_TYPE, ZOTERO_API_KEY)


def fetch_all_items_with_retry(zot: zotero.Zotero, max_retries: int = 3) -> list[dict]:
    """Fetch all top-level items with retry logic for transient API errors."""
    items = []
    start = 0
    limit = 100

    while True:
        for attempt in range(max_retries):
            try:
                batch = zot.top(limit=limit, start=start)
                break
            except Exception as e:
                if attempt < max_retries - 1:
                    wait = 2 ** (attempt + 1)
                    print(f"  API error at start={start}, retrying in {wait}s... ({e})")
                    time.sleep(wait)
                else:
                    raise

        if not batch:
            break

        items.extend(batch)
        print(f"  Fetched {len(items)} items...", end="\r")
        start += limit
        time.sleep(0.2)

    print(f"  Fetched {len(items)} total items")
    return items


def get_items_missing_abstracts(zot: zotero.Zotero) -> list[dict]:
    """
    Get all items that have a DOI but no abstract.

    Returns:
        List of items needing enrichment
    """
    print("Fetching items missing abstracts...")

    # Get all top-level items with retry logic for transient 500 errors
    items = fetch_all_items_with_retry(zot)

    # Filter for items with DOI but no abstract
    missing = []
    for item in items:
        data = item.get("data", {})
        item_type = data.get("itemType", "")

        # Skip non-content types
        if item_type in ["attachment", "note", "annotation"]:
            continue

        doi = data.get("DOI", "").strip()
        abstract = data.get("abstractNote", "").strip()

        # Has DOI but no abstract
        if doi and not abstract:
            missing.append({
                "key": item.get("key"),
                "version": item.get("version"),
                "doi": doi,
                "title": data.get("title", "")[:80],
                "item_type": item_type
            })

    print(f"Found {len(missing)} items with DOI but no abstract")
    return missing


def update_item_abstract(zot: zotero.Zotero, item_key: str, version: int, abstract: str) -> bool:
    """
    Update a Zotero item's abstract.

    Args:
        zot: Zotero client
        item_key: Item key to update
        version: Current item version (for conflict detection)
        abstract: New abstract text

    Returns:
        True if update successful
    """
    try:
        # Get current item
        item = zot.item(item_key)

        # Update abstract
        item["data"]["abstractNote"] = abstract

        # Save changes
        zot.update_item(item)
        return True

    except Exception as e:
        print(f"    Update error: {e}")
        return False


# =============================================================================
# MAIN WORKFLOW
# =============================================================================

def run_enrichment(dry_run: bool = False, limit: Optional[int] = None, report_only: bool = False):
    """
    Run the abstract enrichment workflow.

    Args:
        dry_run: If True, don't actually update items
        limit: Maximum number of items to process
        report_only: If True, only generate report without fetching
    """
    start_time = datetime.now()

    print("=" * 60)
    print("ZOTERO ABSTRACT ENRICHMENT")
    print("=" * 60)

    if dry_run:
        print("MODE: Dry run (no changes will be made)")
    elif report_only:
        print("MODE: Report only")
    else:
        print("MODE: Live update")
    print()

    # Connect to Zotero
    zot = connect_zotero()

    # Get items needing enrichment
    items = get_items_missing_abstracts(zot)

    if not items:
        print("No items need abstract enrichment!")
        return

    if report_only:
        # Just output the list
        print(f"\n{len(items)} items missing abstracts:\n")
        for i, item in enumerate(items[:50], 1):
            print(f"{i}. [{item['item_type']}] {item['title']}")
            print(f"   DOI: {item['doi']}")
        if len(items) > 50:
            print(f"\n... and {len(items) - 50} more")
        return

    # Apply limit if specified
    if limit:
        items = items[:limit]
        print(f"Processing {len(items)} items (limited)")

    # Track results
    results = {
        "total": len(items),
        "enriched": 0,
        "not_found": 0,
        "errors": 0,
        "sources": {"semantic_scholar": 0, "openalex": 0, "crossref": 0}
    }

    print(f"\nProcessing {len(items)} items...\n")

    for i, item in enumerate(items, 1):
        print(f"[{i}/{len(items)}] {item['title'][:60]}...")
        print(f"    DOI: {item['doi']}")

        # Fetch abstract
        abstract, source = fetch_abstract(item["doi"])

        if abstract:
            print(f"    Found via {source} ({len(abstract)} chars)")
            results["sources"][source] += 1

            if not dry_run:
                if update_item_abstract(zot, item["key"], item["version"], abstract):
                    print("    ✅ Updated in Zotero")
                    results["enriched"] += 1
                else:
                    print("    ❌ Update failed")
                    results["errors"] += 1
            else:
                print("    [DRY RUN] Would update")
                results["enriched"] += 1
        else:
            print("    ⚠️  Not found in any source")
            results["not_found"] += 1

        print()

        # Rate limiting between items
        time.sleep(0.2)

    # Summary
    elapsed = (datetime.now() - start_time).total_seconds()

    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total processed:      {results['total']}")
    print(f"Abstracts found:      {results['enriched']}")
    print(f"  - Semantic Scholar: {results['sources']['semantic_scholar']}")
    print(f"  - OpenAlex:         {results['sources']['openalex']}")
    print(f"  - CrossRef:         {results['sources']['crossref']}")
    print(f"Not found:            {results['not_found']}")
    print(f"Errors:               {results['errors']}")
    print(f"Time elapsed:         {elapsed:.1f}s")
    print()

    # Save log
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_file = LOG_DIR / f"abstract-enrichment-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
    with open(log_file, "w") as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "mode": "dry_run" if dry_run else "live",
            "results": results
        }, f, indent=2)
    print(f"Log saved to: {log_file}")


def main():
    parser = argparse.ArgumentParser(
        description="Enrich Zotero items with missing abstracts via DOI lookup"
    )

    parser.add_argument(
        "--dry-run", "-n",
        action="store_true",
        help="Preview changes without updating Zotero"
    )

    parser.add_argument(
        "--limit", "-l",
        type=int,
        help="Maximum number of items to process"
    )

    parser.add_argument(
        "--report", "-r",
        action="store_true",
        help="Generate report of items needing enrichment without fetching"
    )

    args = parser.parse_args()

    run_enrichment(
        dry_run=args.dry_run,
        limit=args.limit,
        report_only=args.report
    )


if __name__ == "__main__":
    main()
