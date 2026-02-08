#!/usr/bin/env python3
"""
Zotero Emoji Tag Deletion Script
================================
Deletes emoji tags from Zotero items (does NOT convert them).

Uses SQLite to find item keys (bypassing API tag search issues),
then uses pyzotero Web API for updates.

Usage:
    python3 zotero-delete-emoji-tags.py --dry-run     # Preview only
    python3 zotero-delete-emoji-tags.py               # Execute deletion

Author: Claude Code (for Cian O'Sullivan)
Date: 1 February 2026
"""

import argparse
import json
import os
# sqlite3 removed - using API-only approach
import sys
import time
from datetime import datetime
from pathlib import Path

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
# SQLite path removed - using API-only approach

# Tags to DELETE entirely (not convert)
EMOJI_TAGS_TO_DELETE = [
    "❌ nosource",
]

# Output paths
LOG_DIR = Path.home() / "scripts" / "logs"

# Batch size
BATCH_SIZE = 50

# =============================================================================
# ZOTERO OPERATIONS
# =============================================================================

def connect_zotero() -> zotero.Zotero:
    """Establish connection to Zotero API."""
    return zotero.Zotero(ZOTERO_LIBRARY_ID, ZOTERO_LIBRARY_TYPE, ZOTERO_API_KEY)


def get_items_with_tag(zot: zotero.Zotero, tag: str) -> list[dict]:
    """
    Get all items with a specific tag by scanning all items.

    This approach fetches all items and filters locally,
    bypassing pyzotero API tag search issues with special characters.

    Returns:
        List of items with the tag
    """
    print(f"Fetching all items to find tag '{tag}'...")
    print("  (This may take a minute for large libraries)")

    # Get all top-level items
    all_items = zot.everything(zot.top())
    print(f"  Retrieved {len(all_items)} items from API")

    # Filter for items with this tag
    items_with_tag = []
    for item in all_items:
        data = item.get("data", {})
        tags = data.get("tags", [])
        item_type = data.get("itemType", "")

        # Skip non-content types
        if item_type in ["attachment", "note", "annotation"]:
            continue

        # Check if tag exists
        for t in tags:
            if t.get("tag") == tag:
                items_with_tag.append(item)
                break

    print(f"Found {len(items_with_tag)} items with tag '{tag}'")
    return items_with_tag


def remove_tag_from_item(item: dict, tag_to_remove: str) -> dict:
    """
    Remove a specific tag from an item's data.

    Args:
        item: Zotero item dict
        tag_to_remove: Tag name to remove

    Returns:
        Modified item with tag removed
    """
    data = item.get("data", {})
    tags = data.get("tags", [])

    # Filter out the tag to remove
    new_tags = [t for t in tags if t.get("tag") != tag_to_remove]

    item["data"]["tags"] = new_tags
    return item


