#!/usr/bin/env python3
"""
Zotero Cloud to Supabase Public Storage

Downloads PDFs from Zotero cloud storage and uploads them to Supabase
public bucket for NotebookLM ingestion via public URLs.

Usage:
    python3 zotero-to-supabase.py list                    # List cloud PDFs
    python3 zotero-to-supabase.py upload --key EGT3N3Q5  # Upload single item
    python3 zotero-to-supabase.py upload --all           # Upload all cloud PDFs
    python3 zotero-to-supabase.py upload --limit 5       # Upload first N items
    python3 zotero-to-supabase.py verify KEY             # Verify public URL works

Prerequisites:
    pip install pyzotero supabase requests

Environment (or ~/.config/claude/credentials.json):
    ZOTERO_USER_ID - Your Zotero user ID
    ZOTERO_API_KEY - API key with read access

Created: 2026-01-17
Author: Claude Code (for Cian O'Sullivan)
"""

import argparse
import json
import os
import sys
import tempfile
from pathlib import Path

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

try:
    import requests
except ImportError:
    print("ERROR: requests not installed. Run: pip install requests")
    sys.exit(1)


# Configuration
CONFIG_PATH = Path.home() / ".config" / "claude" / "credentials.json"
SUPABASE_URL = "https://heesyjucnsatjjolyztt.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlZXN5anVjbnNhdGpqb2x5enR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0Mjg1OTEsImV4cCI6MjA4NDAwNDU5MX0.b7AXlU-OVwKZqRYqzEm5ihKx35rR0q8SuwVn-nmWJmQ"
BUCKET_NAME = "research-pdfs"


def load_zotero_credentials():
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

    print("ERROR: No Zotero credentials found.")
    print("Set ZOTERO_USER_ID and ZOTERO_API_KEY environment variables,")
    print(f"or create config at {CONFIG_PATH}")
    sys.exit(1)


def get_zotero_client():
    """Create authenticated Zotero client."""
    user_id, api_key = load_zotero_credentials()
    return zotero.Zotero(user_id, "user", api_key)


def get_supabase_client() -> Client:
    """Create Supabase client."""
    return create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


def get_citation_key(item: dict) -> str:
    """
    Extract BetterBibTeX citation key from item's Extra field.
    Falls back to Zotero item key if not found.
    """
    extra = item.get("data", {}).get("extra", "")
    for line in extra.split("\n"):
        if line.startswith("Citation Key:"):
            return line.split(":", 1)[1].strip()
    return item.get("key", "unknown")


def list_cloud_pdfs(verbose=True):
    """
    List all imported_file PDF attachments (cloud-stored).

    Returns list of dicts with:
        - key: Zotero attachment key
        - parent_key: Parent item key
        - title: Attachment/parent title
        - citation_key: BetterBibTeX key if available
        - filename: Original filename
    """
    zot = get_zotero_client()

    if verbose:
        print("Scanning for cloud-stored PDFs (imported_file)...\n")

    # Get all attachments
    attachments = zot.items(itemType="attachment", limit=100)

    cloud_pdfs = []

    for att in attachments:
        data = att.get("data", {})

        # Only imported_file (cloud-stored)
        if data.get("linkMode") != "imported_file":
            continue

        # Only PDFs
        if data.get("contentType") != "application/pdf":
            continue

        parent_key = data.get("parentItem")

        # Get parent item for citation key
        citation_key = att.get("key")  # default to attachment key
        title = data.get("title", "Untitled")

        if parent_key:
            try:
                parent = zot.item(parent_key)
                citation_key = get_citation_key(parent)
                title = parent.get("data", {}).get("title", title)
            except Exception:
                pass

        cloud_pdfs.append({
            "key": att.get("key"),
            "parent_key": parent_key,
            "title": title,
            "citation_key": citation_key,
            "filename": data.get("filename", ""),
        })

    if verbose:
        print(f"Found {len(cloud_pdfs)} cloud-stored PDF(s)\n")
        for pdf in cloud_pdfs:
            print(f"  [{pdf['key']}] {pdf['citation_key']}")
            print(f"      Title: {pdf['title'][:60]}...")
            print()

    return cloud_pdfs


def download_pdf_from_zotero(attachment_key: str) -> bytes:
    """Download PDF content from Zotero cloud."""
    user_id, api_key = load_zotero_credentials()

    url = f"https://api.zotero.org/users/{user_id}/items/{attachment_key}/file"
    headers = {
        "Zotero-API-Key": api_key,
        "Zotero-API-Version": "3"
    }

    response = requests.get(url, headers=headers, allow_redirects=True)

    if response.status_code == 200:
        return response.content
    else:
        raise Exception(f"Failed to download: HTTP {response.status_code}")


def upload_to_supabase(filename: str, content: bytes) -> str:
    """
    Upload PDF to Supabase public bucket.
    Returns public URL.
    """
    supabase = get_supabase_client()

    # Upload file
    result = supabase.storage.from_(BUCKET_NAME).upload(
        path=filename,
        file=content,
        file_options={"content-type": "application/pdf", "upsert": "true"}
    )

    # Construct public URL
    public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{filename}"

    return public_url


