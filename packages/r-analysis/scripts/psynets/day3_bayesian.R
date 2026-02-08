# ══════════════════════════════════════════════════════════════════════════════
# PSYNETS Day 3: Bayesian Networks
# Complete Integrated Practical Guide
# ══════════════════════════════════════════════════════════════════════════════
#
# Instructors: Nikola Sekulovski & Maarten Marsman
# Date: 2026-01-28
#
# This script contains ALL content from the Day 3 group assignments AND
# the HTML tutorials, including:
#
#   PART 1: Bayesian Reanalysis (Morning) ........... easybgm, inclusion BF
#   PART 2: Group Differences (Afternoon I) ......... easybgm_compare, bgms
#   PART 3: Clustering with SBM (Afternoon II) ...... Stochastic Block Model
#
# Dataset: French Short Boredom Proneness Scale (SBPS) + CEI-II
#          N = 490, 18 ordinal items (7-point Likert)
#
# HOW TO USE:
# - Run section by section with Cmd+Enter (Mac) or Ctrl+Enter (Windows)
# - Theory explanations are embedded as comments - read them!
# - MCMC estimation is SLOW - be patient (minutes, not seconds)
# - Reduced iterations for exploration; increase for publication
# - No need to open the PDF files - everything is here
#
# KEY FUNCTIONS FROM TUTORIALS:
# - easybgm()           : Fit Bayesian ordinal MRF
# - easybgm_compare()   : Multi-group comparison
# - plot_network()      : Network visualisation
# - plot_edgeevidence() : Edge evidence (BF) plot
# - plot_parameterHDI() : HDI interval plot
# - clusterBayesfactor(): Test cluster hypotheses
#
# ══════════════════════════════════════════════════════════════════════════════


# ┌──────────────────────────────────────────────────────────────────────────────
# │ PART 0: SETUP
# └──────────────────────────────────────────────────────────────────────────────

library(here)
set.seed(2026)

# Core packages for Day 3
library(easybgm)    # Easy Bayesian Graphical Models (primary package)
library(bgms)       # Bayesian Graphical Model Selection (for multi-group & SBM)
library(qgraph)     # Network visualisation
library(pheatmap)   # Heatmaps for coclustering matrix

cat("══════════════════════════════════════════════════════════════════════════════\n")
cat("  PSYNETS Day 3: Bayesian Networks\n")
cat("  All packages loaded successfully\n")
cat("══════════════════════════════════════════════════════════════════════════════\n\n")


# ┌──────────────────────────────────────────────────────────────────────────────
# │ PART 1: BAYESIAN REANALYSIS
# │ Morning Session - Group Assignment 1
# │ Topic: Bayesian Ordinal MRF with easybgm
# │ Based on: Morning Tutorial.html
# └──────────────────────────────────────────────────────────────────────────────

cat("\n")
cat("┌──────────────────────────────────────────────────────────────────────────────\n")
cat("│ PART 1: BAYESIAN REANALYSIS\n")
cat("│ Topic: Bayesian Ordinal MRF, Inclusion Bayes Factors, Prior Sensitivity\n")
cat("└──────────────────────────────────────────────────────────────────────────────\n\n")

# ══════════════════════════════════════════════════════════════════════════════
# THEORY: Bayesian vs Frequentist Inference
# ══════════════════════════════════════════════════════════════════════════════
#
# FREQUENTIST approach (Day 2):
# - Estimate a single "best" network structure
# - Point estimates of edge weights
# - No explicit quantification of uncertainty in structure
# - Cannot distinguish "no evidence" from "evidence of absence"
#
# BAYESIAN approach (Day 3):
# - Posterior distribution over network structures
# - Explicitly quantifies uncertainty in BOTH parameters AND structure
# - Can distinguish:
#     * Evidence FOR an edge (strong positive BF)
#     * Evidence AGAINST an edge (strong negative BF)
#     * INCONCLUSIVE evidence (BF near 1)
#
# Core formula: Posterior ∝ Prior × Likelihood
#
# P(θ|data) ∝ P(θ) × P(data|θ)
#
# Where:
#   - P(θ|data) = posterior (what we want)
#   - P(θ) = prior (our beliefs before seeing data)
#   - P(data|θ) = likelihood (how probable is data given θ)
#
# ══════════════════════════════════════════════════════════════════════════════

# ══════════════════════════════════════════════════════════════════════════════
# THEORY: The Inclusion Bayes Factor
# ══════════════════════════════════════════════════════════════════════════════
#
# The INCLUSION BAYES FACTOR (BF_10) quantifies evidence for edge inclusion:
#
#   BF_10 = P(data | edge present) / P(data | edge absent)
#
# Or equivalently:
#
#   BF_10 = (Posterior odds of inclusion) / (Prior odds of inclusion)
#
# Interpretation:
#   - BF_10 > 10:   Strong evidence FOR edge inclusion
#   - BF_10 3-10:   Moderate evidence FOR inclusion
#   - BF_10 1-3:    Weak/anecdotal evidence FOR inclusion
#   - BF_10 1/3-1:  Weak evidence AGAINST inclusion
#   - BF_10 1/10-1/3: Moderate evidence AGAINST inclusion
#   - BF_10 < 1/10: Strong evidence AGAINST inclusion (evidence of ABSENCE)
#
# KEY INSIGHT: Values near 1 are INCONCLUSIVE - we don't have enough evidence
# to decide either way. This is fundamentally different from frequentist
# approaches where non-significance often gets (incorrectly) interpreted as
# evidence for no effect.
#
# ══════════════════════════════════════════════════════════════════════════════