def delete_tag_from_items(zot: zotero.Zotero, items: list[dict], tag: str, dry_run: bool = True) -> dict:
    """
    Delete a tag from all provided items.

    Args:
        zot: Zotero client
        items: Items to update
        tag: Tag to remove
        dry_run: If True, don't actually update

    Returns:
        Results dict with counts
    """
    results = {
        "total": len(items),
        "updated": 0,
        "errors": 0,
        "error_details": []
    }

    # Process in batches
    for i in range(0, len(items), BATCH_SIZE):
        batch = items[i:i + BATCH_SIZE]
        batch_num = (i // BATCH_SIZE) + 1
        total_batches = (len(items) + BATCH_SIZE - 1) // BATCH_SIZE

        print(f"\nBatch {batch_num}/{total_batches} ({len(batch)} items)...")

        if dry_run:
            # Just count
            for item in batch:
                title = item.get("data", {}).get("title", "Unknown")[:50]
                print(f"  [DRY RUN] Would remove '{tag}' from: {title}")
                results["updated"] += 1
        else:
            # Actually update items
            items_to_update = []
            for item in batch:
                modified_item = remove_tag_from_item(item.copy(), tag)
                items_to_update.append(modified_item)

            try:
                # Batch update via pyzotero
                zot.update_items(items_to_update)
                results["updated"] += len(batch)
                print(f"  ✅ Updated {len(batch)} items")
            except Exception as e:
                print(f"  ❌ Batch update failed: {e}")
                results["errors"] += len(batch)
                results["error_details"].append(str(e))

                # Try individual updates as fallback
                print("  Attempting individual updates...")
                for item in items_to_update:
                    try:
                        zot.update_item(item)
                        results["updated"] += 1
                        results["errors"] -= 1
                    except Exception as e2:
                        title = item.get("data", {}).get("title", "Unknown")[:50]
                        print(f"    ❌ Failed: {title} - {e2}")

        # Rate limiting between batches
        if not dry_run:
            time.sleep(0.5)

    return results


# =============================================================================
# MAIN WORKFLOW
# =============================================================================

def run_deletion(dry_run: bool = True):
    """
    Run the emoji tag deletion workflow.

    Args:
        dry_run: If True, preview only
    """
    start_time = datetime.now()

    print("=" * 60)
    print("ZOTERO EMOJI TAG DELETION")
    print("=" * 60)

    if dry_run:
        print("MODE: Dry run (no changes will be made)")
    else:
        print("MODE: Live deletion")
    print()

    # Connect to Zotero
    zot = connect_zotero()

    # Get baseline counts for circuit breaker
    print("Getting baseline counts...")
    all_items = zot.everything(zot.top())
    baseline_count = len(all_items)
    print(f"Baseline item count: {baseline_count}")

    all_results = {}

    for tag in EMOJI_TAGS_TO_DELETE:
        print(f"\n{'=' * 60}")
        print(f"Processing tag: '{tag}'")
        print("=" * 60)

        # Get items with this tag
        items = get_items_with_tag(zot, tag)

        if not items:
            print(f"No items found with tag '{tag}'")
            all_results[tag] = {"total": 0, "updated": 0, "errors": 0}
            continue

        # Delete tag from items
        results = delete_tag_from_items(zot, items, tag, dry_run)
        all_results[tag] = results

        # Verify item count hasn't changed (circuit breaker)
        if not dry_run:
            print("\nVerifying item count...")
            post_items = zot.everything(zot.top())
            post_count = len(post_items)

            if post_count < baseline_count:
                print(f"⚠️ CIRCUIT BREAKER: Item count decreased! {baseline_count} → {post_count}")
                print("HALTING EXECUTION")
                break
            else:
                print(f"✅ Item count unchanged: {post_count}")

    # Summary
    elapsed = (datetime.now() - start_time).total_seconds()

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    total_updated = 0
    total_errors = 0

    for tag, results in all_results.items():
        print(f"\nTag: '{tag}'")
        print(f"  Total items:   {results['total']}")
        print(f"  Updated:       {results['updated']}")
        print(f"  Errors:        {results['errors']}")
        total_updated += results['updated']
        total_errors += results['errors']

    print(f"\nTotal updated: {total_updated}")
    print(f"Total errors:  {total_errors}")
    print(f"Time elapsed:  {elapsed:.1f}s")

    # Save log
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_file = LOG_DIR / f"emoji-tag-deletion-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
    with open(log_file, "w") as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "mode": "dry_run" if dry_run else "live",
            "baseline_count": baseline_count,
            "results": all_results
        }, f, indent=2)
    print(f"\nLog saved to: {log_file}")

    return total_updated, total_errors


def main():
    parser = argparse.ArgumentParser(
        description="Delete emoji tags from Zotero items"
    )

    parser.add_argument(
        "--dry-run", "-n",
        action="store_true",
        help="Preview changes without updating Zotero"
    )

    args = parser.parse_args()

    run_deletion(dry_run=args.dry_run)


if __name__ == "__main__":
    main()
