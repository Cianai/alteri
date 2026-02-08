#!/usr/bin/env python3
"""
Unified Academic Search Script
==============================
Search across Semantic Scholar, PubMed, and bioRxiv with deduplication.

Outputs JSON for piping to zotero-import.py or citation-graph.py.

Usage:
    python3 unified-search.py "limerence romantic attachment"
    python3 unified-search.py --doi 10.1080/00224545.2020.1787400
    python3 unified-search.py "network analysis" --sources semantic_scholar,pubmed
    python3 unified-search.py "depression" --max-results 50 --output results.json

Author: Claude Code (for Cian O'Sullivan)
Date: 17 January 2026
"""

import argparse
import hashlib
import json
import os
import re
import sys
import time
from dataclasses import asdict, dataclass, field
from datetime import datetime
from difflib import SequenceMatcher
from pathlib import Path
from typing import Optional
from xml.etree import ElementTree

try:
    import requests
except ImportError:
    print("ERROR: requests not installed. Run: pip3 install requests")
    sys.exit(1)

# =============================================================================
# CONFIGURATION
# =============================================================================

# API endpoints
SEMANTIC_SCHOLAR_SEARCH = "https://api.semanticscholar.org/graph/v1/paper/search"
SEMANTIC_SCHOLAR_DOI = "https://api.semanticscholar.org/graph/v1/paper/DOI:{doi}"
PUBMED_SEARCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
PUBMED_FETCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
BIORXIV_API = "https://api.biorxiv.org/details/biorxiv"
CROSSREF_DOI = "https://api.crossref.org/works/{doi}"

# Rate limiting (requests per second)
RATE_LIMITS = {
    "semantic_scholar": 1.0,
    "pubmed": 3.0,  # NCBI allows 3/sec without API key
    "biorxiv": 2.0,
    "crossref": 2.0,
}

# User agent for API requests
USER_AGENT = "UnifiedAcademicSearch/1.0 (cianosullivan@gmail.com)"

# Output directory
OUTPUT_DIR = Path.home() / "scripts" / "logs"


# =============================================================================
# DATA MODELS
# =============================================================================

@dataclass
class Author:
    name: str
    orcid: Optional[str] = None
    affiliation: Optional[str] = None


@dataclass
class Paper:
    id: str
    title: str
    authors: list[Author]
    abstract: Optional[str] = None
    doi: Optional[str] = None
    pmid: Optional[str] = None
    published_date: Optional[str] = None
    venue: Optional[str] = None
    citation_count: Optional[int] = None
    url: Optional[str] = None
    pdf_url: Optional[str] = None
    source: str = "unknown"
    keywords: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "title": self.title,
            "authors": [{"name": a.name, "orcid": a.orcid, "affiliation": a.affiliation} for a in self.authors],
            "abstract": self.abstract,
            "doi": self.doi,
            "pmid": self.pmid,
            "published_date": self.published_date,
            "venue": self.venue,
            "citation_count": self.citation_count,
            "url": self.url,
            "pdf_url": self.pdf_url,
            "source": self.source,
            "keywords": self.keywords,
        }


# =============================================================================
# API CLIENTS
# =============================================================================

