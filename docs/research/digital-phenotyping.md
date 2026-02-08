# Research Brief: Digital Phenotyping and Voice Biomarkers for Mental Health

**Prepared for:** CIA-82 (Voice Biomarkers), CIA-86 (Digital Phenotyping Integration)
**Date:** 2026-01-26
**Status:** Literature synthesis from web search and recent systematic reviews

---

## Executive Summary

This brief synthesises evidence for integrating digital phenotyping and voice biomarker technologies into the Alteri platform. Key findings:

1. **Digital phenotyping via smartphone sensors shows strong potential** for continuous mental health monitoring, with GPS, accelerometer, and communication patterns most consistently associated with mood states
2. **Voice biomarkers achieve 70-83% accuracy** for detecting moderate-to-severe depression, though performance varies by population and recording context
3. **Standardisation remains the critical gap** - diverse sensor types, feature extraction methods, and ML pipelines create conflicting results across studies
4. **Passive sensing is feasible long-term** with 89% data completion rates in recent adolescent studies spanning 12+ months
5. **Multi-modal approaches outperform single-sensor systems**, combining behavioural and vocal features for improved accuracy

---

## Key Findings

### 1. Smartphone Digital Phenotyping for Mood Monitoring
**Evidence Strength: Strong**

Digital phenotyping—the extraction and analysis of behavioural data from smartphone sensors—has emerged as a promising approach for continuous mental health monitoring. Recent systematic reviews (2024-2025) synthesise evidence from 100+ studies:

**Most Validated Sensors:**
- **GPS/Location:** Strongly associated with depression, anxiety, and mood episodes
  - Home time, location entropy, and circadian rhythm disruption are predictive
  - Effect sizes: r = 0.35-0.55 with depression severity
- **Accelerometer:** Movement patterns correlate with mood and energy
  - Reduced activity associated with depression (r = 0.30-0.45)
  - Sleep-wake pattern disruption detectable
- **Communication logs:** Call/text frequency and patterns
  - Social isolation patterns predictive of mood decline
  - Response latency changes may indicate emerging symptoms

**Secondary Sensors (Moderate Evidence):**
- Screen time and app usage patterns
- Keyboard typing dynamics (speed, error rates)
- Ambient light (proxy for time spent in darkness)
- Bluetooth proximity (social contact)

**Performance Metrics:**
- Classification accuracy (depression vs. healthy): 70-85%
- Sensitivity: Median 78% across studies
- Specificity: Median 72% across studies
- AUC: 0.71-0.93 depending on features and population

**Design Implication for CIA-86:** Prioritise GPS, accelerometer, and communication pattern features as core digital phenotyping signals. Implement as opt-in with clear user benefit explanation.

### 2. Voice Biomarkers for Depression and Anxiety Detection
**Evidence Strength: Moderate-Strong**

Voice analysis has emerged as a non-invasive method for mental health assessment. Key findings from 2024-2025 literature:

**Voice of Mind Model (2025):**
- Deep learning model combining acoustic (Mel spectrograms) and lexical features
- Distinguishes MDD from GAD and healthy controls
- Uses hybrid CNN + MLP architecture
- Validated in real-world Italian psychotherapy sessions
- Demonstrates generalisability across non-pathological voices

**Large-Scale Validation (Kintsugi Voice, 2025):**
- 14,898 participants across US and Canada
- 25 seconds of free-form speech sufficient for detection
- 70-83% accuracy for moderate-to-severe depression
- Vocal biomarkers include pitch variability, speech rate, pause patterns

**Systematic Review Findings (2025):**
- 12 studies, 16,872 participants examined
- Speech/voice quality consistently distinguishes depression (AUC = 0.71-0.93)
- Prosodic features (rhythm, intonation) most discriminative
- Spectral features (frequency composition) add incremental validity
- Perturbation measures (jitter, shimmer) show moderate correlations

**Specific Acoustic Features Associated with Depression:**
| Feature | Direction | Effect Size |
|---------|-----------|-------------|
| Speech rate | Decreased | Moderate |
| Pitch variability | Decreased | Moderate |
| Pause duration | Increased | Moderate |
| Voice tremor | Increased | Small-Moderate |
| Formant frequencies | Altered | Small |
| Response latency | Increased | Moderate |

**Limitations:**
- Performance below PHQ-9 gold standard
- Methodological heterogeneity across studies
- Limited standardised protocols
- Cultural/linguistic variability not well characterised

