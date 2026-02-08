# NLP Assessment Implementation Checklist

**Source:** [[nlp-assessment.md]]  
**Date:** 2026-01-26  
**For:** CIA-93, CIA-44

---

## Pre-Implementation Decisions

### [ ] Architecture Decision
- [ ] Review full hybrid approach recommendation with team
- [ ] Decide on MVP scope: Full 3-phase hybrid OR phased rollout?
- [ ] Confirm technical stack (IRT engine, embedding models)
- [ ] Set validation study budget and timeline

### [ ] Scope Validation
- [ ] Review CIA-93 acceptance criteria against recommendations
- [ ] Review CIA-44 construct list against evidence strength ratings
- [ ] Identify any constructs requiring structured-only approach
- [ ] Confirm priority constructs for NLP extraction

---

## Phase 1: MVP (Weeks 1-4)

### CIA-93: Dynamic Assessment Interface
- [ ] Design conversational onboarding flow
  - [ ] Script opening prompt: "Tell me about the people who are most important to you"
  - [ ] Implement alter name extraction (NER or embedding-based)
  - [ ] Design transition to structured assessment
- [ ] Implement full structured scales
  - [ ] ECR-RS (attachment)
  - [ ] IUS-12 (intolerance of uncertainty)
  - [ ] DERS-SF (emotion dysregulation)
  - [ ] PTQ-SF (repetitive negative thinking)
- [ ] Build progress tracking UI
  - [ ] Construct-level progress (not just overall %)
  - [ ] Visual scale widgets for Likert items
- [ ] Set up data logging
  - [ ] Response times per item
  - [ ] Alter names extracted
  - [ ] Session completion metrics

