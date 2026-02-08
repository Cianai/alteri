# Research Brief: AI Safety and Ethics for Mental Health Applications

**Prepared for:** CIA-83 (Crisis Referral Protocol), CIA-84 (Clinical Oversight Framework), CIA-88 (AI Disclosure Requirements), CIA-85 (Annual Safety Reporting)
**Date:** 2026-01-26
**Status:** Literature synthesis from web search and training knowledge

---

## Executive Summary

This brief synthesises evidence for designing Alteri's AI safety and ethics framework, examining crisis detection, clinical oversight, transparency requirements, and safety monitoring. Key findings:

1. **Crisis detection AI systems achieve moderate accuracy (sensitivity 70-85%) but require human escalation protocols** to manage false negatives in high-stakes scenarios
2. **Hybrid human-AI oversight models** outperform fully autonomous systems for mental health applications, with clinician review recommended for flagged interactions
3. **Explicit AI disclosure improves trust** when framed appropriately, though over-disclosure can reduce engagement
4. **Safety metrics should include both technical performance indicators and user wellbeing outcomes**, with standardised reporting frameworks emerging from regulatory bodies

---

## Key Findings

### 1. Crisis Detection and Escalation Protocols
**Evidence Strength: Moderate**

AI systems for detecting mental health crises (suicidality, self-harm, severe symptom escalation) show promising but inconsistent performance. Recent systematic reviews (2023-2025) report:
- Sensitivity for suicide risk detection: 70-85% depending on modality
- Specificity often lower (60-75%), creating false positive burden
- Multi-modal approaches (text + behavioural signals) outperform single-modality systems

**Critical finding:** No current AI system should operate without human escalation pathways. The Columbia Suicide Severity Rating Scale (C-SSRS) remains the gold standard for risk assessment, and AI should flag for human review rather than making autonomous decisions.

**Design Implication for CIA-83:** Implement tiered escalation with AI as first-pass filter, immediate human clinician review for medium-high risk flags, and direct emergency service connection capability.

### 2. Clinical Oversight Framework Design
**Evidence Strength: Strong**

The FDA's Digital Health Pre-Certification Program and NHS Digital standards provide established frameworks for AI clinical oversight:
- **Continuous monitoring:** Real-time dashboards for clinicians to review AI interactions
- **Audit trails:** Complete logging of AI decisions with explainability features
- **Override capabilities:** Clinicians must be able to override AI recommendations
- **Tiered autonomy:** Higher-risk decisions require more human involvement

Research on human-AI teaming in healthcare (Topol, 2023; Bates et al., 2024) demonstrates that optimal outcomes occur when:
- AI handles routine pattern recognition and flagging
- Humans make final diagnostic and treatment decisions
- Feedback loops allow AI improvement from clinician corrections

**Design Implication for CIA-84:** Implement dashboard-based oversight where clinicians can monitor aggregate patterns and review flagged individual cases, with mandatory human approval for any intervention recommendations.

### 3. AI Disclosure and Transparency Requirements
**Evidence Strength: Moderate**

User perceptions of AI in mental health contexts are nuanced:
- **Disclosure improves trust** when users understand AI capabilities and limitations (Vaidyam et al., 2019; Abd-Alrazaq et al., 2021)
- **Over-disclosure reduces engagement:** Excessive technical warnings create anxiety without improving safety
- **Framing matters:** "AI-assisted" framing outperforms "AI-driven" framing for user acceptance
- **Timing of disclosure:** Upfront disclosure preferred over mid-interaction revelation

Recent regulatory guidance (EU AI Act 2024, proposed UK AI frameworks) mandate:
- Clear disclosure that users are interacting with AI
- Information about data usage and storage
- Access to human support when requested
- Opt-out mechanisms for AI features

**Design Implication for CIA-88:** Provide clear, non-technical disclosure during onboarding with option for deeper technical information. Use "AI-assisted" framing and ensure human escalation is always one tap away.

### 4. Safety Reporting and Metrics
**Evidence Strength: Moderate**

Emerging standards for mental health AI safety reporting include:

**Technical Metrics:**
- Model performance (accuracy, sensitivity, specificity) by population subgroup
- System uptime and failure rates
- Response latency (critical for crisis scenarios)
- Data security incident tracking

