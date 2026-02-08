#!/usr/bin/env python3
"""
Literature Review Generator - Generate structured literature review sections from NotebookLM.

Usage:
    python literature-review.py --notebook-id <id> --topic "limerence"
    python literature-review.py --notebook-id <id> --section introduction
    python literature-review.py --notebook-id <id> --full-review --output ~/Vaults/ObsidianVault/
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

# Literature review section templates
REVIEW_SECTIONS = {
    "introduction": {
        "name": "Introduction",
        "query": """Write an introduction section for a literature review on this topic based on the sources provided.
Include:
1. Background context and importance of the topic
2. Brief overview of the research landscape
3. Key debates or gaps in the literature
4. Scope of the review

Use academic writing style with in-text citations [Author, Year] format. Be comprehensive but concise."""
    },
    "definitions": {
        "name": "Definitions and Conceptualisation",
        "query": """Write a section on how the main construct is defined and conceptualised across the literature.
Include:
1. Key definitions from seminal works
2. Evolution of the concept over time
3. Related constructs and distinctions
4. Current consensus (if any) on definition

Use academic style with citations. Highlight areas of agreement and debate."""
    },
    "theoretical": {
        "name": "Theoretical Frameworks",
        "query": """Write a section on theoretical frameworks and models discussed in the literature.
Include:
1. Major theories used to explain the phenomenon
2. How different theories relate to each other
3. Empirical support for each framework
4. Limitations of current theoretical approaches

Provide citations for each framework discussed."""
    },
    "methods": {
        "name": "Methodological Approaches",
        "query": """Write a methods section summarising the research approaches used in this literature.
Include:
1. Study designs (cross-sectional, longitudinal, experimental, qualitative)
2. Sample characteristics and recruitment strategies
3. Measurement instruments and their psychometric properties
4. Analytical approaches

Critically evaluate methodological strengths and limitations."""
    },
    "findings": {
        "name": "Key Findings",
        "query": """Write a section synthesising the key findings from this body of literature.
Organise by theme rather than by study. Include:
1. Prevalence and demographic patterns
2. Risk factors and correlates
3. Outcomes and consequences
4. Intervention approaches (if applicable)

Integrate findings across studies, noting convergences and divergences."""
    },
    "discussion": {
        "name": "Discussion and Future Directions",
        "query": """Write a discussion section for this literature review.
Include:
1. Summary of main themes and findings
2. Theoretical implications
3. Clinical/practical implications
4. Limitations of the current literature
5. Recommendations for future research

Be critical and forward-looking."""
    }
}

def run_mcp_tool(tool: str, params: dict) -> dict:
    """Run an MCP tool directly using the MCP SDK."""
    import asyncio

    try:
        from mcp import ClientSession, StdioServerParameters
        from mcp.client.stdio import stdio_client
    except ImportError:
        subprocess.run([sys.executable, "-m", "pip", "install", "mcp", "-q"], check=True)
        from mcp import ClientSession, StdioServerParameters
        from mcp.client.stdio import stdio_client

    async def call():
        server_params = StdioServerParameters(
            command="uvx",
            args=["--from", "notebooklm-mcp-server", "notebooklm-mcp"],
            env=None
        )
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                result = await session.call_tool(tool, params)
                if result.content:
                    for item in result.content:
                        if hasattr(item, 'text'):
                            try:
                                return json.loads(item.text)
                            except json.JSONDecodeError:
                                return {"raw": item.text}
                return {"error": "No content in response"}

    return asyncio.run(call())

def query_notebook(notebook_id: str, query: str) -> str:
    """Query a NotebookLM notebook and return the response text."""
    result = run_mcp_tool("notebook_query", {
        "notebook_id": notebook_id,
        "query": query
    })

    if "error" in result:
        return f"[Error: {result['error']}]"
    if "raw" in result:
        return result["raw"]
    return result.get("response") or result.get("answer") or result.get("text") or str(result)

def generate_section(notebook_id: str, section_key: str, topic: Optional[str] = None) -> dict:
    """Generate a single literature review section."""
    section = REVIEW_SECTIONS[section_key]
    query = section["query"]

    if topic:
        query = f"Topic: {topic}\n\n{query}"

    print(f"Generating: {section['name']}...")
    response = query_notebook(notebook_id, query)

    return {
        "name": section["name"],
        "key": section_key,
        "content": response
    }

def generate_full_review(notebook_id: str, topic: str) -> str:
    """Generate a complete literature review with all sections."""
    timestamp = datetime.now().strftime("%Y-%m-%d")

    sections = []
    for key in ["introduction", "definitions", "theoretical", "methods", "findings", "discussion"]:
        result = generate_section(notebook_id, key, topic)
        sections.append(result)

    # Build the full document
    md = f"""---
