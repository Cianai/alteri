#!/usr/bin/env python3
"""
Zotero Corpus Clustering Analysis (Direct API Version)
=======================================================
Fetches all papers from Zotero via API, generates embeddings,
and runs unsupervised clustering to discover natural topic groupings.

Author: Claude (for Cian O'Sullivan)
Date: 11 January 2026
"""

import os
import sys
import json
import pickle
import numpy as np
from datetime import datetime
from collections import defaultdict, Counter
from pathlib import Path

# Zotero API
from pyzotero import zotero

# Embeddings
from sentence_transformers import SentenceTransformer

# Clustering
import hdbscan
from sklearn.preprocessing import normalize

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

OUTPUT_DIR = os.path.expanduser("~/Vaults/ObsidianVault/System/Research-Architecture")
CACHE_DIR = os.path.expanduser("~/.cache/zotero-clustering")

# Embedding model (same as zotero-mcp uses: all-MiniLM-L6-v2, 384 dimensions)
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# Clustering parameters
MIN_CLUSTER_SIZE = 25   # Minimum papers to form a cluster
MIN_SAMPLES = 10        # Core point density
SAMPLES_PER_CLUSTER = 12  # Sample papers to show per cluster

# =============================================================================
# DATA LOADING
# =============================================================================

def load_zotero_items(use_cache=True):
    """Fetch all items from Zotero library."""
    
    cache_file = os.path.join(CACHE_DIR, "zotero_items.pkl")
    os.makedirs(CACHE_DIR, exist_ok=True)
    
    # Check cache (valid for 1 hour)
    if use_cache and os.path.exists(cache_file):
        cache_age = datetime.now().timestamp() - os.path.getmtime(cache_file)
        if cache_age < 3600:  # 1 hour
            print(f"Loading {cache_file} from cache...")
            with open(cache_file, 'rb') as f:
                return pickle.load(f)
    
    print(f"Connecting to Zotero library {ZOTERO_LIBRARY_ID}...")
    zot = zotero.Zotero(ZOTERO_LIBRARY_ID, ZOTERO_LIBRARY_TYPE, ZOTERO_API_KEY)
    
    # Get all top-level items
    print("Fetching all items (this may take a few minutes)...")
    items = zot.everything(zot.top())
    
    print(f"Retrieved {len(items)} items")
    
    # Filter to items with titles and abstracts
    valid_items = []
    for item in items:
        data = item.get('data', {})
        item_type = data.get('itemType', '')
        
        # Skip attachments, notes, etc.
        if item_type in ['attachment', 'note', 'annotation']:
            continue
        
        title = data.get('title', '')
        abstract = data.get('abstractNote', '')
        
        if title:  # Must have at least a title
            valid_items.append({
                'key': item.get('key', ''),
                'title': title,
                'abstract': abstract,
                'item_type': item_type,
                'tags': [t.get('tag', '') for t in data.get('tags', [])],
                'creators': data.get('creators', []),
                'date': data.get('date', ''),
                'publication': data.get('publicationTitle', '') or data.get('proceedingsTitle', '') or data.get('bookTitle', ''),
                'doi': data.get('DOI', ''),
                'url': data.get('url', '')
            })
    
    print(f"Found {len(valid_items)} valid items (with titles)")
    
    # Cache results
    with open(cache_file, 'wb') as f:
        pickle.dump(valid_items, f)
    
    return valid_items


# =============================================================================
# EMBEDDING GENERATION
# =============================================================================

def generate_embeddings(items, use_cache=True):
    """Generate embeddings for all items using sentence-transformers."""
    
    cache_file = os.path.join(CACHE_DIR, "embeddings.npz")
    
    # Check cache
    if use_cache and os.path.exists(cache_file):
        cache_age = datetime.now().timestamp() - os.path.getmtime(cache_file)
        if cache_age < 3600:
            print(f"Loading embeddings from cache...")
            data = np.load(cache_file)
            return data['embeddings']
    
    print(f"Loading embedding model: {EMBEDDING_MODEL}...")
    model = SentenceTransformer(EMBEDDING_MODEL)
    
    # Create text for embedding: title + abstract
    print("Preparing texts for embedding...")
    texts = []
    for item in items:
        text = item['title']
        if item['abstract']:
            text += " " + item['abstract']
        texts.append(text)
    
    print(f"Generating embeddings for {len(texts)} items...")
    embeddings = model.encode(
        texts, 
        show_progress_bar=True,
        batch_size=64
    )
    
    print(f"Generated embeddings with shape {embeddings.shape}")
    
    # Cache
    np.savez(cache_file, embeddings=embeddings)
    
    return embeddings


