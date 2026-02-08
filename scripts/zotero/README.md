# Zotero Scripts

Scripts that bridge Zotero with external services (Supabase, Semantic Scholar, etc.) for operations that Zotero plugins cannot handle natively.

## Strategy: Plugins First

Most metadata operations are handled by Zotero 8 plugins:

| Task | Plugin |
|------|--------|
| DOI enrichment, metadata fill | Linter for Zotero |
| Title case, journal standardization | Linter for Zotero |
| Date normalization (ISO 8601) | Linter for Zotero |
| Preprint to published conversion | Linter + arXiv Workflow |
| Citation counts + network | Zotero Cita |
| arXiv version updates | arXiv Workflow |
| AI collection assignment | Zotero AI Collection |

These 3 scripts handle what plugins cannot:

## Active Scripts

### zotero-enrich-abstracts.py
Fetches missing abstracts via DOI lookup using a waterfall of 3 APIs.

```bash
# Check what needs enrichment
python3 zotero-enrich-abstracts.py --report

# Preview changes without writing
python3 zotero-enrich-abstracts.py --dry-run --limit 20

# Run enrichment (writes to Zotero)
python3 zotero-enrich-abstracts.py --limit 100
```

**APIs:** Semantic Scholar (primary, 1.1s/item) > OpenAlex (secondary) > CrossRef (fallback)

### zotero-metadata-sync.py
Syncs Zotero library metadata into Supabase `research_papers` table.

```bash
# Check sync status
python3 zotero-metadata-sync.py status

# Sync all items
python3 zotero-metadata-sync.py sync --all

# Sync limited batch
python3 zotero-metadata-sync.py sync --limit 100
```

### zotero-to-supabase.py
Uploads Zotero PDFs to Supabase storage bucket for NotebookLM access.

```bash
# List available PDFs
python3 zotero-to-supabase.py list

# Upload all PDFs
python3 zotero-to-supabase.py upload --all
```

## Setup

```bash
cp .env.template .env
# Edit .env with your Zotero API credentials
pip install -r requirements.txt
```

## Archived Scripts

The `archive/` directory contains 12 retired scripts. These were replaced by Z8 plugins or were one-time migration utilities. See the archive for reference if needed.
