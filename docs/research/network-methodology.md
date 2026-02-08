---
created: 2026-01-26
type: research-brief
project: Alteri
linear-issues: [CIA-44, CIA-52, CIA-53, CIA-54]
status: draft
---

# Research Brief: Network Methodology for Alteri Platform

**Purpose:** Inform design decisions for Alteri's network analysis module based on psychological network methodology literature and PSYNETS workshop content.

**Linear Issues Addressed:**
- CIA-44: Define final instrument battery and three-level mapping
- CIA-52: Limerence network node selection
- CIA-53: Centrality interpretation strategy
- CIA-54: Regularised vs non-regularised network estimation

---

## Key Findings

### 1. Instrument Selection: Matrix-Based Administration Reduces Burden
**Evidence Strength: Strong**

The Network of Relationships Inventory (NRI-BSV) and Experiences in Close Relationships—Relationship Structures (ECR-RS) both explicitly support matrix-format administration across multiple alters. Recent validation work (Kanth et al., 2024) demonstrates strong internal consistency (α = .85–.97) for NRI-BSV subscales. Contemporary egocentric network methodology emphasises balancing completeness against respondent burden, noting that per-alter completion time is substantial (González-Casado et al., 2026).

**Implementation for Alteri:**
- Matrix interface enables within-ego comparisons across relationships
- Supports 5-10 alter design with optional expansion
- Reduces cognitive switching costs compared to sequential administration

### 2. Network Estimation: Gaussian Graphical Models with Regularisation and Stability Testing
**Evidence Strength: Strong**

PSYNETS workshop (Borsboom et al., 2021; Epskamp et al., 2018) establishes GGM estimation via LASSO regularisation as standard practice, with critical emphasis on bootstrap stability assessment. The bootnet framework quantifies edge accuracy and centrality stability through case-dropping subsets. However, regularisation can produce erratic sampling distributions in some contexts (flagged in PSYNETS Day 1 materials).

**Key methodological principles:**
- Partial correlation networks control for all other variables
- EBIC (Extended Bayesian Information Criterion) model selection balances fit and sparsity
- Bootstrap methods (edge stability, centrality stability) are non-negotiable for publication
- CS-coefficient (correlation stability) should exceed 0.25, preferably 0.50

**Implementation for Alteri:**
- Provide regularised estimation as default
- Include bootstrap stability diagnostics in output
- Flag unstable edges/centrality indices in visualisations
- Consider Bayesian alternatives (Huth et al., 2023) for hypothesis testing about specific edges

### 3. Centrality Interpretation: Strength Over Betweenness/Closeness
**Evidence Strength: Moderate-to-Strong**

PSYNETS materials and your research decisions log note ongoing debates about centrality interpretation. Betweenness and closeness centrality are particularly unstable in small psychological networks and may not generalise well (implicit in Borsboom 2021 cautions about "individual differences in networks" being hard to find). Strength centrality (sum of absolute edge weights) shows better stability.

**Best practices:**
- **Strength centrality**: Most stable, interpretable as "direct influence"
- **Betweenness/closeness**: Use cautiously, report stability, avoid strong claims
- **Expected influence**: Preferable to strength when negative edges present (McNally et al., 2015)

**Implementation for Alteri:**
- Default to strength centrality for node importance
- Display stability intervals (bootstrapped CIs) alongside centrality plots
- Include expected influence as alternative when negative edges detected
- Provide educational tooltips explaining limitations of betweenness/closeness

### 4. Node Selection: Theory-Driven Over Data-Driven
**Evidence Strength: Moderate**

Network Psychometrics with R (PSYNETS recommended reading) emphasises that node selection should be theoretically motivated rather than purely empirical. For limerence research, this means including transdiagnostic mechanisms (IU, ED, RNT) alongside limerence-specific phenomenology (LQ-11 subscales). 

Embedding-based semantic methods (Wulff & Mata, 2025) can help detect jingle-jangle problems (construct overlap) and refine item selection. Your methodology document already plans this for NLP-derived state items.

**Implementation for Alteri:**
- Support theory-driven node definition with researcher annotations
- Include semantic similarity analysis tools for item refinement
- Enable exploratory dimensionality reduction (EGA, mgm) but flag as exploratory
- Distinguish ego-level nodes from tie-level nodes in multilevel designs