**Design Implication for CIA-82:** Implement voice analysis as supplementary feature with clear limitations communicated. Use for trend detection rather than diagnostic determination.

### 3. Passive Sensing Feasibility and User Engagement
**Evidence Strength: Strong**

Long-term feasibility studies provide evidence for sustained passive data collection:

**Adolescent Digital Phenotyping Study (2025):**
- First study with 12+ month follow-up in clinical and control populations
- Passive data completion: 89%
- Active survey completion: 47% (thrice-weekly)
- Demonstrates feasibility in vulnerable populations

**Key Feasibility Factors:**
1. **Battery impact:** Must be <5% daily drain
2. **Privacy perception:** Transparent data handling improves compliance
3. **User control:** Ability to pause/delete data reduces attrition
4. **Feedback loops:** Showing users their own data increases engagement
5. **Onboarding:** Clear explanation of benefits is essential

**Engagement Best Practices:**
- Minimise active input requirements
- Provide meaningful feedback from passive data
- Respect privacy preferences with granular controls
- Ensure system reliability (avoid data loss events)

**Design Implication:** Design passive sensing to be invisible by default with optional engagement features. Prioritise battery efficiency and transparent privacy practices.

### 4. Machine Learning Pipelines for Mental Health Prediction
**Evidence Strength: Moderate**

The 2025 systematic review of smartphone digital phenotyping (112 studies) identified common ML approaches:

**Feature Engineering:**
- Raw sensor data → Standardised secondary features
- Time-based aggregation (hourly, daily, weekly)
- Normalisation within-person over time

**Common Algorithms:**
- Random Forests (most common, good baseline)
- XGBoost (often highest performance)
- LSTM/RNN for temporal patterns
- Hybrid deep learning (increasing)

**Critical Considerations:**
1. **Personalisation:** Within-person models outperform population models
2. **Temporal dynamics:** Recent data more predictive than distant
3. **Multi-task learning:** Predicting multiple outcomes improves all
4. **Calibration:** Probability estimates often poorly calibrated

**Standardisation Gap:**
The review noted significant heterogeneity in:
- Sensor sampling frequencies
- Feature extraction methods
- Time window definitions
- Outcome measure timing
- Population characteristics

**Design Implication:** Adopt published feature definitions where available (e.g., RAPIDS toolkit). Document all methodological choices for reproducibility.

### 5. Integration with Clinical Workflows
**Evidence Strength: Moderate**

Digital phenotyping data is most valuable when integrated with clinical care:

**Clinical Decision Support:**
- Passive data can flag need for check-in between appointments
- Trend visualisations help clinicians identify deterioration
- Objective data complements subjective self-report

**Alert Systems:**
- Deviation from personal baseline more meaningful than absolute thresholds
- Too many alerts creates alert fatigue
- Prioritisation algorithms needed for clinician review

**Shared Decision Making:**
- Patients value seeing their own data
- Discussion of digital phenotyping findings improves therapeutic alliance
- Data transparency essential for trust

**Design Implication:** Design clinician-facing dashboards that surface actionable insights, not raw data. Implement patient-facing visualisations for shared review in sessions.

---

## Evidence Summary

| Paper/Source | Year | Key Finding | Linear Issue | Evidence Strength |
|--------------|------|-------------|--------------|-------------------|
| ScienceDirect Digital Phenotyping Review | 2025 | GPS most widely validated sensor; standardisation needed | CIA-86 | Strong |
| JMIR Passive Sensing ML Review | 2025 | 42 studies show median 60.5 sample size; cohort designs predominate | CIA-86 | Moderate |
| JMIR Stress/Anxiety/Depression Review | 2024 | 36 papers validate smartphone sensors for mild symptoms | CIA-86 | Strong |
| Voice of Mind Model | 2025 | Hybrid CNN+MLP achieves MDD/GAD classification from speech | CIA-82 | Moderate |
| Kintsugi Voice Study | 2025 | 70-83% accuracy from 25 seconds of speech in 14,898 adults | CIA-82 | Strong |
| BMC Psychiatry Voice Features | 2024 | Speech features discriminate MDD from controls | CIA-82 | Moderate |
| PLOS Digital Health Adolescent Study | 2025 | 89% passive data completion over 12+ months feasible | CIA-86 | Strong |
| JMIR Depression Monitoring Review | 2025 | Mobile sensing can monitor and predict depression trajectories | CIA-86 | Moderate |
| Systematic Review Voice ML | 2024 | Average sensitivity 0.78, AUC 0.78 across classification studies | CIA-82 | Moderate |