class SemanticScholarClient:
    """Client for Semantic Scholar API."""

    def __init__(self):
        self.last_request = 0
        self.fields = "title,authors,abstract,year,venue,citationCount,externalIds,url,openAccessPdf"

    def _rate_limit(self):
        elapsed = time.time() - self.last_request
        if elapsed < RATE_LIMITS["semantic_scholar"]:
            time.sleep(RATE_LIMITS["semantic_scholar"] - elapsed)
        self.last_request = time.time()

    def search(self, query: str, max_results: int = 20) -> list[Paper]:
        """Search for papers by query."""
        self._rate_limit()
        papers = []

        try:
            response = requests.get(
                SEMANTIC_SCHOLAR_SEARCH,
                params={
                    "query": query,
                    "limit": min(max_results, 100),
                    "fields": self.fields,
                },
                headers={"User-Agent": USER_AGENT},
                timeout=30,
            )

            if response.status_code == 200:
                data = response.json()
                for item in data.get("data", []):
                    papers.append(self._parse_paper(item))
            elif response.status_code == 429:
                print("  [Semantic Scholar] Rate limited, waiting 60s...", file=sys.stderr)
                time.sleep(60)

        except requests.RequestException as e:
            print(f"  [Semantic Scholar] Error: {e}", file=sys.stderr)

        return papers

    def get_by_doi(self, doi: str) -> Optional[Paper]:
        """Get paper by DOI."""
        self._rate_limit()

        try:
            response = requests.get(
                SEMANTIC_SCHOLAR_DOI.format(doi=doi),
                params={"fields": self.fields},
                headers={"User-Agent": USER_AGENT},
                timeout=30,
            )

            if response.status_code == 200:
                return self._parse_paper(response.json())

        except requests.RequestException as e:
            print(f"  [Semantic Scholar] DOI lookup error: {e}", file=sys.stderr)

        return None

    def _parse_paper(self, data: dict) -> Paper:
        """Parse API response into Paper object."""
        authors = []
        for author in data.get("authors", []):
            authors.append(Author(name=author.get("name", "Unknown")))

        external_ids = data.get("externalIds", {}) or {}
        open_access = data.get("openAccessPdf", {}) or {}

        return Paper(
            id=data.get("paperId", ""),
            title=data.get("title", ""),
            authors=authors,
            abstract=data.get("abstract"),
            doi=external_ids.get("DOI"),
            pmid=external_ids.get("PubMed"),
            published_date=str(data.get("year")) if data.get("year") else None,
            venue=data.get("venue"),
            citation_count=data.get("citationCount"),
            url=data.get("url"),
            pdf_url=open_access.get("url"),
            source="semantic_scholar",
        )


class PubMedClient:
    """Client for PubMed/NCBI E-utilities API."""

    def __init__(self):
        self.last_request = 0

    def _rate_limit(self):
        elapsed = time.time() - self.last_request
        if elapsed < 1 / RATE_LIMITS["pubmed"]:
            time.sleep(1 / RATE_LIMITS["pubmed"] - elapsed)
        self.last_request = time.time()

    def search(self, query: str, max_results: int = 20) -> list[Paper]:
        """Search PubMed for papers."""
        self._rate_limit()
        papers = []

        try:
            # Step 1: Search for PMIDs
            search_response = requests.get(
                PUBMED_SEARCH,
                params={
                    "db": "pubmed",
                    "term": query,
                    "retmax": min(max_results, 100),
                    "retmode": "json",
                    "sort": "relevance",
                },
                headers={"User-Agent": USER_AGENT},
                timeout=30,
            )

            if search_response.status_code != 200:
                return papers

            search_data = search_response.json()
            pmids = search_data.get("esearchresult", {}).get("idlist", [])

            if not pmids:
                return papers

            # Step 2: Fetch full records
            self._rate_limit()
            fetch_response = requests.get(
                PUBMED_FETCH,
                params={
                    "db": "pubmed",
                    "id": ",".join(pmids),
                    "retmode": "xml",
                    "rettype": "abstract",
                },
                headers={"User-Agent": USER_AGENT},
                timeout=60,
            )

            if fetch_response.status_code == 200:
                papers = self._parse_xml_response(fetch_response.text)

        except requests.RequestException as e:
            print(f"  [PubMed] Error: {e}", file=sys.stderr)

        return papers

    def get_by_pmid(self, pmid: str) -> Optional[Paper]:
        """Get paper by PMID."""
        self._rate_limit()

        try:
            response = requests.get(
                PUBMED_FETCH,
                params={
                    "db": "pubmed",
                    "id": pmid,
                    "retmode": "xml",
                    "rettype": "abstract",
                },
                headers={"User-Agent": USER_AGENT},
                timeout=30,
            )

            if response.status_code == 200:
                papers = self._parse_xml_response(response.text)
                if papers:
                    return papers[0]

        except requests.RequestException as e:
            print(f"  [PubMed] PMID lookup error: {e}", file=sys.stderr)

        return None

    def _parse_xml_response(self, xml_text: str) -> list[Paper]:
        """Parse PubMed XML response."""
        papers = []

        try:
            root = ElementTree.fromstring(xml_text)

            for article in root.findall(".//PubmedArticle"):
                medline = article.find("MedlineCitation")
                if medline is None:
                    continue

                article_elem = medline.find("Article")
                if article_elem is None:
                    continue

                # Extract PMID
                pmid_elem = medline.find("PMID")
                pmid = pmid_elem.text if pmid_elem is not None else None

                # Extract title
                title_elem = article_elem.find("ArticleTitle")
                title = title_elem.text if title_elem is not None else ""

                # Extract authors
                authors = []
                author_list = article_elem.find("AuthorList")
                if author_list is not None:
                    for author_elem in author_list.findall("Author"):
                        last = author_elem.find("LastName")
                        first = author_elem.find("ForeName")
                        if last is not None:
                            name = last.text
                            if first is not None:
                                name = f"{first.text} {last.text}"
                            authors.append(Author(name=name))

                # Extract abstract
                abstract = None
                abstract_elem = article_elem.find("Abstract/AbstractText")
                if abstract_elem is not None:
                    abstract = abstract_elem.text

                # Extract DOI
                doi = None
                article_ids = article.find("PubmedData/ArticleIdList")
                if article_ids is not None:
                    for id_elem in article_ids.findall("ArticleId"):
                        if id_elem.get("IdType") == "doi":
                            doi = id_elem.text
                            break

                # Extract date
                pub_date = None
                date_elem = article_elem.find("Journal/JournalIssue/PubDate")
                if date_elem is not None:
                    year = date_elem.find("Year")
                    if year is not None:
                        pub_date = year.text

                # Extract journal
                venue = None
                journal = article_elem.find("Journal/Title")
                if journal is not None:
                    venue = journal.text

                # Extract keywords
                keywords = []
                mesh_list = medline.find("MeshHeadingList")
                if mesh_list is not None:
                    for mesh in mesh_list.findall("MeshHeading/DescriptorName"):
                        if mesh.text:
                            keywords.append(mesh.text)

                papers.append(Paper(
                    id=f"pmid:{pmid}" if pmid else "",
                    title=title,
                    authors=authors,
                    abstract=abstract,
                    doi=doi,
                    pmid=pmid,
                    published_date=pub_date,
                    venue=venue,
                    url=f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/" if pmid else None,
                    source="pubmed",
                    keywords=keywords,
                ))

        except ElementTree.ParseError as e:
            print(f"  [PubMed] XML parse error: {e}", file=sys.stderr)

        return papers