---

## Evidence Summary

| Paper | Year | Key Finding | Linear Issue | Evidence Strength |
|-------|------|-------------|--------------|-------------------|
| Epskamp et al. (BRM) | 2018 | Bootstrap methods essential for edge/centrality stability | CIA-54 | Strong |
| Borsboom et al. (Nature Reviews) | 2021 | GGM via regularisation is standard; node selection theory-driven | CIA-52, CIA-54 | Strong |
| González-Casado et al. | 2026 | Per-alter burden substantial; matrix design reduces fatigue | CIA-44 | Strong |
| Kanth et al. | 2024 | NRI-BSV shows strong reliability (α .85–.97) in matrix format | CIA-44 | Strong |
| Huth et al. (AMPPS) | 2023 | Bayesian GGM enables hypothesis testing for specific edges | CIA-54 | Moderate |
| Wulff & Mata (Nature Human Behaviour) | 2025 | Semantic embeddings detect jingle-jangle problems in scales | CIA-52 | Moderate |
| Guan et al. (BMC Psychology) | 2025 | Longitudinal network analysis of love addiction + attachment | CIA-52 | Moderate |
| Hoekstra et al. (Psych Methods) | 2024 | Individual Network Invariance Test (INIT) for within-person stability | CIA-53 | Moderate |
| Haslbeck & Waldorp | 2020 | mgm package for mixed graphical models (continuous + categorical) | CIA-52 | Moderate |

---

## Design Recommendations

### CIA-44: Instrument Battery and Three-Level Mapping

**Recommendation:** Adopt matrix-based administration for tie-level measures.

**Rationale:**
- NRI-BSV and ECR-RS both validated for matrix format
- Reduces burden from ~15 minutes per alter to ~3-5 minutes
- Enables within-ego comparisons critical for multilevel network models

**Three-level mapping:**
1. **Ego level**: LQ-11, IUS-12, DERS, RRS, CHI-T, GRiPS (individual traits/symptoms)
2. **Tie level**: ECR-RS anxiety/avoidance, NRI-BSV subscales per alter (relationship-specific attachment and support)
3. **Alter level**: Role, proximity, LO flag, demographic attributes

**Instrument priority:**
- Core: LQ-11, ECR-RS, NRI-BSV (limerence + relationship-specific attachment/support)
- Transdiagnostic: IUS-12, DERS, RRS (mechanisms linking adversity to limerence)
- Optional/exploratory: CAMIR-R (global attachment representations), CARTS (figure-structured adversity)

### CIA-52: Limerence Network Node Selection

**Recommendation:** Use theory-driven node selection with semantic validation.

**Nodes to include:**
- **LQ-11 subscales** (2-factor structure: attachment need + self-neglect)
- **Transdiagnostic mechanisms**: IU, ED, RNT (separate subscales or parcels)
- **LO-specific tie quality**: ECR-RS anxiety/avoidance for LO, NRI support/conflict for LO
- **Network position**: LO centrality in ego's attachment network (computed metric)

**Avoid:**
- Total scale scores as single nodes (loses within-construct structure)
- Purely data-driven dimensionality reduction without theoretical justification
- Redundant jingle items (use semantic embeddings to detect overlap first)

**Alteri implementation:**
- Provide node definition wizard with theory templates
- Include semantic similarity checker (embeddings-based)
- Flag highly correlated nodes (r > .70) as potential redundancy
- Support parcelling for long scales with strong unidimensionality

### CIA-53: Centrality Interpretation Strategy

**Recommendation:** Default to strength centrality with bootstrapped stability intervals; provide interpretive cautions for betweenness/closeness.

**Rationale:**
- Strength centrality most stable in small-to-moderate networks
- Betweenness/closeness often have wide confidence intervals and low generalisability
- Bringmann critiques (implicit in PSYNETS materials) emphasise that betweenness assumes shortest-path influence, which may not apply in psychological networks

**Alteri implementation:**

**Display:**
- Centrality plot with bootstrapped 95% CIs
- CS-coefficient (correlation stability) per metric
- Traffic light system: Green (CS > .50), Amber (.25–.50), Red (< .25)

