#!/usr/bin/env python3
"""
Zotero Web API Access
For use with Claude Cowork and other Claude environments.

Usage:
    python3 zotero_api.py search "machine learning"
    python3 zotero_api.py get <item_key>
    python3 zotero_api.py collections
    python3 zotero_api.py collection_items <collection_key>
    python3 zotero_api.py attachment_url <item_key>
    python3 zotero_api.py validate_pdf
    python3 zotero_api.py recent [limit]

Credentials loaded from ~/.config/claude/credentials.json or environment variables.
"""

import argparse
import json
import os
import sys
from pathlib import Path
from urllib.parse import urlencode

try:
    import requests
except ImportError:
    print("ERROR: requests library not installed. Run: pip install requests")
    sys.exit(1)

# Configuration
API_BASE = "https://api.zotero.org"
CONFIG_PATH = Path.home() / ".config" / "claude" / "credentials.json"


def load_credentials():
    """Load credentials from config file or environment variables."""
    # Try environment variables first
    user_id = os.environ.get("ZOTERO_USER_ID")
    api_key = os.environ.get("ZOTERO_API_KEY")

    if user_id and api_key:
        return user_id, api_key, "user"

    # Fall back to config file
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH) as f:
            config = json.load(f)
            zotero = config.get("zotero", {})
            return (
                zotero.get("user_id"),
                zotero.get("api_key"),
                zotero.get("library_type", "user")
            )

    print("ERROR: No credentials found. Set ZOTERO_USER_ID and ZOTERO_API_KEY")
    print(f"       or create config at {CONFIG_PATH}")
    sys.exit(1)


def get_headers():
    """Get API request headers."""
    _, api_key, _ = load_credentials()
    return {
        "Zotero-API-Key": api_key,
        "Zotero-API-Version": "3"
    }


def get_base_url():
    """Get base URL for the user's library."""
    user_id, _, library_type = load_credentials()
    return f"{API_BASE}/users/{user_id}"


def search_items(query: str, limit: int = 25):
    """Search library by title/author/tag."""
    url = f"{get_base_url()}/items"
    params = {
        "q": query,
        "limit": limit,
        "format": "json",
        "itemType": "-attachment"  # Exclude attachments from results
    }

    try:
        response = requests.get(url, headers=get_headers(), params=params)
        response.raise_for_status()
        items = response.json()

        print(f"Search results for '{query}' ({len(items)} items):\n")

        if not items:
            print("  No items found.")
            return []

        results = []
        for item in items:
            data = item.get("data", {})
            result = {
                "key": item.get("key"),
                "itemType": data.get("itemType"),
                "title": data.get("title", "No title"),
                "creators": format_creators(data.get("creators", [])),
                "date": data.get("date", ""),
                "DOI": data.get("DOI", ""),
                "abstractNote": data.get("abstractNote", "")[:200] + "..." if data.get("abstractNote", "") and len(data.get("abstractNote", "")) > 200 else data.get("abstractNote", ""),
                "tags": [t.get("tag") for t in data.get("tags", [])]
            }
            results.append(result)

            print(f"  [{result['key']}] {result['title']}")
            print(f"    Type: {result['itemType']}")
            if result['creators']:
                print(f"    Authors: {result['creators']}")
            if result['date']:
                print(f"    Date: {result['date']}")
            if result['DOI']:
                print(f"    DOI: {result['DOI']}")
            if result['tags']:
                print(f"    Tags: {', '.join(result['tags'])}")
            print()

        return results

    except requests.RequestException as e:
        print(f"ERROR: API request failed: {e}")
        sys.exit(1)


def format_creators(creators):
    """Format creators list into readable string."""
    if not creators:
        return ""
    names = []
    for c in creators[:3]:  # Limit to first 3
        if c.get("name"):
            names.append(c["name"])
        elif c.get("lastName"):
            name = c["lastName"]
            if c.get("firstName"):
                name = f"{c['firstName']} {name}"
            names.append(name)
    if len(creators) > 3:
        names.append("et al.")
    return ", ".join(names)


def get_item(item_key: str):
    """Get full metadata for a specific item."""
    url = f"{get_base_url()}/items/{item_key}"

    try:
        response = requests.get(url, headers=get_headers())
        response.raise_for_status()
        item = response.json()
        data = item.get("data", {})

        print(f"Item: {item_key}\n")
        print(f"  Title: {data.get('title', 'No title')}")
        print(f"  Type: {data.get('itemType')}")

        creators = format_creators(data.get("creators", []))
        if creators:
            print(f"  Authors: {creators}")

        if data.get("date"):
            print(f"  Date: {data.get('date')}")
        if data.get("DOI"):
            print(f"  DOI: {data.get('DOI')}")
        if data.get("url"):
            print(f"  URL: {data.get('url')}")
        if data.get("publicationTitle"):
            print(f"  Publication: {data.get('publicationTitle')}")
        if data.get("volume"):
            print(f"  Volume: {data.get('volume')}")
        if data.get("issue"):
            print(f"  Issue: {data.get('issue')}")
        if data.get("pages"):
            print(f"  Pages: {data.get('pages')}")

        tags = [t.get("tag") for t in data.get("tags", [])]
        if tags:
            print(f"  Tags: {', '.join(tags)}")

        if data.get("abstractNote"):
            print(f"\n  Abstract:\n  {data.get('abstractNote')[:500]}...")

        print(f"\n  Raw JSON keys: {list(data.keys())}")

        return item

    except requests.RequestException as e:
        print(f"ERROR: API request failed: {e}")
        sys.exit(1)