# =============================================================================
# CLUSTERING
# =============================================================================

def run_clustering(embeddings):
    """Run HDBSCAN clustering on normalised embeddings."""
    
    print(f"\nNormalising embeddings...")
    embeddings_norm = normalize(embeddings)
    
    print(f"Running HDBSCAN clustering...")
    print(f"  min_cluster_size={MIN_CLUSTER_SIZE}")
    print(f"  min_samples={MIN_SAMPLES}")
    
    clusterer = hdbscan.HDBSCAN(
        min_cluster_size=MIN_CLUSTER_SIZE,
        min_samples=MIN_SAMPLES,
        metric='euclidean',
        cluster_selection_method='eom',
        prediction_data=True
    )
    
    cluster_labels = clusterer.fit_predict(embeddings_norm)
    probabilities = clusterer.probabilities_
    
    # Statistics
    n_clusters = len(set(cluster_labels)) - (1 if -1 in cluster_labels else 0)
    n_noise = list(cluster_labels).count(-1)
    
    print(f"  Found {n_clusters} clusters")
    print(f"  Noise points: {n_noise} ({n_noise/len(cluster_labels)*100:.1f}%)")
    
    return cluster_labels, probabilities


# =============================================================================
# ANALYSIS
# =============================================================================

def analyse_clusters(items, cluster_labels, probabilities):
    """Group items by cluster and analyse."""
    
    clusters = defaultdict(list)
    
    for idx, label in enumerate(cluster_labels):
        item = items[idx].copy()
        item['probability'] = probabilities[idx]
        item['cluster_idx'] = idx
        clusters[label].append(item)
    
    # Sort clusters by size (excluding noise)
    sorted_clusters = sorted(
        [(k, v) for k, v in clusters.items() if k != -1],
        key=lambda x: len(x[1]),
        reverse=True
    )
    
    # Add noise at end
    if -1 in clusters:
        sorted_clusters.append((-1, clusters[-1]))
    
    return sorted_clusters


def get_cluster_tag_profile(items):
    """Extract tag distribution for a cluster."""
    
    tag_counter = Counter()
    facet_counter = defaultdict(Counter)
    
    for item in items:
        for tag in item.get('tags', []):
            tag_counter[tag] += 1
            
            # Parse faceted tags
            if tag.startswith('#') and '/' in tag:
                parts = tag.split('/', 1)
                facet = parts[0]  # e.g., "#topic"
                value = parts[1]  # e.g., "depression"
                facet_counter[facet][value] += 1
    
    return tag_counter, facet_counter


# =============================================================================
# REPORT GENERATION
# =============================================================================

