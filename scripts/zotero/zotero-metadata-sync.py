#!/usr/bin/env python3
"""
Zotero → Supabase Metadata Sync
================================
Syncs Zotero library metadata into Supabase research_papers table.
This bridges the gap between Zotero (citation store) and Supabase (platform data).

Usage:
    python3 zotero-metadata-sync.py count           # Count syncable items
    python3 zotero-metadata-sync.py sync --limit 50 # Sync first N items
    python3 zotero-metadata-sync.py sync --all      # Sync entire library
    python3 zotero-metadata-sync.py sync --dry-run  # Preview without writing
    python3 zotero-metadata-sync.py status          # Show sync status

Prerequisites:
    pip install pyzotero supabase python-dotenv

Environment (.env or shell):
    ZOTERO_LIBRARY_ID - Your Zotero user ID
    ZOTERO_API_KEY    - API key with read access

Created: 2026-02-07
Author: Claude Code (for Cian O'Sullivan)
Part of: CP5b - Research-to-Platform Pipeline
"""

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

try:
    from dotenv import load_dotenv
except ImportError:
    print("ERROR: python-dotenv not installed. Run: pip install python-dotenv")
    sys.exit(1)

try:
    from pyzotero import zotero
except ImportError:
    print("ERROR: pyzotero not installed. Run: pip install pyzotero")
    sys.exit(1)

try:
    from supabase import create_client, Client
except ImportError:
    print("ERROR: supabase not installed. Run: pip install supabase")
    sys.exit(1)

# Load env from script directory
load_dotenv(Path(__file__).parent / ".env")

# =============================================================================
# CONFIGURATION
# =============================================================================

ZOTERO_LIBRARY_ID = os.environ.get("ZOTERO_LIBRARY_ID")
ZOTERO_API_KEY = os.environ.get("ZOTERO_API_KEY")
SUPABASE_URL = "https://heesyjucnsatjjolyztt.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlZXN5anVjbnNhdGpqb2x5enR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0Mjg1OTEsImV4cCI6MjA4NDAwNDU5MX0.b7AXlU-OVwKZqRYqzEm5ihKx35rR0q8SuwVn-nmWJmQ"

# Item types we sync (skip attachments, notes, annotations)
SYNCABLE_TYPES = {
    "journalArticle", "preprint", "bookSection", "book", "thesis",
    "conferencePaper", "report", "manuscript", "document", "dataset",
    "webpage", "blogPost", "computerProgram", "videoRecording",
}

# Batch size for Zotero API pagination
ZOTERO_PAGE_SIZE = 100

# DOI regex for extraction from Extra field
DOI_PATTERN = re.compile(r'10\.\d{4,9}/[^\s]+')
ARXIV_PATTERN = re.compile(r'(\d{4}\.\d{4,5})(v\d+)?')

if not ZOTERO_LIBRARY_ID or not ZOTERO_API_KEY:
    print("ERROR: Set ZOTERO_LIBRARY_ID and ZOTERO_API_KEY in .env or environment")
    sys.exit(1)


# =============================================================================
# CLIENTS
# =============================================================================

def get_zotero_client():
    return zotero.Zotero(ZOTERO_LIBRARY_ID, "user", ZOTERO_API_KEY)


def get_supabase_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


# =============================================================================
# ZOTERO DATA EXTRACTION
# =============================================================================

def extract_doi(item_data: dict) -> Optional[str]:
    """Extract DOI from item data, checking DOI field and Extra field."""
    doi = item_data.get("DOI", "").strip()
    if doi:
        return doi

    # Check Extra field for DOI
    extra = item_data.get("extra", "")
    for line in extra.split("\n"):
        line = line.strip()
        if line.lower().startswith("doi:"):
            return line.split(":", 1)[1].strip()
        match = DOI_PATTERN.search(line)
        if match:
            return match.group(0)

    return None


