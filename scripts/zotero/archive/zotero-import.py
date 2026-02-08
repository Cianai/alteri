#!/usr/bin/env python3
"""
Zotero Import Script
====================
Import search results to Zotero with metadata normalization.

Reads JSON from unified-search.py output or stdin.

Usage:
    python3 unified-search.py "limerence" | python3 zotero-import.py
    python3 zotero-import.py --input results.json --collection "Research/Limerence"
    python3 zotero-import.py --input results.json --tags "limerence,psychology" --dry-run

Author: Claude Code (for Cian O'Sullivan)
Date: 17 January 2026
"""

import argparse
import json
import os
import re
import sys
import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Optional

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

# Rate limiting
ZOTERO_RATE_LIMIT = 0.5  # seconds between requests

# Output directory
LOG_DIR = Path.home() / "scripts" / "logs"


# =============================================================================
# ZOTERO CLIENT
# =============================================================================

class ZoteroImporter:
    """Import papers to Zotero with metadata normalization."""

    def __init__(self, library_id: str, library_type: str, api_key: str):
        self.zot = zotero.Zotero(library_id, library_type, api_key)
        self.collections_cache: dict[str, str] = {}
        self.last_request = 0

    def _rate_limit(self):
        elapsed = time.time() - self.last_request
        if elapsed < ZOTERO_RATE_LIMIT:
            time.sleep(ZOTERO_RATE_LIMIT - elapsed)
        self.last_request = time.time()

    def _load_collections(self):
        """Load and cache all collections."""
        if self.collections_cache:
            return

        self._rate_limit()
        collections = self.zot.collections()
        for coll in collections:
            name = coll["data"]["name"]
            key = coll["key"]
            parent = coll["data"].get("parentCollection")
            self.collections_cache[key] = {"name": name, "parent": parent}

    def _get_collection_path(self, key: str) -> str:
        """Get full path for a collection."""
        self._load_collections()
        path_parts = []
        current = key

        while current and current in self.collections_cache:
            coll = self.collections_cache[current]
            path_parts.insert(0, coll["name"])
            current = coll["parent"]

        return "/".join(path_parts)

    def _get_or_create_collection(self, path: str, create: bool = True) -> Optional[str]:
        """
        Get or create a collection by path (e.g., "Research/Limerence").

        Returns collection key or None.
        """
        self._load_collections()
        parts = [p.strip() for p in path.split("/") if p.strip()]

        if not parts:
            return None

        parent_key = None

        for part in parts:
            # Find existing collection at this level
            found_key = None
            for key, coll in self.collections_cache.items():
                if coll["name"] == part and coll["parent"] == parent_key:
                    found_key = key
                    break

            if found_key:
                parent_key = found_key
            elif create:
                # Create the collection
                self._rate_limit()
                new_coll = self.zot.create_collections([{
                    "name": part,
                    "parentCollection": parent_key or False,
                }])

                if new_coll and "successful" in new_coll:
                    new_key = list(new_coll["successful"].values())[0]["key"]
                    self.collections_cache[new_key] = {"name": part, "parent": parent_key}
                    parent_key = new_key
                    print(f"  Created collection: {part}", file=sys.stderr)
                else:
                    print(f"  Failed to create collection: {part}", file=sys.stderr)
                    return None
            else:
                return None

        return parent_key

    def _normalize_authors(self, authors: list[dict]) -> list[dict]:
        """Normalize author format for Zotero."""
        normalized = []

        for author in authors:
            name = author.get("name", "").strip()
            if not name:
                continue

            # Try to split into first/last
            parts = name.split()
            if len(parts) >= 2:
                # Assume "First Last" or "First Middle Last" format
                first_name = " ".join(parts[:-1])
                last_name = parts[-1]
            else:
                first_name = ""
                last_name = name

            normalized.append({
                "creatorType": "author",
                "firstName": first_name,
                "lastName": last_name,
            })

        return normalized

    def _parse_date(self, date_str: Optional[str]) -> str:
        """Parse and normalize date string."""
        if not date_str:
            return ""

        # Try various formats
        for fmt in ["%Y-%m-%d", "%Y-%m", "%Y"]:
            try:
                dt = datetime.strptime(date_str[:len("YYYY-MM-DD")], fmt)
                return dt.strftime("%Y-%m-%d") if fmt == "%Y-%m-%d" else date_str
            except ValueError:
                continue

        return date_str

    def _paper_to_zotero_item(self, paper: dict) -> dict:
        """Convert paper dict to Zotero item format."""
        # Determine item type based on venue/source
        venue = paper.get("venue", "") or ""
        source = paper.get("source", "")

        if "arxiv" in source.lower() or "biorxiv" in source.lower():
            item_type = "preprint"
        elif "conference" in venue.lower() or "proceedings" in venue.lower():
            item_type = "conferencePaper"
        else:
            item_type = "journalArticle"

        item = {
            "itemType": item_type,
            "title": paper.get("title", ""),
            "creators": self._normalize_authors(paper.get("authors", [])),
            "abstractNote": paper.get("abstract", "") or "",
            "DOI": paper.get("doi", "") or "",
            "url": paper.get("url", "") or "",
            "date": self._parse_date(paper.get("published_date")),
        }

        # Add venue-specific fields
        if item_type == "journalArticle":
            item["publicationTitle"] = venue
        elif item_type == "conferencePaper":
            item["proceedingsTitle"] = venue
        elif item_type == "preprint":
            item["repository"] = venue or source

        # Add extra metadata
        extra_parts = []
        if paper.get("pmid"):
            extra_parts.append(f"PMID: {paper['pmid']}")
        if paper.get("citation_count") is not None:
            extra_parts.append(f"Citations: {paper['citation_count']}")
        if paper.get("source"):
            extra_parts.append(f"Source: {paper['source']}")

        if extra_parts:
            item["extra"] = "\n".join(extra_parts)

        return item

    def _check_duplicate(self, paper: dict) -> Optional[str]:
        """
        Check if paper already exists in library.

        Returns item key if found, None otherwise.
        """
        doi = paper.get("doi")
        if doi:
            self._rate_limit()
            # Search by DOI
            results = self.zot.items(q=doi, itemType="-attachment")
            for item in results:
                if item["data"].get("DOI", "").lower() == doi.lower():
                    return item["key"]

        return None

    def import_papers(
        self,
        papers: list[dict],
        collection: Optional[str] = None,
        tags: list[str] = None,
        skip_duplicates: bool = True,
        dry_run: bool = False,
    ) -> dict:
        """
        Import papers to Zotero library.

        Args:
            papers: List of paper dicts from unified-search.py
            collection: Collection path to add papers to
            tags: Additional tags to apply
            skip_duplicates: Skip papers that already exist
            dry_run: Don't actually import, just preview

        Returns:
            Results summary dict
        """
        if tags is None:
            tags = []

        results = {
            "imported": 0,
            "skipped_duplicate": 0,
            "errors": 0,
            "items": [],
        }

        # Get/create collection if specified
        collection_key = None
        if collection:
            collection_key = self._get_or_create_collection(collection, create=not dry_run)
            if collection_key:
                print(f"Using collection: {collection}", file=sys.stderr)
            else:
                print(f"Warning: Could not find/create collection: {collection}", file=sys.stderr)

        for i, paper in enumerate(papers, 1):
            title = paper.get("title", "")[:60]
            print(f"\n[{i}/{len(papers)}] {title}...", file=sys.stderr)

            # Check for duplicates
            if skip_duplicates:
                existing_key = self._check_duplicate(paper)
                if existing_key:
                    print(f"  Skipped (already exists: {existing_key})", file=sys.stderr)
                    results["skipped_duplicate"] += 1
                    results["items"].append({
                        "title": paper.get("title"),
                        "status": "duplicate",
                        "key": existing_key,
                    })
                    continue

            # Convert to Zotero format
            item = self._paper_to_zotero_item(paper)

            # Add tags
            item["tags"] = [{"tag": t} for t in tags]
            # Add source tag
            if paper.get("source"):
                item["tags"].append({"tag": f"source:{paper['source']}"})
            # Add import tag
            item["tags"].append({"tag": "imported:unified-search"})

            # Add to collection if specified
            if collection_key:
                item["collections"] = [collection_key]

            if dry_run:
                print(f"  [DRY RUN] Would import: {item['title'][:50]}", file=sys.stderr)
                print(f"    Type: {item['itemType']}", file=sys.stderr)
                print(f"    DOI: {item.get('DOI', 'N/A')}", file=sys.stderr)
                print(f"    Tags: {[t['tag'] for t in item['tags']]}", file=sys.stderr)
                results["imported"] += 1
                results["items"].append({
                    "title": paper.get("title"),
                    "status": "would_import",
                })
            else:
                try:
                    self._rate_limit()
                    response = self.zot.create_items([item])

                    if response and "successful" in response and response["successful"]:
                        new_key = list(response["successful"].values())[0]["key"]
                        print(f"  Imported: {new_key}", file=sys.stderr)
                        results["imported"] += 1
                        results["items"].append({
                            "title": paper.get("title"),
                            "status": "imported",
                            "key": new_key,
                        })
                    else:
                        error_msg = str(response.get("failed", {}) if response else "Unknown error")
                        print(f"  Error: {error_msg}", file=sys.stderr)
                        results["errors"] += 1
                        results["items"].append({
                            "title": paper.get("title"),
                            "status": "error",
                            "error": error_msg,
                        })

                except Exception as e:
                    print(f"  Error: {e}", file=sys.stderr)
                    results["errors"] += 1
                    results["items"].append({
                        "title": paper.get("title"),
                        "status": "error",
                        "error": str(e),
                    })

        return results