class BioRxivClient:
    """Client for bioRxiv API."""

    def __init__(self):
        self.last_request = 0

    def _rate_limit(self):
        elapsed = time.time() - self.last_request
        if elapsed < 1 / RATE_LIMITS["biorxiv"]:
            time.sleep(1 / RATE_LIMITS["biorxiv"] - elapsed)
        self.last_request = time.time()

    def search(self, query: str, max_results: int = 20) -> list[Paper]:
        """Search bioRxiv for papers."""
        # bioRxiv API doesn't have keyword search - we'll use recent papers in relevant categories
        # For now, return empty and rely on Semantic Scholar which indexes bioRxiv
        return []

    def get_recent(self, days: int = 30, max_results: int = 50) -> list[Paper]:
        """Get recent bioRxiv papers."""
        self._rate_limit()
        papers = []

        try:
            # Get recent papers
            from datetime import timedelta
            end_date = datetime.now().strftime("%Y-%m-%d")
            start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")

            response = requests.get(
                f"{BIORXIV_API}/{start_date}/{end_date}/0",
                headers={"User-Agent": USER_AGENT},
                timeout=60,
            )

            if response.status_code == 200:
                data = response.json()
                for item in data.get("collection", [])[:max_results]:
                    papers.append(self._parse_paper(item))

        except requests.RequestException as e:
            print(f"  [bioRxiv] Error: {e}", file=sys.stderr)

        return papers

    def _parse_paper(self, data: dict) -> Paper:
        """Parse bioRxiv API response."""
        # Parse authors
        authors = []
        author_str = data.get("authors", "")
        for name in author_str.split(";"):
            name = name.strip()
            if name:
                authors.append(Author(name=name))

        return Paper(
            id=f"biorxiv:{data.get('doi', '')}",
            title=data.get("title", ""),
            authors=authors,
            abstract=data.get("abstract"),
            doi=data.get("doi"),
            published_date=data.get("date"),
            venue="bioRxiv",
            url=f"https://www.biorxiv.org/content/{data.get('doi', '')}",
            pdf_url=f"https://www.biorxiv.org/content/{data.get('doi', '')}.full.pdf" if data.get("doi") else None,
            source="biorxiv",
            keywords=data.get("category", "").split(";") if data.get("category") else [],
        )


