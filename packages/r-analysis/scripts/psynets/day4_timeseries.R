# ============================================================================
# PSYNETS DAY 4: TIME SERIES NETWORKS
# ============================================================================
# University of Amsterdam | January 29, 2026
#
# This script covers:
#   PART 1 (Morning): N=1 Time Series Networks
#     - graphicalVAR estimation
#     - psychonetrics GVAR with significance testing
#     - Detrending time series
#     - INIT network comparison across individuals
#     - Sample size simulation
#
#   PART 2 (Afternoon): N>1 and Time-Varying Networks
#     - Multilevel VAR (mlVAR)
#     - Panel GVAR (psychonetrics)
#     - Time-Varying VAR (mgm)
#
# Code patterns from: Exercise_timeseries_I.pdf & Exercise_timeseries_II.pdf
# NOTE: Day 4 has NO HTML tutorials - all code extracted directly from PDFs
# ============================================================================

# ============================================================================
# PART 0: SETUP AND PACKAGE INSTALLATION
# ============================================================================

# --- 0.1 Install Required Packages -------------------------------------------

# CRAN packages
required_packages <- c(
  "dplyr",
  "ggplot2",
  "patchwork",
  "qgraph",
  "graphicalVAR",
  "psychonetrics",
  "mlVAR",
  "mgm",
  "remotes"
)

# Install missing CRAN packages
for (pkg in required_packages) {
  if (!require(pkg, character.only = TRUE, quietly = TRUE)) {
    install.packages(pkg, dependencies = TRUE)
    library(pkg, character.only = TRUE)
  }
}

# INIT package from GitHub (developmental)
# From Exercise I, page 5-6
if (!require("INIT", quietly = TRUE)) {
  message("Installing INIT package from GitHub...")
  remotes::install_github("RiaHoekstra/INIT")
}

# --- 0.2 Load Libraries ------------------------------------------------------

library(dplyr)
library(ggplot2)
library(patchwork)
library(qgraph)
library(graphicalVAR)
library(psychonetrics)
library(mlVAR)
library(mgm)
library(INIT)

message("All packages loaded successfully!")

# --- 0.3 Set Paths -----------------------------------------------------------

# Data directory
data_dir <- here::here("packages/r-analysis/data/psynets")

# Morning data (symlinked from course materials)
morning_data_path <- file.path(data_dir, "day4-morning-data.RData")

if (!file.exists(morning_data_path)) {
  message("\n", paste(rep("=", 70), collapse = ""))
  message("DATA FILE MISSING: day4-morning-data.RData")
  message(paste(rep("=", 70), collapse = ""))
  message("\nThe COVID-19 ESM data (Fried et al., 2020) symlink not found.")
  message("Expected at: ", morning_data_path)
  message(paste(rep("=", 70), collapse = ""), "\n")

  morning_data_available <- FALSE
} else {
  morning_data_available <- TRUE
  message("Morning data found: ", morning_data_path)
}

# Panel data (should be symlinked)
panel_data_path <- file.path(data_dir, "day4-panel-data.RData")
if (file.exists(panel_data_path)) {
  message("Panel data found: ", panel_data_path)
} else {
  message("Warning: Panel data not found at expected path")
}


# ============================================================================
# PART 1: N=1 TIME SERIES NETWORKS (MORNING SESSION)
# ============================================================================
# Exercise I: "Estimating N=1 networks"
# Data: COVID-19 ESM study (Fried et al., 2020)
# - 80 Dutch students
# - 56 measurement occasions (4x daily for 2 weeks)
# - 14 items (mood, social, COVID-related)
# ============================================================================

