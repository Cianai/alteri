#!/usr/bin/env python3
"""
Zotero Metadata Audit Script
============================
Analyses the completeness of metadata across the Zotero library and ChromaDB semantic index.

This script answers the critical question: "What can AI tools actually work with?"

Outputs:
    - Metadata completeness statistics (abstract, title, DOI coverage)
    - Item type distribution with metadata quality per type
    - ChromaDB vs Zotero cross-reference (what's indexed vs what exists)
    - List of papers with missing abstracts (limits AI classification quality)
    - Recommendations for cleanup priority

Author: Claude (for Cian O'Sullivan)
Date: 11 January 2026
"""

import os
import sys
import json
import sqlite3
from datetime import datetime
from collections import Counter, defaultdict
from typing import Dict, List, Any, Tuple, Optional
from pathlib import Path

# Attempt to import pyzotero; provide helpful error if missing
try:
    from pyzotero import zotero
except ImportError:
    print("ERROR: pyzotero not installed. Run: pip3 install pyzotero")
    sys.exit(1)

# =============================================================================
# CONFIGURATION
# =============================================================================

# Zotero API credentials - loaded from environment or .env file
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / "zotero" / ".env")

ZOTERO_LIBRARY_ID = os.environ.get("ZOTERO_LIBRARY_ID")
ZOTERO_LIBRARY_TYPE = "user"
ZOTERO_API_KEY = os.environ.get("ZOTERO_API_KEY")

if not ZOTERO_LIBRARY_ID or not ZOTERO_API_KEY:
    print("ERROR: Set ZOTERO_LIBRARY_ID and ZOTERO_API_KEY in environment or scripts/zotero/.env")
    sys.exit(1)

# ChromaDB location (from our earlier analysis)
CHROMADB_PATH = os.path.expanduser("~/.config/zotero-mcp/chroma_db/chroma.sqlite3")

# Output directory for the audit report
REPORT_DIR = os.path.expanduser("~/Vaults/ObsidianVault/System/Research-Architecture")

# Rate limiting for Zotero API (be gentle)
RATE_LIMIT_DELAY = 0.1

# =============================================================================
# ZOTERO AUDIT FUNCTIONS
# =============================================================================

def connect_zotero() -> zotero.Zotero:
    """Establish connection to Zotero API."""
    print("Connecting to Zotero API...")
    return zotero.Zotero(ZOTERO_LIBRARY_ID, ZOTERO_LIBRARY_TYPE, ZOTERO_API_KEY)


def fetch_all_items(zot: zotero.Zotero) -> List[Dict[str, Any]]:
    """
    Fetch all items from Zotero library.
    
    Uses the everything() method to handle pagination automatically.
    Excludes attachments and notes (we want parent items only).
    """
    print("Fetching all items from Zotero (this may take a moment)...")
    
    # Fetch top-level items only (excludes child attachments/notes)
    items = zot.everything(zot.top())
    
    print(f"  Retrieved {len(items)} top-level items")
    return items