class CrossRefClient:
    """Client for CrossRef API (DOI resolution)."""

    def __init__(self):
        self.last_request = 0

    def _rate_limit(self):
        elapsed = time.time() - self.last_request
        if elapsed < 1 / RATE_LIMITS["crossref"]:
            time.sleep(1 / RATE_LIMITS["crossref"] - elapsed)
        self.last_request = time.time()

    def get_by_doi(self, doi: str) -> Optional[Paper]:
        """Get paper metadata by DOI."""
        self._rate_limit()

        try:
            response = requests.get(
                CROSSREF_DOI.format(doi=doi),
                headers={"User-Agent": USER_AGENT},
                timeout=30,
            )

            if response.status_code == 200:
                return self._parse_response(response.json())

        except requests.RequestException as e:
            print(f"  [CrossRef] DOI lookup error: {e}", file=sys.stderr)

        return None

    def _parse_response(self, data: dict) -> Paper:
        """Parse CrossRef API response."""
        message = data.get("message", {})

        # Parse authors
        authors = []
        for author in message.get("author", []):
            name = f"{author.get('given', '')} {author.get('family', '')}".strip()
            authors.append(Author(
                name=name,
                orcid=author.get("ORCID"),
                affiliation=author.get("affiliation", [{}])[0].get("name") if author.get("affiliation") else None,
            ))

        # Parse date
        pub_date = None
        date_parts = message.get("published-print", message.get("published-online", {})).get("date-parts", [[]])
        if date_parts and date_parts[0]:
            pub_date = "-".join(str(p) for p in date_parts[0])

        # Parse abstract (remove HTML tags)
        abstract = message.get("abstract", "")
        if abstract:
            abstract = re.sub(r'<[^>]+>', '', abstract).strip()

        return Paper(
            id=f"doi:{message.get('DOI', '')}",
            title=message.get("title", [""])[0] if message.get("title") else "",
            authors=authors,
            abstract=abstract if abstract else None,
            doi=message.get("DOI"),
            published_date=pub_date,
            venue=message.get("container-title", [""])[0] if message.get("container-title") else None,
            citation_count=message.get("is-referenced-by-count"),
            url=message.get("URL"),
            source="crossref",
        )


# =============================================================================
# DEDUPLICATION
# =============================================================================

def normalize_title(title: str) -> str:
    """Normalize title for comparison."""
    title = title.lower()
    title = re.sub(r'[^\w\s]', '', title)
    title = re.sub(r'\s+', ' ', title)
    return title.strip()


def title_similarity(t1: str, t2: str) -> float:
    """Calculate title similarity score."""
    n1, n2 = normalize_title(t1), normalize_title(t2)
    return SequenceMatcher(None, n1, n2).ratio()


def deduplicate_papers(papers: list[Paper], threshold: float = 0.85) -> list[Paper]:
    """
    Deduplicate papers based on DOI and title similarity.
    Prefers papers with more metadata (abstract, citation count).
    """
    if not papers:
        return []

    # Group by DOI first (exact matches)
    doi_groups: dict[str, list[Paper]] = {}
    no_doi: list[Paper] = []

    for paper in papers:
        if paper.doi:
            normalized_doi = paper.doi.lower().strip()
            if normalized_doi not in doi_groups:
                doi_groups[normalized_doi] = []
            doi_groups[normalized_doi].append(paper)
        else:
            no_doi.append(paper)

    # Select best paper from each DOI group
    unique: list[Paper] = []
    for papers_group in doi_groups.values():
        best = max(papers_group, key=lambda p: (
            1 if p.abstract else 0,
            p.citation_count or 0,
            len(p.authors),
        ))
        unique.append(best)

    # Deduplicate papers without DOI based on title similarity
    for paper in no_doi:
        is_duplicate = False
        for existing in unique:
            if title_similarity(paper.title, existing.title) >= threshold:
                is_duplicate = True
                # Keep the one with more metadata
                if (paper.abstract and not existing.abstract) or \
                   (paper.citation_count or 0) > (existing.citation_count or 0):
                    unique.remove(existing)
                    unique.append(paper)
                break
        if not is_duplicate:
            unique.append(paper)

    return unique


# =============================================================================
# MAIN SEARCH FUNCTION
# =============================================================================