def get_collections():
    """List all collections."""
    url = f"{get_base_url()}/collections"

    try:
        response = requests.get(url, headers=get_headers())
        response.raise_for_status()
        collections = response.json()

        print(f"Collections ({len(collections)} total):\n")

        if not collections:
            print("  No collections found.")
            return []

        results = []
        for col in collections:
            data = col.get("data", {})
            result = {
                "key": col.get("key"),
                "name": data.get("name"),
                "parentCollection": data.get("parentCollection"),
                "numItems": col.get("meta", {}).get("numItems", 0)
            }
            results.append(result)

            parent = f" (parent: {result['parentCollection']})" if result['parentCollection'] else ""
            print(f"  [{result['key']}] {result['name']} - {result['numItems']} items{parent}")

        return results

    except requests.RequestException as e:
        print(f"ERROR: API request failed: {e}")
        sys.exit(1)


def get_collection_items(collection_key: str, limit: int = 50):
    """Get items in a specific collection."""
    url = f"{get_base_url()}/collections/{collection_key}/items"
    params = {
        "limit": limit,
        "format": "json",
        "itemType": "-attachment"
    }

    try:
        response = requests.get(url, headers=get_headers(), params=params)
        response.raise_for_status()
        items = response.json()

        print(f"Items in collection {collection_key} ({len(items)} items):\n")

        if not items:
            print("  No items found.")
            return []

        results = []
        for item in items:
            data = item.get("data", {})
            result = {
                "key": item.get("key"),
                "title": data.get("title", "No title"),
                "itemType": data.get("itemType"),
                "creators": format_creators(data.get("creators", []))
            }
            results.append(result)

            print(f"  [{result['key']}] {result['title']}")
            if result['creators']:
                print(f"    {result['creators']}")
            print()

        return results

    except requests.RequestException as e:
        print(f"ERROR: API request failed: {e}")
        sys.exit(1)


def get_item_children(item_key: str):
    """Get children (attachments, notes) for an item."""
    url = f"{get_base_url()}/items/{item_key}/children"

    try:
        response = requests.get(url, headers=get_headers())
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"ERROR: API request failed: {e}")
        return []


def get_attachment_url(item_key: str):
    """Get PDF URL for an attachment item."""
    # First check if this item is an attachment or has attachment children
    url = f"{get_base_url()}/items/{item_key}"

    try:
        response = requests.get(url, headers=get_headers())
        response.raise_for_status()
        item = response.json()
        data = item.get("data", {})

        # If this is a parent item, find attachment children
        if data.get("itemType") != "attachment":
            children = get_item_children(item_key)
            attachments = [c for c in children if c.get("data", {}).get("itemType") == "attachment"]

            if not attachments:
                print(f"No attachments found for item {item_key}")
                return None

            print(f"Found {len(attachments)} attachment(s) for item {item_key}:\n")
            for att in attachments:
                att_data = att.get("data", {})
                print(f"  [{att.get('key')}] {att_data.get('title', 'No title')}")
                print(f"    Type: {att_data.get('contentType', 'unknown')}")
                print(f"    Link Mode: {att_data.get('linkMode', 'unknown')}")

                # Check if file is available
                if att_data.get("linkMode") in ["imported_file", "imported_url"]:
                    file_url = f"{get_base_url()}/items/{att.get('key')}/file"
                    print(f"    File URL: {file_url}")
                print()

            return attachments

        # This is an attachment item
        if data.get("linkMode") in ["imported_file", "imported_url"]:
            file_url = f"{get_base_url()}/items/{item_key}/file"
            print(f"Attachment: {data.get('title', item_key)}")
            print(f"  Content Type: {data.get('contentType', 'unknown')}")
            print(f"  File URL: {file_url}")
            return file_url
        else:
            print(f"Attachment {item_key} is linked, not stored in Zotero cloud")
            print(f"  Link Mode: {data.get('linkMode')}")
            print(f"  URL: {data.get('url', 'N/A')}")
            return None

    except requests.RequestException as e:
        print(f"ERROR: API request failed: {e}")
        sys.exit(1)


