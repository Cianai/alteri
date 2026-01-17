---
description: Run network analysis workflows with stability checks
allowed-tools: Bash(Rscript*), Bash(R*)
argument-hint: [analysis-script]
---

Execute network analysis scripts with automatic stability verification.

## Usage

```
/r-network estimate    # Run network estimation
/r-network stability   # Run stability analysis
/r-network compare     # Run network comparison
```

## Commands

```bash
cd packages/r-analysis

# Run network estimation with stability checks
Rscript -e "
  set.seed(42)  # Reproducibility

  # Source the analysis script
  source('scripts/$ARGS.R')

  # Verify CS-coefficient if bootstrap results exist
  if (exists('boot_case')) {
    cs <- corStability(boot_case)
    cat('\n=== Stability Check ===\n')
    cat('CS-coefficient (strength):', cs['strength'], '\n')
    if (cs['strength'] < 0.25) {
      cat('WARNING: Centrality should NOT be interpreted (CS < 0.25)\n')
    } else if (cs['strength'] < 0.5) {
      cat('CAUTION: Interpret centrality with care (0.25 <= CS < 0.5)\n')
    } else {
      cat('OK: Centrality interpretation acceptable (CS >= 0.5)\n')
    }
  }
"

# Quick network visualisation
Rscript -e "
  library(qgraph)
  library(bootnet)

  # Load data
  data <- read.csv(here::here('data', 'processed', '$ARGS.csv'))

  # Estimate network
  set.seed(42)
  net <- estimateNetwork(data, default = 'EBICglasso', tuning = 0.5)

  # Plot
  pdf(here::here('outputs', '$ARGS_network.pdf'), width = 10, height = 10)
  plot(net, layout = 'spring', labels = TRUE)
  dev.off()

  cat('Network saved to outputs/$ARGS_network.pdf\n')
"
```

## Pre-flight Checklist

Before running network analysis, ensure:
1. [ ] Data is cleaned and documented
2. [ ] Variables selected have theoretical justification
3. [ ] Missing data strategy decided (FIML vs imputation)
4. [ ] EBIC gamma parameter chosen (default 0.5)
5. [ ] Seed set for reproducibility

## Notes

- All network scripts must include `set.seed()` at the start
- Bootstrap samples: minimum 1000, recommend 2500 for publication
- Always check CS-coefficient before interpreting centrality
- Flag node selection decisions for domain expert review
