---
description: Run R package tests with testthat
allowed-tools: Bash(Rscript*), Bash(R*)
argument-hint: [test-file-pattern]
---

Run testthat tests for the r-analysis package.

## Usage

```
/r-test              # Run all tests
/r-test network      # Run tests matching "network"
/r-test stability    # Run tests matching "stability"
```

## Commands

```bash
cd packages/r-analysis

# Run all tests
Rscript -e "testthat::test_dir('tests')"

# Run specific test file or pattern
Rscript -e "testthat::test_file('tests/testthat/test-$ARGS.R')"

# With verbose output
Rscript -e "testthat::test_dir('tests', reporter = 'progress')"
```

## Notes

- Tests should be in `packages/r-analysis/tests/testthat/`
- Test files must start with `test-`
- Use `set.seed()` in tests for reproducibility