if (morning_data_available) {

  message("\n", paste(rep("=", 70), collapse = ""))
  message("PART 1: N=1 TIME SERIES NETWORKS")
  message(paste(rep("=", 70), collapse = ""))

  # --- 1.1 Load and Explore Data ---------------------------------------------

  # Load the COVID-19 ESM data
  load(morning_data_path)

  # The data should contain a data frame (check structure)
  message("\nData structure:")
  str(clean_network)

  # Check available subjects
  subjects <- unique(clean_network$id)
  n_subjects <- length(subjects)
  message("\nNumber of subjects: ", n_subjects)
  message("Subject IDs: ", paste(head(subjects, 10), collapse = ", "), "...")

  # --- 1.2 Select Subject for Analysis ---------------------------------------

  # Interactive subject selection
  message("\nAvailable subjects: ", paste(subjects, collapse = ", "))

  # Default to first subject (can change interactively)
  selected_subject <- subjects[1]
  message("\nSelected subject for analysis: ", selected_subject)
  message("(Change 'selected_subject' variable to analyze different subject)")

  # Subset data for selected subject
  my_data <- clean_network %>%
    filter(id == selected_subject)

  message("\nObservations for subject ", selected_subject, ": ", nrow(my_data))

  # --- 1.3 Define Variables --------------------------------------------------

  # Get variable names (exclude id and time variables)
  all_vars <- colnames(my_data)
  message("\nAll variables in dataset:")
  print(all_vars)

  # Define variables for network analysis
  # Adjust based on actual column names in the data
  vars <- all_vars[!all_vars %in% c("id", "day", "beep", "conc", "time")]
  message("\nVariables for network analysis:")
  print(vars)

  # ============================================================================
  # Q1-Q2: CONCEPTUAL QUESTIONS
  # ============================================================================
  # Q1: Define ergodicity and its importance for N=1 analyses
  #
  # Ergodicity means that:
  # - The process has constant mean and variance over time (stationarity)
  # - Time averages equal ensemble averages
  # - What holds for the group also holds for individuals
  #
  # Importance: If process is non-ergodic, group-level findings may not
  # apply to individuals, making N=1 analysis essential.
  #
  # Q2: How to check stationarity?
  # - Visual inspection (plot time series)
  # - Statistical tests (ADF, KPSS)
  # - Check for trends in mean/variance over time
  # ============================================================================

  # --- 1.4 Visualize Time Series ---------------------------------------------

  # Plot time series for selected variables
  message("\nPlotting time series...")

  # Create time index if not present
  if (!"time_index" %in% colnames(my_data)) {
    my_data$time_index <- 1:nrow(my_data)
  }

  # Plot first few variables
  vars_to_plot <- vars[1:min(4, length(vars))]

  plots <- lapply(vars_to_plot, function(v) {
    ggplot(my_data, aes(x = time_index, y = .data[[v]])) +
      geom_line() +
      geom_smooth(method = "lm", se = FALSE, color = "red", linetype = "dashed") +
      labs(title = v, x = "Time", y = "Value") +
      theme_minimal()
  })

  # Combine plots
  combined_plot <- wrap_plots(plots, ncol = 2)
  print(combined_plot)

  # ============================================================================
  # Q3: GRAPHICAL VAR ESTIMATION
  # ============================================================================
  # From Exercise I, page 4
  # Estimate GVAR with gamma = 0 (no regularization on temporal)
  # ============================================================================

  message("\n--- Q3: graphicalVAR Estimation ---")

  # Estimate GVAR with gamma = 0
  # From Exercise I, page 4
  fit <- graphicalVAR(my_data[, vars], gamma = 0)

  message("graphicalVAR model estimated successfully")

  # Plot temporal (PDC) and contemporaneous (PCC) networks
  # From Exercise I, page 4
  L <- averageLayout(fit$PDC, fit$PCC)
  max_val <- max(abs(c(fit$PDC, fit$PCC)))

  # Set up plotting
  par(mfrow = c(1, 2))

  qgraph(fit$PDC,
         layout = L,
         maximum = max_val,
         title = "Temporal (PDC)",
         labels = vars)

  qgraph(fit$PCC,
         layout = L,
         maximum = max_val,
         title = "Contemporaneous (PCC)",
         labels = vars)

  par(mfrow = c(1, 1))

  message("\nInterpretation:")
  message("- PDC (Partial Directed Correlations): temporal/lagged effects")
  message("- PCC (Partial Contemporaneous Correlations): same-time associations")

  # ============================================================================
  # Q4: COMPARE TWO SUBJECTS
  # ============================================================================
  # Estimate networks for two different subjects and compare
  # ============================================================================

  message("\n--- Q4: Comparing Two Subjects ---")

  # Select second subject
  subject2 <- subjects[2]
  message("Comparing Subject ", selected_subject, " with Subject ", subject2)

  # Subset data for second subject
  my_data2 <- clean_network %>%
    filter(id == subject2)

  # Estimate GVAR for second subject
  fit2 <- graphicalVAR(my_data2[, vars], gamma = 0)

  # Compare networks visually
  # Use same layout for comparison
  L_compare <- averageLayout(fit$PDC, fit$PCC, fit2$PDC, fit2$PCC)
  max_val_compare <- max(abs(c(fit$PDC, fit$PCC, fit2$PDC, fit2$PCC)))

  par(mfrow = c(2, 2))

  qgraph(fit$PDC, layout = L_compare, maximum = max_val_compare,
         title = paste("Subject", selected_subject, "- Temporal"))
  qgraph(fit$PCC, layout = L_compare, maximum = max_val_compare,
         title = paste("Subject", selected_subject, "- Contemporaneous"))
  qgraph(fit2$PDC, layout = L_compare, maximum = max_val_compare,
         title = paste("Subject", subject2, "- Temporal"))
  qgraph(fit2$PCC, layout = L_compare, maximum = max_val_compare,
         title = paste("Subject", subject2, "- Contemporaneous"))

  par(mfrow = c(1, 1))

  message("\nNote: Individual networks can differ substantially!")
  message("This highlights the importance of N=1 analysis.")

  # ============================================================================
  # Q5-Q6: PSYCHONETRICS GVAR
  # ============================================================================
  # From Exercise I, page 4
  # Estimate saturated GVAR model with significance testing
  # ============================================================================

  message("\n--- Q5-Q6: psychonetrics GVAR ---")

  # Saturated model
  # From Exercise I, page 4
  mod <- gvar(my_data, vars = vars)
  mod <- mod %>% runmodel()

  message("psychonetrics GVAR model estimated")

  # Get network matrices
  PDC <- getmatrix(mod, "PDC")
  omega_zeta <- getmatrix(mod, "omega_zeta")

  message("\nPDC (Temporal) matrix:")
  print(round(PDC, 3))

  message("\nomega_zeta (Contemporaneous) matrix:")
  print(round(omega_zeta, 3))

  # Significance testing with confidence intervals
  # From Exercise I, page 4
  message("\nConfidence interval plot (CIplot):")
  CIplot(mod)

  # ============================================================================
  # Q7: PRUNING THE MODEL
  # ============================================================================
  # From Exercise I, page 4
  # Remove non-significant edges
  # ============================================================================

  message("\n--- Q7: Pruning ---")

  # Prune non-significant edges at alpha = 0.05
  # From Exercise I, page 4
  mod_pruned <- mod %>% prune(alpha = 0.05, recursive = FALSE)

  # Get pruned matrices
  PDC_pruned <- getmatrix(mod_pruned, "PDC")
  omega_zeta_pruned <- getmatrix(mod_pruned, "omega_zeta")

  # Compare saturated vs pruned
  par(mfrow = c(2, 2))

  qgraph(PDC, title = "Temporal (Saturated)", labels = vars)
  qgraph(PDC_pruned, title = "Temporal (Pruned)", labels = vars)
  qgraph(omega_zeta, title = "Contemporaneous (Saturated)", labels = vars)
  qgraph(omega_zeta_pruned, title = "Contemporaneous (Pruned)", labels = vars)

  par(mfrow = c(1, 1))

  # Model fit comparison
  message("\nModel comparison:")
  message("Saturated model fit:")
  print(fit_indices(mod))
  message("\nPruned model fit:")
  print(fit_indices(mod_pruned))

  # ============================================================================
  # Q8: DETRENDING
  # ============================================================================
  # From Exercise I, page 5
  # Check for and remove linear trends
  # ============================================================================

  message("\n--- Q8: Detrending ---")

  # Create concentration variable if needed (time indicator)
  if (!"conc" %in% colnames(my_data)) {
    my_data$conc <- 1:nrow(my_data)
  }

  # Check for trend in a variable (example: first variable)
  # Adjust variable name based on actual data
  trend_var <- vars[1]
  message("Checking for linear trend in: ", trend_var)

  # Fit linear model
  # From Exercise I, page 5
  formula_trend <- as.formula(paste(trend_var, "~ conc"))
  lm_trend <- lm(formula_trend, data = my_data)

  message("\nLinear trend test:")
  print(summary(lm_trend))

  # If significant trend (p < 0.05), detrend
  p_value_trend <- summary(lm_trend)$coefficients["conc", "Pr(>|t|)"]

  if (p_value_trend < 0.05) {
    message("\nSignificant trend detected (p = ", round(p_value_trend, 4), ")")
    message("Detrending the variable...")

    # Detrend by replacing with residuals
    # From Exercise I, page 5
    my_data[[trend_var]][!is.na(my_data[[trend_var]])] <- residuals(lm_trend)

    message("Variable detrended. Re-estimate network if needed.")
  } else {
    message("\nNo significant trend (p = ", round(p_value_trend, 4), ")")
    message("No detrending needed for this variable.")
  }

  # Visualize before/after detrending for illustration
  if (exists("my_data_original")) {
    p1 <- ggplot(my_data_original, aes(x = conc, y = .data[[trend_var]])) +
      geom_point() + geom_smooth(method = "lm") +
      labs(title = "Before Detrending")

    p2 <- ggplot(my_data, aes(x = conc, y = .data[[trend_var]])) +
      geom_point() + geom_smooth(method = "lm") +
      labs(title = "After Detrending")

    print(p1 + p2)
  }

  # ============================================================================
  # Q9: INIT - NETWORK COMPARISON ACROSS INDIVIDUALS
  # ============================================================================
  # From Exercise I, page 5-6
  # Compare N=1 networks across multiple individuals
  # ============================================================================

  message("\n--- Q9: INIT Network Comparison ---")

  # Select a subset of subjects for comparison
  n_compare <- min(5, n_subjects)
  subjects_compare <- subjects[1:n_compare]
  message("Comparing networks across ", n_compare, " subjects")

  # Prepare data for INIT (long format with id as first column)
  # Select subset of variables for faster computation
  vars_init <- vars[1:min(6, length(vars))]

  data_init <- clean_network %>%
    filter(id %in% subjects_compare) %>%
    select(id, all_of(vars_init))

  message("Variables for INIT analysis: ", paste(vars_init, collapse = ", "))

  # Run INIT
  # From Exercise I, page 5-6
  # Basic usage
  message("\nRunning INIT analysis (this may take a moment)...")

  res_init <- INIT(data = data_init,
                   idvar = "id",
                   vars = vars_init,
                   estimator = "FIML",
                   network_type = "pruned",
                   homogeneity_test = "temporal",
                   save_models = TRUE)

  message("\nINIT Results:")
  print(res_init)

  # Interpretation
  message("\nInterpretation:")
  message("- Homogeneity test: Are networks similar across individuals?")
  message("- If p < 0.05: Networks differ significantly between individuals")
  message("- Individual network plots show person-specific patterns")

  # ============================================================================
  # Q10: SAMPLE SIZE SIMULATION
  # ============================================================================
  # From Exercise I, page 7-8
  # Determine required sample size for detecting network structure
  # ============================================================================

  message("\n--- Q10: Sample Size Simulation ---")

  # Generate a random GVAR model as "true" model
  # From Exercise I, page 7-8
  set.seed(5)
  true_model <- randomGVARmodel(6, probKappaEdge = 0.6)

  message("True model generated with 6 variables")

  # Plot the true model
  par(mfrow = c(1, 2))
  qgraph(true_model$PDC, title = "True Temporal", layout = "circle")
  qgraph(true_model$PCC, title = "True Contemporaneous", layout = "circle")
  par(mfrow = c(1, 1))

  # Simulate data with different sample sizes
  sample_sizes <- c(50, 100, 200, 500)
  message("\nSimulating data with sample sizes: ", paste(sample_sizes, collapse = ", "))

  # Store results
  sim_results <- list()

  for (n in sample_sizes) {
    message("  Simulating n = ", n, "...")

    # Simulate data from true model
    # From Exercise I, page 7-8
    var_data <- graphicalVARsim(nTime = n,
                                 beta = true_model$beta,
                                 kappa = true_model$kappa)

    # Estimate model from simulated data
    fit_sim <- graphicalVAR(var_data, gamma = 0)

    # Store results
    sim_results[[as.character(n)]] <- fit_sim
  }

  # Compare recovered networks at different sample sizes
  par(mfrow = c(2, length(sample_sizes)))

  for (i in seq_along(sample_sizes)) {
    n <- sample_sizes[i]
    qgraph(sim_results[[as.character(n)]]$PDC,
           title = paste("Temporal n=", n),
           layout = "circle")
  }

  for (i in seq_along(sample_sizes)) {
    n <- sample_sizes[i]
    qgraph(sim_results[[as.character(n)]]$PCC,
           title = paste("Contemp n=", n),
           layout = "circle")
  }

  par(mfrow = c(1, 1))

  message("\nConclusion: Larger sample sizes recover true structure more accurately")
  message("Recommended: At least 100 time points for stable estimation")

} else {
  message("\n", paste(rep("-", 70), collapse = ""))
  message("SKIPPING PART 1: Morning data not available")
  message("Please download clean_network.RData from OSF and re-run")
  message(paste(rep("-", 70), collapse = ""), "\n")
}


