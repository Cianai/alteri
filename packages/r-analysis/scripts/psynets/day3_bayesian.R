# PSYNETS Day 3: Bayesian Analysis of Networks
# Instructor: Maarten Marsman, Nikola Sekulovski
# Topics: Bayesian GGM, Bayes Factors, Structure Priors
# Date: 2026-01-28

# ═══════════════════════════════════════════════════════════════
# Setup
# ═══════════════════════════════════════════════════════════════

library(here)
set.seed(2026)

# Core packages for Day 3
library(easybgm)    # Easy Bayesian Graphical Models (Ordinal MRF)
library(qgraph)     # Network visualisation
library(BGGM)       # Alternative: Bayesian GGM

cat("═══════════════════════════════════════════════════════════════\n")
cat("  PSYNETS Day 3: Bayesian Analysis of Networks\n")
cat("  Packages loaded successfully\n")
cat("═══════════════════════════════════════════════════════════════\n\n")

# ═══════════════════════════════════════════════════════════════
# Morning Session: Bayesian Ordinal MRF (easybgm)
# ═══════════════════════════════════════════════════════════════

# Load course data
data_path <- here("data", "psynets", "day3-morning-data.rds")
if (file.exists(data_path)) {
  dat <- readRDS(data_path)
  cat("Morning data loaded:", nrow(dat), "observations,", ncol(dat), "variables\n")
} else {
  cat("Note: Course data not yet available. Using example data.\n")
  # Fallback to bfi data
  library(psych)
  data(bfi)
  dat <- na.omit(bfi[, 1:10])  # First 10 items
}

# --- Assignment: Bayesian Reanalysis with easybgm ---

# Fit Bayesian Ordinal MRF
# Note: This is computationally intensive
cat("\nFitting Bayesian Ordinal MRF (this may take several minutes)...\n")

# Reduced iterations for exploration; use 10000+ for publication
fit_bgm <- easybgm(dat,
                   type = "ordinal",     # Ordinal data
                   iter = 1000,          # MCMC iterations (increase for publication)
                   save = TRUE)          # Save edge posterior samples

# Summary
summary(fit_bgm)

# Edge evidence categories based on inclusion Bayes factor
# BF > 10: Strong evidence for edge
# BF 3-10: Moderate evidence for edge
# BF 1/3 - 3: Inconclusive
# BF < 1/10: Strong evidence for no edge

# Visualise inclusion Bayes factors
plot(fit_bgm, type = "evidence")

# Network structure plot
plot(fit_bgm, type = "structure")

# ═══════════════════════════════════════════════════════════════
# Afternoon Session: Structure Priors & Clustering
# ═══════════════════════════════════════════════════════════════

# Load afternoon data
data_path_pm <- here("data", "psynets", "day3-afternoon-data.rds")
if (file.exists(data_path_pm)) {
  dat_pm <- readRDS(data_path_pm)
  cat("\nAfternoon data loaded:", nrow(dat_pm), "observations,", ncol(dat_pm), "variables\n")
}

# --- Prior Sensitivity Analysis ---

# Compare different edge prior settings
# edge_prior = 0.5 (default, uninformative)
# edge_prior = 0.25 (favours sparse networks)

cat("\nPrior sensitivity: Comparing edge_prior = 0.5 vs 0.25...\n")

# fit_sparse <- easybgm(dat, type = "ordinal", edge_prior = 0.25, iter = 1000)
# fit_default <- easybgm(dat, type = "ordinal", edge_prior = 0.5, iter = 1000)

# --- Alternative: BGGM package ---

cat("\n───────────────────────────────────────────────────────────────\n")
cat("Alternative: BGGM package for Bayesian GGM\n")
cat("───────────────────────────────────────────────────────────────\n\n")

# BGGM for continuous data
# fit_bggm <- estimate(dat, type = "continuous")
# summary(fit_bggm)
# select(fit_bggm)  # Edge selection based on credible intervals

cat("\n═══════════════════════════════════════════════════════════════\n")
cat("  Day 3 script complete. Key concepts:\n")
cat("  - Bayesian vs Frequentist: Prior + Likelihood → Posterior\n")
cat("  - Inclusion Bayes Factor: Evidence for/against edges\n")
cat("  - BF interpretation: >10 strong, 3-10 moderate, <1/3 against\n")
cat("  - easybgm: Ordinal MRF estimation\n")
cat("  - Prior sensitivity: Check robustness to prior choices\n")
cat("═══════════════════════════════════════════════════════════════\n")