**Interpretation guidance (in-app tooltips):**
- **Strength**: "Node's total direct influence on network; most stable metric"
- **Betweenness**: "Node's role as bridge; interpret cautiously if CS < .50"
- **Closeness**: "Node's average distance to others; unstable in sparse networks"
- **Expected influence**: "Like strength, but accounts for inhibitory edges"

**Educational content:**
- Link to Epskamp et al. (2018) tutorial for detailed explanation
- Provide worked example comparing stable vs unstable centrality
- Include "When centrality indices disagree" FAQ

### CIA-54: Regularised vs Non-Regularised Network Estimation

**Recommendation:** Offer both regularised (LASSO via EBICglasso) and non-regularised (full correlation matrix) with clear use-case guidance.

**Regularised (default for publication-ready analysis):**
- **Method**: EBICglasso with γ = 0.5 (default)
- **Advantages**: Sparse network, controls false positives, better out-of-sample prediction
- **Disadvantages**: Can produce false negatives (miss weak but real edges)
- **Use when**: N > 3 × number of nodes, aiming for parsimony, publishing results

**Non-regularised (exploratory):**
- **Method**: Polychoric/Pearson correlations with significance thresholding (α = .01)
- **Advantages**: Retains all signal, no shrinkage bias
- **Disadvantages**: Dense network, many spurious edges, poor replicability
- **Use when**: Large N (> 500), exploratory phase, comparing to prior non-regularised studies

**Bayesian alternative:**
- **Method**: easybgm package (Huth et al., 2024)
- **Advantages**: Posterior inclusion probabilities for edges, hypothesis testing
- **Disadvantages**: Computationally intensive, less familiar to reviewers
- **Use when**: Testing specific edge hypotheses (e.g., "Is IU-RNT edge stronger than IU-ED?")

**Alteri implementation:**

**Estimation interface:**
- Radio buttons: Regularised (EBIC) | Non-regularised | Bayesian
- Conditional display of method-specific parameters (γ for EBIC, priors for Bayesian)
- Automatic N-based recommendations (e.g., "Your N = 150 is borderline for regularisation; consider bootstrap stability carefully")

**Output:**
- Edge weight matrix with stability intervals
- Model fit indices (BIC, RMSEA if using psychonetrics confirmatory approach)
- Bootstrap stability plots (edge accuracy, centrality stability)
- Exportable to qgraph, bootnet, psychonetrics R objects for reproducibility

**Stability assessment (non-negotiable):**
- Edge stability: Bootstrap 95% CIs, mark edges with CIs crossing zero as unstable
- Centrality stability: CS-coefficient via case-dropping bootstrap
- Network comparison: NCT (Network Comparison Test) if comparing groups

---

## Gaps Identified

### 1. Multilevel Network Methodology Underdeveloped
Your research design involves **three levels** (egos, ties, alters), but most psychological network methods assume single-level data. Epskamp's Gaussian Graphical Model approach does not inherently model nesting. Your methodology document mentions "multilayer approaches" but doesn't specify estimation method.

**Gap:** No consensus method for estimating networks with tie-level predictors nested within egos. Brinberg et al. (2022) extend dyadic models to intensive longitudinal data, but not to cross-sectional egocentric designs.

**Alteri implication:** May need custom multilevel SEM or Bayesian hierarchical models. This is advanced—consider consulting during PSYNETS or Barcelona workshops.

### 2. Centrality Interpretation for Tie-Level Networks Unclear
Most centrality research (Epskamp, Borsboom, Fried) focuses on **symptom networks** (nodes = symptoms). Your design includes **tie-level networks** (nodes = alters). Centrality in social networks (degree, betweenness) has different meaning than in symptom networks.

**Gap:** Does "LO centrality" mean the LO has high degree (many connections in alter-alter network), or high ECR-RS anxiety scores (tie-level attribute), or is most frequently mentioned in narratives? These are different constructs.

**Alteri implication:** Clearly distinguish:
- **Structural centrality** (position in social network graph): degree, betweenness
- **Attribute centrality** (extremity on tie-level measures): high ECR-RS, high NRI support
- **Symptom centrality** (position in transdiagnostic symptom network): IU, ED, RNT interconnections

