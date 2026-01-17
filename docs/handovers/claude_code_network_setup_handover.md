# Claude Code Handover: Network Analysis Backend Setup

## Context

This task sets up the R environment and package infrastructure for network analysis capabilities within our monorepo. The setup supports two upcoming intensive courses (PsyNets Amsterdam 26-30 Jan 2026, UAB Barcelona 2-6 Feb 2026) and will form the backend for network analysis aspects of ongoing research projects, particularly the limerence research programme which uses multilevel network methodology across individual (L1), dyadic (L2), and population (L3) levels.

## Repository

**Monorepo:** https://github.com/cianos95-dev/alignment-comparato
**Connected services:** Vercel (deployment), Linear (project management)

## Objective

Create a reproducible R environment within the monorepo that supports psychological network analysis (cross-sectional GGMs, time-series VAR models, Bayesian approaches) and personal/egocentric network analysis (composition, structure, multilevel modelling, ERGMs). This infrastructure will be used by Claude Code for implementing network analyses as part of broader research workflows.

---

## Course Context (for understanding package selection)

### PsyNets Amsterdam (26-30 January 2026)
**Focus:** Psychological network psychometrics
**Key instructors:** Denny Borsboom (theory), Jill de Ron (cross-sectional, stability), Maarten Marsman & Nikola Sekulovski (Bayesian), Ria Hoekstra (time-series), Jonas Haslbeck (advanced estimation)

**Core topics:**
- Theoretical foundations of network analysis
- Estimating cross-sectional networks and model selection
- Network stability, comparison, and replicability (bootnet)
- Bayesian analysis of networks (BGGM, psychonetrics)
- Network estimation from time series data (graphicalVAR, mlVAR)
- Advanced network estimation techniques
- Pairwise Markov Random Fields and conditional dependence

### UAB Barcelona Personal Networks (2-6 February 2026)
**Focus:** Egocentric/personal network research
**Key instructors:** Chris McCarty, Raffaele Vacca (R analysis), Bernie Hogan (Network Canvas), Jürgen Lerner (RHEM/eventnet), Gabriel Hâncean (health interventions)

**Core topics:**
- Personal network theory and research design
- Name generators and name interpreters
- Personal network analysis with R (composition, structure)
- Multilevel modelling of ego-network data (lme4)
- Network Canvas for data collection
- Modelling alter nominations with RHEM (eventnet)
- Visualisation with visone

**Key resources:**
- Vacca's R book: https://raffaelevacca.github.io/egocentric-r-book/
- eventnet software: https://github.com/juergenlerner/eventnet
- Network Canvas: https://networkcanvas.com/
- REDES journal guidelines: https://revistes.uab.cat/redes/article/view/v37-n1-alieva-et-al/1122-pdf-en

---

## Directory Structure

Create the following structure within the monorepo:

```
alignment-comparato/
├── R/
│   ├── setup/
│   │   ├── network_courses_setup.R    # Main package installation script
│   │   ├── renv.lock                  # Lockfile (generated after setup)
│   │   └── .Rprofile                  # Project-level R settings
│   ├── network-analysis/
│   │   ├── psychological/             # PsyNets methods
│   │   │   ├── cross_sectional.R      # GGM estimation utilities
│   │   │   ├── time_series.R          # VAR/mlVAR utilities
│   │   │   └── bayesian.R             # Bayesian network utilities
│   │   ├── egocentric/                # UAB methods
│   │   │   ├── composition.R          # Ego-network composition measures
│   │   │   ├── structure.R            # Ego-network structure measures
│   │   │   └── multilevel.R           # Multilevel modelling utilities
│   │   └── visualisation/
│   │       └── network_plots.R        # qgraph, ggraph wrappers
│   └── limerence/                     # Project-specific implementations
│       ├── L1_individual.R            # Within-person dynamics
│       ├── L2_dyadic.R                # Relationship dynamics
│       └── L3_population.R            # Prevalence, risk factors
├── data/
│   └── network-analysis/
│       ├── raw/                       # Raw data inputs
│       ├── processed/                 # Cleaned data
│       └── outputs/                   # Analysis outputs
└── docs/
    └── network-analysis/
        └── README.md                  # Documentation
```

---

## Setup Script

Create `R/setup/network_courses_setup.R` with the following content:

