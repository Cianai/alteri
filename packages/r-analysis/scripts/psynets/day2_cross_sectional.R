# ══════════════════════════════════════════════════════════════════════════════
# PSYNETS Day 2: Cross-Sectional Networks
# Complete Integrated Practical Guide
# ══════════════════════════════════════════════════════════════════════════════
#
# Instructor: Jill de Ron
# Date: 2026-01-27
#
# This script contains ALL content from the Day 2 practicals:
#
#   PART 1: Estimation (01_Estimation.pdf) ............... 9 questions
#   PART 2: Model Selection (02_ModelSelection.pdf) ...... 9 questions
#   PART 3: Replicability (03_Replicability.pdf) ......... 4 questions
#
# HOW TO USE:
# - Run section by section with Cmd+Enter (Mac) or Ctrl+Enter (Windows)
# - Theory explanations are embedded as comments - read them!
# - Each question is clearly marked with ── QUESTION N ──
# - Answer prompts ask you to think before running the solution code
# - No need to open the PDF files - everything is here
#
# ══════════════════════════════════════════════════════════════════════════════


# ┌──────────────────────────────────────────────────────────────────────────────
# │ PART 0: SETUP
# └──────────────────────────────────────────────────────────────────────────────

library(here)
set.seed(2026)

# Core packages for Day 2
library(bootnet)              # Network estimation and stability
library(qgraph)               # Network visualisation
library(psych)                # BFI data and psychometrics
library(NetworkComparisonTest) # Network comparison (NCT)
library(IsingSampler)         # Ising model sampling (binary networks)
library(IsingFit)             # Ising model estimation

cat("══════════════════════════════════════════════════════════════════════════════\n")
cat("  PSYNETS Day 2: Cross-Sectional Networks\n")
cat("  All packages loaded successfully\n")
cat("══════════════════════════════════════════════════════════════════════════════\n\n")


# ┌──────────────────────────────────────────────────────────────────────────────
# │ PART 1: ESTIMATION
# │ Morning Session - Practical 1 (01_Estimation.pdf)
# │ Topics: GGMs, partial correlations, precision matrix, Ising models
# └──────────────────────────────────────────────────────────────────────────────

cat("\n")
cat("┌──────────────────────────────────────────────────────────────────────────────\n")
cat("│ PART 1: ESTIMATION\n")
cat("│ Topics: GGMs, partial correlations, precision matrix, Ising models\n")
cat("└──────────────────────────────────────────────────────────────────────────────\n\n")

# ══════════════════════════════════════════════════════════════════════════════
# THEORY: What is a Gaussian Graphical Model (GGM)?
# ══════════════════════════════════════════════════════════════════════════════
#
# A GGM represents PARTIAL CORRELATIONS between variables as edges in a network.
#
# Key distinction:
#   - MARGINAL correlation: r(X,Y) - the raw correlation between X and Y
#   - PARTIAL correlation: r(X,Y|Z) - correlation between X and Y after
#     controlling for all other variables Z
#
# Why partial correlations matter:
#   - Marginal correlations can be "spurious" - two variables may correlate
#     only because they're both related to a third variable
#   - Partial correlations reveal DIRECT relationships
#   - An edge in a GGM means: "These variables are related even after
#     accounting for everything else"
#
# Mathematical relationship:
#   - S = covariance matrix
#   - K = precision matrix = inverse of covariance matrix = S^(-1)
#   - Partial correlations are computed from K:
#
#     pcor(i,j) = -K[i,j] / sqrt(K[i,i] * K[j,j])
#
# The LASSO assumption:
#   - EBICglasso assumes the TRUE network is SPARSE (most edges are zero)
#   - If the true network is dense (many edges), LASSO will underperform
#   - This is a key limitation to understand!
#
# ══════════════════════════════════════════════════════════════════════════════

# --- Load the Network Analysis 2020 dataset ---
# This dataset contains daily symptom ratings (depression, anxiety, etc.)
# Download from: https://osf.io/45n6d/

cat("Loading NA 2020 dataset from OSF...\n")
dat <- read.csv("https://osf.io/45n6d/download", header = TRUE)
cat("Dataset loaded:", nrow(dat), "observations,", ncol(dat), "variables\n\n")

# Select symptom variables only (columns 2-13)
symptoms <- dat[, 2:13]
cat("Symptom variables:\n")
print(names(symptoms))
cat("\n")


# ── QUESTION 1 ────────────────────────────────────────────────────────────────
#
# "What do you expect to happen if the true network is very dense (i.e., every
# node is connected to every other node)? Would the LASSO assumption be violated?
# What would you expect to happen to the accuracy of your estimation if there
# is such a violation of the LASSO assumption?"
#
# THINK ABOUT THIS before reading the answer below...
#
# ──────────────────────────────────────────────────────────────────────────────

