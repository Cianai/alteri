# R Network Analysis

R-based analysis package for multilevel network methodology, supporting the limerence research programme.

## Purpose

This package contains R scripts and renv environment for statistical network analysis. Claude Code executes analysis; you manage via Linear and focus on theoretical interpretation.

## Setup

```bash
# From this directory
Rscript -e "renv::restore()"
```

## Claude Code Integration (Full Execution)

Claude Code has full access to this R environment via MCP servers. Four modes available:

### Mode 1: Autonomous Network Analysis (r-network, NEW)
Claude executes network functions directly without human session:
```
Claude Code → r-network MCP → mcp-server.R → bootnet/qgraph/psychonetrics
```
**Use for:** Automated analysis, batch processing, autonomous development.

**Available tools:**
- `estimate_network` - Estimate psychological network (EBICglasso, pcor, ggmModSelect)
- `check_stability` - Bootstrap stability analysis (CS-coefficient)
- `plot_network` - Generate qgraph visualisation (PNG output)
- `compare_networks` - Network Comparison Test between groups

**When to use autonomous mode:**
- Running predefined analyses
- Batch processing multiple datasets
- CI/CD pipeline integration
- When human review not needed

### Mode 2: Documentation Lookup (r-btw, isolated)
Spawns fresh R process for documentation queries:
```
Claude Code → r-btw MCP → btw::btw_mcp_server() → R docs
```
Use for: Package help, vignettes, function signatures. Always available.

### Mode 3: Live Session Bridge (r-session, connected)
Connects to your running Positron session via mcptools session discovery:
```
Positron → mcptools::mcp_session() → [registered]
Claude Code → r-session MCP → list_r_sessions() → select_r_session() → YOUR session
```

**Setup workflow:**
1. Open this folder in Positron (`.Rprofile` auto-registers session)
2. In Claude Code, use `r-session` MCP tools:
   - `list_r_sessions()` - shows available R sessions (by working dir, IDE type)
   - `select_r_session()` - connect to your Positron session
3. All subsequent R tools now execute in your live session

**What Claude can do in session mode:**
- Inspect variables and dataframes in your environment
- Execute R code in your running session
- See results of your interactive work
- Access loaded data without re-loading

### Mode 4: Positron Assistant (Inline)
Native Positron AI with direct session access (no MCP required):
```
Positron Assistant → Native R session access → Inline completions + chat
```
Use for: Quick exploratory analysis, inline completions, rapid iteration.

## Workflow Mode Selection

| Mode | MCP | Use Case | Human-in-Loop |
|------|-----|----------|---------------|
| **Autonomous** | r-network | Predefined analyses, batch processing | No |
| **Pair Programming** | r-session | Interactive exploration, debugging | Yes |
| **Documentation** | r-btw | Package help, vignettes | No |
| **Inline** | None (Positron) | Quick completions, chat | Yes |

**Decision heuristic:**
- Known analysis on known data → **r-network** (autonomous)
- Exploratory analysis, debugging → **r-session** (pair programming)
- Need package documentation → **r-btw**
- Quick inline questions → **Positron Assistant**

## Hybrid Pair Programming Workflow

Use both Claude Code and Positron Assistant together:

| Tool | Best For | R Session Access |
|------|----------|------------------|
| **Claude Code (r-network)** | Automated network analysis, batch runs | Isolated (own process) |
| **Positron Assistant** | Quick questions, inline completions, exploratory analysis | Native (always connected) |
| **Claude Code (r-session)** | Multi-file changes, documentation, testing, planning | Via session discovery |
| **Claude Code (r-btw)** | Documentation lookup when session not needed | Isolated process |

**Role Division:**
- r-network: "Run stability analysis on this dataset" "Compare networks between groups"
- Positron Assistant: "What does this error mean?" "Complete this dplyr chain"
- Claude Code: "Refactor analysis across 3 scripts" "Write tests for this function"

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
- `btw` - MCP server for R documentation, environment, and code execution
- `mcptools` - MCP protocol infrastructure (session registration)
- `ellmer` - Tidyverse LLM interface with tool registration
- `targets` - Pipeline orchestration for reproducible workflows
- `here` - Path management (no hardcoded paths)

### Shiny Network Elicitation (replacing Qualtrics/Network Canvas)
- `visNetwork` - Interactive network visualisation for elicitation
- `shinyvalidate` - Input validation for survey forms
- `reactable` - Interactive tables for name interpreters

