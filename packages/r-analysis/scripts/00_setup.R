# 00_setup.R - Environment Setup and Verification
# Run this script to initialise renv and install all required packages
# Usage: source("scripts/00_setup.R")

cat("═══════════════════════════════════════════════════════════════\n")
cat("  Network Analysis Environment Setup\n")
cat("  Alignment Comparator Monorepo\n")
cat("═══════════════════════════════════════════════════════════════\n\n")

# Check R version
r_version <- paste0(R.version$major, ".", R.version$minor)
cat("R version:", r_version, "\n")
if (as.numeric(R.version$major) < 4 || 
    (as.numeric(R.version$major) == 4 && as.numeric(gsub("\\..*", "", R.version$minor)) < 4)) {
  warning("R 4.4+ recommended for full compatibility")
}

# Initialise renv if not already done
if (!file.exists("renv.lock")) {
  cat("\nInitialising renv for reproducible environment...\n")
  if (!requireNamespace("renv", quietly = TRUE)) {
    install.packages("renv")
  }
  renv::init(bare = TRUE)
}

# Define package lists by category
packages <- list(
  # Network Analysis Core
  network_core = c(
    "igraph",       # Graph manipulation and analysis
    "network",      # Network objects (statnet foundation)
    "sna",          # Social network analysis metrics
    "statnet",      # Statistical network analysis suite
    "ergm",         # Exponential random graph models
    "RSiena"        # Stochastic actor-oriented models
  ),

  # Multilevel and Intensive Longitudinal
  multilevel = c(
    "lme4",         # Multilevel/mixed-effects models
    "mlVAR",        # Multilevel VAR for ESM/diary data
    "graphicalVAR", # Gaussian graphical models
    "psychonetrics",# Network psychometrics
    "lavaan"        # Structural equation modelling
  ),

  # Visualisation
  viz = c(
    "tidygraph",    # Tidy network manipulation
    "ggraph",       # ggplot2 for networks
    "qgraph"        # Quick network visualisation
  ),

  # Data wrangling
  data = c(
    "tidyverse",    # Core data manipulation
    "janitor",      # Data cleaning
    "haven",        # SPSS/Stata import
    "skimr"         # Data summaries
  ),

  # MCP server (optional but recommended)
  mcp = c(
    "mcptools"      # Posit MCP server for Claude Code
  ),

  # PsyNets Amsterdam (26-30 Jan 2026)
  # Psychological network psychometrics course
  psynets = c(
    "bootnet",              # Network stability and comparison
    "BGGM",                 # Bayesian Gaussian Graphical Models
    "gimme",                # Group Iterative Multiple Model Estimation
    "NetworkComparisonTest",# Statistical network comparison
    "networktools",         # Network analysis utilities (lowercase on CRAN)
    "EGAnet",               # Exploratory Graph Analysis (CRAN name)
    "lvnet",                # Latent variable network models
    # Day 1: Causal discovery
    "pcalg",                # PC algorithm for causal discovery
    "corpcor",              # Partial correlations
    # Day 2: Cross-sectional networks
    "psych",                # Psychometrics, BFI data
    "IsingSampler",         # Ising model sampling
    # Day 3: Bayesian analysis
    "easybgm",              # Easy Bayesian Graphical Models
    # Day 4: Time series
    "patchwork"             # Plot composition
    # Note: GGMnonreg archived due to missing dependencies (GGMncv)
    # Use BGGM for Bayesian non-regularised estimation instead
    # Note: INIT from GitHub installed separately
  ),

  # UAB Barcelona Personal Networks (2-6 Feb 2026)
  # Egocentric/personal network research course
  uab = c(
    "egor",         # Egocentric network analysis
    "intergraph",   # Network object conversion (igraph <-> network)
    "ergm.ego",     # ERGMs for egocentric data
    "broom.mixed",  # Tidy mixed model outputs
    "car",          # Companion to Applied Regression
    "ggeffects"     # Marginal effects visualisation
  ),

  # Agentic Development Infrastructure (2026 best practices)
  # Per Perplexity research report on agentic coding in R
  agentic = c(
    "btw",          # MCP server for R documentation retrieval
    "targets",      # Pipeline orchestration for reproducible workflows
    "here",         # Path management (no hardcoded paths)
    "ellmer"        # Tidyverse LLM interface with tool registration
    # Note: quarto installed separately via CLI, not CRAN
  ),

  # Shiny Network Elicitation (R-based analysis support)
  # Note: Primary UI is Next.js with SurveyJS (see apps/web/)
  # These packages support R-side visualization and data import
  shiny_elicitation = c(
    "visNetwork",     # Interactive network visualization (R reports)
    "shinyvalidate",  # Input validation for any Shiny dashboards
    "reactable"       # Interactive tables for results display
    # Note: shinysurveys archived from CRAN Jun 2025 - removed
    # Note: surveydown requires quarto - install separately if needed
  )
)