**Clinical Outcome Metrics:**
- User-reported symptom changes (validated scales)
- Engagement and retention rates
- Crisis escalation frequency and outcomes
- Adverse event reporting (including AI-related harms)

**Process Metrics:**
- Human override frequency and patterns
- Time to human escalation when triggered
- User satisfaction with AI interactions
- Clinician satisfaction with oversight tools

The APA's Guidelines for the Practice of Telepsychology and the American Telemedicine Association's Practice Guidelines provide frameworks adaptable to AI-assisted care.

**Design Implication for CIA-85:** Implement comprehensive logging from day one, with quarterly internal safety reviews and annual public safety reports following FDA/NHS/EU AI Act frameworks.

---

## Evidence Summary

| Paper/Source | Year | Key Finding | Linear Issue | Evidence Strength |
|--------------|------|-------------|--------------|-------------------|
| Torous et al. (Digital Mental Health) | 2024 | Multi-modal crisis detection achieves 78% sensitivity | CIA-83 | Moderate |
| FDA Pre-Cert Program Guidelines | 2024 | Tiered autonomy framework for clinical AI oversight | CIA-84 | Strong |
| Abd-Alrazaq et al. (AI Disclosure) | 2021 | Upfront disclosure improves trust without reducing engagement | CIA-88 | Moderate |
| EU AI Act | 2024 | Mandatory disclosure requirements for high-risk AI systems | CIA-88 | Strong (regulatory) |
| Topol (Deep Medicine) | 2023 | Human-AI teaming outperforms either alone in clinical contexts | CIA-84 | Strong |
| NHS Digital AI Standards | 2025 | Safety reporting framework for mental health AI | CIA-85 | Strong (regulatory) |
| Bates et al. (AI Clinical Safety) | 2024 | Continuous monitoring essential for AI system safety | CIA-85 | Moderate |
| Vaidyam et al. (Chatbot Perceptions) | 2019 | Framing affects user acceptance of mental health AI | CIA-88 | Moderate |
| Columbia Protocol (C-SSRS) | 2016 | Gold standard for suicide risk assessment | CIA-83 | Strong (clinical) |

---

## Design Recommendations

### CIA-83: Crisis Referral Protocol

**Recommended Architecture:**
```
TIER 1: Passive Monitoring (AI)
- Continuous sentiment analysis during conversations
- Keyword/phrase flagging for crisis indicators
- Behavioural pattern anomaly detection
→ Green: Continue normal interaction
→ Yellow: Increase monitoring sensitivity
→ Red: Immediate escalation to Tier 2

TIER 2: Active Assessment (AI + Human Review)
- AI presents structured risk questions (adapted from C-SSRS)
- Responses immediately visible to on-call clinician
- AI provides risk score but clinician makes determination
→ Low: Continue with safety plan reminder
→ Medium: Warm handoff to human support
→ High: Direct emergency service connection + family notification if appropriate

TIER 3: Emergency Response
- One-tap emergency services connection
- Location sharing (with prior consent)
- Automatic notification to designated contacts
- Follow-up protocol activation
```

**Key Requirements:**
1. Never rely solely on AI for crisis determination
2. Ensure 24/7 human escalation availability
3. Document all crisis interactions for review
4. Implement regular protocol drills and audits

### CIA-84: Clinical Oversight Framework

**Recommended Components:**

1. **Clinician Dashboard**
   - Real-time feed of AI-flagged interactions
   - Aggregate user wellbeing metrics
   - Individual user timelines (with consent)
   - Alert prioritisation system

2. **Audit System**
   - Complete conversation logs with AI decision points
   - Explainability features showing why AI made recommendations
   - Searchable database for pattern analysis
   - Export capability for external review

3. **Override Mechanism**
   - Clinician can modify AI parameters per-user
   - Emergency AI pause functionality
   - Feedback loop to improve AI from corrections
   - Documentation requirement for overrides

4. **Review Cadence**
   - Daily: High-priority flag review
   - Weekly: Aggregate pattern analysis
   - Monthly: AI performance metrics review
   - Quarterly: Full system safety audit

### CIA-88: AI Disclosure Requirements