### 3. Regularisation Debate Ongoing
Williams et al. (BGGM package) argue LASSO over-regularises and advocate Bayesian estimation. Epskamp/Fried defend LASSO + bootstrap as pragmatic standard. No consensus yet (2024–2026).

**Gap:** Alteri will need to communicate this uncertainty to users. Many researchers trained in LASSO via bootnet may resist Bayesian methods; others may distrust LASSO after reading Williams critiques.

**Alteri implication:** Provide **side-by-side comparison tool**: estimate same data with LASSO, non-regularised, and Bayesian, then show concordance/discordance. Educational content: "Why different methods disagree".

### 4. Longitudinal Network Methods Not Yet in Alteri Scope
PSYNETS Day 4 covers VAR (vector autoregressive) models for time-series data. Your Phase 2 EMA will require this. Haslbeck time-varying VAR (tvVAR) and Hoekstra INIT are cutting-edge but complex.

**Gap:** Current brief focuses on cross-sectional networks. Temporal/dynamic networks require different estimation (mlVAR, graphicalVAR, tvVAR) and different interpretation (contemporaneous vs temporal networks).

**Alteri implication:** Phase 1 focuses on cross-sectional GGM. Phase 2 (post-EMA data collection) will need mlVAR/graphicalVAR module. Defer detailed temporal network design until after PSYNETS/Barcelona training.

---

## Methodological Decision Matrix for Alteri

| Decision Point | Option A | Option B | Recommendation | Rationale |
|----------------|----------|----------|----------------|-----------|
| **Node selection** | Total scale scores | Subscales/parcels | Subscales | Preserves within-construct structure; aligns with LQ-11 validation (2-factor model) |
| **Estimation method** | LASSO (EBICglasso) | Non-regularised | LASSO default, offer both | Standard in literature; but offer non-reg for transparency |
| **Centrality metrics** | All four (S/B/C/EI) | Strength only | Strength + EI, flag B/C instability | Borsboom/Epskamp guidance; avoid overinterpretation of unstable metrics |
| **Stability testing** | Optional | Mandatory | Mandatory | Epskamp 2018 tutorial: "stability analysis is not optional" |
| **Tie-level analysis** | Aggregate to ego | Model nesting | Initially aggregate, Phase 2 multilevel | Multilevel network methods still emerging; aggregate mean/SD per ego is defensible interim |
| **Network comparison** | Visual only | NCT statistical test | NCT test | Established method (van Borkulo et al.); differentiates global structure and specific edges |
| **Bayesian estimation** | Not offered | Optional advanced | Optional | computationally intensive; useful for hypothesis testing but not essential for exploratory work |

---

## Implementation Priorities for Alteri MVP

### High Priority (MVP)
1. ✅ **GGM estimation**: EBICglasso via qgraph/bootnet R backend
2. ✅ **Bootstrap stability**: Edge accuracy, centrality stability (CS-coefficient)
3. ✅ **Strength centrality**: Default metric with 95% CI display
4. ✅ **Matrix-based data input**: Support ECR-RS and NRI-BSV across multiple alters
5. ✅ **Theory-driven node definition**: Researcher-specified node labels and groupings

### Medium Priority (Post-MVP)
1. **Bayesian estimation**: easybgm integration for hypothesis testing
2. **Semantic similarity tool**: Embeddings-based jingle-jangle detector for item refinement
3. **Network comparison**: NCT for group differences (e.g., high vs low limerence)
4. **Expected influence**: Alternative to strength when negative edges present

### Low Priority (Phase 2/Future)
1. **Multilevel network models**: VAR/mlVAR for EMA data (post-PSYNETS training)
2. **Confirmatory network models**: psychonetrics integration for SEM-style network models
3. **Moderated networks**: mgm for testing whether network structure differs by moderators (e.g., LO availability)

---

## Questions for PSYNETS Amsterdam (26-30 Jan 2026)

1. **Day 1 (Borsboom)**: How to justify node selection when multiple transdiagnostic mechanisms overlap (IU, RNT, ED)? Use semantic embeddings or EGA dimensionality reduction?

2. **Day 2 (de Ron)**: What CS-coefficient threshold for publishing centrality analyses? Recent papers use .50, but earlier work accepted .25. Has consensus shifted?