# ANSWER:
#
# Yes, the LASSO assumption would be violated. LASSO assumes SPARSITY - that
# most edges are truly zero. If every node connects to every other node:
#
# 1. LASSO will UNDERESTIMATE edge weights (shrink them too much)
# 2. LASSO may set some TRUE edges to zero (false negatives)
# 3. Sensitivity will decrease (we miss real edges)
# 4. The network will appear sparser than it truly is
#
# In practice: psychological networks are often moderately dense, so this
# is a real concern. When n > 500, consider non-regularised methods like
# ggmModSelect instead.


# ── QUESTION 2 ────────────────────────────────────────────────────────────────
#
# "Before computing anything, we will discuss the two variables feel_alone
# (feeling lonely) and optimistic_future (feeling optimistic about the future).
# What do you expect the marginal correlation to be between these two
# variables? What do you expect the partial correlation to be?"
#
# THINK: What's your intuition? Are lonely people less optimistic?
#        Would this relationship remain after controlling for depression?
#
# ──────────────────────────────────────────────────────────────────────────────

# Let's compute both and see!

# Marginal correlation (raw correlation)
marginal_cor <- cor(symptoms$feel_alone, symptoms$optimistic_future,
                    use = "pairwise.complete.obs")
cat("Marginal correlation (feel_alone, optimistic_future):",
    round(marginal_cor, 3), "\n")

# For partial correlation, we need the full correlation/covariance approach
# (computed in Question 3)


# ── QUESTION 3 ────────────────────────────────────────────────────────────────
#
# "Compute the partial correlation between feel_alone and optimistic_future
# using the precision matrix."
#
# Method: pcor(i,j) = -K[i,j] / sqrt(K[i,i] * K[j,j])
# where K = inverse(covariance matrix)
#
# ──────────────────────────────────────────────────────────────────────────────

# Step 1: Compute covariance matrix (handle missing data)
S <- cov(symptoms, use = "pairwise.complete.obs")

# Step 2: Compute precision matrix (inverse of covariance)
K <- solve(S)

# Step 3: Find indices for our variables
i <- which(names(symptoms) == "feel_alone")
j <- which(names(symptoms) == "optimistic_future")

cat("\nVariable indices:\n")
cat("  feel_alone:", i, "\n")
cat("  optimistic_future:", j, "\n")

# Step 4: Apply the partial correlation formula
partial_cor_precision <- -K[i, j] / sqrt(K[i, i] * K[j, j])

cat("\nPartial correlation (via precision matrix):",
    round(partial_cor_precision, 3), "\n")

# Compare marginal vs partial
cat("\n── COMPARISON ──\n")
cat("Marginal correlation:", round(marginal_cor, 3), "\n")
cat("Partial correlation: ", round(partial_cor_precision, 3), "\n")
cat("\nInterpretation: The partial correlation is weaker because some of\n")
cat("the relationship is explained by other variables (e.g., depression).\n")


# ── QUESTION 4 ────────────────────────────────────────────────────────────────
#
# "Compute the partial correlation between feel_alone and optimistic_future
# using the multiple regression approach."
#
# Method:
# 1. Regress feel_alone on all OTHER variables, get residuals
# 2. Regress optimistic_future on all OTHER variables, get residuals
# 3. Correlate the two sets of residuals
#
# ──────────────────────────────────────────────────────────────────────────────

# Get complete cases for regression
symptoms_complete <- na.omit(symptoms)

# Create formulas for regression
other_vars <- setdiff(names(symptoms_complete), c("feel_alone", "optimistic_future"))
formula_alone <- as.formula(paste("feel_alone ~", paste(other_vars, collapse = " + ")))
formula_optimistic <- as.formula(paste("optimistic_future ~", paste(other_vars, collapse = " + ")))

# Run regressions and extract residuals
resid_alone <- residuals(lm(formula_alone, data = symptoms_complete))
resid_optimistic <- residuals(lm(formula_optimistic, data = symptoms_complete))

# Correlate residuals = partial correlation
partial_cor_regression <- cor(resid_alone, resid_optimistic)

cat("\nPartial correlation (via regression):", round(partial_cor_regression, 3), "\n")
cat("Partial correlation (via precision):  ", round(partial_cor_precision, 3), "\n")
cat("\nThese should be very similar (small differences due to missing data handling).\n")


# ══════════════════════════════════════════════════════════════════════════════
# THEORY: Ising Models for Binary Data
# ══════════════════════════════════════════════════════════════════════════════
#
# GGMs assume CONTINUOUS (Gaussian) data. What about binary data (yes/no)?
#
# The Ising Model:
# - Originally from physics (magnetic spin systems)
# - Models the probability of a binary configuration
# - Network parameters represent conditional log-odds
#
# Key concepts:
# - Thresholds: tendency for each node to be "on" (1) vs "off" (0)
# - Network weights: how nodes influence each other
# - Positive edge: if node A is "on", node B is more likely "on"
# - Negative edge: if node A is "on", node B is more likely "off"
#
# Estimation:
# - Use nodewise logistic regressions (similar to GGM approach)
# - IsingFit package implements this
#
# ══════════════════════════════════════════════════════════════════════════════