# ============================================================================
# PART 2: N>1 AND TIME-VARYING NETWORKS (AFTERNOON SESSION)
# ============================================================================
# Exercise II: "Estimating N>1 and time-varying networks"
# ============================================================================

message("\n", paste(rep("=", 70), collapse = ""))
message("PART 2: N>1 AND TIME-VARYING NETWORKS")
message(paste(rep("=", 70), collapse = ""))

# ============================================================================
# Q1-Q2: CONCEPTUAL QUESTIONS
# ============================================================================
# Q1: Between-subjects vs within-subjects effects
#
# Between-subjects: Differences across individuals (trait-like)
#   - Does having more anxiety correlate with more depression across people?
#
# Within-subjects: Changes within individuals over time (state-like)
#   - When person X has more anxiety, do they also have more depression?
#
# These can differ! (Simpson's paradox)
#
# Q2: Stationarity in multilevel context
# - Assumes process is stable within individuals
# - Mean/variance constant over time for each person
# - Important for valid VAR estimation
# ============================================================================

# ============================================================================
# Q3-Q5: MULTILEVEL VAR (mlVAR)
# ============================================================================
# From Exercise II, page 3
# Estimate VAR model accounting for person-level heterogeneity
# ============================================================================

message("\n--- Q3-Q5: Multilevel VAR (mlVAR) ---")