# =============================================================================
# CLI
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Import search results to Zotero with metadata normalization"
    )

    parser.add_argument(
        "--input", "-i",
        help="Input JSON file (default: stdin)"
    )

    parser.add_argument(
        "--collection", "-c",
        help="Zotero collection path (e.g., 'Research/Limerence')"
    )

    parser.add_argument(
        "--tags", "-t",
        help="Comma-separated tags to apply to all papers"
    )

    parser.add_argument(
        "--no-skip-duplicates",
        action="store_true",
        help="Don't skip papers that already exist in library"
    )

    parser.add_argument(
        "--dry-run", "-n",
        action="store_true",
        help="Preview import without making changes"
    )

    parser.add_argument(
        "--output", "-o",
        help="Output results to JSON file"
    )

    args = parser.parse_args()

    # Read input
    if args.input:
        input_path = Path(args.input)
        if not input_path.exists():
            print(f"ERROR: Input file not found: {args.input}", file=sys.stderr)
            sys.exit(1)
        papers = json.loads(input_path.read_text())
    else:
        # Read from stdin
        try:
            papers = json.load(sys.stdin)
        except json.JSONDecodeError as e:
            print(f"ERROR: Invalid JSON input: {e}", file=sys.stderr)
            sys.exit(1)

    if not papers:
        print("No papers to import", file=sys.stderr)
        sys.exit(0)

    print(f"Importing {len(papers)} papers to Zotero...", file=sys.stderr)
    if args.dry_run:
        print("MODE: Dry run (no changes will be made)", file=sys.stderr)

    # Parse tags
    tags = [t.strip() for t in args.tags.split(",")] if args.tags else []

    # Initialize importer
    importer = ZoteroImporter(
        library_id=ZOTERO_LIBRARY_ID,
        library_type=ZOTERO_LIBRARY_TYPE,
        api_key=ZOTERO_API_KEY,
    )

    # Import papers
    results = importer.import_papers(
        papers=papers,
        collection=args.collection,
        tags=tags,
        skip_duplicates=not args.no_skip_duplicates,
        dry_run=args.dry_run,
    )

    # Summary
    print("\n" + "=" * 50, file=sys.stderr)
    print("IMPORT SUMMARY", file=sys.stderr)
    print("=" * 50, file=sys.stderr)
    print(f"Total papers:      {len(papers)}", file=sys.stderr)
    print(f"Imported:          {results['imported']}", file=sys.stderr)
    print(f"Skipped (dupes):   {results['skipped_duplicate']}", file=sys.stderr)
    print(f"Errors:            {results['errors']}", file=sys.stderr)

    # Write results
    if args.output:
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(results, indent=2))
        print(f"\nResults written to: {output_path}", file=sys.stderr)
    else:
        # Output results to stdout
        print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