# ── QUESTION 5 ────────────────────────────────────────────────────────────────
#
# "Use the IsingSampler package to generate data from the following Ising model.
# Then estimate a network using the IsingFit package."
#
# Given parameters:
# - 5 nodes
# - Thresholds all = 0
# - Network matrix (adjacency) as specified
#
# ──────────────────────────────────────────────────────────────────────────────

cat("\n── Simulating Ising Model Data ──\n")

# Define the TRUE network structure
true_ising_graph <- matrix(c(
  0, 1, 1, 0, 0,
  1, 0, 1, 1, 0,
  1, 1, 0, 1, 0,
  0, 1, 1, 0, 1,
  0, 0, 0, 1, 0
), nrow = 5, byrow = TRUE)

# Set thresholds (all zero = no baseline tendency)
true_thresholds <- rep(0, 5)

# Simulate data from this Ising model
n_samples <- 1000
ising_data <- IsingSampler(n = n_samples,
                           graph = true_ising_graph,
                           thresholds = true_thresholds)

cat("Simulated", n_samples, "observations from Ising model\n")
cat("Data dimensions:", dim(ising_data), "\n")

# Estimate network from the simulated data
cat("\nEstimating Ising network (this may take a moment)...\n")
ising_fit <- IsingFit(ising_data, plot = FALSE, progressbar = FALSE)

# Visualise true vs estimated
par(mfrow = c(1, 2))
qgraph(true_ising_graph, layout = "circle", title = "True Ising Network")
qgraph(ising_fit$weiadj, layout = "circle", title = "Estimated Ising Network")
par(mfrow = c(1, 1))

cat("\nTrue network matrix:\n")
print(true_ising_graph)
cat("\nEstimated network matrix (rounded):\n")
print(round(ising_fit$weiadj, 2))


# ── QUESTION 6 ────────────────────────────────────────────────────────────────
#
# "What is the difference between the regression coefficients from the nodewise
# logistic regressions and the network parameters?"
#
# THINK ABOUT THIS before reading the answer...
#
# ──────────────────────────────────────────────────────────────────────────────

# ANSWER:
#
# In nodewise estimation:
# - We run p separate regressions (one per node)
# - Each regression predicts one node from all others
# - This gives us TWO estimates for each edge: beta_ij and beta_ji
#
# To get network parameters:
# - We need to combine these (they should be similar but not identical)
# - Common approach: average them, i.e., w_ij = (beta_ij + beta_ji) / 2
# - This ensures the network is symmetric
#
# In GGMs: this is the "AND rule" (both must be nonzero) or "OR rule"
# (either can be nonzero) for edge inclusion.


# ── QUESTION 7 ────────────────────────────────────────────────────────────────
#
# "For your estimated network compute the sensitivity, specificity, and
# edge weight correlation."
#
# Definitions:
# - Sensitivity = TP / (TP + FN) = proportion of true edges detected
# - Specificity = TN / (TN + FP) = proportion of true non-edges correctly absent
# - Edge weight correlation = correlation between true and estimated weights
#
# ──────────────────────────────────────────────────────────────────────────────

# Get upper triangles (networks are symmetric, avoid double-counting)
true_edges <- true_ising_graph[upper.tri(true_ising_graph)]
est_edges <- ising_fit$weiadj[upper.tri(ising_fit$weiadj)]

# Binarise estimated edges (present vs absent)
est_binary <- as.numeric(est_edges != 0)
true_binary <- as.numeric(true_edges != 0)

# Confusion matrix
TP <- sum(true_binary == 1 & est_binary == 1)  # True positives
TN <- sum(true_binary == 0 & est_binary == 0)  # True negatives
FP <- sum(true_binary == 0 & est_binary == 1)  # False positives
FN <- sum(true_binary == 1 & est_binary == 0)  # False negatives

# Compute metrics
sensitivity <- TP / (TP + FN)
specificity <- TN / (TN + FP)
edge_cor <- cor(true_edges, est_edges)

cat("\n── Network Recovery Metrics ──\n")
cat("True positives (TP):", TP, "\n")
cat("True negatives (TN):", TN, "\n")
cat("False positives (FP):", FP, "\n")
cat("False negatives (FN):", FN, "\n")
cat("\nSensitivity:", round(sensitivity, 3), "(proportion of true edges detected)\n")
cat("Specificity:", round(specificity, 3), "(proportion of true non-edges correct)\n")
cat("Edge weight correlation:", round(edge_cor, 3), "\n")


