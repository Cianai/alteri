#!/usr/bin/env python3
"""
Synthesis Query - Run structured queries against NotebookLM notebooks and format for Obsidian.

Usage:
    python synthesis-query.py --notebook-id <id> --query "What are the main themes?"
    python synthesis-query.py --notebook-id <id> --template themes
    python synthesis-query.py --notebook-id <id> --batch queries.json --output ~/Vaults/ObsidianVault/
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path
from datetime import datetime
from typing import Optional

# Obsidian vault location
OBSIDIAN_VAULT = Path.home() / "Documents" / "ObsidianVault"

# Predefined query templates for research synthesis
QUERY_TEMPLATES = {
    "themes": {
        "name": "Key Themes",
        "query": "What are the main themes and concepts discussed across these sources? Provide a structured summary with citations."
    },
    "methods": {
        "name": "Methodological Approaches",
        "query": "What methodological approaches are used in these studies? Compare and contrast the research designs, samples, and analysis methods. Cite specific sources."
    },
    "findings": {
        "name": "Key Findings",
        "query": "What are the key findings and conclusions from these sources? Highlight areas of agreement and disagreement. Provide citations."
    },
    "gaps": {
        "name": "Research Gaps",
        "query": "What research gaps, limitations, or future directions are identified in these sources? What questions remain unanswered?"
    },
    "definitions": {
        "name": "Key Definitions",
        "query": "How do these sources define and conceptualize the main constructs? Are there differences in definitions across sources? Cite each definition."
    },
    "theoretical": {
        "name": "Theoretical Frameworks",
        "query": "What theoretical frameworks or models are discussed in these sources? How do they relate to each other?"
    },
    "measures": {
        "name": "Measurement Tools",
        "query": "What measurement instruments, scales, or assessment tools are discussed? Provide details on validity and reliability where mentioned."
    },
    "prevalence": {
        "name": "Prevalence & Demographics",
        "query": "What prevalence rates, demographic patterns, or epidemiological data are reported? Include specific statistics with citations."
    }
}

import time
import select


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
        self._send({
            'method': 'initialize',
            'params': {
                'protocolVersion': '2024-11-05',
                'capabilities': {},
                'clientInfo': {'name': 'synthesis-query', 'version': '1.0'}
            }
        })
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

    def call_tool(self, tool: str, arguments: dict, timeout: float = 120.0) -> dict:
        """Call an MCP tool and return the result."""
        self._send({
            'method': 'tools/call',
            'params': {'name': tool, 'arguments': arguments}
        })
        response = self._read_response(timeout=timeout)

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


# Global MCP client instance
_mcp_client = None


def get_mcp_client() -> NotebookLMMCP:
    """Get or create MCP client."""
    global _mcp_client
    if _mcp_client is None:
        _mcp_client = NotebookLMMCP()
        _mcp_client.start()
        time.sleep(1)
    return _mcp_client


def close_mcp_client():
    """Close the global MCP client."""
    global _mcp_client
    if _mcp_client:
        _mcp_client.close()
        _mcp_client = None


def run_mcp_tool(tool: str, params: dict, timeout: float = 120.0) -> dict:
    """Run an MCP tool using the JSON-RPC client."""
    mcp = get_mcp_client()
    return mcp.call_tool(tool, params, timeout=timeout)

def query_notebook(notebook_id: str, query: str) -> dict:
    """Query a NotebookLM notebook."""
    print(f"Querying notebook: {query[:50]}...")
    result = run_mcp_tool("notebook_query", {
        "notebook_id": notebook_id,
        "query": query
    })
    return result

def format_for_obsidian(query_name: str, query: str, response: dict, notebook_id: str) -> str:
    """Format query response as Obsidian markdown."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")

    # Extract response text
    if "error" in response:
        content = f"> [!error] Query Failed\n> {response['error']}"
    elif "raw" in response:
        content = response["raw"]
    else:
        content = response.get("response") or response.get("answer") or response.get("text") or str(response)

    # Build markdown
    md = f"""---
type: synthesis-query
notebook_id: {notebook_id}
query: "{query[:100]}..."
generated: {timestamp}
---

# {query_name}

## Query
> {query}

## Response

{content}

---
*Generated by synthesis-query.py from NotebookLM notebook `{notebook_id}`*
"""
    return md