# ══════════════════════════════════════════════════════════════════════════════
# THEORY: Why We Use easybgm
# ══════════════════════════════════════════════════════════════════════════════
#
# Rather than choosing between different packages (bgms, BGGM, BDgraph),
# easybgm provides a unified interface that wraps around the best parts.
#
# Depending on your data and choices, easybgm automatically uses:
#   - bgms for ordinal data (our case)
#   - BGGM for continuous data
#   - BDgraph for binary data
#
# Key function: easybgm(data, type, ...)
#   - type = "ordinal", "continuous", "binary", or "mixed"
#   - package = specify which backend to use
#
# ══════════════════════════════════════════════════════════════════════════════

# ══════════════════════════════════════════════════════════════════════════════
# THEORY: Ordinal Markov Random Field (OMRF)
# ══════════════════════════════════════════════════════════════════════════════
#
# The OMRF (Marsman et al., 2025) is designed for ORDINAL data:
#
# - Likert scales (1-7) are ordinal, not continuous
# - Standard GGM assumes continuous/Gaussian data
# - OMRF respects the ordinal nature of measurements
# - Each item is a node; edges encode conditional dependence
#
# Model structure:
# - Nodes: Individual questionnaire items
# - Edges: Conditional associations (controlling for all other items)
# - Parameters: Partial association strengths
#
# Bayesian Model Averaging:
# - Instead of selecting ONE network structure
# - We integrate over ALL possible structures weighted by posterior probability
# - Results reflect uncertainty about which edges exist
#
# ══════════════════════════════════════════════════════════════════════════════


# --- Load the French SBPS + CEI-II Dataset ---

cat("Loading French SBPS + CEI-II dataset...\n")
data_path <- here("data", "psynets", "day3-morning-data.rds")

if (file.exists(data_path)) {
  dat <- readRDS(data_path)
  cat("Dataset loaded:", nrow(dat), "observations,", ncol(dat), "variables\n\n")
} else {
  stop("Data file not found. Check symlink: ", data_path)
}

# ══════════════════════════════════════════════════════════════════════════════
# ASSIGNMENT CONTEXT: French Short Boredom Proneness Scale
# ══════════════════════════════════════════════════════════════════════════════
#
# Original study: Martarelli et al. (2022) validated the French SBPS using
# regularised frequentist network analysis. They found:
# - Positive associations between boredom and curiosity items
# - Negative associations between boredom and exploration items
#
# Our task: Reanalyse using Bayesian methods to:
# 1. Quantify evidence for/against each edge
# 2. Distinguish absence of evidence from evidence of absence
# 3. Assess sensitivity to prior assumptions
#
# Data structure:
# - N = 490 French-speaking participants
# - 8 items from SBPS (Short Boredom Proneness Scale)
# - 10 items from CEI-II (Curiosity and Exploration Inventory)
# - All items measured on 7-point Likert scale
#
# ══════════════════════════════════════════════════════════════════════════════

# Examine data structure
cat("── Data Structure ──\n")
cat("Variables:", ncol(dat), "\n")
cat("Observations:", nrow(dat), "\n")
cat("\nVariable names:\n")
print(names(dat))

# Check for ordinal nature
cat("\nResponse range (should be 1-7 Likert):\n")
print(sapply(dat, range, na.rm = TRUE))


# ── METHODS SECTION: Prior Distributions ──────────────────────────────────────
#
# STRUCTURE PRIORS:
# We use independent Bernoulli priors for edge inclusion.
# The inclusion_probability determines our prior belief about network density.
#
# For the primary analysis:
#   - inclusion_probability = 0.5 (neutral/uninformative)
#
# For sensitivity analysis:
#   - inclusion_probability = 0.1 (sparse prior)
#   - inclusion_probability = 0.7 (dense prior)
#
# PARAMETER PRIORS:
# Partial association parameters are assigned independent Cauchy priors
# with scale = 2.5 (weakly informative, allows for large effects)
#
# ──────────────────────────────────────────────────────────────────────────────


# ── FITTING THE MODEL ─────────────────────────────────────────────────────────

cat("\n── Fitting Bayesian Network (Primary Analysis) ──\n")
cat("Using easybgm() with type = 'continuous' and package = 'BGGM'\n")
cat("(Treating data as continuous for faster computation)\n")
cat("This will take several minutes. Please be patient...\n\n")

# Primary analysis - using continuous/BGGM for speed (as per tutorial)
# From Morning Tutorial.html lines 4061-4070
set.seed(1)
fit = easybgm(data = dat,
              type = "continuous",
              package = "BGGM",
              iter = 1e5,
              burnin = 1e4,
              save = TRUE,
              centrality = TRUE,
              progress = TRUE)