# ── QUESTION 8 ────────────────────────────────────────────────────────────────
#
# "Perform a non-parametric bootstrap on the estimated Ising network using
# the bootnet package."
#
# Non-parametric bootstrap:
# - Resample ROWS of data with replacement
# - Re-estimate network on each bootstrap sample
# - Examine variability in edge weights
#
# ──────────────────────────────────────────────────────────────────────────────

cat("\n── Non-parametric Bootstrap (Ising) ──\n")
cat("Running bootstrap with 100 samples (increase to 1000 for publication)...\n")

# First, estimate via bootnet for bootstrap compatibility
ising_bootnet <- estimateNetwork(ising_data, default = "IsingFit")

# Non-parametric bootstrap
boot_np <- bootnet(ising_bootnet,
                   nBoots = 100,  # Use 1000 for publication
                   type = "nonparametric",
                   nCores = 4)

# Plot edge weight confidence intervals
plot(boot_np, labels = FALSE, order = "sample")
title("Edge Weight Bootstrap CIs (Ising Model)")


# ── QUESTION 9 ────────────────────────────────────────────────────────────────
#
# "Perform a case-dropping bootstrap and compute the CS-coefficient.
# What can you conclude about the stability of centrality measures?"
#
# Case-dropping bootstrap:
# - Systematically drop increasing proportions of cases (10%, 20%, ..., 90%)
# - Re-estimate network and centrality at each level
# - CS-coefficient = maximum proportion where correlation with original > 0.7
#
# Interpretation:
# - CS < 0.25: Do NOT interpret centrality
# - CS 0.25-0.5: Interpret with caution
# - CS > 0.5: Safe to interpret centrality
#
# ──────────────────────────────────────────────────────────────────────────────

cat("\n── Case-Dropping Bootstrap (Centrality Stability) ──\n")
cat("This takes longer - testing stability of centrality measures...\n")

boot_case <- bootnet(ising_bootnet,
                     nBoots = 100,  # Use 1000 for publication
                     type = "case",
                     nCores = 4,
                     statistics = c("strength", "closeness", "betweenness"))

# Plot stability
plot(boot_case, statistics = c("strength", "closeness", "betweenness"))
title("Centrality Stability (Case-Dropping Bootstrap)")

# Compute CS-coefficients
cs_coefs <- corStability(boot_case)
cat("\n── CS-Coefficients ──\n")
print(cs_coefs)

cat("\nInterpretation guidelines:\n")
cat("  CS < 0.25: Do NOT interpret this centrality measure\n")
cat("  CS 0.25-0.5: Interpret with caution\n")
cat("  CS > 0.5: Safe to interpret\n")


# ┌──────────────────────────────────────────────────────────────────────────────
# │ PART 2: MODEL SELECTION
# │ Morning Session - Practical 2 (02_ModelSelection.pdf)
# │ Topics: Regularisation, thresholding, pruning, ggmModSelect
# └──────────────────────────────────────────────────────────────────────────────

cat("\n")
cat("┌──────────────────────────────────────────────────────────────────────────────\n")
cat("│ PART 2: MODEL SELECTION\n")
cat("│ Topics: Regularisation, thresholding, pruning, ggmModSelect\n")
cat("└──────────────────────────────────────────────────────────────────────────────\n\n")

# ══════════════════════════════════════════════════════════════════════════════
# THEORY: Model Selection Methods
# ══════════════════════════════════════════════════════════════════════════════
#
# Problem: How do we decide which edges to include in our network?
#
# Four main approaches:
#
# 1. REGULARISATION (EBICglasso)
#    - Shrinks small edges toward zero
#    - Uses LASSO penalty + EBIC for model selection
#    - gamma parameter controls sparsity (0 = liberal, 0.5 = default)
#    - Best when: n < 500 or p is large relative to n
#    - Limitation: Assumes true network is sparse
#
# 2. THRESHOLDING
#    - Compute all partial correlations
#    - Apply significance test to each
#    - Keep only "significant" edges (p < alpha)
#    - Problem: Multiple comparisons! Need correction (Bonferroni, FDR)
#    - Problem: Significance ≠ importance (tiny effects can be significant)
#
# 3. PRUNING (Model-based)
#    - Start with full model (all edges)
#    - Remove edges one by one if removal improves fit (AIC/BIC)
#    - More principled than simple thresholding
#
# 4. ggmModSelect (Non-regularised)
#    - Stepwise model selection without regularisation
#    - Uses EBIC to compare models
#    - Best when: n > 500 (enough power without shrinkage)
#    - More accurate edge weights than regularised methods
#
# When to use what:
# - Small n (<250): EBICglasso with gamma = 0.5
# - Moderate n (250-500): EBICglasso with gamma = 0.25
# - Large n (>500): ggmModSelect
#
# ══════════════════════════════════════════════════════════════════════════════

# --- Load BFI Data ---
data("bfi")
cat("Loading BFI (Big Five Inventory) dataset...\n")

