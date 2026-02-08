#!/usr/bin/env python3
"""
Zotero Audit Tag Application Script
====================================
Applies audit tags (#audit/keep, #audit/archive, #audit/review) to papers
based on the citation enrichment and triage results.

Usage:
    python3 zotero-apply-audit-tags.py --json /tmp/audit-batch-1.json --dry-run
    python3 zotero-apply-audit-tags.py --json /tmp/audit-batch-1.json --apply
    python3 zotero-apply-audit-tags.py --keys KEY1,KEY2 --tag "#audit/keep"

Author: Claude Code (for Cian O'Sullivan)
Date: 31 January 2026
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Dict, List

try:
    from pyzotero import zotero
except ImportError:
    print("ERROR: pyzotero not installed. Run: pip3 install pyzotero")
    sys.exit(1)


# Configuration
ZOTERO_LIBRARY_ID = os.environ.get("ZOTERO_LIBRARY_ID")
ZOTERO_LIBRARY_TYPE = "user"
ZOTERO_API_KEY = os.environ.get("ZOTERO_API_KEY")

# Tag mapping
AUDIT_TAGS = {
    "keep": "#audit/keep",
    "archive_candidate": "#audit/archive",
    "review": "#audit/review",
    "keep_if_seminal": "#audit/review"  # Map to review for human decision
}


def connect_zotero() -> zotero.Zotero:
    """Establish connection to Zotero API."""
    return zotero.Zotero(ZOTERO_LIBRARY_ID, ZOTERO_LIBRARY_TYPE, ZOTERO_API_KEY)


def get_item_by_key(zot: zotero.Zotero, key: str) -> Dict:
    """Fetch a single item by key."""
    return zot.item(key)


def add_tag_to_item(zot: zotero.Zotero, key: str, tag: str, dry_run: bool = True) -> bool:
    """Add a tag to an item, preserving existing tags."""
    try:
        item = zot.item(key)
        if not item:
            print(f"  ERROR: Item {key} not found")
            return False

        # Get existing tags
        existing_tags = item.get("data", {}).get("tags", [])
        tag_strings = [t.get("tag", "") for t in existing_tags]

        if tag in tag_strings:
            print(f"  SKIP: {key} already has tag '{tag}'")
            return True

        # Add new tag
        new_tags = existing_tags + [{"tag": tag}]

        if dry_run:
            print(f"  DRY RUN: Would add '{tag}' to {key}")
            return True

        # Update item
        item["data"]["tags"] = new_tags
        zot.update_item(item)
        print(f"  OK: Added '{tag}' to {key}")
        return True

    except Exception as e:
        print(f"  ERROR: {key} - {str(e)}")
        return False


def process_audit_json(zot: zotero.Zotero, json_path: str, dry_run: bool = True) -> Dict:
    """Process audit JSON and apply tags based on recommendations."""
    with open(json_path) as f:
        papers = json.load(f)

    stats = {"keep": 0, "archive": 0, "review": 0, "error": 0}

    for paper in papers:
        key = paper.get("key")
        recommendation = paper.get("audit_recommendation")
        title = paper.get("title", "Unknown")[:50]

        tag = AUDIT_TAGS.get(recommendation, "#audit/review")
        print(f"\n[{recommendation.upper()}] {title}...")

        if add_tag_to_item(zot, key, tag, dry_run):
            if "keep" in recommendation:
                stats["keep"] += 1
            elif "archive" in recommendation:
                stats["archive"] += 1
            else:
                stats["review"] += 1
        else:
            stats["error"] += 1

    return stats


def main():
    parser = argparse.ArgumentParser(description="Apply audit tags to Zotero items")
    parser.add_argument("--json", type=str, help="Path to audit JSON file")
    parser.add_argument("--keys", type=str, help="Comma-separated item keys")
    parser.add_argument("--tag", type=str, default="#audit/review", help="Tag to apply")
    parser.add_argument("--dry-run", action="store_true", help="Preview without applying")
    parser.add_argument("--apply", action="store_true", help="Actually apply tags")
    args = parser.parse_args()

    if not args.json and not args.keys:
        parser.error("Either --json or --keys is required")

    if not args.dry_run and not args.apply:
        print("WARNING: Neither --dry-run nor --apply specified. Defaulting to --dry-run")
        args.dry_run = True

    print("Connecting to Zotero API...")
    zot = connect_zotero()

    if args.json:
        print(f"\nProcessing audit file: {args.json}")
        print(f"Mode: {'DRY RUN' if args.dry_run else 'APPLYING TAGS'}")
        stats = process_audit_json(zot, args.json, dry_run=args.dry_run)

        print("\n" + "=" * 60)
        print("SUMMARY")
        print("=" * 60)
        print(f"Keep:    {stats['keep']}")
        print(f"Archive: {stats['archive']}")
        print(f"Review:  {stats['review']}")
        print(f"Errors:  {stats['error']}")

        if args.dry_run:
            print("\nThis was a dry run. Use --apply to actually add tags.")

    elif args.keys:
        keys = [k.strip() for k in args.keys.split(",")]
        print(f"\nApplying tag '{args.tag}' to {len(keys)} items")
        print(f"Mode: {'DRY RUN' if args.dry_run else 'APPLYING TAGS'}")

        success = 0
        for key in keys:
            if add_tag_to_item(zot, key, args.tag, dry_run=args.dry_run):
                success += 1

        print(f"\nSuccess: {success}/{len(keys)}")


if __name__ == "__main__":
    main()