cat("\n── Model Summary ──\n")
summary(fit)


# ── EDGE EVIDENCE: Inclusion Bayes Factors ────────────────────────────────────

cat("\n── Edge Evidence Analysis ──\n")
cat("\nInclusion Bayes Factor interpretation (from tutorial):\n")
cat("  BF > 10:     Strong evidence FOR inclusion\n")
cat("  BF 3-10:     Moderate evidence FOR inclusion\n")
cat("  BF 1/3-3:    Inconclusive\n")
cat("  BF < 1/3:    Evidence AGAINST inclusion (evidence of absence)\n")
cat("  BF < 1/10:   Strong evidence AGAINST inclusion\n\n")

# Edge evidence plot - using plot_edgeevidence() from easybgm
plot_edgeevidence(fit)
title("Edge Evidence Plot (BF Thresholds: 10 and 1/10)")

# ══════════════════════════════════════════════════════════════════════════════
# METHODS FILL-IN-THE-BLANK ANSWERS (from Assignment PDF)
# ══════════════════════════════════════════════════════════════════════════════
#
# "The inclusion Bayes factor COMPARES THE POSTERIOR ODDS OF EDGE INCLUSION
# TO THE PRIOR ODDS OF EDGE INCLUSION."
#
# "These Bayes factors were used to classify edges as showing evidence for
# INCLUSION, evidence for EXCLUSION, or INCONCLUSIVE evidence."
#
# "HDI (or EVIDENCE) plots were used to visualize which edges fall into
# each of these categories."
#
# "In this study, an inclusion Bayes factor of 10 was used as the threshold
# for strong evidence for inclusion, and a Bayes factor of 1/10 was used
# as the threshold for strong evidence for exclusion."
#
# ══════════════════════════════════════════════════════════════════════════════


# ── NETWORK STRUCTURE ─────────────────────────────────────────────────────────

cat("\n── Estimated Network Structure ──\n")

# Network plot using plot_network() - shows median probability model
# Default: exc_prob = 0.5 (edges with posterior inclusion probability > 0.5)
plot_network(fit)
title("Network Structure (Median Probability Model, exc_prob = 0.5)")

# ══════════════════════════════════════════════════════════════════════════════
# THEORY: The Median Probability Model
# ══════════════════════════════════════════════════════════════════════════════
#
# In Bayesian model averaging, not all edges have convincing evidence.
# By default, easybgm visualizes the MEDIAN PROBABILITY MODEL:
# - Network consisting of all edges with posterior inclusion probability > 0.5
# - Equivalently, Bayes Factor > 1
#
# You can adjust this threshold using the exc_prob argument:
# - exc_prob = 0.5 (default) → includes edges with BF > 1
# - exc_prob = 0.8 → stricter, fewer edges shown
# - exc_prob = 0.9 → very strict, only strong edges
#
# ══════════════════════════════════════════════════════════════════════════════

# Compare different exc_prob thresholds
cat("\n── Comparing Network Visualisations at Different Thresholds ──\n")

par(mfrow = c(1, 3))

plot_network(fit, exc_prob = 0.5)
title("exc_prob = 0.5 (default)")

plot_network(fit, exc_prob = 0.8)
title("exc_prob = 0.8 (stricter)")

plot_network(fit, exc_prob = 0.9)
title("exc_prob = 0.9 (very strict)")

par(mfrow = c(1, 1))


# ── PARAMETER UNCERTAINTY: HDI INTERVALS ──────────────────────────────────────

cat("\n── Parameter HDI Intervals ──\n")
cat("If you want to assess uncertainty in edge parameters, use plot_parameterHDI()\n\n")

# HDI plot showing uncertainty in edge parameters
plot_parameterHDI(fit)
title("Edge Parameter HDI Intervals (95% Highest Density Intervals)")


# ── PRIOR SENSITIVITY ANALYSIS ────────────────────────────────────────────────
# NOTE: Tutorial switches to ordinal/bgms for prior sensitivity demonstration
# From Morning Tutorial.html lines 4450-4470

cat("\n── Prior Sensitivity Analysis ──\n")
cat("Comparing inclusion_probability: 0.1 (sparse) vs 0.7 (dense)\n")
cat("Using ordinal/bgms for this section (as per tutorial)\n")
cat("Fitting models with different priors...\n\n")

# Sparse prior model
cat("Fitting with sparse prior (inclusion_probability = 0.1)...\n")
fit_sparse <- easybgm(
  data = dat,
  type = "ordinal",
  package = "bgms",
  iter = 2e3,
  update_method = "adaptive-metropolis",
  inclusion_probability = 0.1,
  seed = 1234
)

# Dense prior model
cat("Fitting with dense prior (inclusion_probability = 0.7)...\n")
fit_dense <- easybgm(
  data = dat,
  type = "ordinal",
  package = "bgms",
  iter = 2e3,
  update_method = "adaptive-metropolis",
  inclusion_probability = 0.7,
  seed = 1234
)

# Compare results
cat("\n── Comparison: Sparse (0.1) vs Dense (0.7) Prior ──\n\n")

cat("Sparse prior (0.1) summary:\n")
summary(fit_sparse)