# Select 25 personality items (exclude gender, education, age)
bfi_items <- bfi[, 1:25]

# Handle missing data - complete cases
bfi_complete <- na.omit(bfi_items)
cat("BFI data:", nrow(bfi_complete), "complete cases,", ncol(bfi_complete), "items\n\n")

# Load item names and trait groupings
Names <- scan("http://sachaepskamp.com/files/BFIitems.txt",
              what = "character", sep = "\n")
Traits <- rep(c("Agreeableness", "Conscientiousness", "Extraversion",
                "Neuroticism", "Openness"), each = 5)


# ── QUESTION 1 ────────────────────────────────────────────────────────────────
#
# "In what conditions do you expect thresholding and/or pruning to perform
# well in recovering the true network structure?"
#
# THINK ABOUT THIS before reading the answer...
#
# ──────────────────────────────────────────────────────────────────────────────

# ANSWER:
#
# Thresholding/pruning work well when:
#
# 1. LARGE SAMPLE SIZE (n > 500)
#    - More power to detect true edges
#    - Significance tests are more reliable
#    - Edge weight estimates are more precise
#
# 2. MODERATE NUMBER OF VARIABLES
#    - Fewer comparisons = less severe multiple testing problem
#    - Each edge has sufficient observations
#
# 3. TRUE NETWORK IS NOT TOO SPARSE
#    - LASSO assumes sparsity, so it's better for sparse networks
#    - Thresholding/pruning don't make this assumption
#
# 4. EDGE WEIGHTS ARE REASONABLY STRONG
#    - Weak edges are hard to detect reliably
#    - Thresholding may miss weak but real effects


# ── QUESTION 2 ────────────────────────────────────────────────────────────────
#
# "Can you think of any situations in which a regularised estimation technique
# such as EBICglasso may underperform compared to the methods above?"
#
# THINK ABOUT THIS before reading the answer...
#
# ──────────────────────────────────────────────────────────────────────────────

# ANSWER:
#
# EBICglasso may underperform when:
#
# 1. SAMPLE SIZE IS VERY LARGE (n > 1000)
#    - Regularisation shrinks edge weights unnecessarily
#    - We have enough data to estimate precisely without shrinkage
#    - Edge weights will be biased downward
#
# 2. TRUE NETWORK IS DENSE
#    - LASSO assumes sparsity
#    - Dense networks violate this assumption
#    - Will miss true edges (false negatives)
#
# 3. MANY WEAK BUT REAL EDGES
#    - LASSO shrinks weak edges to exactly zero
#    - We may care about these weak effects
#
# The course recommends:
# - n < 500: Use EBICglasso
# - n > 500: Consider ggmModSelect


# ── QUESTION 3 ────────────────────────────────────────────────────────────────
#
# "Compute the partial correlation matrix using cor2pcor from qgraph."
#
# ──────────────────────────────────────────────────────────────────────────────

# Compute correlation matrix
cor_matrix <- cor(bfi_complete, use = "pairwise.complete.obs")

# Convert to partial correlations
pcor_matrix <- cor2pcor(cor_matrix)

cat("── Partial Correlation Matrix (first 5x5) ──\n")
print(round(pcor_matrix[1:5, 1:5], 3))


# ── QUESTION 4 ────────────────────────────────────────────────────────────────
#
# "Estimate an EBICglasso network using estimateNetwork with gamma = 0.5"
#
# ──────────────────────────────────────────────────────────────────────────────

cat("\n── EBICglasso Network ──\n")
net_glasso <- estimateNetwork(bfi_complete,
                               default = "EBICglasso",
                               tuning = 0.5)  # gamma = 0.5

# Visualise
qgraph(net_glasso$graph,
       layout = "spring",
       groups = Traits,
       title = "EBICglasso (gamma = 0.5)")


# ── QUESTION 5 ────────────────────────────────────────────────────────────────
#
# "Apply a significance threshold to the partial correlation matrix.
# Use alpha = 0.05 with Bonferroni correction."
#
# ──────────────────────────────────────────────────────────────────────────────

cat("\n── Thresholded Network ──\n")

# Number of tests (unique pairs in 25x25 matrix)
n_tests <- 25 * 24 / 2
n_obs <- nrow(bfi_complete)

# Bonferroni-corrected alpha
alpha_corrected <- 0.05 / n_tests
cat("Bonferroni-corrected alpha:", round(alpha_corrected, 6), "\n")

# Critical value for correlation (two-tailed)
# t = r * sqrt(n-2) / sqrt(1-r^2), so solve for r
t_crit <- qt(1 - alpha_corrected/2, df = n_obs - 2)
r_crit <- t_crit / sqrt(t_crit^2 + n_obs - 2)
cat("Critical correlation:", round(r_crit, 4), "\n")

