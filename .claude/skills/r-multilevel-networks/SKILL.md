# R Multilevel Network Analysis

Domain expertise for psychological network analysis, egocentric networks, and multilevel modelling in R.

## When to Use

Invoke when:
- Implementing network analysis with bootnet, qgraph, psychonetrics
- Working with egocentric/personal network data (egor, ergm.ego)
- Running multilevel VAR models (mlVAR, graphicalVAR)
- Interpreting centrality measures or network stability
- Handling igraph/statnet package conflicts

## Package Ecosystem

### Psychological Networks (PsyNets)
| Package | Purpose | Key Functions |
|---------|---------|---------------|
| `bootnet` | Network estimation and stability | `estimateNetwork()`, `bootnet()`, `corStability()` |
| `qgraph` | Network visualisation | `qgraph()`, `centrality_auto()` |
| `psychonetrics` | Confirmatory network analysis | `ggm()`, `prune()`, `stepup()` |
| `BGGM` | Bayesian GGM estimation | `estimate()`, `select()`, `compare()` |
| `NetworkComparisonTest` | Statistical comparison | `NCT()` |
| `EGAnet` | Exploratory graph analysis | `EGA()`, `bootEGA()` |

### Egocentric Networks (UAB Barcelona)
| Package | Purpose | Key Functions |
|---------|---------|---------------|
| `egor` | Ego network data structures | `as_egor()`, `activate()`, `ego_density()` |
| `ergm.ego` | ERGMs for ego data | `ergm.ego()` |
| `intergraph` | Object conversion | `asNetwork()`, `asIgraph()` |

### Multilevel/Longitudinal
| Package | Purpose | Key Functions |
|---------|---------|---------------|
| `mlVAR` | Multilevel VAR | `mlVAR()` with `temporal`, `contemporaneous`, `between` |
| `graphicalVAR` | Graphical VAR | `graphicalVAR()` |
| `lme4` | Mixed-effects models | `lmer()`, `glmer()` |
| `gimme` | Group iterative estimation | `gimme()` |

## Critical Patterns

### 1. Package Conflict Resolution

igraph and statnet define conflicting functions. Always use explicit namespaces:

```r
# WRONG - ambiguous
library(igraph)
library(sna)
degree(g)  # Which degree()?

# CORRECT - explicit namespaces
igraph::degree(g)
sna::degree(net)

# OR load one at a time
detach("package:igraph", unload = TRUE)
library(sna)
```

Conflicting functions: `degree()`, `betweenness()`, `closeness()`, `components()`, `path.length()`

### 2. Network Stability Analysis (MANDATORY)

Before interpreting any network, run stability analysis:

```r
# Case-dropping bootstrap for centrality stability
boot_case <- bootnet(network, nBoots = 1000, nCores = 8, type = "case")
cs_coef <- corStability(boot_case)

# Interpretation thresholds:
# CS(cor=0.7) < 0.25 → DO NOT interpret centrality
# CS(cor=0.7) >= 0.25 → Interpret with caution
# CS(cor=0.7) >= 0.50 → Preferred for stable interpretation

# Edge accuracy (non-parametric bootstrap)
boot_edge <- bootnet(network, nBoots = 1000, nCores = 8, type = "nonparametric")
plot(boot_edge, order = "sample", labels = FALSE)
```

### 3. Reproducibility Requirements

All stochastic operations MUST include seed setting:

```r
# ALWAYS set seed before:
set.seed(42)  # Or any fixed seed

# - Bootstrap operations
boot_results <- bootnet(network, nBoots = 1000)

# - Network estimation (some methods use random starts)
network <- estimateNetwork(data, default = "EBICglasso")

# - mlVAR (uses random effects)
fit <- mlVAR(data, vars = vars, idvar = "id")

# - Any simulation or resampling
sample_data <- data[sample(nrow(data), 100), ]
```

### 4. Path Management

Never use hardcoded paths. Use `here::here()`:

```r
# WRONG
setwd("/Users/cian/project")
data <- read.csv("data/raw.csv")

# CORRECT
library(here)
data <- read.csv(here("data", "raw.csv"))
output_path <- here("output", "network_plot.png")
```

## Decision Points Requiring Human Judgment

