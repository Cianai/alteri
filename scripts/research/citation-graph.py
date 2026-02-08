#!/usr/bin/env python3
"""
Citation Graph Builder
======================
Build citation networks from seed papers using Semantic Scholar.

Creates directed graphs showing citation relationships with metadata.

Usage:
    python3 citation-graph.py --doi 10.1080/00224545.2020.1787400
    python3 citation-graph.py --doi 10.1080/00224545.2020.1787400 --depth 2 --limit 20
    python3 citation-graph.py --input papers.json --output graph.json
    python3 citation-graph.py --doi 10.1080/00224545.2020.1787400 --format graphml

Author: Claude Code (for Cian O'Sullivan)
Date: 17 January 2026
"""

import argparse
import json
import sys
import time
from collections import deque
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Optional

try:
    import requests
except ImportError:
    print("ERROR: requests not installed. Run: pip3 install requests")
    sys.exit(1)

# =============================================================================
# CONFIGURATION
# =============================================================================

# Semantic Scholar API endpoints
SS_PAPER_DOI = "https://api.semanticscholar.org/graph/v1/paper/DOI:{doi}"
SS_PAPER_ID = "https://api.semanticscholar.org/graph/v1/paper/{paper_id}"
SS_CITATIONS = "https://api.semanticscholar.org/graph/v1/paper/{paper_id}/citations"
SS_REFERENCES = "https://api.semanticscholar.org/graph/v1/paper/{paper_id}/references"

# Fields to fetch
PAPER_FIELDS = "paperId,title,authors,year,venue,citationCount,externalIds,url,abstract"
CITING_FIELDS = "paperId,title,authors,year,venue,citationCount,externalIds"

# Rate limiting
RATE_LIMIT = 1.0  # 1 request per second (free tier)

# Output directory
OUTPUT_DIR = Path.home() / "scripts" / "logs"

USER_AGENT = "CitationGraphBuilder/1.0 (cianosullivan@gmail.com)"


# =============================================================================
# DATA MODELS
# =============================================================================

@dataclass
class PaperNode:
    """Node in the citation graph."""
    id: str
    title: str
    authors: list[str]
    year: Optional[int] = None
    venue: Optional[str] = None
    citation_count: Optional[int] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    abstract: Optional[str] = None
    depth: int = 0  # Distance from seed paper

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "authors": self.authors,
            "year": self.year,
            "venue": self.venue,
            "citation_count": self.citation_count,
            "doi": self.doi,
            "url": self.url,
            "abstract": self.abstract,
            "depth": self.depth,
        }


@dataclass
class CitationEdge:
    """Edge in the citation graph (citing -> cited)."""
    source: str  # Paper ID that cites
    target: str  # Paper ID being cited
    edge_type: str = "cites"  # "cites" or "references"

    def to_dict(self) -> dict:
        return {
            "source": self.source,
            "target": self.target,
            "type": self.edge_type,
        }


@dataclass
class CitationGraph:
    """Citation network graph."""
    nodes: dict[str, PaperNode] = field(default_factory=dict)
    edges: list[CitationEdge] = field(default_factory=list)
    seed_papers: list[str] = field(default_factory=list)
    metadata: dict = field(default_factory=dict)

    def add_node(self, node: PaperNode):
        """Add or update a node."""
        if node.id not in self.nodes:
            self.nodes[node.id] = node
        else:
            # Update with more complete data if available
            existing = self.nodes[node.id]
            if node.abstract and not existing.abstract:
                existing.abstract = node.abstract
            if node.citation_count and (not existing.citation_count or node.citation_count > existing.citation_count):
                existing.citation_count = node.citation_count

    def add_edge(self, edge: CitationEdge):
        """Add edge if not duplicate."""
        # Check for duplicate
        for e in self.edges:
            if e.source == edge.source and e.target == edge.target:
                return
        self.edges.append(edge)

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "nodes": [n.to_dict() for n in self.nodes.values()],
            "edges": [e.to_dict() for e in self.edges],
            "seed_papers": self.seed_papers,
            "metadata": self.metadata,
        }

    def to_graphml(self) -> str:
        """Export to GraphML format."""
        lines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<graphml xmlns="http://graphml.graphdrawing.org/xmlns">',
            '  <key id="title" for="node" attr.name="title" attr.type="string"/>',
            '  <key id="year" for="node" attr.name="year" attr.type="int"/>',
            '  <key id="citations" for="node" attr.name="citations" attr.type="int"/>',
            '  <key id="depth" for="node" attr.name="depth" attr.type="int"/>',
            '  <key id="doi" for="node" attr.name="doi" attr.type="string"/>',
            '  <key id="edge_type" for="edge" attr.name="edge_type" attr.type="string"/>',
            '  <graph id="citation_network" edgedefault="directed">',
        ]

        # Add nodes
        for node in self.nodes.values():
            safe_title = node.title.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")
            lines.append(f'    <node id="{node.id}">')
            lines.append(f'      <data key="title">{safe_title}</data>')
            if node.year:
                lines.append(f'      <data key="year">{node.year}</data>')
            if node.citation_count:
                lines.append(f'      <data key="citations">{node.citation_count}</data>')
            lines.append(f'      <data key="depth">{node.depth}</data>')
            if node.doi:
                lines.append(f'      <data key="doi">{node.doi}</data>')
            lines.append('    </node>')

        # Add edges
        for i, edge in enumerate(self.edges):
            lines.append(f'    <edge id="e{i}" source="{edge.source}" target="{edge.target}">')
            lines.append(f'      <data key="edge_type">{edge.edge_type}</data>')
            lines.append('    </edge>')

        lines.append('  </graph>')
        lines.append('</graphml>')

        return "\n".join(lines)

    def get_stats(self) -> dict:
        """Get graph statistics."""
        return {
            "total_nodes": len(self.nodes),
            "total_edges": len(self.edges),
            "seed_papers": len(self.seed_papers),
            "max_depth": max((n.depth for n in self.nodes.values()), default=0),
            "avg_citations": sum(n.citation_count or 0 for n in self.nodes.values()) / max(len(self.nodes), 1),
            "year_range": {
                "min": min((n.year for n in self.nodes.values() if n.year), default=None),
                "max": max((n.year for n in self.nodes.values() if n.year), default=None),
            },
        }