def upload_items(items: list, dry_run: bool = False):
    """Upload PDFs from Zotero cloud to Supabase."""
    results = []

    print(f"\n{'DRY RUN: ' if dry_run else ''}Uploading {len(items)} PDF(s)...\n")

    for i, item in enumerate(items, 1):
        filename = f"{item['citation_key']}.pdf"
        print(f"[{i}/{len(items)}] {filename}")
        print(f"    Zotero key: {item['key']}")

        if dry_run:
            print(f"    Would upload to: {SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{filename}")
            results.append({"key": item["key"], "status": "would_upload", "filename": filename})
            continue

        try:
            # Download from Zotero
            print(f"    Downloading from Zotero cloud...")
            pdf_content = download_pdf_from_zotero(item["key"])
            print(f"    Downloaded: {len(pdf_content) / 1024:.1f} KB")

            # Upload to Supabase
            print(f"    Uploading to Supabase...")
            public_url = upload_to_supabase(filename, pdf_content)
            print(f"    ✅ Public URL: {public_url}")

            results.append({
                "key": item["key"],
                "citation_key": item["citation_key"],
                "status": "uploaded",
                "url": public_url,
                "size_kb": len(pdf_content) / 1024,
            })

        except Exception as e:
            print(f"    ❌ Error: {e}")
            results.append({"key": item["key"], "status": "failed", "error": str(e)})

        print()

    # Summary
    uploaded = [r for r in results if r["status"] == "uploaded"]
    failed = [r for r in results if r["status"] == "failed"]

    print(f"{'DRY RUN ' if dry_run else ''}Summary:")
    print(f"  {'Would upload' if dry_run else 'Uploaded'}: {len(uploaded)}")
    if failed:
        print(f"  Failed: {len(failed)}")

    return results


def verify_public_url(citation_key: str):
    """Verify that a PDF is accessible via public URL."""
    filename = f"{citation_key}.pdf"
    url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{filename}"

    print(f"Verifying: {url}\n")

    response = requests.head(url)

    print(f"Status: {response.status_code}")
    print(f"Content-Type: {response.headers.get('Content-Type', 'unknown')}")
    print(f"Content-Length: {response.headers.get('Content-Length', 'unknown')} bytes")

    if response.status_code == 200:
        print(f"\n✅ Public access: YES")
        return True
    else:
        print(f"\n❌ Public access: NO")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Upload Zotero cloud PDFs to Supabase public storage"
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    # list command
    list_parser = subparsers.add_parser("list", help="List cloud-stored PDFs")
    list_parser.add_argument("--json", action="store_true", help="Output as JSON")

    # upload command
    upload_parser = subparsers.add_parser("upload", help="Upload PDFs to Supabase")
    upload_parser.add_argument("--key", "-k", help="Specific Zotero attachment key")
    upload_parser.add_argument("--keys", help="Comma-separated list of attachment keys")
    upload_parser.add_argument("--all", action="store_true", help="Upload all cloud PDFs")
    upload_parser.add_argument("--limit", type=int, help="Max items to upload")
    upload_parser.add_argument("--dry-run", action="store_true", help="Preview only")

    # verify command
    verify_parser = subparsers.add_parser("verify", help="Verify public URL access")
    verify_parser.add_argument("citation_key", help="Citation key to verify")

    args = parser.parse_args()

    if args.command == "list":
        items = list_cloud_pdfs(verbose=not args.json)
        if args.json:
            print(json.dumps(items, indent=2))

    elif args.command == "upload":
        # Direct keys mode - skip listing, fetch individual items
        if args.keys:
            zot = get_zotero_client()
            keys = [k.strip() for k in args.keys.split(",")]
            items = []
            for key in keys:
                try:
                    att = zot.item(key)
                    data = att.get("data", {})
                    parent_key = data.get("parentItem")
                    citation_key = key
                    title = data.get("title", "Untitled")

                    if parent_key:
                        try:
                            parent = zot.item(parent_key)
                            citation_key = get_citation_key(parent)
                            title = parent.get("data", {}).get("title", title)
                        except Exception:
                            pass

                    items.append({
                        "key": key,
                        "parent_key": parent_key,
                        "title": title,
                        "citation_key": citation_key,
                        "filename": data.get("filename", ""),
                    })
                    print(f"Found: {key} -> {citation_key}")
                except Exception as e:
                    print(f"Error fetching {key}: {e}")

            if items:
                upload_items(items, dry_run=args.dry_run)
            return

        items = list_cloud_pdfs(verbose=False)

        if not items:
            print("No cloud-stored PDFs found.")
            return

        if args.key:
            items = [i for i in items if i["key"] == args.key]
            if not items:
                print(f"No item found with key: {args.key}")
                return

        if args.limit:
            items = items[:args.limit]

        if not args.all and not args.key and not args.limit:
            print("Specify --key, --keys, --all, or --limit")
            return

        upload_items(items, dry_run=args.dry_run)

    elif args.command == "verify":
        verify_public_url(args.citation_key)


if __name__ == "__main__":
    main()