def validate_pdf_access():
    """Test if PDFs are accessible via the API."""
    print("Validating PDF access via Zotero API...\n")

    # Search for items with attachments
    url = f"{get_base_url()}/items"
    params = {
        "itemType": "attachment",
        "limit": 10,
        "format": "json"
    }

    try:
        response = requests.get(url, headers=get_headers(), params=params)
        response.raise_for_status()
        attachments = response.json()

        if not attachments:
            print("No attachments found in library.")
            print("PDF Access: CANNOT DETERMINE (no attachments to test)")
            return None

        pdf_attachments = [
            a for a in attachments
            if a.get("data", {}).get("contentType") == "application/pdf"
        ]

        if not pdf_attachments:
            print(f"Found {len(attachments)} attachments, but none are PDFs.")
            print("PDF Access: CANNOT DETERMINE (no PDFs to test)")
            return None

        print(f"Found {len(pdf_attachments)} PDF attachment(s). Testing access...\n")

        # Test first PDF
        test_att = pdf_attachments[0]
        test_key = test_att.get("key")
        test_data = test_att.get("data", {})

        print(f"Testing: {test_data.get('title', test_key)}")
        print(f"  Link Mode: {test_data.get('linkMode')}")

        if test_data.get("linkMode") not in ["imported_file", "imported_url"]:
            print(f"\n  This attachment is linked (not synced to Zotero cloud).")
            print("  Testing another attachment...")

            # Try to find a synced attachment
            synced = [a for a in pdf_attachments
                     if a.get("data", {}).get("linkMode") in ["imported_file", "imported_url"]]

            if not synced:
                print("\nNo cloud-synced PDFs found.")
                print("PDF Access: NO (all PDFs are linked, not synced)")
                return False

            test_att = synced[0]
            test_key = test_att.get("key")
            test_data = test_att.get("data", {})
            print(f"\nTesting synced attachment: {test_data.get('title', test_key)}")

        # Try to access the file
        file_url = f"{get_base_url()}/items/{test_key}/file"
        print(f"  File URL: {file_url}")

        file_response = requests.get(
            file_url,
            headers=get_headers(),
            allow_redirects=False
        )

        if file_response.status_code == 302:
            redirect_url = file_response.headers.get("Location", "")
            print(f"\n  Status: 302 Redirect")
            print(f"  Redirects to: {redirect_url[:80]}...")
            print("\n✅ PDF Access: YES (cloud-synced, accessible via redirect)")
            return True
        elif file_response.status_code == 200:
            content_type = file_response.headers.get("Content-Type", "")
            content_length = file_response.headers.get("Content-Length", "unknown")
            print(f"\n  Status: 200 OK")
            print(f"  Content-Type: {content_type}")
            print(f"  Content-Length: {content_length} bytes")
            print("\n✅ PDF Access: YES (direct download available)")
            return True
        elif file_response.status_code == 404:
            print(f"\n  Status: 404 Not Found")
            print("\n❌ PDF Access: NO (file not in cloud storage)")
            return False
        else:
            print(f"\n  Status: {file_response.status_code}")
            print(f"  Response: {file_response.text[:200]}")
            print("\n⚠️ PDF Access: UNCLEAR (unexpected response)")
            return None

    except requests.RequestException as e:
        print(f"ERROR: API request failed: {e}")
        sys.exit(1)


def get_recent_items(limit: int = 10):
    """Get recently added items."""
    url = f"{get_base_url()}/items"
    params = {
        "limit": limit,
        "format": "json",
        "sort": "dateAdded",
        "direction": "desc",
        "itemType": "-attachment"
    }

    try:
        response = requests.get(url, headers=get_headers(), params=params)
        response.raise_for_status()
        items = response.json()

        print(f"Recently added items ({len(items)}):\n")

        for item in items:
            data = item.get("data", {})
            print(f"  [{item.get('key')}] {data.get('title', 'No title')}")
            print(f"    Added: {data.get('dateAdded', 'unknown')}")
            creators = format_creators(data.get("creators", []))
            if creators:
                print(f"    Authors: {creators}")
            print()

        return items

    except requests.RequestException as e:
        print(f"ERROR: API request failed: {e}")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Zotero Web API Client")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    # search
    search_parser = subparsers.add_parser("search", help="Search library")
    search_parser.add_argument("query", help="Search query")
    search_parser.add_argument("--limit", "-l", type=int, default=25, help="Max results")

    # get
    get_parser = subparsers.add_parser("get", help="Get item details")
    get_parser.add_argument("item_key", help="Item key")

    # collections
    subparsers.add_parser("collections", help="List collections")

    # collection_items
    col_parser = subparsers.add_parser("collection_items", help="Items in collection")
    col_parser.add_argument("collection_key", help="Collection key")
    col_parser.add_argument("--limit", "-l", type=int, default=50, help="Max results")

    # attachment_url
    att_parser = subparsers.add_parser("attachment_url", help="Get attachment URL")
    att_parser.add_argument("item_key", help="Item or attachment key")

    # validate_pdf
    subparsers.add_parser("validate_pdf", help="Test PDF accessibility")

    # recent
    recent_parser = subparsers.add_parser("recent", help="Recent items")
    recent_parser.add_argument("limit", nargs="?", type=int, default=10, help="Number of items")

    args = parser.parse_args()

    if args.command == "search":
        search_items(args.query, args.limit)
    elif args.command == "get":
        get_item(args.item_key)
    elif args.command == "collections":
        get_collections()
    elif args.command == "collection_items":
        get_collection_items(args.collection_key, args.limit)
    elif args.command == "attachment_url":
        get_attachment_url(args.item_key)
    elif args.command == "validate_pdf":
        validate_pdf_access()
    elif args.command == "recent":
        get_recent_items(args.limit)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