# =============================================================================
# SEMANTIC SCHOLAR CLIENT
# =============================================================================

class SemanticScholarClient:
    """Client for Semantic Scholar API."""

    def __init__(self):
        self.last_request = 0

    def _rate_limit(self):
        elapsed = time.time() - self.last_request
        if elapsed < RATE_LIMIT:
            time.sleep(RATE_LIMIT - elapsed)
        self.last_request = time.time()

    def _parse_paper(self, data: dict, depth: int = 0) -> Optional[PaperNode]:
        """Parse API response into PaperNode."""
        if not data or not data.get("paperId"):
            return None

        authors = [a.get("name", "") for a in data.get("authors", []) if a.get("name")]
        external_ids = data.get("externalIds", {}) or {}

        return PaperNode(
            id=data["paperId"],
            title=data.get("title", ""),
            authors=authors,
            year=data.get("year"),
            venue=data.get("venue"),
            citation_count=data.get("citationCount"),
            doi=external_ids.get("DOI"),
            url=data.get("url"),
            abstract=data.get("abstract"),
            depth=depth,
        )

    def get_paper_by_doi(self, doi: str) -> Optional[PaperNode]:
        """Get paper by DOI."""
        self._rate_limit()

        try:
            response = requests.get(
                SS_PAPER_DOI.format(doi=doi),
                params={"fields": PAPER_FIELDS},
                headers={"User-Agent": USER_AGENT},
                timeout=30,
            )

            if response.status_code == 200:
                return self._parse_paper(response.json())
            elif response.status_code == 429:
                print("  Rate limited, waiting 60s...", file=sys.stderr)
                time.sleep(60)
                return self.get_paper_by_doi(doi)

        except requests.RequestException as e:
            print(f"  Error fetching DOI {doi}: {e}", file=sys.stderr)

        return None

    def get_paper_by_id(self, paper_id: str) -> Optional[PaperNode]:
        """Get paper by Semantic Scholar ID."""
        self._rate_limit()

        try:
            response = requests.get(
                SS_PAPER_ID.format(paper_id=paper_id),
                params={"fields": PAPER_FIELDS},
                headers={"User-Agent": USER_AGENT},
                timeout=30,
            )

            if response.status_code == 200:
                return self._parse_paper(response.json())

        except requests.RequestException as e:
            print(f"  Error fetching paper {paper_id}: {e}", file=sys.stderr)

        return None

    def get_citations(self, paper_id: str, limit: int = 50, offset: int = 0) -> list[tuple[PaperNode, str]]:
        """
        Get papers that cite this paper.

        Returns list of (citing_paper, cited_paper_id) tuples.
        """
        self._rate_limit()
        results = []

        try:
            response = requests.get(
                SS_CITATIONS.format(paper_id=paper_id),
                params={
                    "fields": CITING_FIELDS,
                    "limit": min(limit, 1000),
                    "offset": offset,
                },
                headers={"User-Agent": USER_AGENT},
                timeout=60,
            )

            if response.status_code == 200:
                try:
                    data = response.json()
                except Exception:
                    return results
                if not isinstance(data, dict):
                    return results
                for item in data.get("data") or []:
                    citing = item.get("citingPaper", {})
                    node = self._parse_paper(citing)
                    if node:
                        results.append((node, paper_id))

            elif response.status_code == 429:
                print("  Rate limited, waiting 60s...", file=sys.stderr)
                time.sleep(60)
                return self.get_citations(paper_id, limit, offset)

        except requests.RequestException as e:
            print(f"  Error fetching citations for {paper_id}: {e}", file=sys.stderr)

        return results

    def get_references(self, paper_id: str, limit: int = 50, offset: int = 0) -> list[tuple[str, PaperNode]]:
        """
        Get papers that this paper references.

        Returns list of (citing_paper_id, referenced_paper) tuples.
        """
        self._rate_limit()
        results = []

        try:
            response = requests.get(
                SS_REFERENCES.format(paper_id=paper_id),
                params={
                    "fields": CITING_FIELDS,
                    "limit": min(limit, 1000),
                    "offset": offset,
                },
                headers={"User-Agent": USER_AGENT},
                timeout=60,
            )

            if response.status_code == 200:
                try:
                    data = response.json()
                except Exception:
                    return results
                if not isinstance(data, dict):
                    return results
                for item in data.get("data") or []:
                    cited = item.get("citedPaper", {})
                    node = self._parse_paper(cited)
                    if node:
                        results.append((paper_id, node))

            elif response.status_code == 429:
                print("  Rate limited, waiting 60s...", file=sys.stderr)
                time.sleep(60)
                return self.get_references(paper_id, limit, offset)

        except requests.RequestException as e:
            print(f"  Error fetching references for {paper_id}: {e}", file=sys.stderr)

        return results