def unified_search(
    query: str = None,
    doi: str = None,
    sources: list[str] = None,
    max_results: int = 20,
) -> list[Paper]:
    """
    Search across multiple sources and return deduplicated results.

    Args:
        query: Search query string
        doi: DOI to look up directly
        sources: List of sources to search (semantic_scholar, pubmed, biorxiv)
        max_results: Maximum results per source

    Returns:
        List of deduplicated Paper objects
    """
    if sources is None:
        sources = ["semantic_scholar", "pubmed"]

    all_papers: list[Paper] = []

    # Initialize clients
    ss_client = SemanticScholarClient()
    pubmed_client = PubMedClient()
    biorxiv_client = BioRxivClient()
    crossref_client = CrossRefClient()

    # DOI lookup mode
    if doi:
        print(f"Looking up DOI: {doi}", file=sys.stderr)

        # Try Semantic Scholar first
        paper = ss_client.get_by_doi(doi)
        if paper:
            all_papers.append(paper)
            print(f"  Found in Semantic Scholar", file=sys.stderr)

        # Fallback to CrossRef
        if not paper:
            paper = crossref_client.get_by_doi(doi)
            if paper:
                all_papers.append(paper)
                print(f"  Found in CrossRef", file=sys.stderr)

        return all_papers

    # Query search mode
    if query:
        print(f"Searching for: {query}", file=sys.stderr)
        print(f"Sources: {', '.join(sources)}", file=sys.stderr)
        print("", file=sys.stderr)

        for source in sources:
            if source == "semantic_scholar":
                print(f"  Querying Semantic Scholar...", file=sys.stderr)
                papers = ss_client.search(query, max_results)
                print(f"    Found {len(papers)} results", file=sys.stderr)
                all_papers.extend(papers)

            elif source == "pubmed":
                print(f"  Querying PubMed...", file=sys.stderr)
                papers = pubmed_client.search(query, max_results)
                print(f"    Found {len(papers)} results", file=sys.stderr)
                all_papers.extend(papers)

            elif source == "biorxiv":
                print(f"  Querying bioRxiv...", file=sys.stderr)
                # bioRxiv doesn't have search, get recent papers
                papers = biorxiv_client.get_recent(days=90, max_results=max_results)
                # Filter by query terms
                query_terms = query.lower().split()
                papers = [p for p in papers if any(
                    term in (p.title or "").lower() or term in (p.abstract or "").lower()
                    for term in query_terms
                )]
                print(f"    Found {len(papers)} results", file=sys.stderr)
                all_papers.extend(papers)

    # Deduplicate
    print(f"\nDeduplicating {len(all_papers)} papers...", file=sys.stderr)
    unique_papers = deduplicate_papers(all_papers)
    print(f"  {len(unique_papers)} unique papers after deduplication", file=sys.stderr)

    return unique_papers


# =============================================================================
# CLI
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Unified academic search across Semantic Scholar, PubMed, and bioRxiv"
    )

    parser.add_argument(
        "query",
        nargs="?",
        help="Search query string"
    )

    parser.add_argument(
        "--doi", "-d",
        help="Look up a specific DOI"
    )

    parser.add_argument(
        "--sources", "-s",
        default="semantic_scholar,pubmed",
        help="Comma-separated list of sources (semantic_scholar, pubmed, biorxiv)"
    )

    parser.add_argument(
        "--max-results", "-m",
        type=int,
        default=20,
        help="Maximum results per source (default: 20)"
    )

    parser.add_argument(
        "--output", "-o",
        help="Output file path (default: stdout)"
    )

    parser.add_argument(
        "--format", "-f",
        choices=["json", "jsonl", "summary"],
        default="json",
        help="Output format (default: json)"
    )

    args = parser.parse_args()

    if not args.query and not args.doi:
        parser.error("Either query or --doi must be provided")

    # Parse sources
    sources = [s.strip() for s in args.sources.split(",")]

    # Run search
    papers = unified_search(
        query=args.query,
        doi=args.doi,
        sources=sources,
        max_results=args.max_results,
    )

    # Format output
    if args.format == "json":
        output = json.dumps([p.to_dict() for p in papers], indent=2)
    elif args.format == "jsonl":
        output = "\n".join(json.dumps(p.to_dict()) for p in papers)
    else:  # summary
        lines = [f"Found {len(papers)} papers:\n"]
        for i, paper in enumerate(papers, 1):
            lines.append(f"{i}. {paper.title}")
            lines.append(f"   Authors: {', '.join(a.name for a in paper.authors[:3])}")
            lines.append(f"   DOI: {paper.doi or 'N/A'}")
            lines.append(f"   Source: {paper.source}")
            lines.append(f"   Citations: {paper.citation_count or 'N/A'}")
            lines.append("")
        output = "\n".join(lines)

    # Write output
    if args.output:
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(output)
        print(f"\nResults written to: {output_path}", file=sys.stderr)
    else:
        print(output)


if __name__ == "__main__":
    main()