cat("\nDense prior (0.7) summary:\n")
summary(fit_dense)

# Side-by-side evidence plots
par(mfrow = c(1, 2))
plot_edgeevidence(fit_sparse)
title("Sparse Prior (0.1)")
plot_edgeevidence(fit_dense)
title("Dense Prior (0.7)")
par(mfrow = c(1, 1))

cat("\nInterpretation:\n")
cat("If results are similar across priors, conclusions are ROBUST to prior choice.\n")
cat("If results differ substantially, interpret with caution.\n")


# ┌──────────────────────────────────────────────────────────────────────────────
# │ PART 2: GROUP DIFFERENCES
# │ Afternoon Session I - Group Assignment 2
# │ Topic: Multi-group OMRF comparing males vs females
# │ Based on: Afternoon Group Tutorial.html
# └──────────────────────────────────────────────────────────────────────────────

cat("\n")
cat("┌──────────────────────────────────────────────────────────────────────────────\n")
cat("│ PART 2: GROUP DIFFERENCES\n")
cat("│ Topic: Multi-group OMRF, Testing Edge Differences Between Groups\n")
cat("└──────────────────────────────────────────────────────────────────────────────\n\n")

# ══════════════════════════════════════════════════════════════════════════════
# THEORY: Multi-Group Ordinal MRF
# ══════════════════════════════════════════════════════════════════════════════
#
# The MULTI-GROUP OMRF extends the basic model to test whether network
# structure differs between groups (e.g., males vs females).
#
# Key question: Do the conditional associations between items differ
# between groups, or is the network structure invariant?
#
# We use easybgm_compare() which fits a JOINT model that:
# - Allows for edge differences between groups
# - Tests whether edges differ using Bayes factors
# - Can borrow strength across groups for common edges
#
# This is different from fitting TWO separate networks:
# - We explicitly model and test the DIFFERENCE
# - Joint estimation is more principled
#
# Interpretation:
# - Evidence FOR difference: The edge strength differs between groups
# - Evidence AGAINST difference: The edge is similar across groups
# - Inconclusive: Not enough data to determine
#
# ══════════════════════════════════════════════════════════════════════════════

# --- Load Group Differences Data ---

cat("Loading data for group comparison...\n")
data_path_group <- here("data", "psynets", "day3-group-data.rds")

if (file.exists(data_path_group)) {
  dat_group <- readRDS(data_path_group)
  cat("Group data loaded:", nrow(dat_group), "observations\n\n")
} else {
  # Fallback to morning data if same file
  dat_group <- dat
  cat("Using morning data (same dataset)\n\n")
}

# ══════════════════════════════════════════════════════════════════════════════
# ASSIGNMENT CONTEXT: Testing Gender Differences
# ══════════════════════════════════════════════════════════════════════════════
#
# In the original study, Martarelli et al. (2022) did NOT test whether
# the network structure differs between males and females.
#
# Our task: Use multi-group Bayesian OMRF to test:
# 1. Do any edge weights differ significantly between genders?
# 2. Which specific edges show evidence of gender differences?
# 3. Are results robust to prior assumptions?
#
# Data: Same N=490 participants
#   - 73% females (n ≈ 358)
#   - 27% males (n ≈ 132)
#
# Note: Unequal group sizes may affect power to detect differences.
#
# ══════════════════════════════════════════════════════════════════════════════


# ── METHODS SECTION: Multi-Group Model Specification ──────────────────────────
#
# STRUCTURE PRIORS for edge differences:
# Beta-Bernoulli(1, 1) prior = Uniform over number of differences
# This reflects prior ignorance about how many edges differ between groups.
#
# Sensitivity analysis priors:
# - Beta-Bernoulli(1, 10): Favors FEW differences (prior mean = 1/11 ≈ 9%)
# - Beta-Bernoulli(10, 1): Favors MANY differences (prior mean = 10/11 ≈ 91%)
#
# PARAMETER PRIORS:
# Difference parameters are assigned independent Cauchy priors
# with scale = 1.0 (default). Can vary with interaction_scale parameter.
#
# ──────────────────────────────────────────────────────────────────────────────


# Prepare data for group comparison
cat("── Preparing Data for Group Comparison ──\n")

# Check if gender variable exists
if ("gender" %in% names(dat_group)) {
  # Create group indicator
  group_indicator <- dat_group$gender

  # Remove gender column from data (keep only item responses)
  data_items <- dat_group[, names(dat_group) != "gender"]

  cat("Gender variable found\n")
  cat("  Group 1 (male):", sum(group_indicator == 1, na.rm = TRUE), "\n")
  cat("  Group 2 (female):", sum(group_indicator == 2, na.rm = TRUE), "\n\n")

} else {
  cat("Gender variable not in this dataset.\n")
  cat("For demonstration, we'll simulate a gender variable.\n\n")

  # Simulate gender (73% female as per study description)
  set.seed(2026)
  n <- nrow(dat_group)
  group_indicator <- sample(c(1, 2), n, replace = TRUE, prob = c(0.27, 0.73))
  data_items <- dat_group

  cat("Simulated gender:\n")
  cat("  Group 1 (male):", sum(group_indicator == 1), "\n")
  cat("  Group 2 (female):", sum(group_indicator == 2), "\n\n")
}