# =============================================================================
# GRAPH BUILDER
# =============================================================================

class GraphBuilder:
    """Build citation graphs from seed papers."""

    def __init__(self):
        self.client = SemanticScholarClient()
        self.graph = CitationGraph()

    def build_from_doi(
        self,
        doi: str,
        depth: int = 1,
        limit_per_paper: int = 20,
        include_references: bool = True,
        include_citations: bool = True,
    ) -> CitationGraph:
        """
        Build citation graph starting from a DOI.

        Args:
            doi: Seed paper DOI
            depth: How many levels of citations/references to follow
            limit_per_paper: Max citations/references per paper
            include_references: Include papers this paper references
            include_citations: Include papers that cite this paper
        """
        print(f"Building citation graph from DOI: {doi}", file=sys.stderr)
        print(f"Depth: {depth}, Limit: {limit_per_paper}", file=sys.stderr)

        # Get seed paper
        seed = self.client.get_paper_by_doi(doi)
        if not seed:
            print(f"ERROR: Could not find paper with DOI: {doi}", file=sys.stderr)
            return self.graph

        seed.depth = 0
        self.graph.add_node(seed)
        self.graph.seed_papers.append(seed.id)

        print(f"\nSeed paper: {seed.title[:60]}...", file=sys.stderr)
        print(f"  Citations: {seed.citation_count or 'N/A'}", file=sys.stderr)

        # BFS to expand graph
        queue: deque[tuple[str, int]] = deque([(seed.id, 0)])
        visited: set[str] = {seed.id}

        while queue:
            paper_id, current_depth = queue.popleft()

            if current_depth >= depth:
                continue

            print(f"\nExpanding paper at depth {current_depth}...", file=sys.stderr)

            # Get citations (papers that cite this one)
            if include_citations:
                print(f"  Fetching citations...", file=sys.stderr)
                citations = self.client.get_citations(paper_id, limit=limit_per_paper)
                print(f"    Found {len(citations)} citing papers", file=sys.stderr)

                for citing_node, cited_id in citations:
                    citing_node.depth = current_depth + 1
                    self.graph.add_node(citing_node)
                    self.graph.add_edge(CitationEdge(
                        source=citing_node.id,
                        target=cited_id,
                        edge_type="cites",
                    ))

                    if citing_node.id not in visited:
                        visited.add(citing_node.id)
                        queue.append((citing_node.id, current_depth + 1))

            # Get references (papers this one cites)
            if include_references:
                print(f"  Fetching references...", file=sys.stderr)
                references = self.client.get_references(paper_id, limit=limit_per_paper)
                print(f"    Found {len(references)} referenced papers", file=sys.stderr)

                for citing_id, ref_node in references:
                    ref_node.depth = current_depth + 1
                    self.graph.add_node(ref_node)
                    self.graph.add_edge(CitationEdge(
                        source=citing_id,
                        target=ref_node.id,
                        edge_type="references",
                    ))

                    if ref_node.id not in visited:
                        visited.add(ref_node.id)
                        queue.append((ref_node.id, current_depth + 1))

        # Add metadata
        self.graph.metadata = {
            "created": datetime.now().isoformat(),
            "seed_doi": doi,
            "depth": depth,
            "limit_per_paper": limit_per_paper,
            "include_references": include_references,
            "include_citations": include_citations,
        }

        return self.graph

    def build_from_papers(
        self,
        papers: list[dict],
        depth: int = 1,
        limit_per_paper: int = 20,
    ) -> CitationGraph:
        """Build citation graph from multiple seed papers."""
        for paper in papers:
            doi = paper.get("doi")
            if doi:
                print(f"\nProcessing seed paper: {doi}", file=sys.stderr)
                self.build_from_doi(doi, depth=depth, limit_per_paper=limit_per_paper)
            else:
                print(f"Skipping paper without DOI: {paper.get('title', 'Unknown')}", file=sys.stderr)

        return self.graph


