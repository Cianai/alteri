# 00_uab_setup.R - UAB Barcelona Personal Networks Course Setup
# Run this script to verify environment is ready for the course
# Usage: source(here::here("scripts/uab/00_uab_setup.R"))

cat("═══════════════════════════════════════════════════════════════\n")
cat("  UAB Barcelona Personal Networks Course Setup\n")
cat("  Course: 2-6 February 2026\n")
cat("  Materials: https://raffaelevacca.github.io/egocentric-r-book/\n")
cat("═══════════════════════════════════════════════════════════════\n\n")

# Check R version
r_version <- paste0(R.version$major, ".", R.version$minor)
cat("R version:", r_version, "\n\n")

# Required packages for UAB course
uab_packages <- c(
  # Core egocentric network analysis
  "egor",         # Egocentric network analysis
  "intergraph",   # Network object conversion (igraph <-> network)
  "ergm.ego",     # ERGMs for egocentric data

  # Multilevel modeling
  "lme4",         # Mixed-effects models
  "broom.mixed",  # Tidy mixed model outputs
  "car",          # Companion to Applied Regression
  "ggeffects",    # Marginal effects visualisation

  # Network analysis core
  "igraph",       # Graph manipulation
  "tidygraph",    # Tidy network manipulation
  "ggraph",       # Network visualisation
  "statnet",      # Statistical network analysis

  # Data wrangling
  "tidyverse",    # Core data manipulation
  "janitor",      # Data cleaning
  "skimr"         # Data summaries
)

# Check and load packages
cat("───────────────────────────────────────────────────────────────\n")
cat("Checking required packages...\n\n")

missing_pkgs <- c()
for (pkg in uab_packages) {
  if (requireNamespace(pkg, quietly = TRUE)) {
    version <- as.character(packageVersion(pkg))
    cat("  ✓", pkg, "(", version, ")\n")
  } else {
    cat("  ✗", pkg, "- NOT INSTALLED\n")
    missing_pkgs <- c(missing_pkgs, pkg)
  }
}

if (length(missing_pkgs) > 0) {
  cat("\n⚠ Missing packages:", paste(missing_pkgs, collapse = ", "), "\n")
  cat("Run: renv::restore() to install missing packages\n")
} else {
  cat("\n✓ All required packages installed\n")
}

# Check data symlinks
cat("\n───────────────────────────────────────────────────────────────\n")
cat("Checking workshop data...\n\n")

data_path <- here::here("data/uab/workshop-data")
scripts_path <- here::here("data/uab/workshop-scripts")

if (dir.exists(data_path)) {
  data_files <- list.files(data_path, recursive = TRUE)
  cat("  ✓ Workshop data found:", length(data_files), "files\n")
  cat("    Key files:\n")
  if (file.exists(file.path(data_path, "data.rda"))) {
    cat("      ✓ data.rda (main dataset)\n")
  }
  if (file.exists(file.path(data_path, "codebook.xlsx"))) {
    cat("      ✓ codebook.xlsx (variable documentation)\n")
  }
  if (dir.exists(file.path(data_path, "raw_data"))) {
    cat("      ✓ raw_data/ (CSV source files)\n")
  }
} else {
  cat("  ✗ Workshop data NOT FOUND at:", data_path, "\n")
}

if (dir.exists(scripts_path)) {
  script_files <- list.files(scripts_path, pattern = "\\.R$")
  cat("  ✓ Workshop scripts found:", length(script_files), "R scripts\n")
} else {
  cat("  ✗ Workshop scripts NOT FOUND at:", scripts_path, "\n")
}

# Load main dataset
cat("\n───────────────────────────────────────────────────────────────\n")
cat("Loading workshop data...\n\n")

data_rda <- file.path(data_path, "data.rda")
if (file.exists(data_rda)) {
  load(data_rda)
  cat("  Loaded objects from data.rda:\n")
  # List objects that were loaded (common ones from the workshop)
  loaded_objects <- ls()
  for (obj in loaded_objects) {
    if (exists(obj) && !is.function(get(obj))) {
      obj_class <- class(get(obj))[1]
      if (is.data.frame(get(obj))) {
        obj_dims <- paste0(nrow(get(obj)), " x ", ncol(get(obj)))
        cat("    •", obj, "(", obj_class, ",", obj_dims, ")\n")
      } else if (is.list(get(obj))) {
        cat("    •", obj, "(", obj_class, ", length:", length(get(obj)), ")\n")
      }
    }
  }
}

# Check MCP session status
cat("\n───────────────────────────────────────────────────────────────\n")
cat("MCP Integration Status...\n\n")

if (interactive()) {
  if (requireNamespace("mcptools", quietly = TRUE)) {
    cat("  ✓ mcptools available\n")
    cat("  Session should be registered for Claude Code discovery\n")
    cat("  In Claude Code, use: ToolSearch 'r-session' then list_r_sessions()\n")
  } else {
    cat("  ✗ mcptools not available - Claude Code session discovery disabled\n")
  }
} else {
  cat("  (Non-interactive session - MCP registration skipped)\n")
}

cat("\n═══════════════════════════════════════════════════════════════\n")
cat("  Setup verification complete!\n")
cat("  \n")
cat("  Course schedule (R practicals):\n")
cat("    Wed 4th (10-14): Composition & Structure (Raffaele Vacca)\n")
cat("    Thu 5th (10-14): Multilevel modeling (Raffaele Vacca)\n")
cat("═══════════════════════════════════════════════════════════════\n")