def extract_arxiv_id(item_data: dict) -> Optional[str]:
    """Extract arXiv ID from URL, Extra field, or archive fields."""
    # Check archiveID field
    archive_id = item_data.get("archiveID", "")
    if archive_id and "arxiv" in archive_id.lower():
        match = ARXIV_PATTERN.search(archive_id)
        if match:
            return match.group(0)

    # Check URL
    url = item_data.get("url", "")
    if "arxiv.org" in url:
        match = ARXIV_PATTERN.search(url)
        if match:
            return match.group(0)

    # Check Extra field
    extra = item_data.get("extra", "")
    for line in extra.split("\n"):
        if "arxiv" in line.lower():
            match = ARXIV_PATTERN.search(line)
            if match:
                return match.group(0)

    return None


def extract_authors(item_data: dict) -> list[dict]:
    """Extract authors as a list of {firstName, lastName} dicts."""
    creators = item_data.get("creators", [])
    authors = []
    for c in creators:
        if c.get("creatorType") == "author":
            authors.append({
                "firstName": c.get("firstName", ""),
                "lastName": c.get("lastName", ""),
                "name": c.get("name", ""),  # For single-field names
            })
    return authors


def extract_publication_year(item_data: dict) -> Optional[int]:
    """Extract publication year from date field."""
    date_str = item_data.get("date", "")
    if not date_str:
        return None

    # Try YYYY pattern
    match = re.search(r'(\d{4})', date_str)
    if match:
        year = int(match.group(1))
        if 1900 <= year <= 2030:
            return year
    return None


def zotero_item_to_paper(item: dict) -> Optional[dict]:
    """Convert a Zotero API item to a research_papers row dict."""
    data = item.get("data", {})
    item_type = data.get("itemType", "")

    if item_type not in SYNCABLE_TYPES:
        return None

    doi = extract_doi(data)
    arxiv_id = extract_arxiv_id(data)
    title = data.get("title", "").strip()

    if not title:
        return None

    abstract = data.get("abstractNote", "").strip() or None
    authors = extract_authors(data)
    pub_year = extract_publication_year(data)
    journal = data.get("publicationTitle", "").strip() or data.get("bookTitle", "").strip() or None

    return {
        "zotero_key": item.get("key"),
        "doi": doi,
        "arxiv_id": arxiv_id,
        "title": title,
        "abstract": abstract,
        "authors": authors if authors else None,
        "publication_date": data.get("date", None),
        "publication_year": pub_year,
        "journal": journal,
        "keywords": data.get("tags", []) if data.get("tags") else None,
        "source_api": "zotero",
        "api_metadata": {
            "item_type": item_type,
            "zotero_version": item.get("version"),
            "collections": data.get("collections", []),
            "extra": data.get("extra", "")[:500],  # Truncate
        },
        "stage": "accepted",  # Zotero items are already curated
        "stage_changed_at": datetime.now(timezone.utc).isoformat(),
        "classification": {},  # Empty — will be populated by classify-sync.py
    }


# =============================================================================
# SYNC OPERATIONS
# =============================================================================

def fetch_all_zotero_items(zot, limit: Optional[int] = None) -> list[dict]:
    """Fetch all top-level items from Zotero, paginated."""
    if limit:
        # For limited fetches, use manual pagination
        items = []
        start = 0
        while len(items) < limit:
            batch_size = min(ZOTERO_PAGE_SIZE, limit - len(items))
            batch = zot.top(
                start=start,
                limit=batch_size,
                sort="dateModified",
                direction="desc",
            )
            if not batch:
                break
            items.extend(batch)
            print(f"  Fetched {len(items)} items...", end="\r")
            if len(batch) < batch_size:
                break
            start += batch_size
            time.sleep(0.5)  # Rate limit courtesy
    else:
        # Full fetch using pyzotero's everything() helper
        print("  Fetching all items (this may take a minute)...")
        items = zot.everything(zot.top())

    print(f"  Fetched {len(items)} items total    ")
    return items


def get_existing_zotero_keys(supabase: Client) -> set[str]:
    """Get all zotero_keys already in Supabase."""
    keys = set()
    offset = 0
    page_size = 1000

    while True:
        result = supabase.table("research_papers") \
            .select("zotero_key") \
            .not_.is_("zotero_key", "null") \
            .range(offset, offset + page_size - 1) \
            .execute()

        if not result.data:
            break

        for row in result.data:
            if row.get("zotero_key"):
                keys.add(row["zotero_key"])

        if len(result.data) < page_size:
            break

        offset += page_size

    return keys


