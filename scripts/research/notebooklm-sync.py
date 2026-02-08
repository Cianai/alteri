#!/usr/bin/env python3
"""
NotebookLM Sync - Create notebooks from Zotero collections and add PDF URLs from Supabase.

Usage:
    python notebooklm-sync.py --collection "Limerence" --bucket "research-pdfs"
    python notebooklm-sync.py --pdfs finch2024.pdf darlingrasmussen2019.pdf --name "Test Notebook"
"""

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path
from datetime import datetime

# Supabase configuration
SUPABASE_PROJECT = "heesyjucnsatjjolyztt"
SUPABASE_URL = f"https://{SUPABASE_PROJECT}.supabase.co"


class NotebookLMMCP:
    """Simple JSON-RPC client for NotebookLM MCP."""

    def __init__(self):
        self.proc = None
        self.msg_id = 0

    def start(self):
        """Start the MCP server process."""
        self.proc = subprocess.Popen(
            ['uvx', '--from', 'notebooklm-mcp-server', 'notebooklm-mcp'],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1
        )
        # Initialize
        self._send({
            'method': 'initialize',
            'params': {
                'protocolVersion': '2024-11-05',
                'capabilities': {},
                'clientInfo': {'name': 'notebooklm-sync', 'version': '1.0'}
            }
        })
        # Read init response
        self._read_response()
        return self

    def _send(self, msg: dict) -> int:
        """Send a JSON-RPC message."""
        self.msg_id += 1
        msg['jsonrpc'] = '2.0'
        msg['id'] = self.msg_id
        self.proc.stdin.write(json.dumps(msg) + '\n')
        self.proc.stdin.flush()
        return self.msg_id

    def _read_response(self, timeout: float = 30.0) -> dict:
        """Read response from MCP server."""
        import select
        start = time.time()
        while time.time() - start < timeout:
            ready, _, _ = select.select([self.proc.stdout], [], [], 0.5)
            if ready:
                line = self.proc.stdout.readline()
                if line:
                    try:
                        return json.loads(line)
                    except json.JSONDecodeError:
                        continue
        return {"error": "Timeout waiting for response"}

    def call_tool(self, tool: str, arguments: dict) -> dict:
        """Call an MCP tool and return the result."""
        self._send({
            'method': 'tools/call',
            'params': {'name': tool, 'arguments': arguments}
        })
        response = self._read_response()

        # Extract result from response
        if 'result' in response:
            content = response['result'].get('content', [])
            for item in content:
                if item.get('type') == 'text':
                    try:
                        return json.loads(item['text'])
                    except json.JSONDecodeError:
                        return {"raw": item['text']}

        if 'error' in response:
            err = response['error']
            if isinstance(err, dict):
                return {"error": err.get('message', str(err))}
            return {"error": str(err)}

        return {"error": "Unknown response format", "raw": response}

    def close(self):
        """Close the MCP server process."""
        if self.proc:
            self.proc.stdin.close()
            self.proc.terminate()
            self.proc.wait(timeout=5)