# ── OPTIONAL: Inspect Group-Specific Networks First ───────────────────────────

cat("── Inspecting Group-Specific Networks (Descriptive) ──\n")
cat("First, we can inspect networks for each group separately.\n")
cat("This provides a descriptive overview before formal comparison.\n\n")

# Fit separate models WITHOUT edge selection (for descriptive comparison)
cat("Fitting descriptive model for Group 1...\n")
fit_group1 <- bgm(
  data_items[group_indicator == 1, ],
  iter = 2000,
  edge_selection = FALSE  # No edge selection for descriptive
)

cat("Fitting descriptive model for Group 2...\n")
fit_group2 <- bgm(
  data_items[group_indicator == 2, ],
  iter = 2000,
  edge_selection = FALSE
)

# Visualise side by side (descriptive)
par(mfrow = c(1, 2))
qgraph(fit_group1$interactions, title = "Group 1 (Descriptive)")
qgraph(fit_group2$interactions, title = "Group 2 (Descriptive)")
par(mfrow = c(1, 1))


# ── FITTING MULTI-GROUP MODEL WITH easybgm_compare() ──────────────────────────

cat("\n── Fitting Multi-Group OMRF with easybgm_compare() ──\n")
cat("This uses a joint model to formally test for edge differences.\n")
cat("This is computationally intensive - please be patient...\n\n")

# Multi-group model using easybgm_compare()
# From Afternoon Group Tutorial.html
easy_fit <- easybgm_compare(
  data = data_items,
  group_indicator = group_indicator,
  iter = 2000,                              # Use more for publication
  package = "bgms",                         # Use bgms backend
  type = "ordinal",
  seed = 1234
)

cat("\n── Multi-Group Model Summary ──\n")
summary(easy_fit)

# Edge evidence plot for differences
cat("\n── Edge Evidence for Group Differences ──\n")
plot_edgeevidence(easy_fit)
title("Evidence for Edge Differences Between Groups")

# ══════════════════════════════════════════════════════════════════════════════
# INTERPRETATION: Edge Evidence Plot for Group Comparison
# ══════════════════════════════════════════════════════════════════════════════
#
# The edge evidence plot summarizes, for each edge:
# - How strongly the data support a GROUP DIFFERENCE (BF > 10)
# - How strongly the data support GROUP SIMILARITY (BF < 1/10)
# - Neither (inconclusive)
#
# In the plot:
# - GREEN edges: Evidence that edge is SIMILAR across groups
# - RED edges: Evidence that edge DIFFERS between groups
# - GREY edges: Inconclusive evidence
#
# ══════════════════════════════════════════════════════════════════════════════


# ── PRIOR SENSITIVITY: Beta-Bernoulli Prior ───────────────────────────────────

cat("\n── Prior Sensitivity Analysis: Difference Structure Prior ──\n")
cat("Testing Beta-Bernoulli(1,1) vs Beta-Bernoulli(1,10) vs Beta-Bernoulli(10,1)\n\n")

# Default is implicitly Bernoulli(0.5) for differences
# Let's test with explicit Beta-Bernoulli priors

# Beta-Bernoulli(1,1): Uniform - no prior preference
cat("Fitting with Beta-Bernoulli(1,1) prior for differences...\n")
fit_beta11 <- easybgm_compare(
  data = data_items,
  group_indicator = group_indicator,
  iter = 2000,
  package = "bgms",
  type = "ordinal",
  seed = 1234,
  difference_prior = "Beta-Bernoulli",
  beta_bernoulli_alpha = 1,
  beta_bernoulli_beta = 1
)

# Beta-Bernoulli(1,10): Favors FEW differences
cat("Fitting with Beta-Bernoulli(1,10) prior (favors similarity)...\n")
fit_beta110 <- easybgm_compare(
  data = data_items,
  group_indicator = group_indicator,
  iter = 2000,
  package = "bgms",
  type = "ordinal",
  seed = 1234,
  difference_prior = "Beta-Bernoulli",
  beta_bernoulli_alpha = 1,
  beta_bernoulli_beta = 10
)

# Compare evidence
cat("\n── Comparison of Prior Sensitivity ──\n")
summary(fit_beta11)
summary(fit_beta110)


# ── PRIOR SENSITIVITY: Interaction Scale ──────────────────────────────────────

cat("\n── Prior Sensitivity Analysis: Interaction Scale ──\n")
cat("The interaction_scale parameter controls the prior on the SIZE of differences.\n")
cat("Default is 1.0. Testing with doubled (2.0) and halved (0.5) scales.\n\n")

# Double the scale
cat("Fitting with interaction_scale = 2.0...\n")
fit_scale2 <- easybgm_compare(
  data = data_items,
  group_indicator = group_indicator,
  iter = 2000,
  package = "bgms",
  type = "ordinal",
  seed = 1234,
  interaction_scale = 2.0
)

