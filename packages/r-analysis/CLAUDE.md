# R Network Analysis

R-based analysis package for multilevel network methodology, supporting the limerence research programme.

## Purpose

This package contains R scripts and renv environment for statistical network analysis. Claude Code executes analysis; you manage via Linear and focus on theoretical interpretation.

## Setup

```bash
# From this directory
Rscript -e "renv::restore()"
```

## MCP Server (Optional)

For interactive R sessions with Claude Code, install the Posit mcptools server:

```bash
# Add to Claude Code
claude mcp add -s "user" r-mcptools -- Rscript -e "mcptools::mcp_server()"
```

Then in any R session you want Claude to access:
```r
mcptools::mcp_session()
```

## Package Categories

### Network Analysis Core
- `igraph` - Graph manipulation and analysis
- `network` - Network objects (statnet foundation)
- `sna` - Social network analysis metrics
- `statnet` - Statistical network analysis suite
- `ergm` - Exponential random graph models
- `RSiena` - Stochastic actor-oriented models (longitudinal)

### Multilevel / Intensive Longitudinal
- `lme4` - Multilevel/mixed-effects models
- `mlVAR` - Multilevel VAR for ESM/diary data
- `graphicalVAR` - Gaussian graphical models from time series
- `psychonetrics` - Network psychometrics (GGM estimation)
- `lavaan` - Structural equation modelling

### Visualisation
- `tidygraph` - Tidy network manipulation
- `ggraph` - ggplot2 for networks
- `qgraph` - Quick network visualisation (psychometric networks)

### Data Wrangling
- `tidyverse` - Core data manipulation
- `janitor` - Data cleaning
- `haven` - SPSS/Stata import
- `skimr` - Data summaries

### PsyNets Amsterdam (26-30 Jan 2026)
Psychological network psychometrics course packages:
- `bootnet` - Network stability and comparison
- `BGGM` - Bayesian Gaussian Graphical Models
- `gimme` - Group Iterative Multiple Model Estimation
- `NetworkComparisonTest` - Statistical network comparison
- `networktools` - Network analysis utilities
- `EGAnet` - Exploratory Graph Analysis
- `lvnet` - Latent variable network models

### UAB Barcelona Personal Networks (2-6 Feb 2026)
Egocentric/personal network research course packages:
- `egor` - Egocentric network analysis
- `intergraph` - Network object conversion (igraph <-> network)
- `ergm.ego` - ERGMs for egocentric data
- `broom.mixed` - Tidy mixed model outputs
- `car` - Companion to Applied Regression
- `ggeffects` - Marginal effects visualisation

### Agentic Development Infrastructure (2026 best practices)
- `btw` - MCP server for R documentation retrieval
- `targets` - Pipeline orchestration for reproducible workflows
- `here` - Path management (no hardcoded paths)
- `ellmer` - Tidyverse LLM interface with tool registration

### Shiny Network Elicitation (replacing Qualtrics/Network Canvas)
- `visNetwork` - Interactive network visualisation for elicitation
- `shinyvalidate` - Input validation for survey forms
- `reactable` - Interactive tables for name interpreters

## MCP Server (btw)

The btw MCP server provides R documentation retrieval for Claude Code:

```bash
# Configured in .mcp.json - starts automatically with project
# Or run manually:
Rscript -e "btw::btw_mcp_server(tools = 'docs')"
```

## Slash Commands

| Command | Purpose |
|---------|---------|
| `/r-test` | Run testthat tests |
| `/r-check` | Validate renv sync, lint scripts |
| `/r-doc` | Render analysis reports |
| `/r-network` | Run network analysis with stability checks |

## Skills

The `r-multilevel-networks` skill provides domain expertise for:
- Psychological network analysis patterns
- Package conflict resolution (igraph vs statnet)
- Stability analysis thresholds (CS-coefficient)
- Reporting standards (Burger et al. 2022)
- Decision points requiring human judgment

## Pre-Hook Validation

R files are automatically checked before edits for:
- Missing `set.seed()` before stochastic operations
- Hardcoded paths (should use `here::here()`)
- igraph/statnet package conflicts

## Linear Integration

Analysis tasks tracked under project: Alignment Comparator (CIA-)
Related issues: CIA-44 (instrument battery), CIA-50 (limerence model)

## File Structure

```
r-analysis/
├── CLAUDE.md          # This file
├── renv.lock          # Locked package versions
├── renv/              # renv library cache
├── scripts/           # Analysis scripts
│   ├── 00_setup.R     # Environment verification
│   ├── 01_data_prep.R # Data import and cleaning
│   └── ...
└── outputs/           # Generated figures, tables
```

## Cross-System Compatibility

renv ensures identical package versions across your Mac Mini and any other system. After cloning:

1. Install R 4.4+ (currently using 4.5.2)
2. Run `renv::restore()` to install exact package versions
3. Run `source("scripts/00_setup.R")` to verify

## Decision Points (Require Human Judgment)

These statistical decisions cannot be automated. Flag for Linear review:

| Decision | Context | Guidance |
|----------|---------|----------|
| Node selection | Which variables to include | Boundary specification problem - theoretical justification required |
| Centrality interpretation | Betweenness/closeness | Often unsuitable per Bringmann 2019; prefer strength |
| EBIC gamma (γ) | 0, 0.25, or 0.5 | 0.5 default; 0 for discovery |
| Regularised vs non-regularised | EBICglasso vs ggmModSelect | n > 500, p < 50 → consider non-regularised |
| CS-coefficient threshold | 0.25 vs 0.5 | < 0.25 → do not interpret; ≥ 0.5 preferred |

## Do Not

1. Commit large data files (use .gitignore)
2. Manually install packages outside renv
3. Modify renv.lock without running `renv::snapshot()`
4. Interpret centrality without stability analysis
5. Use hardcoded paths - use `here::here()` instead
6. Mix igraph and statnet without explicit namespaces