# Apply threshold (set small partial correlations to 0)
pcor_thresholded <- pcor_matrix
pcor_thresholded[abs(pcor_matrix) < r_crit] <- 0

# Visualise
qgraph(pcor_thresholded,
       layout = "spring",
       groups = Traits,
       title = "Thresholded (Bonferroni)")


# ── QUESTION 6 ────────────────────────────────────────────────────────────────
#
# "Apply model-based pruning to the partial correlation matrix using
# the 'ggmModSelect' function with stepwise = TRUE."
#
# This method:
# 1. Starts with the full pcor matrix
# 2. Iteratively removes edges if it improves model fit (BIC)
#
# ──────────────────────────────────────────────────────────────────────────────

cat("\n── Pruned Network ──\n")
cat("Running model-based pruning (this may take a moment)...\n")

net_pruned <- estimateNetwork(bfi_complete,
                               default = "ggmModSelect",
                               stepwise = TRUE,
                               start = "pcor")  # Start from pcor matrix

qgraph(net_pruned$graph,
       layout = "spring",
       groups = Traits,
       title = "Pruned (ggmModSelect stepwise)")


# ── QUESTION 7 ────────────────────────────────────────────────────────────────
#
# "Estimate a ggmModSelect network WITHOUT using stepwise search
# (start from empty graph)."
#
# ──────────────────────────────────────────────────────────────────────────────

cat("\n── ggmModSelect (from empty) ──\n")
cat("Running ggmModSelect from empty graph...\n")

net_modselect <- estimateNetwork(bfi_complete,
                                  default = "ggmModSelect",
                                  stepwise = FALSE)

qgraph(net_modselect$graph,
       layout = "spring",
       groups = Traits,
       title = "ggmModSelect (from empty)")


# ── QUESTION 8 ────────────────────────────────────────────────────────────────
#
# "Count the number of edges in each of the four methods."
#
# ──────────────────────────────────────────────────────────────────────────────

# Function to count edges (non-zero entries in upper triangle)
count_edges <- function(adj_matrix) {
  sum(adj_matrix[upper.tri(adj_matrix)] != 0)
}

edges_glasso <- count_edges(net_glasso$graph)
edges_thresh <- count_edges(pcor_thresholded)
edges_pruned <- count_edges(net_pruned$graph)
edges_modsel <- count_edges(net_modselect$graph)

cat("\n── Edge Counts ──\n")
cat("EBICglasso:       ", edges_glasso, "edges\n")
cat("Thresholded:      ", edges_thresh, "edges\n")
cat("Pruned:           ", edges_pruned, "edges\n")
cat("ggmModSelect:     ", edges_modsel, "edges\n")
cat("\nNote: EBICglasso typically produces sparser networks due to LASSO penalty.\n")


# ── QUESTION 9 ────────────────────────────────────────────────────────────────
#
# "Based on what you learned, which method would you recommend for the
# BFI dataset (n = 2236 complete cases)?"
#
# Consider:
# - Sample size is large (n > 500)
# - 25 variables (moderate)
# - Goal is accurate edge weight estimation
#
# ──────────────────────────────────────────────────────────────────────────────

cat("\n── RECOMMENDATION ──\n")
cat("For the BFI dataset with n =", nrow(bfi_complete), ":\n\n")
cat("RECOMMENDED: ggmModSelect (non-regularised)\n\n")
cat("Reasons:\n")
cat("1. Large sample size (>500) means we don't need regularisation\n")
cat("2. Edge weights will be less biased without LASSO shrinkage\n")
cat("3. Model selection via EBIC is principled\n")
cat("4. With n>2000, we have excellent power to detect true edges\n\n")
cat("If sample was smaller (<500), EBICglasso would be preferred.\n")


# ┌──────────────────────────────────────────────────────────────────────────────
# │ PART 3: REPLICABILITY
# │ Afternoon Session - Practical 3 (03_Replicability.pdf)
# │ Topics: Bootstrap, simulation, NCT
# └──────────────────────────────────────────────────────────────────────────────

cat("\n")
cat("┌──────────────────────────────────────────────────────────────────────────────\n")
cat("│ PART 3: REPLICABILITY\n")
cat("│ Topics: Bootstrap, simulation, Network Comparison Test\n")
cat("└──────────────────────────────────────────────────────────────────────────────\n\n")

