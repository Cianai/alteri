---
description: Run R package checks and validation
allowed-tools: Bash(Rscript*), Bash(R*)
---

Run comprehensive R package checks for code quality and reproducibility.

## Usage

```
/r-check             # Run all checks
```

## Commands

```bash
cd packages/r-analysis

# Check renv synchronisation
Rscript -e "renv::status()"

# Lint R files
Rscript -e "lintr::lint_dir('scripts')"

# Check for common issues
Rscript -e "
  files <- list.files('scripts', pattern = '\\.R$', full.names = TRUE)
  for (f in files) {
    cat('Checking:', f, '\n')
    # Check for set.seed before stochastic ops
    content <- readLines(f, warn = FALSE)
    has_stochastic <- any(grepl('(sample|rnorm|boot)', content))
    has_seed <- any(grepl('set\\.seed', content))
    if (has_stochastic && !has_seed) {
      cat('  WARNING: Stochastic operations without set.seed()\n')
    }
    # Check for hardcoded paths
    if (any(grepl('setwd|\"C:|\"~/', content))) {
      cat('  WARNING: Hardcoded paths detected\n')
    }
  }
"

# Verify all packages load
Rscript -e "
  pkgs <- c('igraph', 'bootnet', 'qgraph', 'egor', 'mlVAR', 'targets', 'here')
  for (p in pkgs) {
    if (requireNamespace(p, quietly = TRUE)) {
      cat('✓', p, '\n')
    } else {
      cat('✗', p, 'NOT INSTALLED\n')
    }
  }
"
```

## Notes

- Run after modifying R scripts or updating packages
- Address any renv status warnings before committing
- Ensure all scripts have reproducible seeds