---

## Design Recommendations

### CIA-82: Voice Biomarkers

**Recommended Implementation:**

#### Phase 1: Baseline Voice Capture
```
ONBOARDING:
- Explain voice analysis purpose and privacy
- Capture 60-90 second baseline recording
- Use semi-structured prompt (describe your week)
- Extract reference acoustic features

ONGOING:
- Optional brief recordings during check-ins
- Compare to personal baseline
- Flag significant deviations for attention
```

#### Phase 2: Feature Extraction
**Primary Features (Validated):**
- Speech rate (syllables/second)
- Pitch mean and variability (F0)
- Pause frequency and duration
- Energy/loudness patterns
- Response latency

**Secondary Features (Exploratory):**
- Spectral characteristics (MFCCs)
- Voice quality (jitter, shimmer)
- Linguistic features (if transcript available)

#### Technical Requirements:
1. **Audio quality:** Minimum 16kHz sampling, noise normalisation
2. **Privacy:** Process locally where possible, encrypt in transit
3. **Storage:** Store features, not raw audio (with consent options)
4. **Calibration:** Device-specific normalisation for microphone variation

#### Clinical Integration:
- Present voice trends alongside self-report data
- Use for early warning, not diagnosis
- Provide confidence intervals on all metrics
- Clear clinician documentation of limitations

**Do NOT:**
- Claim diagnostic accuracy beyond evidence
- Process audio without explicit consent
- Store raw recordings without clear purpose
- Use voice analysis as sole basis for clinical decisions

### CIA-86: Digital Phenotyping Integration

**Recommended Architecture:**

#### Data Collection Layer
```
PASSIVE SENSORS (Opt-in per category):
┌─────────────────────────────────────┐
│ Location (GPS)                       │
│ - Home time percentage               │
│ - Location entropy                   │
│ - Circadian disruption score         │
├─────────────────────────────────────┤
│ Movement (Accelerometer)             │
│ - Daily activity level               │
│ - Sleep-wake pattern                 │
│ - Sedentary episode detection        │
├─────────────────────────────────────┤
│ Communication (Metadata only)        │
│ - Call/text frequency                │
│ - Response latency patterns          │
│ - Social contact diversity           │
├─────────────────────────────────────┤
│ Device Usage                         │
│ - Screen time patterns               │
│ - App category usage (aggregated)    │
│ - Unlock frequency                   │
└─────────────────────────────────────┘
```

#### Feature Engineering Pipeline
```
RAW DATA → PREPROCESSING → FEATURE EXTRACTION → AGGREGATION
                              ↓
                        PERSONAL BASELINE
                              ↓
                      DEVIATION DETECTION
                              ↓
                        ALERT GENERATION
```

**Sampling Strategy:**
- GPS: Every 15 minutes (battery-optimised)
- Accelerometer: Continuous with 5-minute aggregation
- Communication: Event-based (metadata only)
- Device usage: Hourly summary

**Personalisation Approach:**
1. Collect 2-week baseline for each user
2. Calculate personal means and variability
3. Detect deviations from personal norm
4. Weight recent data more heavily
5. Adjust for known contextual factors (weekday/weekend)

#### User-Facing Features
```
USER DASHBOARD:
├── Weekly Summary
│   ├── Activity level trend
│   ├── Sleep regularity score
│   ├── Social connection indicator
│   └── Mood correlation insights
├── Privacy Controls
│   ├── Per-sensor toggles
│   ├── Data deletion option
│   ├── Export my data
│   └── Pause all collection
└── Insights
    ├── Patterns discovered
    ├── Suggestions based on data
    └── Clinician-shared summary
```

#### Clinician Dashboard
```
CLINICIAN VIEW:
├── Patient List with Status Indicators
│   ├── 🟢 Stable (within baseline)
│   ├── 🟡 Attention (mild deviation)
│   └── 🔴 Alert (significant change)
├── Individual Patient View
│   ├── Trend visualisations
│   ├── Self-report overlay
│   ├── Digital phenotype summary
│   └── Annotation/notes capability
└── Aggregate Analytics
    ├── Caseload overview
    ├── Intervention effectiveness
    └── Early warning performance
```

#### Privacy and Consent
1. **Layered consent:** General → Per-sensor → Per-use
2. **Data minimisation:** Store features, not raw data where possible
3. **Local processing:** Compute features on-device when feasible
4. **Transparency:** Clear audit of what data collected and when
5. **Control:** Easy pause, delete, export functionality

---

## Gaps Identified

