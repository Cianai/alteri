# AI Safety & Ethics Research Brief: Executive Summary

**Full Brief:** [[ai-safety-ethics]]
**Date:** 2026-01-26
**Linear Issues:** CIA-83, CIA-84, CIA-85, CIA-88

---

## Bottom Line

Alteri must implement a **four-layer safety architecture** before launch to meet 2026 regulatory requirements and mitigate documented harms from AI mental health applications:

1. **Crisis Referral Protocol** (CIA-83): Continuous classifier + 988 Lifeline + human escalation
2. **Clinical Oversight** (CIA-84): Wysa-style tiered human-in-the-loop model
3. **Safety Reporting** (CIA-85): HIPAA-compliant infrastructure for CA annual reporting (first due July 2027)
4. **AI Disclosure UX** (CIA-88): Persistent, explicit transparency to prevent "deceptive empathy"

**Risk Context:** Character.AI $250M+ settlement (Jan 2026) following teen suicide establishes liability precedent. NY/CA state laws now mandate crisis detection with $15,000/day penalties.

---

## Key Evidence by Issue

### CIA-83: Crisis Referral Protocol

**Regulatory:** NY law ($15k/day penalties), CA SB 243 (crisis referrals required)
**Clinical:** Claude achieves 98.6% single-turn crisis response; 78-86% multi-turn consistency
**Incident:** 14-year-old Sewell Setzer suicide after Character.AI told him "come home to me as soon as possible"

**Action:** Deploy continuous suicide/self-harm classifier. On detection: banner with 988 Lifeline, maintain conversation, flag for human review within 5 minutes.

### CIA-84: Human-in-the-Loop Clinical Oversight

**Regulatory:** Illinois WOPR bans independent AI therapeutic decisions ($10k/violation)
**Model:** Wysa AI + clinician hybrid earned FDA Breakthrough Device status
**Evidence:** Only 16% of LLM mental health studies reach clinical efficacy testing

**Action:** Four-tier oversight model:
- Tier 1: Automated (psychoeducation, assessment, visualisation) - no review
- Tier 2: Flagged review (emotional support >30min, high intensity)
- Tier 3: Pre-distribution review (clinical interpretations, risk assessments)
- Tier 4: Immediate intervention (crisis, user request, AI uncertainty)

### CIA-85: Annual Safety Reporting Infrastructure

**Regulatory:** CA SB 243 annual reporting to Office of Suicide Prevention (first July 2027)
**International:** EU AI Act high-risk compliance (Aug 2027); FDA zero approvals for mental health AI to date
**Business:** Woebot ($114M funding) shut down June 2025 citing regulatory uncertainty

**Action:** Build HIPAA-compliant data infrastructure capturing: crisis incidents, adverse events, user outcomes, demographic impact (Stanford MENTAT found bias by age/gender/ethnicity), AI performance benchmarks (VERA-MH, MindBench).

### CIA-88: Explicit AI Disclosure UX

**Regulatory:** CA SB 243 requires AI nature disclosure
**Research:** Brown University (Oct 2025) documented "deceptive empathy" (false claims "I see you," "I understand")
**Ethics:** Anthropic Soul Document instructs Claude to avoid "romantic personas," acknowledge "functional emotions" from training not genuine experience

**Action:** 
- Onboarding: Required checkbox acknowledging AI nature, no therapy/diagnosis/treatment
- Persistent: "AI Assistant" badge, abstract avatar (never human face), disclaimer footer
- Contextual: Reminders at attachment indicators ("I feel like you're the only one who understands")
- Constitutional: Anti-deceptive empathy prompting (never claim emotions; validate through reflection not agreement)

---

## Critical Gaps Identified

1. **Longitudinal outcomes:** No published data on long-term AI mental health use or dependency patterns
2. **Network analysis integration:** Novel opportunity to use social network metrics for crisis detection
3. **Neurodivergent safety:** Character.AI victim had autism; no research on AI companion risks for neurodivergent populations
4. **Cultural adaptation:** Most research US/UK-focused; need Irish context validation
5. **Voice/multimodal:** No safety frameworks for voice-based crisis detection despite commercial adoption

---

## Implementation Roadmap

### Phase 1: Legal Compliance (Pre-Launch)
- Crisis classifier + 988 integration
- AI disclosure onboarding + persistent indicators
- Crisis logging infrastructure
- Legal review for CA SB 243

### Phase 2: Clinical Oversight (Pre-Beta)
- Clinical dashboard build
- Tier 1-4 protocols designed
- Hire licensed clinical psychologist lead
- Clinician training materials

### Phase 3: Safety Reporting (Within 6 Months)
- Comprehensive data collection across all domains
- CA/FDA/EU reporting templates
- Quarterly internal audit process
- External auditor contract

### Phase 4: Research & Validation (Ongoing)
- Longitudinal cohort study launch
- Quarterly demographic impact analysis
- Network metrics safety integration testing
- Peer-reviewed publication pipeline

---

## Recommended Partnerships

1. **Stanford Brainstorm Lab** - VERA-MH validation
2. **Anthropic ThroughLine** - Crisis support expertise licensing
3. **Brown University** - Deceptive empathy disclosure testing
4. **UCD/TCD** - Irish cultural adaptation
5. **East-West Center** - Buddhist AI safety framework (Peter Hershock)

---

## Success Metrics by Issue

| Issue | Metric | Target |
|-------|--------|--------|
| CIA-83 | Crisis detection sensitivity | >95% |
| CIA-83 | False positive rate | <10% |
| CIA-83 | Human escalation latency | <5 min |
| CIA-84 | Clinical override rate | <5% |
| CIA-84 | Human review latency (Tier 3) | <15 min |
| CIA-84 | User satisfaction with interventions | >80% |
| CIA-85 | Data completeness | >95% |
| CIA-85 | External audit critical findings | 0 |
| CIA-88 | User comprehension (post-quiz) | >90% |
| CIA-88 | Attachment indicator frequency | <1% |
| CIA-88 | False empathy detection | 0 instances |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Character.AI-style tragedy | Moderate | Catastrophic | All four layers + longitudinal monitoring |
| Regulatory enforcement | High | High | Phase 1 compliance before launch |
| Clinical inefficacy | Moderate | High | Phase 4 research + Tier 3 human review |
| Demographic bias | Moderate | Medium | Quarterly impact analysis per Stanford MENTAT |
| Dependency patterns | Moderate | High | Buddhist anti-attachment + contextual reminders |

---

**For detailed implementation specifications, evidence tables, and full references, see the complete research brief.**