# ══════════════════════════════════════════════════════════════════════════════
# THEORY: Assessing Replicability
# ══════════════════════════════════════════════════════════════════════════════
#
# Problem: We have ONE dataset and ONE estimated network. How do we know:
# - Are the edges reliable?
# - Would we find the same structure with different data?
# - How accurate are our centrality measures?
#
# Tools for assessment:
#
# 1. BOOTSTRAP (bootnet package)
#    - Nonparametric: resample rows, re-estimate
#    - Case-dropping: drop 10%, 20%, ..., re-estimate
#    - Gives confidence intervals for edges and centrality
#
# 2. SIMULATION (netSimulator)
#    - Treat estimated network as "true"
#    - Generate data from it
#    - Re-estimate and compare to "true"
#    - Tests: If this WERE the true network, how well would we recover it?
#
# 3. REPLICATION SIMULATION (replicationSimulator)
#    - Similar but tests replication across two samples
#    - Would two studies with this N find the same edges?
#
# 4. NETWORK COMPARISON TEST (NCT)
#    - Compare networks from two groups (e.g., male vs female)
#    - Permutation test for global and edge-level differences
#
# ══════════════════════════════════════════════════════════════════════════════

# Use the EBICglasso network from Part 2
cat("Using BFI EBICglasso network from Part 2\n\n")


# ── QUESTION 1 ────────────────────────────────────────────────────────────────
#
# "Are the following statements true or false? Explain why."
#
# 1. "All things held equal, a larger sample size will result in a sparser
#     network."
#
# 2. "Suppose we estimate a network and assess its stability. We find that
#     the BCI of a specific edge weight is relatively wide and contains 0.
#     We can conclude that the edge is not significant."
#
# THINK ABOUT THIS before reading the answer...
#
# ──────────────────────────────────────────────────────────────────────────────

cat("── QUESTION 1: True or False? ──\n\n")

cat("Statement 1: 'Larger sample size -> sparser network'\n")
cat("ANSWER: FALSE\n")
cat("Explanation: Larger samples give MORE power to detect edges,\n")
cat("so networks typically become DENSER (more edges detected).\n")
cat("The sparsity assumption of LASSO doesn't change with n.\n\n")

cat("Statement 2: 'BCI contains 0 -> edge is not significant'\n")
cat("ANSWER: FALSE (careful with interpretation!)\n")
cat("Explanation: Bootstrap CIs are not the same as significance tests.\n")
cat("A BCI containing 0 means the edge weight is UNSTABLE across resamples,\n")
cat("not that it's 'not significant' in the frequentist sense.\n")
cat("Also, 'significance' is about population parameters; bootstrap is about\n")
cat("sample variability. Different questions!\n\n")


# ── QUESTION 2 ────────────────────────────────────────────────────────────────
#
# "Pretending your estimated network is the true network structure, investigate
# how well EBICglasso recovers the structure using netSimulator.
# Use sample sizes: 100, 500, 1000, 2500, 5000."
#
# ──────────────────────────────────────────────────────────────────────────────

cat("── Network Recovery Simulation ──\n")
cat("Running netSimulator (this may take several minutes)...\n")
cat("Testing sample sizes: 100, 500, 1000, 2500, 5000\n\n")

# Run simulation (reduce nReps for speed; use 100+ for publication)
sim_results <- netSimulator(net_glasso$graph,
                            default = "EBICglasso",
                            tuning = 0.5,
                            nCases = c(100, 500, 1000, 2500, 5000),
                            nReps = 10)  # Use 100 for publication

# Plot results
plot(sim_results)
title("Network Recovery by Sample Size")

# Summary
cat("\nSimulation complete. Key metrics:\n")
cat("- Sensitivity: proportion of true edges detected\n")
cat("- Specificity: proportion of true non-edges correctly absent\n")
cat("- Correlation: edge weight correlation with true values\n\n")
cat("As expected: all metrics improve with larger sample size.\n")


# ── QUESTION 3 ────────────────────────────────────────────────────────────────
#
# "Use replicationSimulator to investigate replicability of EBICglasso
# under threshold = TRUE and threshold = FALSE.
# Sample sizes: 100, 500, 1000, 2500, 5000."
#
# replicationSimulator tests: If we run two studies with the same N,
# how often do we find the same edges?
#
# ──────────────────────────────────────────────────────────────────────────────

cat("\n── Replication Simulation ──\n")
cat("Testing replicability at different sample sizes...\n")
cat("Comparing threshold = TRUE vs threshold = FALSE\n\n")

# Without threshold
rep_nothresh <- replicationSimulator(net_glasso$graph,
                                      default = "EBICglasso",
                                      tuning = 0.5,
                                      nCases = c(100, 500, 1000, 2500, 5000),
                                      nReps = 10)

# With threshold (more conservative)
rep_thresh <- replicationSimulator(net_glasso$graph,
                                    default = "EBICglasso",
                                    tuning = 0.5,
                                    threshold = TRUE,
                                    nCases = c(100, 500, 1000, 2500, 5000),
                                    nReps = 10)

# Plot comparison
par(mfrow = c(1, 2))
plot(rep_nothresh, main = "Replicability (no threshold)")
plot(rep_thresh, main = "Replicability (with threshold)")
par(mfrow = c(1, 1))

cat("\nInterpretation:\n")
cat("- threshold = TRUE: Only count edges as 'replicated' if significant in BOTH samples\n")
cat("- This is more conservative and shows lower replication rates\n")
cat("- Higher sample sizes -> better replication\n")