## MCP Server Configuration

Two MCP servers configured in project `.mcp.json`:

### r-btw (Isolated Process)
```bash
Rscript -e "btw::btw_mcp_server()"
```
Spawns fresh R process each call. Use for documentation lookup.

### r-session (Session Discovery)
```bash
Rscript -e "mcptools::mcp_server(btw::btw_tools())"
```
Includes session discovery tools. Use for live session connection.

| Tool Group | Capabilities |
|------------|--------------|
| `docs` | Query R package documentation, vignettes, help pages |
| `env` | Inspect variables, dataframes, environment state |
| `files` | Code search, file operations within project |
| `run` | Execute R code and see results |
| `pkg` | Package development (document, check, test, coverage) |
| `list_r_sessions` | Discover available R sessions (mcptools) |
| `select_r_session` | Connect to a discovered session (mcptools) |

### PSYNETS Workflow (26-30 Jan 2026)

**Session Strategy:** Continue in this Claude Code session for all 5 days. The course builds conceptually, and context carries over (e.g., Day 2's stability analysis informs Day 3's Bayesian approach).

**Theory Support (During Lectures):**
1. Ask Claude Code to explain concepts as they arise
2. Reference: "Explain [concept] from the Day X lecture"
3. Claude has access to course booklet context and prepared scripts

**Practical Support (During Tutorials):**
1. Open `packages/r-analysis/` in Positron
2. Load day script: `source(here("scripts/psynets/dayX_topic.R"))`
3. Run code blocks interactively in Positron
4. Ask Claude Code to interpret outputs or debug errors
5. Positron Assistant handles quick inline questions

**Available Scripts:**
| Day | Script | Topics |
|-----|--------|--------|
| 1 | `data/psynets/Practical 1 Cian.R` | Causal discovery, PC/FCI algorithms |
| 2 | `scripts/psynets/day2_cross_sectional.R` | EBICglasso, bootnet, NCT |
| 3 | `scripts/psynets/day3_bayesian.R` | easybgm, Bayes factors, priors |
| 4 | `scripts/psynets/day4_time_series.R` | GVAR, mlVAR, psychonetrics |
| 5 | `scripts/psynets/day5_advanced.R` | mgm, moderated networks |

**Data Symlinks:**
- `data/psynets/day3-morning-data.rds` → Bayesian MRF exercise
- `data/psynets/day3-afternoon-data.rds` → Structure priors exercise
- `data/psynets/day4-panel-data.RData` → Panel VAR exercise

### UAB Barcelona Workflow (2-6 Feb 2026)

**Setup:** Run `source(here::here("scripts/uab/00_uab_setup.R"))` to verify environment.

**Available Scripts:**
| Day | Script | Topics |
|-----|--------|--------|
| Wed 4th | `data/uab/workshop-scripts/04_Composition.R` | Network composition measures |
| Wed 4th | `data/uab/workshop-scripts/05_Structure.R` | Structural network measures |
| Thu 5th | `data/uab/workshop-scripts/06_Multilevel.R` | Multilevel modeling |
| Thu 5th | `data/uab/workshop-scripts/07_egor.R` | egor package workflows |

**Data Symlinks:**
- `data/uab/workshop-data/data.rda` → Main dataset (102 Sri Lankan immigrants, 45-alter networks)
- `data/uab/workshop-data/codebook.xlsx` → Variable documentation
- `data/uab/workshop-data/raw_data/` → CSV source files
- `data/uab/workshop-scripts/` → Course R scripts (chapters 2-8)

**Role Division:**
- **You:** Theoretical interpretation, domain knowledge, research questions
- **Claude Code:** Code execution, debugging, syntax, package help
- **Positron Assistant:** Quick inline completions, exploratory analysis

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
├── scripts/
│   ├── 00_setup.R     # Environment verification
│   ├── 01_data_prep.R # Data import and cleaning
│   └── psynets/       # PSYNETS course scripts
│       ├── day2_cross_sectional.R
│       ├── day3_bayesian.R
│       ├── day4_time_series.R
│       └── day5_advanced.R
├── data/
│   └── psynets/       # Course data (symlinks to Obsidian vault)
│       ├── day1-graph.txt
│       ├── day1-helpers.R
│       ├── day3-morning-data.rds
│       ├── day3-afternoon-data.rds
│       └── day4-panel-data.RData
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
7. Store API keys or credentials as R variables (MCP exposes environment)