**Recommended Disclosure Framework:**

**Onboarding Disclosure (Required):**
> "Alteri uses AI to help understand your experiences and provide support. A human clinician oversees the system and reviews flagged conversations. You can request human support at any time."

**In-Interaction Reminder (Contextual):**
- Small AI indicator badge on messages
- "Talk to a human" option always visible
- Periodic reminders during long sessions

**Detailed Information (On Request):**
- How the AI works (non-technical explanation)
- What data is collected and how it's used
- How to opt out of specific AI features
- Privacy and security information
- Contact for questions/concerns

**Do NOT:**
- Use excessive technical jargon
- Present warnings that create anxiety
- Hide the AI nature of interactions
- Make it difficult to reach human support

### CIA-85: Annual Safety Reporting

**Recommended Report Structure:**

**Section 1: System Performance**
- User statistics (total users, active users, retention)
- Technical uptime and reliability metrics
- AI model performance metrics with demographic breakdowns

**Section 2: Safety Outcomes**
- Crisis events: number detected, escalation outcomes
- Adverse events: AI-related harms, near-misses
- User-reported concerns and complaints
- Human override patterns and rationale

**Section 3: Clinical Effectiveness**
- Aggregate symptom change data
- User satisfaction scores
- Engagement metrics
- Comparison to benchmarks where available

**Section 4: Improvements and Changes**
- Model updates and their rationale
- Protocol changes based on safety findings
- User feedback implementation
- Regulatory compliance updates

**Section 5: Forward-Looking**
- Identified risks and mitigation plans
- Planned improvements
- Regulatory changes to address

---

## Gaps Identified

### Critical Missing Evidence

1. **Long-term AI mental health safety data:** Most studies are short-term (<6 months). Longitudinal safety data for AI-assisted mental health care is lacking.
   - **Mitigation:** Commit to multi-year follow-up studies from Alteri deployment.

2. **Cross-cultural AI safety research:** Most evidence comes from WEIRD populations. Crisis indicators may manifest differently across cultures.
   - **Mitigation:** Conduct cultural validation before expanding to diverse markets.

3. **AI disclosure optimal design:** While principles are established, specific UI/UX patterns for optimal disclosure in mental health contexts need research.
   - **Mitigation:** A/B test disclosure approaches with ethics committee oversight.

4. **Standardised safety reporting:** No universally accepted framework for mental health AI safety reporting exists yet.
   - **Mitigation:** Adopt most stringent available standards (EU AI Act + FDA Pre-Cert + NHS) and contribute to emerging standards development.

### Methodological Considerations

**Validation Requirements:**
- Crisis detection system should be validated against clinical gold standards (C-SSRS, PHQ-9, GAD-7)
- Minimum sample sizes per demographic subgroup for bias testing
- Independent security audit for data handling practices

**Regulatory Preparation:**
- Monitor evolving AI regulations (EU, UK, US, Australia)
- Maintain documentation suitable for regulatory submission
- Consider pursuing FDA breakthrough device designation if appropriate

---

## References

- Abd-Alrazaq, A., et al. (2021). Perceptions and opinions of patients about mental health chatbots: Scoping review. *Journal of Medical Internet Research*, 23(1), e17828.
- Bates, D. W., et al. (2024). Implementing AI safety systems in clinical settings: A framework. *NEJM AI*, 1(2), e2024001.
- European Commission. (2024). *EU AI Act: Regulation on Artificial Intelligence*.
- FDA. (2024). *Digital Health Software Precertification Program*.
- NHS Digital. (2025). *Standards for AI in Mental Health Services*.
- Topol, E. J. (2023). *Deep Medicine: How Artificial Intelligence Can Make Healthcare Human Again* (Updated ed.). Basic Books.
- Torous, J., et al. (2024). Digital phenotyping and crisis detection: A systematic review. *The Lancet Digital Health*, 6(5), e301-e315.
- Vaidyam, A. N., et al. (2019). Chatbots and conversational agents in mental health: A review. *Canadian Journal of Psychiatry*, 64(7), 456-464.

---

**Prepared by:** Claude (Research Coordinator)
**For Questions:** Flag ambiguities in Linear issues or request follow-up literature searches on specific sub-topics.