def upsert_paper(supabase: Client, paper: dict, dry_run: bool = False) -> str:
    """Upsert a paper to Supabase. Returns 'inserted', 'updated', or 'skipped'."""
    if dry_run:
        return "would_insert"

    # Clean up keywords — convert Zotero tag format to simple string array
    if paper.get("keywords"):
        paper["keywords"] = [
            t.get("tag", "") for t in paper["keywords"]
            if isinstance(t, dict) and t.get("tag")
        ]
        if not paper["keywords"]:
            paper["keywords"] = None

    # Clean up publication_date — Supabase expects ISO date or null
    pub_date = paper.get("publication_date")
    if pub_date and isinstance(pub_date, str) and pub_date.strip():
        # Try to parse various date formats
        date_match = re.search(r'(\d{4})-?(\d{2})?-?(\d{2})?', pub_date)
        if date_match:
            year = int(date_match.group(1))
            month = int(date_match.group(2) or "1")
            day = int(date_match.group(3) or "1")
            # Validate ranges
            if year < 1800 or year > 2030:
                paper["publication_date"] = None
            else:
                month = max(1, min(12, month))
                day = max(1, min(28, day))  # Safe cap at 28
                paper["publication_date"] = f"{year:04d}-{month:02d}-{day:02d}"
        else:
            paper["publication_date"] = None
    else:
        paper["publication_date"] = None

    # Set updated_at
    paper["updated_at"] = datetime.now(timezone.utc).isoformat()

    try:
        result = supabase.table("research_papers").upsert(
            paper,
            on_conflict="zotero_key",
        ).execute()
        return "upserted"
    except Exception as e:
        # If upsert on zotero_key fails (no unique constraint), try DOI
        if paper.get("doi"):
            try:
                # Check if DOI exists
                existing = supabase.table("research_papers") \
                    .select("id, zotero_key") \
                    .eq("doi", paper["doi"]) \
                    .execute()

                if existing.data:
                    # Update existing row with zotero_key
                    row_id = existing.data[0]["id"]
                    supabase.table("research_papers") \
                        .update(paper) \
                        .eq("id", row_id) \
                        .execute()
                    return "updated_via_doi"
                else:
                    # Insert new
                    supabase.table("research_papers").insert(paper).execute()
                    return "inserted"
            except Exception as e2:
                print(f"    Error on DOI fallback: {e2}")
                return "error"
        else:
            try:
                supabase.table("research_papers").insert(paper).execute()
                return "inserted"
            except Exception as e2:
                print(f"    Error on insert: {e2}")
                return "error"


# =============================================================================
# COMMANDS
# =============================================================================

def cmd_count():
    """Count syncable items."""
    zot = get_zotero_client()
    print("Counting Zotero items...")
    items = fetch_all_zotero_items(zot)

    syncable = 0
    by_type = {}
    for item in items:
        data = item.get("data", {})
        itype = data.get("itemType", "unknown")
        if itype in SYNCABLE_TYPES:
            syncable += 1
            by_type[itype] = by_type.get(itype, 0) + 1

    print(f"\nTotal items: {len(items)}")
    print(f"Syncable:    {syncable}")
    print(f"\nBy type:")
    for t, c in sorted(by_type.items(), key=lambda x: -x[1]):
        print(f"  {t}: {c}")


