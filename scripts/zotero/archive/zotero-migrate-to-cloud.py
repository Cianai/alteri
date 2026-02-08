#!/usr/bin/env python3
"""
Zotero Linked-to-Cloud Migration Script

Converts linked_file attachments to imported_file attachments by uploading
local PDFs to Zotero cloud storage. This enables direct URL access for
NotebookLM ingestion without ZotMoov dependency.

Usage:
    python3 zotero-migrate-to-cloud.py scan                  # List linked files
    python3 zotero-migrate-to-cloud.py scan --collection KEY # Scan specific collection
    python3 zotero-migrate-to-cloud.py migrate --dry-run     # Preview migration
    python3 zotero-migrate-to-cloud.py migrate               # Execute migration
    python3 zotero-migrate-to-cloud.py migrate --limit 5     # Migrate first N items
    python3 zotero-migrate-to-cloud.py verify KEY            # Verify specific item

Prerequisites:
    pip install pyzotero requests

Environment:
    ZOTERO_USER_ID - Your Zotero user ID (from zotero.org/settings/keys)
    ZOTERO_API_KEY - API key with write access

Created: 2026-01-17
Author: Claude Code (for Cian O'Sullivan)
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

try:
    from pyzotero import zotero
except ImportError:
    print("ERROR: pyzotero not installed. Run: pip install pyzotero")
    sys.exit(1)

try:
    import requests
except ImportError:
    print("ERROR: requests not installed. Run: pip install requests")
    sys.exit(1)


# Configuration
CONFIG_PATH = Path.home() / ".config" / "claude" / "credentials.json"
LOG_DIR = Path.home() / "scripts" / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)


def load_credentials():
    """Load Zotero credentials from environment or config file."""
    user_id = os.environ.get("ZOTERO_USER_ID")
    api_key = os.environ.get("ZOTERO_API_KEY")

    if user_id and api_key:
        return user_id, api_key

    if CONFIG_PATH.exists():
        with open(CONFIG_PATH) as f:
            config = json.load(f)
            zotero_config = config.get("zotero", {})
            return zotero_config.get("user_id"), zotero_config.get("api_key")

    print("ERROR: No credentials found.")
    print("Set ZOTERO_USER_ID and ZOTERO_API_KEY environment variables,")
    print(f"or create config at {CONFIG_PATH}")
    sys.exit(1)


def get_zotero_client():
    """Create authenticated Zotero client."""
    user_id, api_key = load_credentials()
    return zotero.Zotero(user_id, "user", api_key)


def scan_linked_files(collection_key=None, verbose=True):
    """
    Scan library for linked_file attachments that need migration.

    Returns list of dicts with attachment info:
        - key: Zotero item key
        - parent_key: Parent item key
        - title: Attachment title
        - path: Local file path
        - exists: Whether local file exists
        - size_mb: File size in MB (if exists)
    """
    zot = get_zotero_client()

    if verbose:
        print("Scanning for linked_file attachments...\n")

    # Build query
    params = {
        "itemType": "attachment",
        "limit": 100,
    }

    if collection_key:
        attachments = zot.collection_items(collection_key, **params)
        attachments = [a for a in attachments if a["data"].get("itemType") == "attachment"]
    else:
        attachments = zot.items(**params)

    linked_files = []

    for att in attachments:
        data = att.get("data", {})

        # Only process linked_file attachments (not imported or linked_url)
        if data.get("linkMode") != "linked_file":
            continue

        # Only process PDFs
        if data.get("contentType") != "application/pdf":
            continue

        local_path = data.get("path", "")

        # Handle Zotero's path format (may have attachments: prefix)
        if local_path.startswith("attachments:"):
            # This is a relative path from Zotero's base directory
            # Need to resolve based on Zotero data directory
            local_path = local_path.replace("attachments:", "")

        path_obj = Path(local_path) if local_path else None
        exists = path_obj.exists() if path_obj else False
        size_mb = round(path_obj.stat().st_size / (1024 * 1024), 2) if exists else None

        linked_files.append({
            "key": att.get("key"),
            "parent_key": data.get("parentItem"),
            "title": data.get("title", "Untitled"),
            "filename": data.get("filename", ""),
            "path": local_path,
            "exists": exists,
            "size_mb": size_mb,
            "version": att.get("version"),
        })

    if verbose:
        print(f"Found {len(linked_files)} linked PDF attachment(s)\n")

        accessible = [f for f in linked_files if f["exists"]]
        missing = [f for f in linked_files if not f["exists"]]

        if accessible:
            print(f"✅ {len(accessible)} files accessible locally:")
            total_size = sum(f["size_mb"] or 0 for f in accessible)
            for f in accessible[:10]:  # Show first 10
                print(f"   [{f['key']}] {f['title'][:50]} ({f['size_mb']} MB)")
            if len(accessible) > 10:
                print(f"   ... and {len(accessible) - 10} more")
            print(f"   Total size: {total_size:.1f} MB\n")

        if missing:
            print(f"⚠️  {len(missing)} files NOT found locally:")
            for f in missing[:5]:
                print(f"   [{f['key']}] {f['title'][:50]}")
                print(f"       Path: {f['path'][:80]}")
            if len(missing) > 5:
                print(f"   ... and {len(missing) - 5} more")
            print()

    return linked_files


def migrate_to_cloud(items, dry_run=True, limit=None):
    """
    Migrate linked_file attachments to imported_file (cloud storage).

    Process:
    1. For each linked_file attachment where local file exists
    2. Create new imported_file attachment with same metadata
    3. Upload file to Zotero cloud
    4. Delete old linked_file attachment
    5. Log results

    Args:
        items: List from scan_linked_files()
        dry_run: If True, only preview what would happen
        limit: Maximum number of items to migrate
    """
    zot = get_zotero_client()

    # Filter to accessible files only
    migratable = [i for i in items if i["exists"]]

    if limit:
        migratable = migratable[:limit]

    if not migratable:
        print("No migratable files found (all linked files are missing locally).")
        return []

    print(f"\n{'DRY RUN: ' if dry_run else ''}Migrating {len(migratable)} attachment(s)...\n")

    results = []
    log_entries = []

    for i, item in enumerate(migratable, 1):
        print(f"[{i}/{len(migratable)}] {item['title'][:60]}")

        local_path = Path(item["path"])

        if dry_run:
            print(f"   Would upload: {local_path}")
            print(f"   Size: {item['size_mb']} MB")
            print(f"   Parent: {item['parent_key']}")
            results.append({"key": item["key"], "status": "would_migrate"})
            continue

        try:
            # Upload file as new imported_file attachment
            # attachment_simple creates imported_file attachments
            uploaded = zot.attachment_simple(
                files=[str(local_path)],
                parentid=item["parent_key"]
            )

            if uploaded:
                new_key = uploaded[0].get("key") if isinstance(uploaded, list) else uploaded.get("key")
                print(f"   ✅ Uploaded as: {new_key}")

                # Delete old linked_file attachment
                try:
                    zot.delete_item(zot.item(item["key"]))
                    print(f"   🗑️  Deleted old linked attachment: {item['key']}")
                except Exception as e:
                    print(f"   ⚠️  Could not delete old attachment: {e}")

                results.append({
                    "key": item["key"],
                    "new_key": new_key,
                    "status": "migrated",
                    "path": str(local_path),
                })

                log_entries.append({
                    "timestamp": datetime.now().isoformat(),
                    "old_key": item["key"],
                    "new_key": new_key,
                    "title": item["title"],
                    "size_mb": item["size_mb"],
                    "status": "success",
                })
            else:
                print(f"   ❌ Upload failed (no response)")
                results.append({"key": item["key"], "status": "failed", "error": "no_response"})

        except Exception as e:
            print(f"   ❌ Error: {e}")
            results.append({"key": item["key"], "status": "failed", "error": str(e)})
            log_entries.append({
                "timestamp": datetime.now().isoformat(),
                "old_key": item["key"],
                "title": item["title"],
                "status": "failed",
                "error": str(e),
            })

    # Write log
    if log_entries and not dry_run:
        log_file = LOG_DIR / f"zotero-migration-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
        with open(log_file, "w") as f:
            json.dump(log_entries, f, indent=2)
        print(f"\nLog written to: {log_file}")

    # Summary
    migrated = [r for r in results if r["status"] == "migrated"]
    failed = [r for r in results if r["status"] == "failed"]

    print(f"\n{'DRY RUN ' if dry_run else ''}Summary:")
    print(f"  {'Would migrate' if dry_run else 'Migrated'}: {len(migrated)}")
    if failed:
        print(f"  Failed: {len(failed)}")

    return results


def verify_migration(item_key):
    """
    Verify that an item's attachment is now cloud-accessible.

    Checks:
    1. Attachment exists
    2. linkMode is imported_file
    3. File is accessible via API (returns 302 redirect or 200)
    """
    zot = get_zotero_client()
    user_id, api_key = load_credentials()

    print(f"Verifying attachment: {item_key}\n")

    try:
        item = zot.item(item_key)
        data = item.get("data", {})

        print(f"Title: {data.get('title', 'Unknown')}")
        print(f"Item Type: {data.get('itemType')}")
        print(f"Link Mode: {data.get('linkMode')}")
        print(f"Content Type: {data.get('contentType')}")

        if data.get("linkMode") != "imported_file":
            print(f"\n❌ Not an imported_file (linkMode: {data.get('linkMode')})")
            return False

        # Test file access
        file_url = f"https://api.zotero.org/users/{user_id}/items/{item_key}/file"
        print(f"\nTesting: {file_url}")

        headers = {
            "Zotero-API-Key": api_key,
            "Zotero-API-Version": "3"
        }

        response = requests.get(file_url, headers=headers, allow_redirects=False)

        if response.status_code == 302:
            redirect = response.headers.get("Location", "")
            print(f"Status: 302 Redirect")
            print(f"Redirect URL: {redirect[:100]}...")
            print(f"\n✅ Cloud access: YES")
            return True
        elif response.status_code == 200:
            print(f"Status: 200 OK")
            print(f"Content-Length: {response.headers.get('Content-Length', 'unknown')}")
            print(f"\n✅ Cloud access: YES")
            return True
        else:
            print(f"Status: {response.status_code}")
            print(f"\n❌ Cloud access: NO")
            return False

    except Exception as e:
        print(f"Error: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Migrate Zotero linked_file attachments to cloud storage"
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    # scan command
    scan_parser = subparsers.add_parser("scan", help="Scan for linked files")
    scan_parser.add_argument("--collection", "-c", help="Specific collection key")
    scan_parser.add_argument("--json", action="store_true", help="Output as JSON")

    # migrate command
    migrate_parser = subparsers.add_parser("migrate", help="Migrate linked files to cloud")
    migrate_parser.add_argument("--dry-run", action="store_true", help="Preview only")
    migrate_parser.add_argument("--limit", type=int, help="Max items to migrate")
    migrate_parser.add_argument("--collection", "-c", help="Specific collection key")

    # verify command
    verify_parser = subparsers.add_parser("verify", help="Verify cloud access for item")
    verify_parser.add_argument("key", help="Item key to verify")

    args = parser.parse_args()

    if args.command == "scan":
        items = scan_linked_files(
            collection_key=args.collection,
            verbose=not args.json
        )
        if args.json:
            print(json.dumps(items, indent=2))

    elif args.command == "migrate":
        items = scan_linked_files(
            collection_key=args.collection,
            verbose=True
        )
        if not items:
            print("No linked files to migrate.")
            return

        # Confirm if not dry run
        if not args.dry_run:
            accessible = [i for i in items if i["exists"]]
            print(f"\n⚠️  This will migrate {len(accessible)} file(s) to Zotero cloud storage.")
            print("The original linked attachments will be deleted after successful upload.")
            confirm = input("\nProceed? [y/N]: ")
            if confirm.lower() != "y":
                print("Aborted.")
                return

        migrate_to_cloud(items, dry_run=args.dry_run, limit=args.limit)

    elif args.command == "verify":
        verify_migration(args.key)


if __name__ == "__main__":
    main()