def analyse_metadata_completeness(items: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyse metadata completeness across all items.
    
    For each item, checks presence and quality of:
    - Title (required for any meaningful classification)
    - Abstract (critical for AI classification)
    - DOI (useful for deduplication and lookup)
    - Authors/creators
    - Publication date
    - Publication venue (journal, conference, etc.)
    """
    
    # Counters for overall statistics
    total_items = len(items)
    
    # Track presence of each field
    has_title = 0
    has_abstract = 0
    has_doi = 0
    has_creators = 0
    has_date = 0
    has_publication = 0
    
    # Track abstract quality (length distribution)
    abstract_lengths = []
    
    # Track by item type
    by_item_type = defaultdict(lambda: {
        'count': 0,
        'has_abstract': 0,
        'has_doi': 0,
        'abstract_lengths': []
    })
    
    # Track items missing abstracts (for potential manual attention)
    missing_abstract_items = []
    
    # Track tag statistics
    items_with_tags = 0
    items_with_faceted_tags = 0
    all_tags = []
    status_marker_items = 0
    
    print("Analysing metadata completeness...")
    
    for item in items:
        data = item.get('data', {})
        item_type = data.get('itemType', 'unknown')
        item_key = item.get('key', 'unknown')
        
        # Skip non-content item types
        if item_type in ['attachment', 'note', 'annotation']:
            continue
        
        by_item_type[item_type]['count'] += 1
        
        # Check title
        title = data.get('title', '').strip()
        if title:
            has_title += 1
        
        # Check abstract (the critical field for AI classification)
        abstract = data.get('abstractNote', '').strip()
        if abstract:
            has_abstract += 1
            by_item_type[item_type]['has_abstract'] += 1
            abstract_lengths.append(len(abstract))
            by_item_type[item_type]['abstract_lengths'].append(len(abstract))
        else:
            # Track items missing abstracts for potential follow-up
            missing_abstract_items.append({
                'key': item_key,
                'title': title[:100] if title else '(no title)',
                'item_type': item_type,
                'doi': data.get('DOI', ''),
                'url': data.get('url', '')
            })
        
        # Check DOI
        doi = data.get('DOI', '').strip()
        if doi:
            has_doi += 1
            by_item_type[item_type]['has_doi'] += 1
        
        # Check creators
        creators = data.get('creators', [])
        if creators:
            has_creators += 1
        
        # Check date
        date = data.get('date', '').strip()
        if date:
            has_date += 1
        
        # Check publication venue (field name varies by item type)
        publication = (
            data.get('publicationTitle', '') or 
            data.get('proceedingsTitle', '') or
            data.get('bookTitle', '') or
            data.get('publisher', '')
        ).strip()
        if publication:
            has_publication += 1
        
        # Analyse tags
        tags = data.get('tags', [])
        if tags:
            items_with_tags += 1
            tag_names = [t.get('tag', '') for t in tags]
            all_tags.extend(tag_names)
            
            # Check for faceted tags
            if any(t.startswith('#') and '/' in t for t in tag_names):
                items_with_faceted_tags += 1
            
            # Check for status markers
            tag_str = ' '.join(tag_names)
            if any(marker in tag_str for marker in ['❌', '🚫', '⛔']):
                status_marker_items += 1
    
    # Calculate statistics
    results = {
        'total_items': total_items,
        'field_coverage': {
            'title': {'count': has_title, 'percent': round(has_title / total_items * 100, 1)},
            'abstract': {'count': has_abstract, 'percent': round(has_abstract / total_items * 100, 1)},
            'doi': {'count': has_doi, 'percent': round(has_doi / total_items * 100, 1)},
            'creators': {'count': has_creators, 'percent': round(has_creators / total_items * 100, 1)},
            'date': {'count': has_date, 'percent': round(has_date / total_items * 100, 1)},
            'publication': {'count': has_publication, 'percent': round(has_publication / total_items * 100, 1)},
        },
        'abstract_quality': {
            'min_length': min(abstract_lengths) if abstract_lengths else 0,
            'max_length': max(abstract_lengths) if abstract_lengths else 0,
            'avg_length': round(sum(abstract_lengths) / len(abstract_lengths), 0) if abstract_lengths else 0,
            'short_abstracts': sum(1 for l in abstract_lengths if l < 100),  # Very short, possibly incomplete
            'good_abstracts': sum(1 for l in abstract_lengths if 100 <= l <= 2000),  # Typical length
            'long_abstracts': sum(1 for l in abstract_lengths if l > 2000),  # Unusually long
        },
        'by_item_type': dict(by_item_type),
        'missing_abstract_items': missing_abstract_items,
        'tag_statistics': {
            'items_with_tags': items_with_tags,
            'items_with_faceted_tags': items_with_faceted_tags,
            'status_marker_items': status_marker_items,
            'unique_tags': len(set(all_tags)),
            'total_tag_applications': len(all_tags),
        }
    }
    
    return results


# =============================================================================
# CHROMADB AUDIT FUNCTIONS
# =============================================================================

def analyse_chromadb() -> Dict[str, Any]:
    """
    Analyse the ChromaDB semantic search database.
    
    Extracts:
    - Total embeddings indexed
    - Metadata coverage within ChromaDB
    - Item keys for cross-referencing with Zotero
    """
    
    if not os.path.exists(CHROMADB_PATH):
        return {'error': f'ChromaDB not found at {CHROMADB_PATH}'}
    
    print(f"Analysing ChromaDB at {CHROMADB_PATH}...")
    
    conn = sqlite3.connect(CHROMADB_PATH)
    cursor = conn.cursor()
    
    # Get total embedding count
    cursor.execute("SELECT COUNT(*) FROM embeddings")
    total_embeddings = cursor.fetchone()[0]
    
    # Get all item keys from ChromaDB (for cross-reference)
    cursor.execute("""
        SELECT DISTINCT string_value 
        FROM embedding_metadata 
        WHERE key = 'item_key'
    """)
    chromadb_item_keys = set(row[0] for row in cursor.fetchall())
    
    # Analyse what metadata is present in ChromaDB
    cursor.execute("""
        SELECT key, COUNT(*) as cnt,
               SUM(CASE WHEN string_value IS NOT NULL AND string_value != '' THEN 1 ELSE 0 END) as non_empty
        FROM embedding_metadata
        GROUP BY key
    """)
    chromadb_metadata = {}
    for key, total, non_empty in cursor.fetchall():
        chromadb_metadata[key] = {
            'total': total,
            'non_empty': non_empty,
            'coverage_percent': round(non_empty / total * 100, 1) if total > 0 else 0
        }
    
    # Get document content sample lengths (what's actually embedded)
    cursor.execute("""
        SELECT LENGTH(string_value) as doc_length
        FROM embedding_metadata
        WHERE key = 'chroma:document' AND string_value IS NOT NULL
    """)
    doc_lengths = [row[0] for row in cursor.fetchall()]
    
    # Analyse tag distribution in ChromaDB
    cursor.execute("""
        SELECT string_value, COUNT(*) as cnt
        FROM embedding_metadata
        WHERE key = 'tags' AND string_value IS NOT NULL AND string_value != ''
        GROUP BY string_value
        ORDER BY cnt DESC
        LIMIT 50
    """)
    top_tag_combinations = cursor.fetchall()
    
    conn.close()
    
    return {
        'total_embeddings': total_embeddings,
        'item_keys': chromadb_item_keys,
        'metadata_coverage': chromadb_metadata,
        'document_stats': {
            'count': len(doc_lengths),
            'min_length': min(doc_lengths) if doc_lengths else 0,
            'max_length': max(doc_lengths) if doc_lengths else 0,
            'avg_length': round(sum(doc_lengths) / len(doc_lengths), 0) if doc_lengths else 0,
        },
        'top_tag_combinations': top_tag_combinations[:20],
    }


# =============================================================================
# CROSS-REFERENCE ANALYSIS
# =============================================================================

def cross_reference_zotero_chromadb(
    zotero_items: List[Dict[str, Any]], 
    chromadb_results: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Compare what's in Zotero versus what's indexed in ChromaDB.
    
    Identifies:
    - Items in Zotero but not ChromaDB (not searchable)
    - Items in ChromaDB but not Zotero (orphaned embeddings)
    - Sync status overall
    """
    
    if 'error' in chromadb_results:
        return {'error': chromadb_results['error']}
    
    print("Cross-referencing Zotero and ChromaDB...")
    
    # Get all Zotero item keys (excluding attachments/notes)
    zotero_keys = set()
    for item in zotero_items:
        item_type = item.get('data', {}).get('itemType', '')
        if item_type not in ['attachment', 'note', 'annotation']:
            zotero_keys.add(item.get('key', ''))
    
    chromadb_keys = chromadb_results.get('item_keys', set())
    
    # Calculate overlap
    in_both = zotero_keys & chromadb_keys
    zotero_only = zotero_keys - chromadb_keys
    chromadb_only = chromadb_keys - zotero_keys
    
    return {
        'zotero_total': len(zotero_keys),
        'chromadb_total': len(chromadb_keys),
        'in_both': len(in_both),
        'zotero_only': len(zotero_only),
        'chromadb_only': len(chromadb_only),
        'sync_percent': round(len(in_both) / len(zotero_keys) * 100, 1) if zotero_keys else 0,
        'zotero_only_keys': list(zotero_only)[:50],  # Sample for investigation
        'chromadb_only_keys': list(chromadb_only)[:50],
    }


# =============================================================================
# REPORT GENERATION
# =============================================================================

def generate_report(
    zotero_results: Dict[str, Any],
    chromadb_results: Dict[str, Any],
    cross_ref_results: Dict[str, Any]
) -> str:
    """Generate a comprehensive markdown report of the audit findings."""
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    report = f"""# Zotero Metadata Audit Report

**Generated**: {timestamp}
**Library**: {ZOTERO_LIBRARY_ID} ({ZOTERO_LIBRARY_TYPE})

---

## Executive Summary

This audit analyses metadata completeness to determine what AI classification tools can reliably work with. The critical finding is the **abstract coverage rate**, as abstracts are the primary input for content-based AI tagging.

### Key Metrics

| Metric | Value | Implication |
|--------|-------|-------------|
| Total items | {zotero_results['total_items']:,} | Full library size |
| Items with abstracts | {zotero_results['field_coverage']['abstract']['count']:,} ({zotero_results['field_coverage']['abstract']['percent']}%) | **AI-classifiable papers** |
| Items missing abstracts | {zotero_results['total_items'] - zotero_results['field_coverage']['abstract']['count']:,} ({100 - zotero_results['field_coverage']['abstract']['percent']}%) | Will need title-only classification or manual review |
| Items with DOI | {zotero_results['field_coverage']['doi']['count']:,} ({zotero_results['field_coverage']['doi']['percent']}%) | Can potentially fetch missing abstracts |
| ChromaDB indexed | {chromadb_results.get('total_embeddings', 'N/A'):,} | Semantic search coverage |

---

## Field Coverage Analysis

How complete is the metadata across your library?

| Field | Count | Coverage | Notes |
|-------|-------|----------|-------|
| Title | {zotero_results['field_coverage']['title']['count']:,} | {zotero_results['field_coverage']['title']['percent']}% | Essential for any use |
| Abstract | {zotero_results['field_coverage']['abstract']['count']:,} | {zotero_results['field_coverage']['abstract']['percent']}% | **Critical for AI classification** |
| DOI | {zotero_results['field_coverage']['doi']['count']:,} | {zotero_results['field_coverage']['doi']['percent']}% | Enables metadata lookup |
| Authors | {zotero_results['field_coverage']['creators']['count']:,} | {zotero_results['field_coverage']['creators']['percent']}% | Citation quality |
| Date | {zotero_results['field_coverage']['date']['count']:,} | {zotero_results['field_coverage']['date']['percent']}% | Temporal filtering |
| Publication | {zotero_results['field_coverage']['publication']['count']:,} | {zotero_results['field_coverage']['publication']['percent']}% | Venue-based filtering |

---

## Abstract Quality Analysis

For items that have abstracts, how useful are they?

| Category | Count | Description |
|----------|-------|-------------|
| Short (<100 chars) | {zotero_results['abstract_quality']['short_abstracts']:,} | May be truncated or incomplete |
| Normal (100-2000 chars) | {zotero_results['abstract_quality']['good_abstracts']:,} | Good for AI classification |
| Long (>2000 chars) | {zotero_results['abstract_quality']['long_abstracts']:,} | Full abstracts, excellent |

**Average abstract length**: {zotero_results['abstract_quality']['avg_length']:,.0f} characters

---

## Coverage by Item Type

Different item types have different metadata patterns:

| Item Type | Count | Has Abstract | Abstract % | Has DOI | DOI % |
|-----------|-------|--------------|------------|---------|-------|
"""
    
    # Sort item types by count
    sorted_types = sorted(
        zotero_results['by_item_type'].items(),
        key=lambda x: x[1]['count'],
        reverse=True
    )
    
    for item_type, stats in sorted_types:
        if stats['count'] > 0:
            abstract_pct = round(stats['has_abstract'] / stats['count'] * 100, 1)
            doi_pct = round(stats['has_doi'] / stats['count'] * 100, 1)
            report += f"| {item_type} | {stats['count']:,} | {stats['has_abstract']:,} | {abstract_pct}% | {stats['has_doi']:,} | {doi_pct}% |\n"
    
    report += f"""

---

## Current Tag Statistics

Understanding the existing tag situation before cleanup:

| Metric | Value |
|--------|-------|
| Items with any tags | {zotero_results['tag_statistics']['items_with_tags']:,} |
| Items with faceted tags (#prefix/) | {zotero_results['tag_statistics']['items_with_faceted_tags']:,} |
| Items with status markers (❌🚫⛔) | {zotero_results['tag_statistics']['status_marker_items']:,} |
| Unique tag strings | {zotero_results['tag_statistics']['unique_tags']:,} |
| Total tag applications | {zotero_results['tag_statistics']['total_tag_applications']:,} |

**Tag fragmentation ratio**: {zotero_results['tag_statistics']['unique_tags'] / zotero_results['total_items']:.2f} unique tags per item (ideally <0.1)

---

## ChromaDB Semantic Index Status

"""
    
    if 'error' in chromadb_results:
        report += f"**Error**: {chromadb_results['error']}\n"
    else:
        report += f"""The semantic search database contains embeddings for AI-powered search:

| Metric | Value |
|--------|-------|
| Total embeddings | {chromadb_results['total_embeddings']:,} |
| Average document length | {chromadb_results['document_stats']['avg_length']:,.0f} chars |
| Sync with Zotero | {cross_ref_results.get('sync_percent', 'N/A')}% |

### Sync Status

| Category | Count |
|----------|-------|
| In both Zotero and ChromaDB | {cross_ref_results.get('in_both', 'N/A'):,} |
| In Zotero only (not indexed) | {cross_ref_results.get('zotero_only', 'N/A'):,} |
| In ChromaDB only (orphaned) | {cross_ref_results.get('chromadb_only', 'N/A'):,} |

"""

    report += f"""---

## Recommendations

Based on this audit, here are the prioritised next steps:

### 1. Abstract Enrichment (High Impact)

{zotero_results['total_items'] - zotero_results['field_coverage']['abstract']['count']:,} items lack abstracts. Of these, {zotero_results['field_coverage']['doi']['count']:,} have DOIs, meaning abstracts could potentially be fetched automatically from CrossRef, Semantic Scholar, or publisher APIs.

**Recommendation**: Before AI classification, run an abstract enrichment script on items with DOIs but no abstracts. This could significantly increase the classifiable portion of your library.

### 2. Status Marker Cleanup (Required)

{zotero_results['tag_statistics']['status_marker_items']:,} items have workflow status markers (❌🚫⛔) embedded in the tag field. These should be:
- Recorded separately (saved searches or a status field)
- Removed from tags before any taxonomy work

### 3. Tag Reset (Recommended)

The current tag system has {zotero_results['tag_statistics']['unique_tags']:,} unique tag combinations across {zotero_results['total_items']:,} items, indicating severe fragmentation. A full reset and re-tagging with a simpler schema is more efficient than trying to clean up the existing tags.

### 4. AI Classification Scope

Based on abstract coverage:
- **{zotero_results['field_coverage']['abstract']['count']:,} items** can be reliably AI-classified (have abstracts)
- **{zotero_results['total_items'] - zotero_results['field_coverage']['abstract']['count']:,} items** will need title-only classification (lower confidence) or manual review

---

## Items Missing Abstracts (Sample)

The following items lack abstracts and may need manual attention or metadata enrichment:

| Item Key | Title | Type | Has DOI |
|----------|-------|------|---------|
"""
    
    # Show first 30 items missing abstracts
    for item in zotero_results['missing_abstract_items'][:30]:
        has_doi = "✓" if item['doi'] else "✗"
        title_short = item['title'][:60] + "..." if len(item['title']) > 60 else item['title']
        report += f"| {item['key']} | {title_short} | {item['item_type']} | {has_doi} |\n"
    
    if len(zotero_results['missing_abstract_items']) > 30:
        report += f"\n*... and {len(zotero_results['missing_abstract_items']) - 30:,} more items*\n"
    
    report += f"""

---

## Next Steps

1. **Run abstract enrichment** on items with DOIs but no abstracts
2. **Remove status markers** from tag field (Phase 1 cleanup)
3. **Export and backup** current tags, then reset (Phase 2)
4. **Run embedding clustering** to discover natural topic groups (Phase 3)
5. **Design new taxonomy** based on cluster analysis (Phase 4)
6. **Apply new tags** via AI classification (Phase 5)

---

*Report generated by zotero-metadata-audit.py*
"""
    
    return report


# =============================================================================
# MAIN EXECUTION
# =============================================================================

def main():
    """Run the complete metadata audit."""
    
    print("=" * 60)
    print("ZOTERO METADATA AUDIT")
    print("=" * 60)
    print()
    
    # Step 1: Connect to Zotero and fetch all items
    zot = connect_zotero()
    items = fetch_all_items(zot)
    
    # Step 2: Analyse Zotero metadata completeness
    zotero_results = analyse_metadata_completeness(items)
    print(f"  Analysed {zotero_results['total_items']} items")
    print(f"  Abstract coverage: {zotero_results['field_coverage']['abstract']['percent']}%")
    
    # Step 3: Analyse ChromaDB
    chromadb_results = analyse_chromadb()
    if 'error' not in chromadb_results:
        print(f"  ChromaDB embeddings: {chromadb_results['total_embeddings']}")
    
    # Step 4: Cross-reference
    cross_ref_results = cross_reference_zotero_chromadb(items, chromadb_results)
    if 'error' not in cross_ref_results:
        print(f"  Sync status: {cross_ref_results['sync_percent']}%")
    
    # Step 5: Generate report
    print()
    print("Generating report...")
    report = generate_report(zotero_results, chromadb_results, cross_ref_results)
    
    # Step 6: Save report
    os.makedirs(REPORT_DIR, exist_ok=True)
    report_filename = f"Zotero-Metadata-Audit-{datetime.now().strftime('%Y%m%d')}.md"
    report_path = os.path.join(REPORT_DIR, report_filename)
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"Report saved to: {report_path}")
    
    # Also save raw data as JSON for further analysis
    raw_data = {
        'zotero': zotero_results,
        'chromadb': {k: v for k, v in chromadb_results.items() if k != 'item_keys'},
        'cross_reference': {k: v for k, v in cross_ref_results.items() if k not in ['zotero_only_keys', 'chromadb_only_keys']},
    }
    
    json_path = os.path.join(REPORT_DIR, f"zotero-audit-data-{datetime.now().strftime('%Y%m%d')}.json")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(raw_data, f, indent=2, default=str)
    
    print(f"Raw data saved to: {json_path}")
    
    # Print summary to console
    print()
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total items:           {zotero_results['total_items']:,}")
    print(f"With abstracts:        {zotero_results['field_coverage']['abstract']['count']:,} ({zotero_results['field_coverage']['abstract']['percent']}%)")
    print(f"Missing abstracts:     {zotero_results['total_items'] - zotero_results['field_coverage']['abstract']['count']:,}")
    print(f"With DOI:              {zotero_results['field_coverage']['doi']['count']:,} ({zotero_results['field_coverage']['doi']['percent']}%)")
    print(f"Status marker items:   {zotero_results['tag_statistics']['status_marker_items']:,}")
    print(f"Unique tag combos:     {zotero_results['tag_statistics']['unique_tags']:,}")
    print()
    print(f"AI-classifiable:       {zotero_results['field_coverage']['abstract']['count']:,} items (have abstracts)")
    print(f"Need attention:        {zotero_results['total_items'] - zotero_results['field_coverage']['abstract']['count']:,} items (no abstracts)")
    print()


if __name__ == "__main__":
    main()