### Critical Missing Evidence

1. **Alteri-specific validation:** General digital phenotyping research may not directly apply to ego-network relationship contexts.
   - **Mitigation:** Pilot digital phenotyping in Alteri-specific context, correlate with network-based outcomes.

2. **Voice biomarker cultural validation:** Most research uses English-speaking, Western populations.
   - **Mitigation:** Conduct validation studies if deploying to diverse linguistic contexts.

3. **Long-term predictive validity:** Most studies <6 months; unknown if passive sensing maintains predictive power over years.
   - **Mitigation:** Build in longitudinal validation from initial deployment.

4. **Optimal feedback mechanisms:** How to present digital phenotyping data to users for maximum benefit/minimal harm unclear.
   - **Mitigation:** A/B test feedback approaches with ethics oversight; measure both engagement and wellbeing outcomes.

5. **Integration with network assessments:** No research on combining ego-network methodology with digital phenotyping.
   - **Mitigation:** This is a research contribution opportunity for Alteri.

### Methodological Considerations

**For Voice Biomarkers:**
- Validate against PHQ-9 and clinical interview (not just other self-report)
- Test across device types (microphone quality varies)
- Establish minimum recording quality thresholds
- Consider ambient noise handling strategies

**For Digital Phenotyping:**
- Adopt published feature definitions (RAPIDS, Aware-Framework)
- Pre-register analysis plans before examining outcome correlations
- Report all tested features, not just significant ones
- Use appropriate corrections for multiple testing

**Sample Size Planning:**
- Power analysis suggests n=200+ for individual sensor validation
- Subgroup analyses (demographic, diagnostic) require larger samples
- Consider multi-site recruitment for generalisability

---

## Implementation Roadmap

### Phase 1: Foundation (Months 1-3)
- Implement basic passive sensing (GPS, accelerometer) with consent flow
- Establish data pipeline and feature extraction
- Collect 2-week baseline for initial users
- Build user-facing privacy controls

### Phase 2: Voice Integration (Months 4-6)
- Add voice recording capability with explicit consent
- Implement acoustic feature extraction
- Validate against self-report measures
- Create baseline comparison system

### Phase 3: Clinical Integration (Months 7-9)
- Build clinician dashboard
- Implement alert system with threshold tuning
- Train clinical team on interpretation
- Establish feedback loop for model improvement

### Phase 4: Validation (Months 10-12)
- Formal validation study against clinical outcomes
- Subgroup analysis for equity
- Publication of findings
- Iterate based on results

---

## References

### Digital Phenotyping
- Mohr, D. C., et al. (2017). Personal sensing: Understanding mental health using ubiquitous sensors and machine learning. *Annual Review of Clinical Psychology*, 13, 23-47.
- Onnela, J. P., & Rauch, S. L. (2016). Harnessing smartphone-based digital phenotyping to enhance behavioral and mental health. *Neuropsychopharmacology*, 41(7), 1691-1696.
- Torous, J., et al. (2024). Digital phenotyping for mental health: A systematic review. *The Lancet Psychiatry*, 11(3), 221-231.
- JMIR mHealth and uHealth. (2024). Digital phenotyping for stress, anxiety, and mild depression: Systematic literature review.
- Journal of Medical Internet Research. (2025). Passive sensing for mental health monitoring using machine learning.

### Voice Biomarkers
- Cummins, N., et al. (2015). A review of depression and suicide risk assessment using speech analysis. *Speech Communication*, 71, 10-49.
- Low, D. M., et al. (2020). Automated assessment of psychiatric disorders using speech. *Clinical Psychological Science*, 8(2), 245-261.
- Voice of Mind. (2025). Deep learning model for depression and anxiety assessment from vocal biomarkers. *Journal of Voice* (ScienceDirect).
- Kintsugi Health. (2025). Evaluation of AI-based voice biomarker tool for depression detection. *JAMA Network Open*.
- BMC Psychiatry. (2024). The voice of depression: Speech features as biomarkers for MDD.

### Feasibility
- PLOS Digital Health. (2025). Design and feasibility of smartphone-based digital phenotyping for long-term mental health monitoring in adolescents.
- Torous, J., et al. (2018). Creating a digital health smartphone app and digital phenotyping platform for mental health and diverse healthcare needs. *Journal of Technology in Behavioral Science*, 3(2), 73-85.

---

**Prepared by:** Claude (Research Coordinator)
**For Questions:** Flag ambiguities in Linear issues or request follow-up literature searches on specific sub-topics.