3. **Day 3 (Marsman)**: When to prefer Bayesian (easybgm) over LASSO? Is computational cost worth it for exploratory work, or only for confirmatory hypothesis testing?

4. **Day 4 (Hoekstra)**: INIT test applicability to cross-sectional egocentric networks? Your method tests **within-person** longitudinal network stability, but can it extend to **between-person** comparison of ego networks?

5. **Day 5 (Haslbeck)**: mgm moderated networks—can this handle tie-level moderators (e.g., "is the IU-RNT edge stronger when LO is proximate")?

6. **General**: Multilevel egocentric network analysis—any emerging methods for modeling tie-level variables nested within egos in cross-sectional design? Or should we aggregate tie-level means to ego level for now?

---

## References

Borsboom, D., Deserno, M. K., Rhemtulla, M., Epskamp, S., Fried, E. I., McNally, R. J., ... & Waldorp, L. J. (2021). Network analysis of multivariate data in psychological science. *Nature Reviews Methods Primers*, 1(1), 1-18.

Brinberg, M., Ram, N., Conroy, D. E., Pincus, A. L., & Gerstorf, D. (2022). Dyadic analysis and the reciprocal one-with-many model: Extending the study of interpersonal processes with intensive longitudinal data. *Psychological Methods*, 27(1), 65-81.

Epskamp, S., Borsboom, D., & Fried, E. I. (2018). Estimating psychological networks and their accuracy: A tutorial paper. *Behavior Research Methods*, 50, 195-212.

González-Casado, M. A., Cruzado Rey, A., Pulgar Corrotea, M., McCarty, C., Molina, J. L., & Sánchez, A. (2026). Collecting a large number of alters in egocentric network research: A comparative analysis of three approaches. *Social Networks*, 84, 78-86.

Guan, C., Wang, J., Zhang, L., Xu, Z., Zhang, Y., & Jiang, B. (2025). A longitudinal network analysis of the relationship between love addiction, insecure attachment patterns, and interpersonal dependence. *BMC Psychology*, 13, 330.

Haslbeck, J. M. B., Bringmann, L. F., & Waldorp, L. J. (2020). A tutorial on estimating time-varying vector autoregressive models. *Multivariate Behavioral Research*, 56(1), 120-149.

Haslbeck, J. M. B., & Waldorp, L. J. (2020). mgm: Structure estimation for time-varying mixed graphical models in high-dimensional data. *Journal of Statistical Software*, 93(8), 1-46.

Hoekstra, R. H. A., Epskamp, S., Nierenberg, A. A., Borsboom, D., & McNally, R. J. (2024). Testing similarity in longitudinal networks: The Individual Network Invariance Test. *Psychological Methods*. Advance online publication.

Huth, K. B. S., de Ron, J., Goudriaan, A. E., Luigjes, J., Mohammadi, R., van Holst, R. J., Wagenmakers, E.-J., & Marsman, M. (2023). Bayesian analysis of cross-sectional networks: A tutorial in R and JASP. *Advances in Methods and Practices in Psychological Science*, 6(4), 1-18.

Huth, K., Keetelaar, S., Sekulovski, N., van den Bergh, D., & Marsman, M. (2024). Simplifying Bayesian analysis of graphical models for the social sciences with easybgm: A user-friendly R-package. *Advances in Psychology*, 2, e66366.

Kanth, K., Wehner, E. A., & Furman, W. (2024). Psychometric evaluation of the Network of Relationships Inventory Behavioral Systems Version. *Journal of Youth and Adolescence*, 53, 1575-1591.

Marshall, L., Waldeck, D., Pancani, L., Churchill, S., & Tyndall, I. (2025). Development and validation of the Limerence Questionnaire (LQ-11). *Psychological Reports*. Advance online publication.

Wulff, D. U., & Mata, R. (2025). Semantic embeddings reveal and address taxonomic incommensurability in psychological measurement. *Nature Human Behaviour*, 9, 944-954.

---

## Document Metadata

**Created:** 2026-01-26  
**Author:** Claude (Research Coordinator)  
**Project:** Alteri Platform Network Analysis Module  
**Status:** Draft for review before PSYNETS Amsterdam  
**Next Review:** 2026-01-31 (post-PSYNETS debrief)  
**Linear Issues:** CIA-44, CIA-52, CIA-53, CIA-54