# Half the scale
cat("Fitting with interaction_scale = 0.5...\n")
fit_scale05 <- easybgm_compare(
  data = data_items,
  group_indicator = group_indicator,
  iter = 2000,
  package = "bgms",
  type = "ordinal",
  seed = 1234,
  interaction_scale = 0.5
)

cat("\n── Comparison: interaction_scale = 0.5 vs 1.0 vs 2.0 ──\n")
cat("If conclusions are consistent, results are robust to prior choice.\n")


# ┌──────────────────────────────────────────────────────────────────────────────
# │ PART 3: STRUCTURE PRIORS & CLUSTERING
# │ Afternoon Session II - Group Assignment 3
# │ Topic: Stochastic Block Model, Cluster Bayes Factors
# │ Based on: Structure priors and clustering.html
# └──────────────────────────────────────────────────────────────────────────────

cat("\n")
cat("┌──────────────────────────────────────────────────────────────────────────────\n")
cat("│ PART 3: STRUCTURE PRIORS & CLUSTERING\n")
cat("│ Topic: Stochastic Block Model, Detecting Network Communities\n")
cat("└──────────────────────────────────────────────────────────────────────────────\n\n")

# ══════════════════════════════════════════════════════════════════════════════
# THEORY: Structure Priors
# ══════════════════════════════════════════════════════════════════════════════
#
# Standard structure priors (Bernoulli, Beta-Bernoulli) treat all edges as
# EXCHANGEABLE - they don't encode expectations about network structure.
#
# Types of structure priors:
# 1. BERNOULLI: Each edge has same prior probability π
#    - π = 0.5: neutral
#    - π < 0.5: sparse
#    - π > 0.5: dense
#
# 2. BETA-BERNOULLI: Data-driven sparsity tuning
#    - Allows the data to inform overall network density
#
# 3. STOCHASTIC BLOCK MODEL (SBM): Encodes CLUSTERING expectations
#    - Edge probability depends on cluster membership
#    - Can test for and estimate clustering
#
# ══════════════════════════════════════════════════════════════════════════════

# ══════════════════════════════════════════════════════════════════════════════
# THEORY: Stochastic Block Model (SBM) as Structure Prior
# ══════════════════════════════════════════════════════════════════════════════
#
# The SBM prior encodes clustering expectations:
#
# Key idea: The probability of an edge between two nodes depends on
# THE CLUSTER MEMBERSHIP OF THOSE NODES.
#
# - WITHIN-cluster edges: Higher probability (nodes in same cluster connect)
# - BETWEEN-cluster edges: Lower probability (nodes in different clusters)
#
# This allows us to:
# 1. Test whether clustering exists in the network
# 2. Estimate cluster membership of nodes
# 3. Quantify evidence for different numbers of clusters
#
# SBM Hyperparameters:
# - λ (lambda): Controls prior on number of clusters
#     * λ = 1: Prior expectation of ~1 cluster (no clustering)
#     * λ = 1.59: Prior expectation of ~2 clusters
#     * λ = 2.82: Prior expectation of ~3 clusters
#     * λ = 3.92: Prior expectation of ~4 clusters
#
# - α_within, β_within: Beta prior for within-cluster edge probability
# - α_between, β_between: Beta prior for between-cluster edge probability
#
# - Dirichlet concentration: Controls cluster size balance
#     * Large values: Similar sized clusters
#     * Small values: Unequal cluster sizes allowed
#     * 1.0: Neutral (default)
#
# ══════════════════════════════════════════════════════════════════════════════

# ══════════════════════════════════════════════════════════════════════════════
# ASSIGNMENT CONTEXT: Testing Clustering in SBPS + CEI-II
# ══════════════════════════════════════════════════════════════════════════════
#
# Original study: Martarelli et al. (2022) used post-hoc community detection
# and found TWO clusters:
#   1. All SBPS items (boredom)
#   2. All CEI-II items (curiosity + exploration)
#
# They originally expected THREE clusters (boredom, curiosity, exploration),
# but curiosity and exploration clustered together.
#
# Our task: Use SBM prior to:
# 1. Test H0: No clustering vs H1: Some clustering (1 vs 2+ clusters)
# 2. Test H1: 2 clusters vs H2: 3 clusters
# 3. Estimate cluster membership of each node
#
# Prior expectations: Based on Martarelli et al., we expect 2 clusters,
# so we set lambda appropriately to reflect this belief.
#
# ══════════════════════════════════════════════════════════════════════════════


# --- Load Clustering Data ---

cat("Loading data for clustering analysis...\n")
data_path_cluster <- here("data", "psynets", "day3-afternoon-data.rds")

if (file.exists(data_path_cluster)) {
  dat_cluster <- readRDS(data_path_cluster)
  cat("Clustering data loaded:", nrow(dat_cluster), "observations,",
      ncol(dat_cluster), "variables\n\n")
} else {
  # Fallback to morning data
  dat_cluster <- dat
  cat("Using morning data\n\n")
}


# ── METHODS SECTION: SBM Prior Specification ──────────────────────────────────
#
# METHODS FILL-IN-THE-BLANK ANSWERS:
#
# "In the SBM model, the probability of an edge between two nodes depends on
# THE CLUSTER MEMBERSHIP OF THOSE NODES."
#
# "Based on the results from the previous study by Martarelli et al. (2022),
# we expect to find two clusters in the network structure, corresponding to
# the SBPS and CEI-II items."
#
# ──────────────────────────────────────────────────────────────────────────────


