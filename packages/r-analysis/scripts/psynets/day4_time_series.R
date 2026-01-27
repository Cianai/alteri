# PSYNETS Day 4: Time Series Data
# Instructor: Ria Hoekstra
# Topics: GVAR, N=1 Networks, mlVAR, Panel VAR, Time-varying VAR
# Date: 2026-01-29

# ═══════════════════════════════════════════════════════════════
# Setup
# ═══════════════════════════════════════════════════════════════

library(here)
set.seed(2026)

# Core packages for Day 4
library(dplyr)            # Data manipulation
library(graphicalVAR)     # Graphical VAR for N=1
library(psychonetrics)    # Multi-group and panel VAR
library(qgraph)           # Network visualisation
library(patchwork)        # Plot composition
library(ggplot2)          # Plotting
library(mlVAR)            # Multilevel VAR
library(mgm)              # Mixed graphical models, time-varying

# Optional: INIT package (GitHub)
if (requireNamespace("INIT", quietly = TRUE)) {
  library(INIT)
  cat("INIT package loaded (Individual Network Invariance Test)\n")
} else {
  cat("Note: INIT package not installed. Install with:\n")
  cat("  remotes::install_github('RiaHoekstra/INIT')\n\n")
}

cat("═══════════════════════════════════════════════════════════════\n")
cat("  PSYNETS Day 4: Time Series Data\n")
cat("  Packages loaded successfully\n")
cat("═══════════════════════════════════════════════════════════════\n\n")

# ═══════════════════════════════════════════════════════════════
# Morning Session: GVAR for N=1 Data
# ═══════════════════════════════════════════════════════════════

# --- Exercise 1: COVID-19 ESM Data (Fried et al., 2020) ---

# Note: Data needs to be downloaded from OSF
# https://osf.io/mvdpe/
cat("Morning session: GVAR with COVID-19 ESM data\n")
cat("Data source: https://osf.io/mvdpe/ (Fried et al., 2020)\n\n")

# Simulated example structure (replace with actual data)
# The COVID data has: date, participant ID, and symptom ratings

# --- graphicalVAR for single-subject analysis ---

# Generate example data for demonstration
n_timepoints <- 100
n_vars <- 5
var_names <- c("Anxiety", "Sadness", "Fatigue", "Sleep", "Concentration")

# Simulated VAR(1) data
example_data <- matrix(rnorm(n_timepoints * n_vars), ncol = n_vars)
colnames(example_data) <- var_names

# Fit graphical VAR
cat("Fitting graphical VAR model...\n")
gvar_fit <- graphicalVAR(example_data,
                          gamma = 0,      # No regularisation (exploratory)
                          nLambda = 50)   # Lambda sequence length

# Extract networks
# Temporal network (lagged effects)
temporal_net <- gvar_fit$beta
# Contemporaneous network (same-time associations)
contemp_net <- gvar_fit$kappa

# Visualise both networks
par(mfrow = c(1, 2))
qgraph(temporal_net, layout = "circle",
       title = "Temporal Network (VAR coefficients)",
       labels = var_names)
qgraph(contemp_net, layout = "circle",
       title = "Contemporaneous Network",
       labels = var_names)
par(mfrow = c(1, 1))

# ═══════════════════════════════════════════════════════════════
# Afternoon Session: Multilevel VAR & Panel Data
# ═══════════════════════════════════════════════════════════════

# --- Exercise 2: Panel Data Analysis ---

# Load panel data from course materials
data_path <- here("data", "psynets", "day4-panel-data.RData")
if (file.exists(data_path)) {
  load(data_path)
  cat("\nPanel data loaded from course materials\n")
  # Data object name may vary - check with ls()
} else {
  cat("\nNote: Panel data not available. Using simulated example.\n")
}

# --- mlVAR for multilevel analysis ---

cat("\n───────────────────────────────────────────────────────────────\n")
cat("Multilevel VAR: Combining multiple individuals\n")
cat("───────────────────────────────────────────────────────────────\n\n")

# mlVAR requires: beep, day, id, and symptom variables
# Example structure:
# mlvar_fit <- mlVAR(data,
#                    vars = symptom_vars,
#                    idvar = "id",
#                    dayvar = "day",
#                    beepvar = "beep",
#                    lags = 1)

# --- psychonetrics: Panel GVAR ---

cat("Panel GVAR with psychonetrics...\n")

# panelgvar() for panel data with 2+ waves
# gvar() for continuous-time or multi-group analysis

# --- Time-varying VAR with mgm ---

cat("\n───────────────────────────────────────────────────────────────\n")
cat("Time-varying VAR: Detecting non-stationarity\n")
cat("───────────────────────────────────────────────────────────────\n\n")

# tvmvar() for time-varying mixed VAR
# Useful for detecting changes in network structure over time
# tv_fit <- tvmvar(data,
#                  type = rep("g", ncol(data)),  # Gaussian
#                  level = rep(1, ncol(data)),
#                  lambdaSel = "CV",
#                  timepoints = 1:nrow(data))

# ═══════════════════════════════════════════════════════════════
# Optional: INIT - Individual Network Invariance Test
# ═══════════════════════════════════════════════════════════════

if (requireNamespace("INIT", quietly = TRUE)) {
  cat("\n───────────────────────────────────────────────────────────────\n")
  cat("INIT: Testing individual network invariance\n")
  cat("───────────────────────────────────────────────────────────────\n\n")

  # INIT tests whether network structure is invariant across individuals
  # If not, using group-level networks may be misleading

  # init_result <- INIT(data, id = "id", ...)
}

cat("\n═══════════════════════════════════════════════════════════════\n")
cat("  Day 4 script complete. Key concepts:\n")
cat("  - GVAR: Graphical VAR = Temporal + Contemporaneous networks\n")
cat("  - Temporal network: Lagged effects (what predicts what tomorrow?)\n")
cat("  - Contemporaneous: Same-time partial correlations\n")
cat("  - mlVAR: Multilevel VAR for ESM data (multiple individuals)\n")
cat("  - Panel GVAR: Two+ waves, latent variable approach\n")
cat("  - Time-varying: Network changes over time (non-stationarity)\n")
cat("═══════════════════════════════════════════════════════════════\n")
