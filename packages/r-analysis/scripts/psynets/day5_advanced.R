# PSYNETS Day 5: Advanced Network Estimation
# Instructor: Jonas Haslbeck
# Topics: Mixed Graphical Models, Moderated Networks
# Date: 2026-01-30

# ═══════════════════════════════════════════════════════════════
# Setup
# ═══════════════════════════════════════════════════════════════

library(here)
set.seed(2026)

# Core packages for Day 5
library(mgm)        # Mixed graphical models, moderated networks
library(qgraph)     # Network visualisation
library(bootnet)    # Additional estimation options

cat("═══════════════════════════════════════════════════════════════\n")
cat("  PSYNETS Day 5: Advanced Network Estimation\n")
cat("  Packages loaded successfully\n")
cat("═══════════════════════════════════════════════════════════════\n\n")

# Note: Day 5 materials may be incomplete at course start
# This script provides a template based on the course booklet

# ═══════════════════════════════════════════════════════════════
# Morning Session: Mixed Graphical Models (mgm)
# ═══════════════════════════════════════════════════════════════

cat("Morning session: Mixed Graphical Models\n")
cat("- Combining continuous, categorical, and count variables\n")
cat("- mgm package for heterogeneous data types\n\n")

# --- Example: Mixed variable types ---

# Generate example mixed data
n <- 200
mixed_data <- data.frame(
  continuous1 = rnorm(n),
  continuous2 = rnorm(n),
  binary = sample(0:1, n, replace = TRUE),
  categorical = sample(1:3, n, replace = TRUE),
  count = rpois(n, lambda = 2)
)

# Specify variable types and levels
# type: "g" = Gaussian, "c" = categorical, "p" = Poisson
# level: number of categories (1 for continuous/count)

cat("Fitting mixed graphical model...\n")
mgm_fit <- mgm(data = mixed_data,
               type = c("g", "g", "c", "c", "p"),
               level = c(1, 1, 2, 3, 1),
               lambdaSel = "EBIC",
               lambdaGam = 0.25)

# Visualise
qgraph(mgm_fit$pairwise$wadj,
       layout = "spring",
       edge.color = mgm_fit$pairwise$edgecolor,
       title = "Mixed Graphical Model")

# ═══════════════════════════════════════════════════════════════
# Afternoon Session: Moderated Networks
# ═══════════════════════════════════════════════════════════════

cat("\n───────────────────────────────────────────────────────────────\n")
cat("Afternoon: Moderated Network Models (MNM)\n")
cat("───────────────────────────────────────────────────────────────\n\n")

cat("- Edge weights depend on moderator variable\n")
cat("- Example: Does the anxiety-depression edge vary with age?\n\n")

# --- Moderated Network Model ---

# Example with age as moderator
continuous_data <- data.frame(
  anxiety = rnorm(n),
  depression = rnorm(n),
  stress = rnorm(n),
  age = sample(18:65, n, replace = TRUE)  # Moderator
)

cat("Fitting moderated network model...\n")
# mgm with moderator
# mvar_fit <- mgm(data = continuous_data,
#                 type = rep("g", 4),
#                 level = rep(1, 4),
#                 moderators = 4,  # age as moderator
#                 lambdaSel = "CV")

# Conditional networks at different moderator values
# qgraph(predict(mvar_fit, moderator_value = 25), title = "Network at age 25")
# qgraph(predict(mvar_fit, moderator_value = 55), title = "Network at age 55")

# ═══════════════════════════════════════════════════════════════
# Q&A Session
# ═══════════════════════════════════════════════════════════════

cat("\n───────────────────────────────────────────────────────────────\n")
cat("Key Questions for Q&A:\n")
cat("───────────────────────────────────────────────────────────────\n\n")

cat("1. When to use regularised vs non-regularised estimation?\n")
cat("   - Regularised (EBICglasso): n < 500 or p large\n")
cat("   - Non-regularised (ggmModSelect): n > 500, moderate p\n\n")

cat("2. How to handle non-stationarity in time series?\n")
cat("   - Time-varying models (tvmvar)\n")
cat("   - Windowed analysis\n")
cat("   - Change point detection\n\n")

cat("3. Group vs individual networks?\n")
cat("   - INIT test for individual invariance\n")
cat("   - mlVAR for individual + group effects\n")
cat("   - Consider heterogeneity before pooling\n\n")

cat("\n═══════════════════════════════════════════════════════════════\n")
cat("  Day 5 script complete. Key concepts:\n")
cat("  - mgm: Mixed graphical models for heterogeneous data\n")
cat("  - MNM: Moderated networks (edge weights depend on moderator)\n")
cat("  - Consider data type, sample size, stationarity, heterogeneity\n")
cat("═══════════════════════════════════════════════════════════════\n")
