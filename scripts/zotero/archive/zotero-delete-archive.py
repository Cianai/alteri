#!/usr/bin/env python3
"""
Delete archived papers from local Zotero database.
These papers scored below threshold and don't match any coursework/research terms.

Usage:
    python3 zotero-delete-archive.py --dry-run   # Preview what will be deleted
    python3 zotero-delete-archive.py --apply     # Actually delete

Author: Claude Code
Date: 31 January 2026
"""

import argparse
import json
import sqlite3
from pathlib import Path
from datetime import datetime

ZOTERO_DB_PATH = Path.home() / "Zotero" / "zotero.sqlite"
DELETE_KEYS_FILE = Path("/tmp/zotero-delete-keys.json")


def delete_items_by_key(keys: list, dry_run: bool = True) -> int:
    """Delete items from Zotero SQLite by their keys."""
    conn = sqlite3.connect(ZOTERO_DB_PATH)
    cursor = conn.cursor()

    deleted = 0

    for key in keys:
        # Get itemID from key
        cursor.execute("SELECT itemID FROM items WHERE key = ?", (key,))
        result = cursor.fetchone()

        if result:
            item_id = result[0]

            if dry_run:
                # Just count
                cursor.execute("SELECT key FROM items WHERE itemID = ?", (item_id,))
                print(f"Would delete: {key}")
                deleted += 1
            else:
                # Actually delete by moving to trash (Zotero's deletedItems table)
                cursor.execute(
                    "INSERT OR IGNORE INTO deletedItems (itemID, dateDeleted) VALUES (?, ?)",
                    (item_id, datetime.now().isoformat())
                )
                deleted += 1

    if not dry_run:
        conn.commit()
        print(f"\nMoved {deleted} items to Zotero trash.")
        print("Open Zotero and empty trash to permanently delete, or they'll sync as deleted.")

    conn.close()
    return deleted


def main():
    parser = argparse.ArgumentParser(description="Delete archived papers from Zotero")
    parser.add_argument("--dry-run", action="store_true", help="Preview deletions without applying")
    parser.add_argument("--apply", action="store_true", help="Actually delete the papers")
    args = parser.parse_args()

    if not args.dry_run and not args.apply:
        print("Must specify --dry-run or --apply")
        return

    # Load keys to delete
    with open(DELETE_KEYS_FILE) as f:
        keys = json.load(f)

    print(f"Loaded {len(keys)} keys to delete")
    print(f"Database: {ZOTERO_DB_PATH}")
    print()

    deleted = delete_items_by_key(keys, dry_run=args.dry_run)

    print(f"\n{'Would delete' if args.dry_run else 'Deleted'}: {deleted} papers")


if __name__ == "__main__":
    main()