# Check if morning data available for mlVAR
if (morning_data_available) {

  # Prepare data for mlVAR
  # Need: id, beep, day, and variables
  Data2 <- clean_network

  # Check required columns
  required_cols <- c("id", "beep", "day")
  missing_cols <- required_cols[!required_cols %in% colnames(Data2)]

  if (length(missing_cols) > 0) {
    message("Warning: Missing columns for mlVAR: ", paste(missing_cols, collapse = ", "))
    message("Creating placeholder columns...")

    if (!"beep" %in% colnames(Data2)) {
      Data2 <- Data2 %>%
        group_by(id) %>%
        mutate(beep = row_number()) %>%
        ungroup()
    }
    if (!"day" %in% colnames(Data2)) {
      Data2$day <- ceiling(Data2$beep / 4)  # Assuming 4 beeps per day
    }
  }

  # Select subset of variables for faster estimation
  vars_mlvar <- vars[1:min(6, length(vars))]
  message("Variables for mlVAR: ", paste(vars_mlvar, collapse = ", "))

  # Estimate mlVAR
  # From Exercise II, page 3
  message("\nEstimating mlVAR model (this may take a while)...")

  fit_mlvar <- mlVAR(Data2,
                     vars = vars_mlvar,
                     idvar = "id",
                     beepvar = "beep",
                     dayvar = "day",
                     lags = 1,
                     temporal = "correlated")  # or "orthogonal"

  message("mlVAR model estimated successfully")

  # --- Q4: Plot Networks ---
  # From Exercise II, page 3

  message("\n--- Q4: Network Plots ---")

  # Temporal network (fixed effects)
  plot(fit_mlvar, type = "temporal", layout = "circle", alpha = 0.05)
  title("Temporal Network (Fixed Effects)")

  # Contemporaneous network
  plot(fit_mlvar, type = "contemporaneous", layout = "circle",
       alpha = 0.05, rule = "and")
  title("Contemporaneous Network")

  # Between-subjects network
  plot(fit_mlvar, type = "between", layout = "circle",
       alpha = 0.05, rule = "and")
  title("Between-Subjects Network")

  # --- Q5: Individual Differences ---
  # From Exercise II, page 3

  message("\n--- Q5: Individual Differences ---")

  # Plot with standard deviations (random effects)
  par(mfrow = c(1, 2))

  plot(fit_mlvar, type = "temporal", SD = TRUE)
  title("Temporal with Individual Variation")

  plot(fit_mlvar, type = "contemporaneous", SD = TRUE)
  title("Contemporaneous with Individual Variation")

  par(mfrow = c(1, 1))

  message("\nInterpretation:")
  message("- Thicker edges = larger random effects variance")
  message("- More variation = more individual differences in that connection")

} else {
  message("Skipping mlVAR: Morning data not available")
  message("Download clean_network.RData from OSF to run mlVAR")
}