### CIA-44: Instrument Battery
- [ ] Use structured items only (no NLP extraction yet)
- [ ] Validate psychometric properties
  - [ ] Internal consistency (Cronbach's alpha)
  - [ ] Confirmatory factor analysis if n > 200
- [ ] Document baseline construct scores for comparison

### Validation
- [ ] Pilot with n=20-50 users
- [ ] Collect qualitative feedback on conversational onboarding
- [ ] Analyse completion rates and time-on-task
- [ ] Document any issues with alter name extraction

---

## Phase 2: Adaptive Testing (Weeks 5-8)

### CIA-93: Adaptive Layer
- [ ] Integrate IRT engine
  - [ ] Calibrate item parameters using pilot data
  - [ ] Implement item selection algorithm (Fisher information maximisation)
  - [ ] Set stopping rules (SE < 0.32 or max 10 items)
- [ ] A/B test adaptive vs full scales
  - [ ] Random assignment to conditions
  - [ ] Compare: burden (time), precision (SE), completion rates
- [ ] Refine based on results
  - [ ] Adjust stopping rules if needed
  - [ ] Identify problematic items

### Validation
- [ ] n=100 participants in A/B test
- [ ] Correlate adaptive scores with full scale scores (target r > 0.90)
- [ ] Check for differential item functioning (DIF) by demographics
- [ ] User feedback on experience

---

## Phase 3: NLP Augmentation (Weeks 9-16)

### CIA-44: Construct Extraction
- [ ] Implement NLP pipeline for HIGH CONFIDENCE constructs only
  - [ ] Emotional valence (sentiment model)
  - [ ] Anxiety symptom mentions (lexicon + embeddings)
  - [ ] Depression symptom mentions (lexicon + embeddings)
- [ ] Build validation study
  - [ ] Concurrent validity: NLP scores vs full validated scales
  - [ ] Convergent/discriminant validity matrix
  - [ ] Bias audit by demographics
- [ ] Decision gate: Only proceed if r > 0.60
  - [ ] If YES → implement hybrid scoring
  - [ ] If NO → revert to structured-only, document findings

### CIA-93: Hybrid Scoring
- [ ] Implement weighted combination of NLP + structured items
  - [ ] Present 3-5 validation items for NLP-extracted constructs
  - [ ] Combine: 0.7 * structured + 0.3 * NLP (or data-driven weights)
- [ ] Add conversational follow-up (Phase 3)
  - [ ] Detect outlier/inconsistent responses
  - [ ] Generate clarifying prompts
  - [ ] Log clarification turns

### Validation
- [ ] n=200+ participants for full validation study
- [ ] Pre-register hypotheses on OSF or AsPredicted
- [ ] Comprehensive psychometric evaluation
  - [ ] Reliability (internal consistency, test-retest)
  - [ ] Validity (concurrent, convergent, discriminant)
  - [ ] Sensitivity to change (if longitudinal data available)

---

## Phase 4: Advanced Features (Weeks 17+)

### CIA-93: Conversational Refinement
- [ ] Implement template prompts
  - [ ] "When I think about [alter name], I feel ___"
  - [ ] Test engagement vs burden
- [ ] Add multi-turn clarification
  - [ ] Controlled prompts (no leading questions)
  - [ ] Log conversation transcripts for quality control
- [ ] Real-time inconsistency detection
  - [ ] Flag contradictory responses during assessment
  - [ ] Offer in-session clarification

### Long-term Monitoring
- [ ] Set up ongoing psychometric monitoring
  - [ ] Automated alerts for alpha < 0.70
  - [ ] DIF monitoring by demographics
- [ ] User feedback loops
  - [ ] In-app feedback prompts
  - [ ] Quarterly user interviews

---

## Critical Checkpoints

### Before Phase 2 (Adaptive Testing):
**Question:** Are baseline psychometrics acceptable?  
**Criteria:** Alpha > 0.70 for all scales, completion rate > 70%  
**Action if NO:** Refine scales, improve UX before proceeding

### Before Phase 3 (NLP Augmentation):
**Question:** Is adaptive testing working?  
**Criteria:** Adaptive vs full scale correlation r > 0.90, user satisfaction high  
**Action if NO:** Debug adaptive algorithm, adjust stopping rules

### Before Phase 4 (Advanced Features):
**Question:** Is NLP extraction valid?  
**Criteria:** Concurrent validity r > 0.60, no demographic bias, user acceptance  
**Action if NO:** Limit NLP to conversational onboarding only, use structured for all measurement

---

## Open Research Questions (Document as Go)

1. **Alteri-Specific Language:**
   - Do linguistic patterns differ when describing others vs self?
   - What unique linguistic markers emerge in personal network descriptions?

2. **Attachment Detection:**
   - Can NLP accurately infer attachment anxiety/avoidance from relationship descriptions?
   - What training data would be needed?

3. **Longitudinal Sensitivity:**
   - Are NLP-derived scores sensitive to change over time?
   - Do conversational assessments show practice effects?

4. **Cultural Validity:**
   - How do language differences affect NLP construct extraction?
   - Do validation metrics hold across demographic groups?

---

## Documentation Requirements

Throughout implementation:
- [ ] Maintain decision log (why choices were made)
- [ ] Document all model parameters (IRT, NLP)
- [ ] Version control all prompts and algorithms
- [ ] Create reproducible analysis scripts
- [ ] Write up findings for publication (if novel)

---

## Team Roles (Suggested)

| Role | Responsibilities | Phase Focus |
|------|-----------------|-------------|
| Product Lead | UX, user feedback, roadmap | All |
| Research Psychologist | Psychometric validation, scale selection | 1-3 |
| ML Engineer | NLP pipeline, IRT implementation | 2-3 |
| Data Analyst | Statistical validation, monitoring | 2-4 |
| Frontend Developer | UI for conversational + structured assessment | 1, 4 |

---

## Success Metrics

### Primary:
- Completion rate > 80%
- Psychometric reliability maintained (alpha > 0.70)
- User satisfaction > 4/5
- Assessment burden < 20 minutes

### Secondary:
- NLP construct extraction accuracy (r > 0.60 with gold standard)
- Adaptive testing efficiency (50% item reduction without precision loss)
- Longitudinal sensitivity (detect change in intervention studies)

---

**Status Tracking:** Update this checklist as items complete. Link to specific GitHub issues/PRs for each item.