# Installation function
install_if_missing <- function(pkg_list, category_name) {
  cat("\n", category_name, "packages:\n", sep = "")
  for (pkg in pkg_list) {
    if (!requireNamespace(pkg, quietly = TRUE)) {
      cat("  Installing", pkg, "...\n")
      tryCatch({
        install.packages(pkg)
        cat("  ✓", pkg, "installed\n")
      }, error = function(e) {
        cat("  ✗", pkg, "FAILED:", conditionMessage(e), "\n")
      })
    } else {
      cat("  ✓", pkg, "(already installed)\n")
    }
  }
}

# Install all packages
cat("\n───────────────────────────────────────────────────────────────\n")
cat("Installing packages...\n")

install_if_missing(packages$data, "Data Wrangling")
install_if_missing(packages$network_core, "Network Analysis Core")
install_if_missing(packages$multilevel, "Multilevel/Longitudinal")
install_if_missing(packages$viz, "Visualisation")

cat("\n───────────────────────────────────────────────────────────────\n")
cat("PsyNets Amsterdam (26-30 Jan 2026)\n")
install_if_missing(packages$psynets, "Psychological Network Psychometrics")

cat("\n───────────────────────────────────────────────────────────────\n")
cat("UAB Barcelona (2-6 Feb 2026)\n")
install_if_missing(packages$uab, "Personal/Egocentric Networks")

cat("\n───────────────────────────────────────────────────────────────\n")
cat("Optional: MCP server for Claude Code integration\n")
install_if_missing(packages$mcp, "MCP Tools")

cat("\n───────────────────────────────────────────────────────────────\n")
cat("Agentic Development Infrastructure (2026 best practices)\n")
install_if_missing(packages$agentic, "Agentic R Development")

cat("\n───────────────────────────────────────────────────────────────\n")
cat("Shiny Network Elicitation (replacing Qualtrics/Network Canvas)\n")
install_if_missing(packages$shiny_elicitation, "Shiny Elicitation Tools")

# Install Bioconductor packages (pcalg dependencies)
cat("\n───────────────────────────────────────────────────────────────\n")
cat("Bioconductor packages (for pcalg causal discovery)\n")
bioc_pkgs <- c("graph", "RBGL")
for (pkg in bioc_pkgs) {
  if (!requireNamespace(pkg, quietly = TRUE)) {
    cat("  Installing", pkg, "from Bioconductor...\n")
    tryCatch({
      if (!requireNamespace("BiocManager", quietly = TRUE)) {
        install.packages("BiocManager")
      }
      BiocManager::install(pkg, ask = FALSE, update = FALSE)
      cat("  ✓", pkg, "installed\n")
    }, error = function(e) {
      cat("  ✗", pkg, "FAILED:", conditionMessage(e), "\n")
    })
  } else {
    cat("  ✓", pkg, "(already installed)\n")
  }
}

# Install GitHub packages (PSYNETS Day 4)
cat("\n───────────────────────────────────────────────────────────────\n")
cat("GitHub packages (PSYNETS Day 4: Individual Network Invariance Test)\n")
if (!requireNamespace("INIT", quietly = TRUE)) {
  cat("  Installing INIT from GitHub...\n")
  tryCatch({
    if (!requireNamespace("remotes", quietly = TRUE)) {
      install.packages("remotes")
    }
    remotes::install_github("RiaHoekstra/INIT", quiet = TRUE)
    cat("  ✓ INIT installed\n")
  }, error = function(e) {
    cat("  ✗ INIT FAILED:", conditionMessage(e), "\n")
  })
} else {
  cat("  ✓ INIT (already installed)\n")
}

# Snapshot the environment
cat("\n───────────────────────────────────────────────────────────────\n")
cat("Creating renv.lock snapshot...\n")
renv::snapshot(prompt = FALSE)

cat("\n═══════════════════════════════════════════════════════════════\n")
cat("  Setup complete!\n")
cat("  Run renv::restore() on other systems to replicate environment\n")
cat("═══════════════════════════════════════════════════════════════\n")