# ── QUESTION 4 ────────────────────────────────────────────────────────────────
#
# "Use NCT from the NetworkComparisonTest package to test if the network
# structure differs between men and women."
#
# NCT performs permutation tests for:
# - Global network structure (are the networks different overall?)
# - Global connectivity (is one network more strongly connected?)
# - Individual edges (which specific edges differ?)
#
# ──────────────────────────────────────────────────────────────────────────────

cat("\n── Network Comparison Test: Males vs Females ──\n")

# Split data by gender (1 = male, 2 = female in BFI)
bfi_males <- na.omit(bfi_items[bfi$gender == 1, ])
bfi_females <- na.omit(bfi_items[bfi$gender == 2, ])

cat("Males:", nrow(bfi_males), "observations\n")
cat("Females:", nrow(bfi_females), "observations\n\n")

# Estimate networks for each group
net_males <- estimateNetwork(bfi_males, default = "EBICglasso", corMethod = "cor")
net_females <- estimateNetwork(bfi_females, default = "EBICglasso", corMethod = "cor")

# Visualise side by side with same layout
L <- averageLayout(net_males, net_females)
Max <- max(abs(c(getWmat(net_males), getWmat(net_females))))

par(mfrow = c(1, 2))
plot(net_males, layout = L, title = "Males", maximum = Max, groups = Traits)
plot(net_females, layout = L, title = "Females", maximum = Max, groups = Traits)
par(mfrow = c(1, 1))

# Run NCT (this is computationally intensive!)
cat("\nRunning Network Comparison Test (may take several minutes)...\n")
cat("Using 100 permutations (use 1000 for publication)\n\n")

nct_result <- NCT(bfi_males, bfi_females,
                  it = 100,  # Use 1000 for publication
                  test.edges = TRUE,
                  test.centrality = TRUE,
                  centrality = c("strength"))

# Results
cat("── NCT Results ──\n\n")

cat("1. GLOBAL NETWORK STRUCTURE\n")
cat("   Tests whether the overall pattern of edges differs\n")
cat("   M statistic:", round(nct_result$nwinv.real, 4), "\n")
cat("   p-value:", round(nct_result$nwinv.pval, 4), "\n")
if (nct_result$nwinv.pval < 0.05) {
  cat("   -> Networks differ significantly in structure\n\n")
} else {
  cat("   -> No significant difference in network structure\n\n")
}

cat("2. GLOBAL CONNECTIVITY\n")
cat("   Tests whether one network is more strongly connected\n")
cat("   S statistic:", round(nct_result$glstrinv.real, 4), "\n")
cat("   p-value:", round(nct_result$glstrinv.pval, 4), "\n")
if (nct_result$glstrinv.pval < 0.05) {
  cat("   -> Networks differ significantly in connectivity\n\n")
} else {
  cat("   -> No significant difference in connectivity\n\n")
}

# Significant edge differences (if any)
sig_edges <- nct_result$einv.pvals[nct_result$einv.pvals$`p-value` < 0.05, ]
if (nrow(sig_edges) > 0) {
  cat("3. SIGNIFICANT EDGE DIFFERENCES\n")
  print(sig_edges)
} else {
  cat("3. No individual edges showed significant differences (p < 0.05)\n")
}


# ══════════════════════════════════════════════════════════════════════════════
# END OF DAY 2 PRACTICALS
# ══════════════════════════════════════════════════════════════════════════════

cat("\n")
cat("══════════════════════════════════════════════════════════════════════════════\n")
cat("  DAY 2 COMPLETE!\n")
cat("══════════════════════════════════════════════════════════════════════════════\n\n")

cat("KEY TAKEAWAYS:\n\n")

cat("PART 1 - ESTIMATION:\n")
cat("  - GGMs show PARTIAL correlations (controlling for other variables)\n")
cat("  - Partial cor = -K[i,j] / sqrt(K[i,i] * K[j,j]) where K = S^(-1)\n")
cat("  - Ising models handle binary data\n")
cat("  - Sensitivity/specificity assess edge recovery\n\n")

cat("PART 2 - MODEL SELECTION:\n")
cat("  - EBICglasso: regularised, best for n < 500\n")
cat("  - ggmModSelect: non-regularised, best for n > 500\n")
cat("  - Thresholding/pruning: alternatives that don't assume sparsity\n")
cat("  - gamma controls sparsity (higher = sparser)\n\n")

cat("PART 3 - REPLICABILITY:\n")
cat("  - Bootstrap: assess edge weight stability\n")
cat("  - CS-coefficient: assess centrality stability (need > 0.25)\n")
cat("  - netSimulator: test recovery with simulated data\n")
cat("  - NCT: compare networks between groups\n\n")

cat("══════════════════════════════════════════════════════════════════════════════\n")