def save_to_obsidian(content: str, filename: str, subfolder: str = "2-Areas/Research/Synthesis") -> Path:
    """Save content to Obsidian vault."""
    output_dir = OBSIDIAN_VAULT / subfolder
    output_dir.mkdir(parents=True, exist_ok=True)

    # Sanitize filename
    safe_name = "".join(c for c in filename if c.isalnum() or c in "- _").strip()
    output_path = output_dir / f"{safe_name}.md"

    output_path.write_text(content)
    return output_path

def run_batch_queries(notebook_id: str, queries: list[dict], output_dir: Optional[Path] = None) -> list[dict]:
    """Run multiple queries and save results."""
    results = []
    output_dir = output_dir or (OBSIDIAN_VAULT / "2-Areas/Research/Synthesis")

    for i, q in enumerate(queries, 1):
        query_name = q.get("name", f"Query {i}")
        query_text = q.get("query")

        if not query_text:
            continue

        print(f"\n[{i}/{len(queries)}] {query_name}")
        response = query_notebook(notebook_id, query_text)

        # Format and save
        md = format_for_obsidian(query_name, query_text, response, notebook_id)
        filename = f"{datetime.now().strftime('%Y-%m-%d')} - {query_name}"
        path = save_to_obsidian(md, filename)

        results.append({
            "name": query_name,
            "success": "error" not in response,
            "output_path": str(path)
        })
        print(f"  Saved to: {path}")

    return results

def list_templates():
    """Print available query templates."""
    print("Available query templates:\n")
    for key, template in QUERY_TEMPLATES.items():
        print(f"  {key:12} - {template['name']}")
        print(f"               {template['query'][:60]}...\n")

def main():
    parser = argparse.ArgumentParser(
        description="Query NotebookLM notebooks and format results for Obsidian"
    )
    parser.add_argument(
        "--notebook-id", "-n",
        required=False,
        help="NotebookLM notebook ID"
    )
    parser.add_argument(
        "--query", "-q",
        help="Custom query to run"
    )
    parser.add_argument(
        "--template", "-t",
        choices=list(QUERY_TEMPLATES.keys()),
        help="Use a predefined query template"
    )
    parser.add_argument(
        "--batch", "-b",
        type=Path,
        help="JSON file with batch queries"
    )
    parser.add_argument(
        "--all-templates",
        action="store_true",
        help="Run all predefined templates"
    )
    parser.add_argument(
        "--output", "-o",
        type=Path,
        help="Output directory (default: Obsidian vault)"
    )
    parser.add_argument(
        "--list-templates",
        action="store_true",
        help="List available query templates"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output raw JSON instead of markdown"
    )

    args = parser.parse_args()

    if args.list_templates:
        list_templates()
        return

    if not args.notebook_id:
        print("Error: --notebook-id required", file=sys.stderr)
        parser.print_help()
        sys.exit(1)

    output_dir = args.output or (OBSIDIAN_VAULT / "2-Areas/Research/Synthesis")

    if args.all_templates:
        # Run all predefined templates
        queries = [{"name": t["name"], "query": t["query"]} for t in QUERY_TEMPLATES.values()]
        results = run_batch_queries(args.notebook_id, queries, output_dir)
        print(f"\nCompleted {len(results)} queries")
        return

    if args.batch:
        # Load batch queries from file
        with open(args.batch) as f:
            queries = json.load(f)
        results = run_batch_queries(args.notebook_id, queries, output_dir)
        print(f"\nCompleted {len(results)} queries")
        return

    # Single query
    if args.template:
        template = QUERY_TEMPLATES[args.template]
        query_name = template["name"]
        query_text = template["query"]
    elif args.query:
        query_name = "Custom Query"
        query_text = args.query
    else:
        print("Error: --query or --template required", file=sys.stderr)
        sys.exit(1)

    response = query_notebook(args.notebook_id, query_text)

    if args.json:
        print(json.dumps(response, indent=2))
    else:
        md = format_for_obsidian(query_name, query_text, response, args.notebook_id)
        filename = f"{datetime.now().strftime('%Y-%m-%d')} - {query_name}"
        path = save_to_obsidian(md, filename, str(output_dir.relative_to(OBSIDIAN_VAULT)) if output_dir != OBSIDIAN_VAULT else "2-Areas/Research/Synthesis")
        print(f"Saved to: {path}")

if __name__ == "__main__":
    try:
        main()
    finally:
        close_mcp_client()
