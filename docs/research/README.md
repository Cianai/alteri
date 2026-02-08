# Alteri Research Briefs

This directory contains evidence-based research briefs synthesising academic literature, regulatory developments, and industry best practices to inform Alteri platform design decisions.

---

## Published Briefs

### AI Safety and Ethics (2026-01-26)

**Files:**
- [[ai-safety-ethics]] - Full research brief (719 lines)
- [[ai-safety-ethics-executive-summary]] - One-page executive summary

**Scope:** Comprehensive analysis of AI safety and ethics requirements for mental health applications, addressing:
- CIA-83: Crisis Referral Protocol (NY/CA regulatory compliance)
- CIA-84: Human-in-the-Loop Clinical Oversight (Wysa copilot model)
- CIA-85: Annual Safety Reporting Infrastructure (CA SB 243)
- CIA-88: Explicit AI Disclosure UX (Brown "deceptive empathy" findings)

**Evidence Base:** 40+ sources including:
- Regulatory: Character.AI settlement, California SB 243, Illinois WOPR, FDA guidance
- Clinical: VERA-MH, MindBench.ai, Stanford MENTAT benchmarks
- Industry: Anthropic Constitutional AI, Microsoft HSI, Wysa clinical model
- Ethics: Buddhist AI frameworks, contemplative superalignment research

**Key Recommendations:**
1. Four-layer safety architecture (crisis + oversight + reporting + disclosure)
2. Wysa-style tiered human oversight (Tier 1-4)
3. Continuous crisis detection with 988 Lifeline integration
4. HIPAA-compliant safety monitoring for annual CA reporting (first due July 2027)
5. Anti-deceptive empathy constitutional prompting

**Critical Gaps Identified:**
- No longitudinal outcome data for AI mental health interventions
- No published research on network analysis integration with AI safety
- Limited neurodivergent user safety research
- Cultural adaptation needed for Irish market

---

## Brief Status Key

| Status | Meaning |
|--------|---------|
| Complete | Evidence synthesis finished; ready for implementation planning |
| In Progress | Active research and synthesis |
| Planned | Identified need; not yet started |

---

## Planned Briefs

### Network Psychometrics Implementation
**Status:** Planned
**Scope:** Evidence-based design recommendations for ego-network assessment, visualisation, and intervention within Alteri platform
**Linear Issues:** CIA-52, CIA-53, CIA-54, CIA-55
**Target Date:** Pre-PSYNETS (26-30 Jan 2026)

### Buddhist Contemplative AI Framework
**Status:** Planned
**Scope:** Integration of Buddhist ethics principles (Hershock, Laukkonen) into Constitutional AI architecture
**Linear Issues:** CIA-30, CIA-64
**Target Date:** Q1 2026

### Transdiagnostic Mechanisms Assessment
**Status:** Planned
**Scope:** Evidence review of intolerance of uncertainty, emotion dysregulation, repetitive negative thinking measurement and intervention
**Linear Issues:** TBD (assessment selection)
**Target Date:** Q2 2026

---

## Brief Format

All research briefs follow this structure:

1. **Executive Summary** - Key recommendations with evidence strength ratings
2. **Key Findings** - 3-5 synthesised findings with Strong/Moderate/Limited evidence classifications
3. **Evidence Summary Table** - Paper, year, key finding, Linear issue, evidence strength
4. **Design Recommendations by Linear Issue** - Specific implementation guidance
5. **Gaps Identified** - Research limitations and opportunities
6. **Implementation Priorities** - Phased roadmap with timelines
7. **Recommended Research Partnerships** - Academic/clinical collaborators
8. **References** - Full citations organised by category

---

## Usage Guidelines

**For Product Team:**
- Start with executive summary for high-level understanding
- Review design recommendations for your Linear issue
- Flag concerns/questions for research team

**For Engineering:**
- Focus on technical implementation sections
- Note evidence strength when making tradeoff decisions
- Strong evidence = non-negotiable; Moderate/Limited = optimisation opportunities

**For Clinical Oversight:**
- Review clinical research sources
- Validate recommendations against professional standards
- Identify additional safety considerations

**For Legal/Regulatory:**
- Verify all regulatory citations before implementation
- Review disclosure language and compliance requirements
- Monitor developments (field evolving rapidly)

---

## Maintenance

**Update Triggers:**
- Major regulatory changes (new laws, FDA guidance, court decisions)
- Significant new research publications (RCTs, meta-analyses, benchmarks)
- Industry incidents (safety failures, settlements, enforcement actions)
- Internal findings (user research, safety monitoring, clinical review)

**Review Frequency:**
- Regulatory sections: Quarterly
- Clinical research: Semi-annually
- Implementation priorities: After each phase completion

**Version Control:**
- Document control table at end of each brief
- Significant updates = new version number
- Archive previous versions in `briefs/archive/[brief-name]-v[X.Y].md`

---

## Contact

**Research Lead:** Cian O'Sullivan (via Linear issues or Obsidian notes)
**Clinical Oversight:** [TBD - hire per CIA-84 recommendations]
**Legal Review:** [TBD - contract per Phase 1 roadmap]

---

Last Updated: 2026-01-26