# ============================================================================
# Q6-Q7: PANEL GVAR (psychonetrics)
# ============================================================================
# From Exercise II, page 4-5
# For panel data with few time points but many subjects
# Data: McBride et al. (2020) - 9 time points, 6 variables
# ============================================================================

message("\n--- Q6-Q7: Panel GVAR ---")

# Load panel data
if (file.exists(panel_data_path)) {

  load(panel_data_path)
  message("Panel data loaded successfully")

  # Check structure
  message("\nPanel data structure:")
  str(panel_data)
  message("\nDimensions: ", nrow(panel_data), " subjects x ", ncol(panel_data), " columns")

  # The panel data is in WIDE format
  # Columns: id, then 9 timepoints x 6 variables = 54 variable columns
  # From Exercise II, page 4-5

  # Create design matrix for variable names
  # Assumes column structure: id, var1_t1, var2_t1, ..., var6_t1, var1_t2, ..., var6_t9
  varnames <- colnames(panel_data)[2:ncol(panel_data)]

  # Check number of variable columns
  n_var_cols <- length(varnames)
  message("\nNumber of variable columns: ", n_var_cols)

  # Assuming 9 time points and 6 variables
  n_timepoints <- 9
  n_vars_panel <- 6

  if (n_var_cols == n_timepoints * n_vars_panel) {
    message("Data structure confirmed: ", n_timepoints, " time points x ", n_vars_panel, " variables")

    # Create design matrix
    # From Exercise II, page 4-5
    # Matrix rows = time points, columns = variables
    designvars <- matrix(varnames, nrow = n_timepoints, ncol = n_vars_panel)

    message("\nDesign matrix (rows = time, cols = variables):")
    print(designvars)

    # Estimate panel GVAR
    # From Exercise II, page 4-5
    message("\nEstimating panel GVAR model...")

    mod_panel <- panelgvar(panel_data, vars = designvars)
    mod_panel <- mod_panel %>% runmodel()

    message("Panel GVAR model estimated")

    # Prune
    # From Exercise II, page 4-5
    mod_panel_pruned <- mod_panel %>% prune(alpha = 0.05, recursive = FALSE)

    # Get matrices
    PDC_panel <- getmatrix(mod_panel_pruned, "PDC")
    omega_zeta_panel <- getmatrix(mod_panel_pruned, "omega_zeta")  # within-subjects contemporaneous
    omega_eta_panel <- getmatrix(mod_panel_pruned, "omega_eta")    # between-subjects

    # Plot networks
    par(mfrow = c(1, 3))

    qgraph(PDC_panel, title = "Temporal (PDC)", layout = "circle")
    qgraph(omega_zeta_panel, title = "Contemporaneous (within)", layout = "circle")
    qgraph(omega_eta_panel, title = "Between-Subjects", layout = "circle")

    par(mfrow = c(1, 1))

    # Model fit
    message("\nModel fit indices:")
    print(fit_indices(mod_panel_pruned))

  } else {
    message("Warning: Unexpected number of columns. Check data structure.")
    message("Expected: ", n_timepoints * n_vars_panel, ", Got: ", n_var_cols)
  }

} else {
  message("Panel data file not found at: ", panel_data_path)
  message("Check symlink or provide correct path")
}