These decisions CANNOT be automated and must be flagged for researcher review:

### 1. Node Selection
> "Node selection is primarily driven by substantive/theoretical considerations, not methodology."

The boundary specification problem means centrality becomes invalid if important nodes are excluded. AI should implement networks but flag node selection for domain expert review.

### 2. Centrality Interpretation
Bringmann et al. (2019) concluded:
> "Betweenness and closeness centrality are especially unsuitable as measures of node importance in psychological networks."

Why: Psychological processes don't follow shortest-path information flow assumptions. A "central" node may be a common effect (collider) with no causal influence.

**Recommendation**: Report strength centrality; interpret betweenness/closeness only with strong theoretical justification.

### 3. EBIC Gamma (γ) Parameter
| γ Value | Effect | When to Use |
|---------|--------|-------------|
| 0.5 | Higher specificity (default) | Confirmatory, sparse networks |
| 0.25 | Balanced | General purpose |
| 0 | Higher sensitivity | Discovery, dense networks |

### 4. Regularised vs Non-Regularised Estimation

| Condition | Method | Reason |
|-----------|--------|--------|
| n < 500 or p > 30 | EBICglasso (regularised) | Insufficient data for non-regularised |
| n > 500 and p < 50 | ggmModSelect (non-regularised) | Williams et al. (2019) showed better performance |
| Bayesian preferred | BGGM | Full uncertainty quantification |

## Reporting Standards (Burger et al. 2022)

Methods must include:
- [ ] Sample size and selection criteria
- [ ] Instruments with version numbers
- [ ] Estimation algorithm with all parameters (including defaults)
- [ ] Number and type of bootstrap samples
- [ ] R version and all package versions

Results must include:
- [ ] Accuracy and stability check results (CS-coefficient, CI plots)
- [ ] Network density
- [ ] Smallest and largest edge weights
- [ ] Layout algorithm used
- [ ] For centrality: raw scores + CS-coefficient

## Extended Thinking for Statistical Reasoning

Use extended thinking patterns for complex statistical decisions:

```
"think" - Standard reasoning for method selection
"think hard" - Complex decisions involving multiple trade-offs
"ultrathink" - Novel methodological questions requiring deep analysis
```

Example triggers:
- Choosing between regularised and non-regularised methods
- Interpreting unexpected centrality patterns
- Diagnosing model convergence issues
- Evaluating assumption violations

## Common Error Patterns

### "Empty network was selected"
```r
# EBIC regularisation shrunk all edges to zero
# Solution: reduce gamma or use BIC
network <- estimateNetwork(data, default = "EBICglasso", tuning = 0)  # γ = 0
```

### "'what' must be a function or character string"
```r
# Passing raw data to bootnet instead of estimateNetwork result
# WRONG
boot <- bootnet(raw_data)

# CORRECT
network <- estimateNetwork(raw_data, default = "EBICglasso")
boot <- bootnet(network, nBoots = 1000)
```

### mlVAR Convergence Issues
```r
# Complex random effects fail to converge
# Solution: simplify temporal structure
fit <- mlVAR(data, vars = vars, idvar = "id",
             temporal = "fixed",  # Instead of "correlated"
             contemporaneous = "orthogonal")
```

### Non-Positive Definite Matrix
```r
# Caused by pairwise deletion with missing data
# Solution 1: Use FIML
network <- estimateNetwork(data, default = "EBICglasso", missing = "fiml")

# Solution 2: Multiple imputation
library(mice)
imp <- mice(data, m = 5)
```

## References

- Epskamp, S., & Fried, E. I. (2018). A tutorial on regularized partial correlation networks. *Psychological Methods*.
- Borsboom, D., et al. (2021). Network analysis of multivariate data in psychological science. *Nature Reviews Methods Primers*.
- Bringmann, L. F., et al. (2019). What do centrality measures measure in psychological networks? *Journal of Abnormal Psychology*.
- Burger, J., et al. (2022). Reporting standards for psychological network analyses in cross-sectional data. *Psychological Methods*.
- Williams, D. R., & Rast, P. (2019). Back to the basics: Rethinking partial correlation network methodology. *British Journal of Mathematical and Statistical Psychology*.
