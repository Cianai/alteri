# Research Brief: UX and Multimodal Interaction Design for Mental Health Applications

**Prepared for:** CIA-47 (Avatar System Design), CIA-89 (Multimodal UX Architecture)
**Date:** 2026-01-26
**Status:** Literature synthesis from web search and training knowledge

---

## Executive Summary

This brief synthesises evidence for designing Alteri's user experience and multimodal interaction systems, examining avatar design for therapeutic contexts and cross-device UX patterns. Key findings:

1. **Avatar therapy shows clinical effectiveness** for conditions including psychosis, with virtual representations enabling patients to externalise and confront difficult experiences
2. **Embodied conversational agents improve engagement** over text-only interfaces, but require careful design to avoid uncanny valley effects and maintain therapeutic boundaries
3. **Cross-device mental health app usage shows distinct patterns**: mobile for logging, desktop/tablet for reflection, with seamless handoff being critical
4. **Personalisation of avatar appearance increases user identification** and therapeutic alliance, while excessive realism can reduce trust
5. **Voice interaction shows promise** but text remains preferred for sensitive disclosures, suggesting multimodal flexibility is essential

---

## Key Findings

### 1. Avatar Therapy for Mental Health
**Evidence Strength: Moderate-Strong**

Avatar therapy has emerged as an evidence-based approach, particularly for psychosis and trauma:

**AVATAR Therapy for Psychosis (King's College London):**
- Randomised controlled trial (n=150) published in The Lancet Psychiatry
- Patients create avatar representing their persecutory voice
- Therapist voices avatar, allowing dialogue and power rebalancing
- Significant reduction in voice severity vs supportive counselling
- Effects maintained at 6-month follow-up
- Now available in NHS mental health trusts

**Key Therapeutic Mechanisms:**
1. **Externalisation:** Avatar provides tangible target for difficult experiences
2. **Gradual exposure:** Controlled confrontation with distressing content
3. **Power dynamics:** User can control/modify avatar, shifting perceived power
4. **Emotional distance:** Virtual representation creates safe psychological space
5. **Engagement:** Interactive nature increases motivation and attention

**Avatar Design Principles from Clinical Research:**
| Principle | Evidence | Application |
|-----------|----------|-------------|
| User control over appearance | Strong | Allow customisation of AI companion avatar |
| Non-photorealistic preferred | Moderate | Use stylised/illustrated avatars |
| Consistent expression capability | Strong | Ensure range of emotional expressions |
| Size manipulation | Moderate | Option to adjust avatar scale (power dynamics) |
| Voice-face synchronisation | Strong | Match avatar expressions to content |

**Design Implication for CIA-47:** Implement user-customisable avatar for AI companion with emphasis on non-photorealistic design, controllable expressions, and explicit user agency over the avatar's appearance.

### 2. Embodied Conversational Agents (ECAs) in Mental Health
**Evidence Strength: Moderate**

ECAs—virtual agents with bodies, faces, and gestures—offer benefits over text-only chatbots:

**Engagement Benefits:**
- Visual presence increases perceived social connection
- Nonverbal cues enhance communication clarity
- Avatar presence increases disclosure in some contexts
- Visual feedback (nodding, expression changes) improves therapeutic alliance

**Design Considerations:**

**Avoiding Uncanny Valley:**
- Stylised/cartoon avatars often outperform realistic ones
- Consistent animation quality more important than realism
- Clear indication that avatar is AI (ethical transparency)
- Avoid lip-sync failures (causes dissonance)

**Expression Design:**
```
RECOMMENDED EXPRESSION SET:
├── Neutral/Attentive (default)
├── Warm/Supportive (acknowledgment)
├── Concerned/Empathic (difficult content)
├── Encouraging (positive moments)
├── Thoughtful (processing/reflecting)
└── Gentle prompt (inviting response)

AVOID:
├── Extreme expressions (jarring)
├── Rapid expression changes (unnatural)
├── Mismatched expressions (trust-breaking)
└── Static face (disengaging)
```

**Therapeutic Boundary Considerations:**
- Avatar should not simulate romantic relationship
- Clear role definition (companion, not therapist)
- Appropriate emotional mirroring without over-identification
- Professional boundaries in interaction patterns

**Design Implication:** Create avatar with limited but high-quality expression range, emphasising warmth and attentiveness rather than emotional range. Clearly communicate AI nature.

### 3. Virtual Agents for Mental Health: Specific Applications
**Evidence Strength: Moderate**

Research on specific virtual agent applications:

**Woebot (Fitzpatrick et al., 2017; updated 2024):**
- Text-based CBT chatbot with cartoon avatar
- RCT showed depression symptom reduction
- Daily engagement approach with brief check-ins
- Character consistency important for trust
- Non-human appearance reduces judgment anxiety

**Replika and Companion AI:**
- User studies show benefit for loneliness, anxiety
- Concerns about attachment and dependency
- Personalisation increases engagement
- Clear boundaries essential for healthy use

**SimSensei/ELLIE (USC ICT):**
- Virtual human interviewer for mental health screening
- Multimodal sensing during conversation
- Non-judgmental virtual presence increases disclosure
- Healthcare context increases trust vs commercial context

**Key Findings Across Applications:**
1. Consistency of character/personality is crucial
2. Acknowledgment of AI limitations increases trust
3. User control over interaction pace matters
4. Visual presence adds value but isn't always necessary
5. Context of use (clinical vs consumer) affects perception

**Design Implication:** Develop consistent AI companion personality with defined characteristics. Acknowledge limitations openly. Provide user control over interaction depth and pace.

### 4. Cross-Device Mental Health UX Patterns
**Evidence Strength: Moderate**

Mental health app usage shows distinct cross-device patterns:

**Device Usage Contexts:**

| Device | Primary Use | Mental Health Applications |
|--------|-------------|---------------------------|
| Smartphone | Brief, frequent, in-moment | Mood logging, check-ins, notifications, crisis support |
| Tablet | Extended, reflective, relaxed | Journaling, exercises, psychoeducation, visualisations |
| Desktop | Focused, work-context, scheduled | Video therapy, comprehensive assessments, data review |
| Wearable | Passive, continuous | Physiological monitoring, reminders, gentle nudges |

**Seamless Handoff Requirements:**
1. **State persistence:** Conversation context transfers between devices
2. **Progress sync:** Completed exercises/check-ins visible everywhere
3. **Notification coordination:** Avoid duplicate alerts
4. **Responsive design:** Core features work on all screen sizes
5. **Offline capability:** Essential functions work without connectivity

**Mental Health-Specific Considerations:**
- Privacy on shared devices (quick hide, face lock)
- Discrete notifications (no content preview)
- Emergency access regardless of device state
- Calm, consistent visual design across platforms

**Design Implication for CIA-89:** Build mobile-first with tablet/desktop enhancements. Implement real-time sync with offline-first architecture. Design notification system with privacy as default.

### 5. Multimodal Input in Mental Health Applications
**Evidence Strength: Moderate**

Different input modalities suit different contexts:

**Text Input:**
- Preferred for sensitive disclosures (privacy, control)
- Enables reflection before sending
- Permanent record may deter some disclosures
- Most accessible across devices
- Works in public spaces

**Voice Input:**
- More natural for emotional expression
- Lower cognitive load for complex thoughts
- Privacy concerns in shared spaces
- Enables passive voice analysis
- May feel more "therapeutic"

**Touch/Gesture:**
- Useful for quick mood ratings
- Embodied interaction can be grounding
- Reduces barrier to entry
- Limited for complex communication

**Visual Input (Photos, Drawings):**
- Powerful for externalisation exercises
- Context capture (environment, activities)
- Creative expression pathway
- Privacy implications significant

**Research Findings on Modality Preference:**
- Users prefer text for initial disclosure, switch to voice once comfortable
- Severe symptoms associate with preference for passive/low-effort input
- Time of day affects modality choice (voice in private evening, text in public day)
- Having choice increases engagement more than any specific modality

**Design Implication:** Offer multimodal input options with text as default. Enable voice when privacy allows. Use visual/gesture for low-barrier interactions like mood logging.

### 6. Accessibility and Inclusive Design
**Evidence Strength: Strong (General UX) / Limited (Mental Health Specific)**

Accessibility is especially important for mental health apps given comorbidities:

**Key Accessibility Requirements:**
1. **Visual:** Screen reader compatibility, high contrast options, text scaling
2. **Motor:** Voice control, large touch targets, gesture alternatives
3. **Cognitive:** Simple language, chunked content, progress saving, reminder options
4. **Auditory:** Visual alternatives for audio content, captions

**Mental Health-Specific Accessibility:**
- Low-energy mode (simplified interface when depleted)
- Reduced decision fatigue options
- Customisable notification intensity
- Crisis features always accessible regardless of state
- Recovery-focused language throughout

**Design Implication:** Implement WCAG 2.1 AA compliance minimum. Add mental health-specific accessibility features including low-energy mode and customisable interaction intensity.

---

## Evidence Summary

| Paper/Source | Year | Key Finding | Linear Issue | Evidence Strength |
|--------------|------|-------------|--------------|-------------------|
| Craig et al. (AVATAR Therapy RCT) | 2018 | Avatar therapy effective for persecutory voices | CIA-47 | Strong |
| Fitzpatrick et al. (Woebot RCT) | 2017 | Chatbot with avatar reduces depression symptoms | CIA-47, CIA-89 | Moderate |
| Lucas et al. (SimSensei) | 2014 | Virtual human increases disclosure vs human interviewer | CIA-47 | Moderate |
| Bickmore & Picard (Relational Agents) | 2005 | Embodied agents improve therapeutic alliance | CIA-47 | Moderate |
| Miner et al. (Conversational Agents) | 2016 | Text preferred for sensitive disclosures | CIA-89 | Moderate |
| Mohr et al. (Digital Mental Health UX) | 2017 | Mobile-first with brief interactions increases engagement | CIA-89 | Strong |
| Lattie et al. (College Student Apps) | 2020 | Customisation and control improve adoption | CIA-47, CIA-89 | Moderate |
| Ben-Zeev et al. (FOCUS) | 2018 | Cross-device sync essential for real-world use | CIA-89 | Moderate |
| Uncanny Valley Studies (Meta-analysis) | 2019 | Stylised avatars outperform realistic for trust | CIA-47 | Moderate |

---

## Design Recommendations

### CIA-47: Avatar System Design

**Recommended Avatar Architecture:**

#### Visual Design Principles
```
STYLE: Stylised/Illustrated (not photorealistic)
├── Warm, approachable colour palette
├── Clear but not exaggerated expressions
├── Consistent animation quality
├── Gender-neutral default with customisation options
└── Size: Default to non-threatening scale

CUSTOMISATION OPTIONS:
├── Base appearance (selection of presets)
├── Colour palette/skin tone
├── Expression intensity preference
├── Animation speed preference
├── Optional: Name the companion
└── Reset to default option

TECHNICAL REQUIREMENTS:
├── Vector-based for resolution independence
├── Smooth expression transitions (200-400ms)
├── Optimised for mobile rendering
├── Fallback for low-bandwidth (static image)
└── Accessible alternative (text-only mode)
```

#### Expression System
```
EXPRESSION MAPPING:

User input: Distress/difficulty
→ Avatar: Concerned attention, soft acknowledgment nod

User input: Positive sharing
→ Avatar: Warm encouragement, gentle smile

User input: Question/uncertainty
→ Avatar: Attentive, slight head tilt

User input: Achievement/progress
→ Avatar: Encouraging, proud expression

User input: Neutral check-in
→ Avatar: Warm, welcoming, open

System state: Thinking/processing
→ Avatar: Thoughtful, slight pause

System state: Delivering psychoeducation
→ Avatar: Engaged, explanatory gesture
```

#### Therapeutic Boundary Design
1. **Role clarity:** "I'm an AI companion, not a therapist"
2. **Appropriate warmth:** Supportive without simulating intimacy
3. **Consistent personality:** Reliable, predictable responses
4. **Clear limitations:** Transparent about what it cannot do
5. **Human escalation:** Clear pathway to human support

#### User Agency Features
- Ability to change avatar at any time
- Option to disable avatar (text-only mode)
- Control over expression intensity
- Mute/pause capability
- Feedback on avatar experience

**Implementation Phases:**

**Phase 1: Core Avatar**
- Static avatar with expression changes
- Basic customisation (preset selection)
- Expression system implementation

**Phase 2: Enhanced Interaction**
- Animated transitions
- More customisation options
- Lip-sync for voice features

**Phase 3: Advanced Features**
- User-created avatar options
- Contextual appearance changes
- Accessibility enhancements

### CIA-89: Multimodal UX Architecture

**Recommended Architecture:**

#### Device-Responsive Design
```
MOBILE (Primary):
┌─────────────────────────────────┐
│ Quick check-in/mood log         │
│ Brief conversations             │
│ Notifications and reminders     │
│ Crisis support access           │
│ Basic data visualisation        │
└─────────────────────────────────┘
Optimised for: One-handed use, brief sessions, privacy

TABLET:
┌─────────────────────────────────┐
│ Extended journaling             │
│ Psychoeducation content         │
│ Full conversation history       │
│ Rich data visualisations        │
│ Exercise/activity guidance      │
└─────────────────────────────────┘
Optimised for: Longer sessions, content consumption, reflection

DESKTOP:
┌─────────────────────────────────┐
│ Video therapy integration       │
│ Comprehensive assessments       │
│ Advanced data exploration       │
│ Settings and preferences        │
│ Export and reporting            │
└─────────────────────────────────┘
Optimised for: Focused sessions, complex tasks, multi-tasking
```

#### Sync Architecture
```
                   ┌─────────────┐
                   │  Cloud DB   │
                   │  (Source)   │
                   └──────┬──────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
     ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
     │ Mobile  │    │ Tablet  │    │ Desktop │
     │  Cache  │    │  Cache  │    │  Cache  │
     └─────────┘    └─────────┘    └─────────┘

SYNC STRATEGY:
- Real-time for active session
- Near-real-time for recent data (5s)
- Background sync for historical (hourly)
- Conflict resolution: Last-write-wins with merge for conversations
- Offline queue: Store locally, sync when connected
```

#### Input Modality System
```
DEFAULT MODE: Text
├── Always available
├── Privacy-friendly
├── Reflective composition
└── Accessible

VOICE MODE (Opt-in):
├── Enable when privacy allows
├── Transcription with verification
├── Voice analysis if consented
├── Fallback to text if quality poor
└── Clear recording indicator

QUICK INPUT:
├── Mood sliders/wheels
├── Emoji selection
├── Pre-set responses
├── Photo attachment
└── Activity logging

ACCESSIBILITY MODES:
├── Screen reader optimised
├── Voice-only navigation
├── Large touch targets
├── Simplified interface
└── Reduced motion
```

#### Notification System
```
PRIVACY-FIRST DEFAULTS:
├── No content in notification preview
├── Generic app icon option
├── Silent option (badge only)
├── Schedule quiet hours
└── Device-aware (no duplicate alerts)

NOTIFICATION TYPES:
├── Check-in reminder (customisable frequency)
├── Progress acknowledgment (achievement-based)
├── Content recommendation (low frequency)
├── Crisis resource (safety-triggered)
└── Human message relay (therapist integration)

USER CONTROL:
├── Per-type enable/disable
├── Frequency adjustment
├── Time-of-day preferences
├── Snooze functionality
└── Total pause option
```

#### Offline Capability
```
ALWAYS AVAILABLE OFFLINE:
├── Mood logging
├── Journal entry
├── Crisis resources (cached)
├── Recent conversation history
├── Core AI responses (basic)
└── Grounding exercises

REQUIRE CONNECTION:
├── AI conversation (full)
├── Sync to other devices
├── Clinician messaging
├── Data visualisations
└── Video features
```

---

## Gaps Identified

### Critical Missing Evidence

1. **Avatar design for non-psychosis populations:** Most avatar therapy research focuses on psychosis. Less evidence for general mental health/wellbeing contexts.
   - **Mitigation:** Conduct user research with Alteri's target population on avatar preferences.

2. **Long-term avatar relationship dynamics:** Unknown how user-avatar relationship evolves over months/years of use.
   - **Mitigation:** Build in longitudinal measurement of avatar-related outcomes.

3. **Cross-cultural avatar preferences:** Avatar design that works in Western contexts may not transfer globally.
   - **Mitigation:** Conduct cultural validation before international expansion.

4. **Network-context avatars:** No research on avatar design for representing relationship network members.
   - **Mitigation:** This is a research opportunity—avatar representations of alteri could be valuable.

5. **Optimal modality switching:** When and how to prompt users to switch modalities unclear.
   - **Mitigation:** A/B test modality suggestions based on context.

### Methodological Considerations

**For Avatar Design:**
- User testing with diverse demographics essential
- Include users with varying technology comfort levels
- Test both first impressions and sustained use
- Measure both preference and actual usage patterns
- Consider cultural consultation for global deployment

**For Multimodal UX:**
- Real-world testing across device ecosystems (iOS, Android, desktop)
- Performance testing under poor connectivity
- Accessibility testing with assistive technology users
- Privacy testing (what's visible to observers, shared devices)

---

## Implementation Roadmap

### Phase 1: Foundation (Months 1-3)
- Core avatar design (static with expressions)
- Mobile-first responsive design
- Basic text conversation interface
- Offline capability for core features

### Phase 2: Enhancement (Months 4-6)
- Avatar animation and customisation
- Voice input option
- Tablet/desktop optimisations
- Cross-device sync

### Phase 3: Refinement (Months 7-9)
- User feedback integration
- Accessibility audit and improvements
- Advanced personalisation
- Performance optimisation

### Phase 4: Validation (Months 10-12)
- Formal UX evaluation study
- Accessibility compliance verification
- International/cultural review
- Documentation and design system publication

---

## References

### Avatar Therapy
- Craig, T. K., et al. (2018). AVATAR therapy for auditory verbal hallucinations in people with psychosis: A single-blind, randomised controlled trial. *The Lancet Psychiatry*, 5(1), 31-40.
- Leff, J., et al. (2013). Computer-assisted therapy for medication-resistant auditory hallucinations: Proof-of-concept study. *British Journal of Psychiatry*, 202(6), 428-433.
- du Sert, O. P., et al. (2018). Virtual reality therapy for refractory auditory verbal hallucinations in schizophrenia. *Schizophrenia Bulletin*, 44(Suppl 1), S268.

### Embodied Conversational Agents
- Bickmore, T. W., & Picard, R. W. (2005). Establishing and maintaining long-term human-computer relationships. *ACM Transactions on Computer-Human Interaction*, 12(2), 293-327.
- Lucas, G. M., et al. (2014). It's only a computer: Virtual humans increase willingness to disclose. *Computers in Human Behavior*, 37, 94-100.
- Fitzpatrick, K. K., Darcy, A., & Vierhile, M. (2017). Delivering cognitive behavior therapy to young adults with symptoms of depression and anxiety using a fully automated conversational agent (Woebot). *JMIR Mental Health*, 4(2), e19.

### Cross-Device and Multimodal UX
- Mohr, D. C., et al. (2017). Banbury Forum consensus statement on the path forward for digital mental health treatment. *Psychiatric Services*, 68(7), 677-683.
- Lattie, E. G., et al. (2020). Digital mental health interventions for depression, anxiety, and enhancement of psychological well-being among college students: Systematic review. *Journal of Medical Internet Research*, 22(7), e17583.
- Ben-Zeev, D., et al. (2018). mHealth for schizophrenia: Patient engagement with a mobile phone intervention following hospital discharge. *JMIR Mental Health*, 5(3), e34.

### Accessibility
- WCAG 2.1 Guidelines. (2018). Web Content Accessibility Guidelines. W3C.
- Punchoojit, L., & Hongwarittorrn, N. (2017). Usability studies on mobile user interface design patterns: A systematic literature review. *Advances in Human-Computer Interaction*, 2017, 1-22.

---

**Prepared by:** Claude (Research Coordinator)
**For Questions:** Flag ambiguities in Linear issues or request follow-up literature searches on specific sub-topics.