# ============================================================================
# Q8-Q9: TIME-VARYING VAR (mgm)
# ============================================================================
# From Exercise II, page 5-6
# Estimate VAR where parameters change over time
# Data: symptom_data from mgm package (built-in)
# ============================================================================

message("\n--- Q8-Q9: Time-Varying VAR ---")

# Load built-in data
# From Exercise II, page 5-6
data(symptom_data)

message("symptom_data loaded from mgm package")
message("\nData structure:")
str(symptom_data, max.level = 1)

# The data object contains:
# - data: the actual measurements
# - type: variable types (e.g., "g" for Gaussian)
# - level: number of levels (1 for continuous)
# - colnames: variable names
# - groups: variable groupings

# Subset to mood variables (as per Exercise)
# From Exercise II, page 5-6
selection_ind <- c(which(symptom_data$groups == "Mood"),
                   which(symptom_data$colnames %in% c("Action", "Who with")))

message("\nSelected variables for TV-VAR:")
print(symptom_data$colnames[selection_ind])

# Create subset
symptom_data_short <- list(
  data = symptom_data$data[, selection_ind],
  type = symptom_data$type[selection_ind],
  level = symptom_data$level[selection_ind],
  colnames = symptom_data$colnames[selection_ind]
)

message("\nNumber of observations: ", nrow(symptom_data_short$data))
message("Number of variables: ", ncol(symptom_data_short$data))

