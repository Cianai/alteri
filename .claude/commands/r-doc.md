---
description: Generate R documentation and analysis reports
allowed-tools: Bash(Rscript*), Bash(R*), Bash(quarto*)
argument-hint: [report-name]
---

Generate R documentation, render analysis reports, and create package documentation.

## Usage

```
/r-doc               # List available reports
/r-doc network       # Render network analysis report
/r-doc all           # Render all reports
```

## Commands

```bash
cd packages/r-analysis

# List available Rmd/qmd files
find . -name "*.Rmd" -o -name "*.qmd" | head -20

# Render specific report (Rmarkdown)
Rscript -e "rmarkdown::render('reports/$ARGS.Rmd', output_dir = 'outputs')"

# Render specific report (Quarto)
quarto render "reports/$ARGS.qmd" --output-dir outputs

# Render all reports
Rscript -e "
  files <- list.files('reports', pattern = '\\.(Rmd|qmd)$', full.names = TRUE)
  for (f in files) {
    cat('Rendering:', f, '\n')
    if (grepl('\\.Rmd$', f)) {
      rmarkdown::render(f, output_dir = 'outputs')
    }
  }
"

# Generate roxygen documentation (if using R package structure)
Rscript -e "devtools::document()"
```

## Notes

- Reports should be in `packages/r-analysis/reports/`
- Output goes to `packages/r-analysis/outputs/`
- Use `targets::tar_make()` for pipeline-based reports
- Quarto requires CLI installation: `brew install quarto`