# ── DEFINING EXPECTED CLUSTERS ────────────────────────────────────────────────

# Based on the study, items should cluster as:
# Cluster 1: SBPS items (boredom proneness) - items 1-8
# Cluster 2: CEI-II items (curiosity/exploration) - items 9-18

n_items <- ncol(dat_cluster)
cat("Number of items:", n_items, "\n")

# Expected cluster assignment (for comparison)
expected_clusters <- c(rep(1, 8), rep(2, n_items - 8))
cat("Expected cluster assignment (based on scale):\n")
cat("  SBPS items (1-8): Cluster 1\n")
cat("  CEI-II items (9+): Cluster 2\n\n")


# ── FITTING MODEL WITH SBM PRIOR ──────────────────────────────────────────────

cat("── Fitting OMRF with Stochastic Block Model Prior ──\n")
cat("Using edge_prior = 'Stochastic-Block' with lambda = 1\n")
cat("(lambda = 1 is conservative, testing for presence of clustering)\n")
cat("This is computationally intensive - please be patient...\n\n")

# Fit with SBM prior
# From Structure priors and clustering.html
fit_sbm <- easybgm(
  data = dat_cluster,
  type = "ordinal",
  iter = 10000,                             # SBM needs more iterations
  package = "bgms",
  edge_prior = "Stochastic-Block",          # KEY: Use SBM prior
  lambda = 1,                               # Prior expectation of ~1 cluster
  seed = 1234
)

cat("\n── SBM Model Summary ──\n")
summary(fit_sbm)

# ══════════════════════════════════════════════════════════════════════════════
# INTERPRETING SBM OUTPUT
# ══════════════════════════════════════════════════════════════════════════════
#
# The summary shows:
# - Estimated cluster assignments (posterior mean and mode)
# - Bayes factor testing H1: B > 1 (clustering) vs H0: B = 1 (no clustering)
#
# If BF favors H1, there is evidence for clustering in the network.
#
# ══════════════════════════════════════════════════════════════════════════════


# ── NETWORK VISUALISATION ─────────────────────────────────────────────────────

cat("\n── Network Plot with Estimated Clusters ──\n")
plot_network(fit_sbm)
title("Network Structure (SBM Prior)")


# ── CLUSTER BAYES FACTOR TESTS ────────────────────────────────────────────────

cat("\n── Cluster Bayes Factor Analysis ──\n")
cat("\nTesting specific clustering hypotheses:\n\n")

# Test: 2 clusters vs 1 cluster (no clustering)
cat("Test 1: H1 (2 clusters) vs H0 (1 cluster / no clustering)\n")
bf_2vs1 <- clusterBayesfactor(fit_sbm, type = "point", b1 = 2, b2 = 1)
cat("  Bayes Factor:", bf_2vs1, "\n")
if (bf_2vs1 > 10) {
  cat("  → Strong evidence FOR 2 clusters over no clustering\n\n")
} else if (bf_2vs1 > 3) {
  cat("  → Moderate evidence FOR 2 clusters\n\n")
} else if (bf_2vs1 < 1/10) {
  cat("  → Strong evidence AGAINST 2 clusters (prefer 1)\n\n")
} else {
  cat("  → Inconclusive\n\n")
}

# Test: 2 clusters vs 3 clusters
cat("Test 2: H1 (2 clusters) vs H2 (3 clusters)\n")
bf_2vs3 <- clusterBayesfactor(fit_sbm, type = "point", b1 = 2, b2 = 3)
cat("  Bayes Factor:", bf_2vs3, "\n")
if (bf_2vs3 > 10) {
  cat("  → Strong evidence FOR 2 clusters over 3 clusters\n\n")
} else if (bf_2vs3 < 1/10) {
  cat("  → Strong evidence FOR 3 clusters over 2 clusters\n\n")
} else {
  cat("  → Inconclusive between 2 and 3 clusters\n\n")
}


# ── POSTERIOR COCLUSTERING MATRIX ─────────────────────────────────────────────

cat("── Posterior Coclustering Matrix ──\n")
cat("Shows how often pairs of nodes appear in the same cluster.\n")
cat("Values close to 1.0 = often in same cluster\n")
cat("Values close to 0.0 = rarely in same cluster\n\n")

# Extract coclustering matrix from SBM output
if (!is.null(fit_sbm$sbm$posterior_mean_coclustering_matrix)) {
  coclustering_matrix <- fit_sbm$sbm$posterior_mean_coclustering_matrix

  # Visualise with pheatmap
  pheatmap(
    coclustering_matrix,
    cluster_rows = FALSE,
    cluster_cols = FALSE,
    main = "Posterior Coclustering Probabilities",
    color = colorRampPalette(c("white", "steelblue"))(100)
  )

  # Print numerical matrix
  cat("\nCoclustering Matrix (rounded):\n")
  print(round(coclustering_matrix, 2))

} else {
  cat("Coclustering matrix not available in this model output.\n")
  cat("This may be due to the easybgm/bgms version.\n")
}


