#!/bin/bash
# Zotero Daily Backup with Local + Google Drive redundancy
# Created: Jan 31, 2026
# Purpose: Prevent data loss regardless of cleanup approach

set -euo pipefail

LOCAL_BACKUP_DIR="$HOME/Zotero/backups"
GDRIVE_BACKUP_DIR="$HOME/Library/CloudStorage/GoogleDrive-cianos95@gmail.com/Zotero-Backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ZOTERO_DB="$HOME/Zotero/zotero.sqlite"

# Ensure directories exist
mkdir -p "$LOCAL_BACKUP_DIR"
mkdir -p "$GDRIVE_BACKUP_DIR"

# Check if Zotero is running (backup while running risks corruption)
if pgrep -x "Zotero" > /dev/null; then
    echo "$(date): Zotero is running - skipping backup to avoid corruption"
    exit 0
fi

# Check if database exists
if [[ ! -f "$ZOTERO_DB" ]]; then
    echo "$(date): ERROR - Zotero database not found at $ZOTERO_DB"
    exit 1
fi

BACKUP_FILE="zotero_backup_$TIMESTAMP.sqlite"

# Create local backup
echo "$(date): Creating local backup..."
cp "$ZOTERO_DB" "$LOCAL_BACKUP_DIR/$BACKUP_FILE"
echo "$(date): Local backup created: $LOCAL_BACKUP_DIR/$BACKUP_FILE"

# Verify backup integrity (basic size check)
ORIGINAL_SIZE=$(stat -f%z "$ZOTERO_DB")
BACKUP_SIZE=$(stat -f%z "$LOCAL_BACKUP_DIR/$BACKUP_FILE")

if [[ "$ORIGINAL_SIZE" -ne "$BACKUP_SIZE" ]]; then
    echo "$(date): WARNING - Backup size mismatch! Original: $ORIGINAL_SIZE, Backup: $BACKUP_SIZE"
    exit 1
fi

# Copy to Google Drive (offsite redundancy)
if [[ -d "$GDRIVE_BACKUP_DIR" ]]; then
    echo "$(date): Copying to Google Drive..."
    cp "$LOCAL_BACKUP_DIR/$BACKUP_FILE" "$GDRIVE_BACKUP_DIR/$BACKUP_FILE"
    echo "$(date): Google Drive backup created: $GDRIVE_BACKUP_DIR/$BACKUP_FILE"
else
    echo "$(date): WARNING - Google Drive directory not available, skipping offsite backup"
fi

# Retention: Keep last 7 local backups
echo "$(date): Cleaning old local backups (keeping last 7)..."
ls -t "$LOCAL_BACKUP_DIR"/zotero_backup_*.sqlite 2>/dev/null | tail -n +8 | xargs rm -f 2>/dev/null || true

# Retention: Keep last 14 Google Drive backups (2 weeks offsite)
if [[ -d "$GDRIVE_BACKUP_DIR" ]]; then
    echo "$(date): Cleaning old Google Drive backups (keeping last 14)..."
    ls -t "$GDRIVE_BACKUP_DIR"/zotero_backup_*.sqlite 2>/dev/null | tail -n +15 | xargs rm -f 2>/dev/null || true
fi

echo "$(date): Backup complete. Size: $BACKUP_SIZE bytes"
