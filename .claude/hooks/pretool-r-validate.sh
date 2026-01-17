#!/bin/bash
# Pre-tool validation hook for R files
# Checks for common issues before R file modifications

FILE_PATH="$1"

# Only process R files
if [[ ! "$FILE_PATH" =~ \.(R|r|Rmd|rmd)$ ]]; then
    exit 0
fi

# Check if file exists (skip for new files)
if [[ ! -f "$FILE_PATH" ]]; then
    exit 0
fi

WARNINGS=""

# Check for stochastic operations without set.seed()
if grep -qE "(sample|rnorm|runif|rbinom|rpois|boot|bootstrap)" "$FILE_PATH"; then
    if ! grep -q "set.seed" "$FILE_PATH"; then
        WARNINGS="${WARNINGS}Warning: File contains stochastic operations but no set.seed() for reproducibility\n"
    fi
fi

# Check for hardcoded paths (should use here::here())
if grep -qE '(setwd|"C:|"~\/|"/Users|"/home)' "$FILE_PATH"; then
    WARNINGS="${WARNINGS}Warning: Hardcoded paths detected - consider using here::here()\n"
fi

# Check for common package conflicts (igraph vs statnet)
if grep -q "library(igraph)" "$FILE_PATH" && grep -qE "library\((sna|network|statnet)\)" "$FILE_PATH"; then
    WARNINGS="${WARNINGS}Warning: Both igraph and statnet packages loaded - watch for function conflicts (degree, betweenness, etc.)\n"
fi

# Output warnings if any
if [[ -n "$WARNINGS" ]]; then
    echo -e "$WARNINGS"
fi

exit 0