def generate_report(clusters, total_items):
    """Generate comprehensive markdown report."""
    
    n_clusters = len([c for c, _ in clusters if c != -1])
    noise_items = [items for c, items in clusters if c == -1]
    n_noise = len(noise_items[0]) if noise_items else 0
    
    report = []
    report.append("# Zotero Corpus Clustering Analysis")
    report.append(f"\n**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    report.append(f"**Total items analysed:** {total_items}")
    report.append(f"**Clusters discovered:** {n_clusters}")
    report.append(f"**Unclustered (noise):** {n_noise} ({n_noise/total_items*100:.1f}%)")
    report.append(f"**Clustering parameters:** min_cluster_size={MIN_CLUSTER_SIZE}, min_samples={MIN_SAMPLES}")
    
    report.append("\n---\n")
    report.append("## Executive Summary\n")
    report.append("This analysis uses unsupervised clustering on paper embeddings (title + abstract) to discover natural topic groupings in your Zotero library. Unlike your existing tag-based organisation, these clusters reflect semantic similarity in the actual content.\n")
    
    # Summary table
    report.append("## Cluster Overview\n")
    report.append("| # | Size | % | Dominant Existing Tags | Suggested Theme |")
    report.append("|---|------|---|------------------------|-----------------|")
    
    for cluster_id, items in clusters:
        if cluster_id == -1:
            continue
        
        size = len(items)
        pct = size / total_items * 100
        
        tag_counter, facet_counter = get_cluster_tag_profile(items)
        
        # Get top topic tags
        top_topics = facet_counter.get('#topic', Counter()).most_common(3)
        topics_str = ", ".join([f"{v}({c})" for v, c in top_topics]) if top_topics else "—"
        
        # Placeholder for theme (to be filled by human/Claude review)
        theme = "_[pending review]_"
        
        report.append(f"| {cluster_id} | {size} | {pct:.1f}% | {topics_str} | {theme} |")
    
    if n_noise > 0:
        report.append(f"| noise | {n_noise} | {n_noise/total_items*100:.1f}% | — | Unclustered |")
    
    report.append("\n---\n")
    report.append("## Detailed Cluster Profiles\n")
    
    # Detailed breakdown
    for cluster_id, items in clusters:
        if cluster_id == -1:
            report.append(f"### Noise (Unclustered): {len(items)} items\n")
            report.append("These items don't cluster strongly with any group. They may be:")
            report.append("- Unique or niche topics")
            report.append("- Items with poor/missing abstracts")
            report.append("- Genuinely miscellaneous\n")
        else:
            report.append(f"### Cluster {cluster_id}: {len(items)} items\n")
        
        # Tag profile
        tag_counter, facet_counter = get_cluster_tag_profile(items)
        
        if facet_counter:
            report.append("**Existing tag distribution:**\n")
            for facet in ['#topic', '#method', '#file', '#pop', '#theory']:
                if facet in facet_counter:
                    top_vals = facet_counter[facet].most_common(5)
                    vals_str = ", ".join([f"`{v}` ({c})" for v, c in top_vals])
                    report.append(f"- **{facet}/**: {vals_str}")
            report.append("")
        
        # Sample papers (highest probability = best fit)
        sorted_items = sorted(items, key=lambda x: x.get('probability', 0), reverse=True)
        samples = sorted_items[:SAMPLES_PER_CLUSTER]
        
        report.append(f"**Representative papers (top {len(samples)} by cluster fit):**\n")
        for i, item in enumerate(samples, 1):
            title = item['title']
            if len(title) > 90:
                title = title[:87] + "..."
            
            pub = item.get('publication', '')[:40] or "—"
            year = item.get('date', '')[:4] or "—"
            
            report.append(f"{i}. **{title}**")
            report.append(f"   _{pub}_ ({year})\n")
        
        report.append("---\n")
    
    # Recommendations section
    report.append("## Recommendations for Taxonomy Design\n")
    report.append("Based on this clustering analysis:\n")
    report.append("1. **Review each cluster** and assign a descriptive theme name")
    report.append("2. **Compare to existing tags** — do clusters align with your `#topic/` tags?")
    report.append("3. **Identify gaps** — clusters without clear existing tags need new categories")
    report.append("4. **Consider merging** — if multiple clusters map to one existing tag, the tag may be too broad")
    report.append("5. **Address noise** — unclustered items may need manual review or are genuinely diverse\n")
    
    return "\n".join(report)


# =============================================================================
# MAIN
# =============================================================================

def main():
    print("="*70)
    print("ZOTERO CORPUS CLUSTERING ANALYSIS")
    print("="*70)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Load data
    items = load_zotero_items(use_cache=True)
    
    if not items:
        print("ERROR: No items loaded")
        sys.exit(1)
    
    # Generate embeddings
    embeddings = generate_embeddings(items, use_cache=True)
    
    # Run clustering
    cluster_labels, probabilities = run_clustering(embeddings)
    
    # Analyse
    clusters = analyse_clusters(items, cluster_labels, probabilities)
    
    # Generate report
    report = generate_report(clusters, len(items))
    
    # Save report
    output_path = os.path.join(OUTPUT_DIR, "Zotero-Corpus-Clustering-Report.md")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w') as f:
        f.write(report)
    
    print(f"\n{'='*70}")
    print("COMPLETE")
    print(f"{'='*70}")
    print(f"Report saved to: {output_path}")
    
    # Print quick summary
    n_clusters = len([c for c, _ in clusters if c != -1])
    print(f"\nDiscovered {n_clusters} natural topic clusters")
    print("\nTop 10 clusters by size:")
    for cluster_id, items in clusters[:10]:
        if cluster_id == -1:
            continue
        print(f"  Cluster {cluster_id}: {len(items)} items")
        # Show a sample title
        sample = items[0]['title'][:60]
        print(f"    e.g., \"{sample}...\"")


if __name__ == "__main__":
    main()