# Fit time-varying VAR
# From Exercise II, page 5-6
message("\nEstimating time-varying VAR (this may take several minutes)...")

fit_tvvar <- tvmvar(data = symptom_data_short$data,
                    type = symptom_data_short$type,
                    level = symptom_data_short$level,
                    lambdaSel = "CV",
                    lambdaFolds = 10,
                    beepvar = symptom_data$data_time$beepno,
                    dayvar = symptom_data$data_time$dayno,
                    bandwidth = 0.15,
                    estpoints = seq(0, 1, length = 10))

message("Time-varying VAR model estimated")

# Plot networks at different estimation points
# From Exercise II, page 5-6
# Note: Need to transpose matrices for qgraph!

message("\nPlotting networks at different time points...")

# Number of estimation points
n_estpoints <- dim(fit_tvvar$wadj)[3]
message("Number of estimation points: ", n_estpoints)

# Plot at 3 time points (early, middle, late)
plot_points <- c(1, ceiling(n_estpoints/2), n_estpoints)

par(mfrow = c(1, length(plot_points)))

for (i in plot_points) {
  # Need to transpose for qgraph!
  # From Exercise II, page 5-6
  qgraph(t(fit_tvvar$wadj[,,i]),
         edge.color = t(fit_tvvar$edgecolor[,,i]),
         labels = symptom_data_short$colnames,
         title = paste("Estimation Point", i))
}

par(mfrow = c(1, 1))

# --- Q9: Interpretation ---

message("\n--- Q9: Interpretation ---")
message("\nTime-varying VAR results:")
message("- Networks change across the study period")
message("- Some edges appear/disappear over time")
message("- Edge strength may vary")
message("\nThis captures non-stationarity in the network structure")


# ============================================================================
# SESSION SUMMARY
# ============================================================================

message("\n", paste(rep("=", 70), collapse = ""))
message("DAY 4 SESSION COMPLETE")
message(paste(rep("=", 70), collapse = ""))

message("\nKey takeaways:")
message("1. N=1 networks reveal individual-specific patterns")
message("2. psychonetrics allows significance testing and pruning")
message("3. INIT compares networks across individuals")
message("4. mlVAR separates within and between-subject effects")
message("5. Panel GVAR handles wide-format panel data")
message("6. Time-varying VAR captures network changes over time")

message("\nPackages used: graphicalVAR, psychonetrics, INIT, mlVAR, mgm")
message("\nSession complete!")