def cmd_sync(limit: Optional[int] = None, dry_run: bool = False, force: bool = False):
    """Sync Zotero metadata to Supabase."""
    zot = get_zotero_client()
    supabase = get_supabase_client()

    print("=" * 60)
    print(f"ZOTERO → SUPABASE METADATA SYNC {'(DRY RUN)' if dry_run else ''}")
    print("=" * 60)

    # Fetch Zotero items
    print("\n1. Fetching from Zotero...")
    items = fetch_all_zotero_items(zot, limit=limit)

    # Get existing keys for incremental sync
    if not force:
        print("\n2. Checking existing Supabase records...")
        existing_keys = get_existing_zotero_keys(supabase)
        print(f"   Already synced: {len(existing_keys)} papers")
    else:
        existing_keys = set()
        print("\n2. Force mode — will upsert all items")

    # Convert and sync
    print(f"\n3. {'Previewing' if dry_run else 'Syncing'} papers...")
    stats = {"inserted": 0, "upserted": 0, "updated_via_doi": 0,
             "skipped": 0, "would_insert": 0, "error": 0, "not_syncable": 0}

    for i, item in enumerate(items, 1):
        paper = zotero_item_to_paper(item)
        if not paper:
            stats["not_syncable"] += 1
            continue

        zkey = paper["zotero_key"]

        # Skip if already synced (incremental)
        if not force and zkey in existing_keys:
            stats["skipped"] += 1
            continue

        result = upsert_paper(supabase, paper, dry_run=dry_run)
        stats[result] = stats.get(result, 0) + 1

        if i % 50 == 0:
            synced = stats["inserted"] + stats["upserted"] + stats["updated_via_doi"] + stats["would_insert"]
            print(f"   Progress: {i}/{len(items)} processed, {synced} synced")

        if not dry_run:
            time.sleep(0.1)  # Rate limit

    # Summary
    print(f"\n{'=' * 60}")
    print(f"SYNC {'PREVIEW' if dry_run else 'COMPLETE'}")
    print(f"{'=' * 60}")
    print(f"  Total Zotero items:  {len(items)}")
    print(f"  Not syncable:        {stats['not_syncable']}")
    print(f"  Already in Supabase: {stats['skipped']}")
    if dry_run:
        print(f"  Would insert:        {stats['would_insert']}")
    else:
        print(f"  Inserted:            {stats['inserted']}")
        print(f"  Upserted:            {stats['upserted']}")
        print(f"  Updated via DOI:     {stats['updated_via_doi']}")
        print(f"  Errors:              {stats['error']}")


def cmd_status():
    """Show sync status."""
    supabase = get_supabase_client()

    # Count total papers in Supabase
    total = supabase.table("research_papers").select("id", count="exact").execute()
    total_count = total.count or 0

    # Count with zotero_key
    zotero_synced = supabase.table("research_papers") \
        .select("id", count="exact") \
        .not_.is_("zotero_key", "null") \
        .execute()
    zotero_count = zotero_synced.count or 0

    # Count classified
    classified = supabase.table("research_papers") \
        .select("id", count="exact") \
        .neq("classification", "{}") \
        .execute()
    classified_count = classified.count or 0

    # Count with abstracts
    with_abstract = supabase.table("research_papers") \
        .select("id", count="exact") \
        .not_.is_("abstract", "null") \
        .execute()
    abstract_count = with_abstract.count or 0

    print("=" * 50)
    print("SUPABASE RESEARCH_PAPERS STATUS")
    print("=" * 50)
    print(f"  Total papers:     {total_count}")
    print(f"  From Zotero:      {zotero_count}")
    print(f"  With abstracts:   {abstract_count}")
    print(f"  Classified:       {classified_count}")
    print(f"  Unclassified:     {total_count - classified_count}")
    print()
    print(f"  Zotero library:   ~6,381 items")
    print(f"  Sync coverage:    {zotero_count / 6352 * 100:.1f}%" if total_count else "  Sync coverage:    0%")


# =============================================================================
# MAIN
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Sync Zotero metadata to Supabase research_papers table"
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # count
    subparsers.add_parser("count", help="Count syncable items in Zotero")

    # sync
    sync_parser = subparsers.add_parser("sync", help="Sync metadata to Supabase")
    sync_parser.add_argument("--limit", type=int, help="Max items to sync")
    sync_parser.add_argument("--all", action="store_true", help="Sync entire library")
    sync_parser.add_argument("--dry-run", action="store_true", help="Preview without writing")
    sync_parser.add_argument("--force", action="store_true", help="Re-sync already synced items")

    # status
    subparsers.add_parser("status", help="Show sync status")

    args = parser.parse_args()

    if args.command == "count":
        cmd_count()
    elif args.command == "sync":
        limit = args.limit if args.limit else (None if args.all else None)
        if not args.all and not args.limit:
            print("Specify --limit N or --all")
            return
        cmd_sync(limit=limit, dry_run=args.dry_run, force=args.force)
    elif args.command == "status":
        cmd_status()


if __name__ == "__main__":
    main()