type: literature-review
topic: {topic}
notebook_id: {notebook_id}
generated: {timestamp}
status: draft
---

# Literature Review: {topic.title()}

"""

    for section in sections:
        md += f"## {section['name']}\n\n{section['content']}\n\n"

    md += f"""---

## References

*Note: Extract and format references from the source documents. Citations in the text use [Author, Year] format.*

---

*Generated by literature-review.py from NotebookLM notebook `{notebook_id}`*
*Review Date: {timestamp}*
"""

    return md

def save_to_obsidian(content: str, filename: str, subfolder: str = "2-Areas/Research/Literature-Reviews") -> Path:
    """Save content to Obsidian vault."""
    output_dir = OBSIDIAN_VAULT / subfolder
    output_dir.mkdir(parents=True, exist_ok=True)

    # Sanitize filename
    safe_name = "".join(c for c in filename if c.isalnum() or c in "- _").strip()
    output_path = output_dir / f"{safe_name}.md"

    output_path.write_text(content)
    return output_path

def list_sections():
    """Print available review sections."""
    print("Available literature review sections:\n")
    for key, section in REVIEW_SECTIONS.items():
        print(f"  {key:12} - {section['name']}")

def main():
    parser = argparse.ArgumentParser(
        description="Generate literature review sections from NotebookLM notebooks"
    )
    parser.add_argument(
        "--notebook-id", "-n",
        required=False,
        help="NotebookLM notebook ID"
    )
    parser.add_argument(
        "--topic", "-t",
        help="Topic/construct being reviewed"
    )
    parser.add_argument(
        "--section", "-s",
        choices=list(REVIEW_SECTIONS.keys()),
        help="Generate a specific section"
    )
    parser.add_argument(
        "--full-review",
        action="store_true",
        help="Generate complete literature review"
    )
    parser.add_argument(
        "--output", "-o",
        type=Path,
        help="Output directory (default: Obsidian vault)"
    )
    parser.add_argument(
        "--list-sections",
        action="store_true",
        help="List available review sections"
    )
    parser.add_argument(
        "--stdout",
        action="store_true",
        help="Print to stdout instead of saving"
    )

    args = parser.parse_args()

    if args.list_sections:
        list_sections()
        return

    if not args.notebook_id:
        print("Error: --notebook-id required", file=sys.stderr)
        parser.print_help()
        sys.exit(1)

    topic = args.topic or "the research topic"

    if args.full_review:
        print(f"Generating full literature review on: {topic}\n")
        content = generate_full_review(args.notebook_id, topic)

        if args.stdout:
            print(content)
        else:
            filename = f"{datetime.now().strftime('%Y-%m-%d')} - {topic} Literature Review"
            path = save_to_obsidian(content, filename)
            print(f"\nSaved to: {path}")

    elif args.section:
        result = generate_section(args.notebook_id, args.section, topic)

        if args.stdout:
            print(f"# {result['name']}\n\n{result['content']}")
        else:
            filename = f"{datetime.now().strftime('%Y-%m-%d')} - {topic} - {result['name']}"

            # Create markdown with frontmatter
            content = f"""---
type: literature-review-section
section: {result['key']}
topic: {topic}
notebook_id: {args.notebook_id}
generated: {datetime.now().strftime('%Y-%m-%d')}
---

# {result['name']}

{result['content']}

---
*Generated from NotebookLM notebook `{args.notebook_id}`*
"""
            path = save_to_obsidian(content, filename)
            print(f"Saved to: {path}")

    else:
        print("Error: --section or --full-review required", file=sys.stderr)
        parser.print_help()
        sys.exit(1)

if __name__ == "__main__":
    main()