```r
# Network Analysis Courses - R Package Setup
# Covers: UAB Barcelona Personal Networks (2-6 Feb 2026) + PsyNets Amsterdam (26-30 Jan 2026)
# Monorepo: https://github.com/cianos95-dev/alignment-comparato

# =============================================================================
# ENVIRONMENT SETUP
# =============================================================================

# Use renv for reproducibility
if (!requireNamespace("renv", quietly = TRUE)) {
  install.packages("renv")
}

# =============================================================================
# CORE PACKAGES
# =============================================================================

core_packages <- c(
  "tidyverse",
  "devtools",
  "remotes",
  "here"
)

# =============================================================================
# PSYNETS AMSTERDAM - Psychological Network Analysis
# =============================================================================

psynets_packages <- c(
  # Core network estimation and visualisation
  "qgraph",
  "bootnet",
  
  # Cross-sectional models
  "psychonetrics",
  "BGGM",
  "GGMnonreg",
  
  # Time-series/longitudinal models
  "graphicalVAR",
  "mlVAR",
  "gimme",
  
  # Additional tools
  "NetworkComparisonTest",
  "NetworkTools",
  "EGA",
  "lvnet"
)

# =============================================================================
# UAB BARCELONA - Personal Networks Course
# =============================================================================

uab_packages <- c(
  # Network data and measures

  "igraph",
  "egor",
  "tidygraph",
  "ggraph",
  "intergraph",
  
  # Statnet suite
  "statnet",
  "ergm.ego",
  
  # Descriptive statistics
  "janitor",
  "skimr",
  
  # Multilevel modelling
  "lme4",
  "broom.mixed",
  "car",
  "ggeffects"
)

# =============================================================================
# INSTALLATION
# =============================================================================

install_packages <- function(packages) {
  for (pkg in packages) {
    if (!requireNamespace(pkg, quietly = TRUE)) {
      message(paste("Installing:", pkg))
      tryCatch(
        install.packages(pkg, dependencies = TRUE),
        error = function(e) message(paste("Failed:", pkg))
      )
    } else {
      message(paste("OK:", pkg))
    }
  }
}

message("\n=== Core ===")
install_packages(core_packages)

message("\n=== PsyNets ===")
install_packages(psynets_packages)

message("\n=== UAB ===")
install_packages(uab_packages)

# =============================================================================
# VERIFICATION
# =============================================================================

all_packages <- c(core_packages, psynets_packages, uab_packages)
installed <- sapply(all_packages, requireNamespace, quietly = TRUE)
missing <- all_packages[!installed]

if (length(missing) == 0) {
  message("\n✓ All packages installed")
} else {
  message("\n✗ Missing: ", paste(missing, collapse = ", "))
}

# Snapshot for reproducibility
# renv::snapshot()
```

---

## Tasks

1. **Clone/access the repository** and navigate to the project root

2. **Create directory structure** as specified above

3. **Create the setup script** at `R/setup/network_courses_setup.R`

4. **Initialise renv** for the R subdirectory:
   ```r
   setwd("R")
   renv::init()
   ```

5. **Run the setup script** and verify all packages install correctly

6. **Generate lockfile** with `renv::snapshot()` for reproducibility

7. **Create placeholder files** for the network-analysis subdirectories with appropriate headers and TODO comments indicating their purpose

8. **Create documentation** at `docs/network-analysis/README.md` explaining:
   - Purpose of the network analysis infrastructure
   - Package categories and their use cases
   - How to run the setup
   - Links to course materials and references

9. **Verify Vercel compatibility** - ensure the R directory doesn't interfere with existing deployment (R code is backend/analysis only, not deployed)

10. **Create Linear issues** (if Linear MCP available) for:
    - "Network Analysis: Package environment setup complete"
    - "Network Analysis: Post-PsyNets implementation tasks"
    - "Network Analysis: Post-UAB implementation tasks"
    - "Limerence Research: Integrate network methods"

---

## Key References for Implementation

When implementing network analysis functions, reference these resources:

**Psychological networks:**
- bootnet tutorial: https://reisrgabriel.com/blog/2021-09-27-bootnet/
- Psychosystems packages: https://psych-networks.com/r-packages/
- psychonetrics documentation: http://psychonetrics.org/

**Personal networks:**
- Vacca's R book: https://raffaelevacca.github.io/egocentric-r-book/
- egor package: https://github.com/tilltnet/egor
- ergm.ego tutorial: https://statnet.org/workshop-ergm-ego/ergm.ego_tutorial.html

**eventnet/RHEM:**
- Repository: https://github.com/juergenlerner/eventnet
- Tutorial: https://github.com/juergenlerner/eventnet/wiki/RHEM-first-steps-(tutorial)

---

## Notes

- The user will focus on learning theory during the courses; Claude Code handles implementation
- All R work is backend analysis, not deployed to Vercel
- Linear tracks project management across this and other workstreams
- The limerence research uses multilevel methodology (L1/L2/L3) that maps to both course curricula
- Prioritise reproducibility (renv) and clear documentation
- eventnet may require Java; note this dependency if encountered

---

## Success Criteria

- All specified packages install without errors
- renv lockfile generated for reproducibility
- Directory structure created and documented
- README provides clear onboarding for future Claude Code sessions
- No interference with existing Vercel deployment
- Linear issues created for tracking (if available)