# =============================================================================
# CLI
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Build citation networks from seed papers"
    )

    parser.add_argument(
        "--doi", "-d",
        help="Seed paper DOI"
    )

    parser.add_argument(
        "--input", "-i",
        help="Input JSON file with papers (from unified-search.py)"
    )

    parser.add_argument(
        "--depth",
        type=int,
        default=1,
        help="Citation depth to explore (default: 1)"
    )

    parser.add_argument(
        "--limit", "-l",
        type=int,
        default=20,
        help="Max citations/references per paper (default: 20)"
    )

    parser.add_argument(
        "--no-references",
        action="store_true",
        help="Don't include referenced papers"
    )

    parser.add_argument(
        "--no-citations",
        action="store_true",
        help="Don't include citing papers"
    )

    parser.add_argument(
        "--output", "-o",
        help="Output file path"
    )

    parser.add_argument(
        "--format", "-f",
        choices=["json", "graphml", "summary"],
        default="json",
        help="Output format (default: json)"
    )

    args = parser.parse_args()

    if not args.doi and not args.input:
        parser.error("Either --doi or --input must be provided")

    builder = GraphBuilder()

    if args.doi:
        graph = builder.build_from_doi(
            doi=args.doi,
            depth=args.depth,
            limit_per_paper=args.limit,
            include_references=not args.no_references,
            include_citations=not args.no_citations,
        )
    else:
        input_path = Path(args.input)
        if not input_path.exists():
            print(f"ERROR: Input file not found: {args.input}", file=sys.stderr)
            sys.exit(1)
        papers = json.loads(input_path.read_text())
        graph = builder.build_from_papers(
            papers=papers,
            depth=args.depth,
            limit_per_paper=args.limit,
        )

    # Stats
    stats = graph.get_stats()
    print("\n" + "=" * 50, file=sys.stderr)
    print("GRAPH STATISTICS", file=sys.stderr)
    print("=" * 50, file=sys.stderr)
    print(f"Total nodes:    {stats['total_nodes']}", file=sys.stderr)
    print(f"Total edges:    {stats['total_edges']}", file=sys.stderr)
    print(f"Seed papers:    {stats['seed_papers']}", file=sys.stderr)
    print(f"Max depth:      {stats['max_depth']}", file=sys.stderr)
    print(f"Avg citations:  {stats['avg_citations']:.1f}", file=sys.stderr)
    if stats['year_range']['min']:
        print(f"Year range:     {stats['year_range']['min']}-{stats['year_range']['max']}", file=sys.stderr)

    # Format output
    if args.format == "json":
        output = json.dumps(graph.to_dict(), indent=2)
    elif args.format == "graphml":
        output = graph.to_graphml()
    else:  # summary
        lines = [
            f"Citation Graph Summary",
            f"=" * 40,
            f"Nodes: {stats['total_nodes']}",
            f"Edges: {stats['total_edges']}",
            f"",
            f"Top cited papers:",
        ]
        top_papers = sorted(
            graph.nodes.values(),
            key=lambda n: n.citation_count or 0,
            reverse=True,
        )[:10]
        for i, paper in enumerate(top_papers, 1):
            lines.append(f"  {i}. [{paper.citation_count or 0} cites] {paper.title[:50]}...")
        output = "\n".join(lines)

    # Write output
    if args.output:
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(output)
        print(f"\nGraph written to: {output_path}", file=sys.stderr)
    else:
        print(output)


if __name__ == "__main__":
    main()