# ── COMPARING ESTIMATED VS EXPECTED CLUSTERS ──────────────────────────────────

cat("\n── Comparing Estimated vs Expected Cluster Membership ──\n")

# Get estimated cluster membership
if (!is.null(fit_sbm$sbm)) {
  estimated_clusters <- fit_sbm$sbm$cluster_assignment_mode

  cat("\nExpected (based on questionnaire):\n")
  print(expected_clusters)

  cat("\nEstimated (from SBM):\n")
  print(estimated_clusters)

  # Check alignment
  cat("\nDo estimated clusters match expected SBPS/CEI-II division?\n")
  # (Note: cluster labels may be permuted)

} else {
  cat("Cluster assignment not available in this model output.\n")
}


# ── PRIOR SENSITIVITY FOR CLUSTERING ──────────────────────────────────────────

cat("\n── Prior Sensitivity Analysis: Lambda ──\n")
cat("Testing different prior expectations for number of clusters.\n\n")

# Lambda = 1.59: Prior expectation of ~2 clusters
cat("Fitting with lambda = 1.59 (prior expects ~2 clusters)...\n")
fit_sbm_2 <- easybgm(
  data = dat_cluster,
  type = "ordinal",
  iter = 10000,
  package = "bgms",
  edge_prior = "Stochastic-Block",
  lambda = 1.59,                            # Expect ~2 clusters
  seed = 1234
)

# Lambda = 2.82: Prior expectation of ~3 clusters
cat("Fitting with lambda = 2.82 (prior expects ~3 clusters)...\n")
fit_sbm_3 <- easybgm(
  data = dat_cluster,
  type = "ordinal",
  iter = 10000,
  package = "bgms",
  edge_prior = "Stochastic-Block",
  lambda = 2.82,                            # Expect ~3 clusters
  seed = 1234
)

cat("\n── Comparison: lambda = 1 vs 1.59 vs 2.82 ──\n")
cat("If cluster structure is detected consistently, conclusions are robust.\n")

summary(fit_sbm)
summary(fit_sbm_2)
summary(fit_sbm_3)


# ══════════════════════════════════════════════════════════════════════════════
# END OF DAY 3 PRACTICALS
# ══════════════════════════════════════════════════════════════════════════════

cat("\n")
cat("══════════════════════════════════════════════════════════════════════════════\n")
cat("  DAY 3 COMPLETE!\n")
cat("══════════════════════════════════════════════════════════════════════════════\n\n")

cat("KEY TAKEAWAYS:\n\n")

cat("PART 1 - BAYESIAN REANALYSIS:\n")
cat("  - Bayesian approach: Posterior ∝ Prior × Likelihood\n")
cat("  - Inclusion Bayes Factor quantifies evidence for edges\n")
cat("  - BF > 10: strong FOR; BF < 1/10: strong AGAINST; else: inconclusive\n")
cat("  - easybgm() with type = 'ordinal' for Likert data\n")
cat("  - Key functions: plot_network(), plot_edgeevidence(), plot_parameterHDI()\n")
cat("  - Always check prior sensitivity (inclusion_probability)\n\n")

cat("PART 2 - GROUP DIFFERENCES:\n")
cat("  - easybgm_compare() for multi-group models\n")
cat("  - Requires group_indicator variable\n")
cat("  - Tests edge DIFFERENCES between groups (not just separate networks)\n")
cat("  - difference_prior = 'Beta-Bernoulli' for sensitivity analysis\n")
cat("  - interaction_scale controls prior on size of differences\n\n")

cat("PART 3 - CLUSTERING:\n")
cat("  - edge_prior = 'Stochastic-Block' for SBM prior\n")
cat("  - lambda controls prior expectation of clusters\n")
cat("     * λ = 1 → ~1 cluster; λ = 1.59 → ~2 clusters; λ = 2.82 → ~3 clusters\n")
cat("  - clusterBayesfactor() tests specific cluster hypotheses\n")
cat("  - Coclustering matrix shows node-pair clustering probabilities\n")
cat("  - SBPS and CEI-II expected to form distinct clusters\n\n")

cat("GENERAL NOTES:\n")
cat("  - Bayesian MCMC is SLOW - allow several minutes per model\n")
cat("  - Use 10000+ iterations for publication-quality results\n")
cat("  - Check convergence before interpreting\n")
cat("  - Prior sensitivity analysis is essential for robust conclusions\n\n")

cat("KEY FUNCTIONS REFERENCE:\n")
cat("  easybgm()            - Fit single-group Bayesian network\n")
cat("  easybgm_compare()    - Fit multi-group comparison model\n")
cat("  plot_network()       - Visualise network structure\n")
cat("  plot_edgeevidence()  - Edge evidence (BF) plot\n")
cat("  plot_parameterHDI()  - HDI interval plot\n")
cat("  clusterBayesfactor() - Test cluster hypotheses\n")
cat("  pheatmap()           - Coclustering matrix heatmap\n\n")

cat("══════════════════════════════════════════════════════════════════════════════\n")