def get_supabase_pdfs(bucket: str) -> list[dict]:
    """Get list of PDFs from Supabase storage bucket."""
    query = f"""
    SELECT name, metadata, created_at
    FROM storage.objects
    WHERE bucket_id = '{bucket}'
    AND name LIKE '%.pdf'
    ORDER BY created_at DESC;
    """
    cmd = [
        "supabase", "db", "query", query,
        "--project-ref", SUPABASE_PROJECT
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode != 0:
            return get_known_pdfs(bucket)
        return json.loads(result.stdout) if result.stdout else []
    except:
        return get_known_pdfs(bucket)


def get_known_pdfs(bucket: str) -> list[dict]:
    """Fallback: return known PDFs from previous Supabase query."""
    pdfs = [
        "finch2024.pdf",
        "darlingrasmussen2019.pdf",
        "correia-santos2024.pdf",
        "bethell2016.pdf",
        "rog2021.pdf"
    ]
    return [{"name": pdf, "bucket": bucket} for pdf in pdfs]


def get_public_url(bucket: str, filename: str) -> str:
    """Construct public URL for a Supabase storage object."""
    return f"{SUPABASE_URL}/storage/v1/object/public/{bucket}/{filename}"


def sync_pdfs(pdf_names: list[str], notebook_name: str, bucket: str) -> dict:
    """Sync specific PDFs to a new NotebookLM notebook."""
    mcp = NotebookLMMCP()

    try:
        print("Starting NotebookLM MCP...")
        mcp.start()
        time.sleep(1)  # Give server time to fully initialize

        # Create notebook
        print(f"Creating notebook: {notebook_name}")
        result = mcp.call_tool("notebook_create", {"title": notebook_name})

        if "error" in result:
            return {"error": f"Failed to create notebook: {result['error']}"}

        # Handle nested response format: {status, notebook: {id, title, url}}
        notebook_data = result.get("notebook", result)
        notebook_id = notebook_data.get("id") or result.get("notebook_id") or result.get("id")
        if not notebook_id:
            return {"error": "No notebook ID returned", "details": result}

        print(f"Created notebook: {notebook_id}")

        # Add each PDF
        added = []
        failed = []
        for filename in pdf_names:
            if not filename.endswith(".pdf"):
                filename += ".pdf"
            url = get_public_url(bucket, filename)
            title = filename.replace(".pdf", "").replace("-", " ").replace("_", " ")

            print(f"  Adding: {title} ({url})")
            result = mcp.call_tool("notebook_add_url", {
                "notebook_id": notebook_id,
                "url": url
            })

            if "error" in result:
                print(f"    Failed: {result['error']}")
                failed.append({"file": filename, "error": result["error"]})
            else:
                print(f"    Success")
                added.append(filename)

            time.sleep(1)  # Rate limiting

        return {
            "notebook_id": notebook_id,
            "notebook_name": notebook_name,
            "notebook_url": f"https://notebooklm.google.com/notebook/{notebook_id}",
            "added": added,
            "failed": failed
        }

    finally:
        mcp.close()


def sync_collection(collection_name: str, bucket: str) -> dict:
    """Sync a Zotero collection to NotebookLM via Supabase PDFs."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    notebook_name = f"{collection_name} - Synced {timestamp}"

    pdfs = get_supabase_pdfs(bucket)
    return sync_pdfs([p["name"] for p in pdfs], notebook_name, bucket)


def list_notebooks() -> dict:
    """List existing NotebookLM notebooks."""
    mcp = NotebookLMMCP()
    try:
        mcp.start()
        time.sleep(1)
        return mcp.call_tool("notebook_list", {})
    finally:
        mcp.close()


def query_notebook(notebook_id: str, query: str, timeout: float = 90.0) -> dict:
    """Query a NotebookLM notebook."""
    mcp = NotebookLMMCP()
    try:
        mcp.start()
        time.sleep(1)
        # Queries can take longer - use extended timeout
        mcp._send({
            'method': 'tools/call',
            'params': {'name': 'notebook_query', 'arguments': {
                "notebook_id": notebook_id,
                "query": query
            }}
        })
        response = mcp._read_response(timeout=timeout)

        # Extract result from response
        if 'result' in response:
            content = response['result'].get('content', [])
            for item in content:
                if item.get('type') == 'text':
                    try:
                        return json.loads(item['text'])
                    except json.JSONDecodeError:
                        return {"response": item['text']}

        if 'error' in response:
            err = response['error']
            if isinstance(err, dict):
                return {"error": err.get('message', str(err))}
            return {"error": str(err)}

        return {"error": "Unknown response format", "raw": response}
    finally:
        mcp.close()


def main():
    parser = argparse.ArgumentParser(
        description="Sync Zotero collections or Supabase PDFs to NotebookLM"
    )
    parser.add_argument(
        "--collection", "-c",
        help="Zotero collection name to sync"
    )
    parser.add_argument(
        "--pdfs", "-p",
        nargs="+",
        help="Specific PDF filenames to sync"
    )
    parser.add_argument(
        "--name", "-n",
        default=None,
        help="Notebook name (default: auto-generated)"
    )
    parser.add_argument(
        "--bucket", "-b",
        default="research-pdfs",
        help="Supabase storage bucket (default: research-pdfs)"
    )
    parser.add_argument(
        "--list", "-l",
        action="store_true",
        help="List available PDFs in bucket"
    )
    parser.add_argument(
        "--notebooks",
        action="store_true",
        help="List existing NotebookLM notebooks"
    )
    parser.add_argument(
        "--query", "-q",
        help="Query a notebook (requires --notebook-id)"
    )
    parser.add_argument(
        "--notebook-id",
        help="Notebook ID for queries"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output as JSON"
    )

    args = parser.parse_args()

    if args.list:
        pdfs = get_supabase_pdfs(args.bucket)
        if args.json:
            print(json.dumps(pdfs, indent=2))
        else:
            print(f"PDFs in '{args.bucket}' bucket:")
            for pdf in pdfs:
                print(f"  - {pdf['name']}")
        return

    if args.notebooks:
        result = list_notebooks()
        if args.json:
            print(json.dumps(result, indent=2))
        else:
            if "error" in result:
                print(f"Error: {result['error']}", file=sys.stderr)
                sys.exit(1)
            notebooks = result.get("notebooks", [])
            print(f"Found {len(notebooks)} notebook(s):")
            for nb in notebooks:
                print(f"  [{nb['id'][:8]}...] {nb['title']} ({nb['source_count']} sources)")
        return

    if args.query:
        if not args.notebook_id:
            print("Error: --notebook-id required for queries", file=sys.stderr)
            sys.exit(1)
        result = query_notebook(args.notebook_id, args.query)
        if args.json:
            print(json.dumps(result, indent=2))
        else:
            if "error" in result:
                print(f"Error: {result['error']}", file=sys.stderr)
                sys.exit(1)
            print(f"Query: {args.query}")
            print(f"\nResponse:\n{result.get('response', result)}")
        return

    if args.pdfs:
        name = args.name or f"Custom Sync - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        result = sync_pdfs(args.pdfs, name, args.bucket)
    elif args.collection:
        result = sync_collection(args.collection, args.bucket)
    else:
        # Default: sync all PDFs in bucket
        name = args.name or f"Research PDFs - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        pdfs = get_supabase_pdfs(args.bucket)
        result = sync_pdfs([p["name"] for p in pdfs], name, args.bucket)

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        if "error" in result:
            print(f"Error: {result['error']}", file=sys.stderr)
            sys.exit(1)
        print(f"\nNotebook created: {result['notebook_name']}")
        print(f"Notebook ID: {result['notebook_id']}")
        print(f"URL: {result['notebook_url']}")
        print(f"Added {len(result['added'])} sources:")
        for f in result['added']:
            print(f"  ✓ {f}")
        if result.get('failed'):
            print(f"Failed to add {len(result['failed'])} sources:")
            for f in result['failed']:
                print(f"  ✗ {f['file']}: {f['error']}")


if __name__ == "__main__":
    main()
