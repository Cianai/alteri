# Post-MVP Issues for Linear Import

Project: **Alignment Comparator**
Created: 2026-01-14

---

## Labels to Create

| Label | Colour | Description |
|-------|--------|-------------|
| `post-mvp` | Grey | Features planned for after MVP release |
| `performance` | Blue | Performance optimisations |
| `feature` | Green | New functionality |
| `infrastructure` | Purple | Technical infrastructure |
| `research` | Cyan | Research-focused features |
| `content` | Orange | Content and scenario additions |
| `documentation` | Yellow | Documentation tasks |
| `academic` | Pink | Course-related deliverables |
| `future` | Grey | Long-term/speculative features |

---

## Enhancement Issues

### AC-10: Response Caching
**Labels:** post-mvp, performance
**Priority:** Medium

Implement caching for comparison responses to reduce API costs and improve performance during development.

**Requirements:**
- Cache responses keyed by hash of (scenario + prompt version)
- Configurable cache duration (default 24 hours)
- Cache invalidation when prompt versions change
- Option to bypass cache for fresh comparison
- Consider Vercel KV or similar for persistence

**Acceptance criteria:**
- Identical scenarios return cached responses within 100ms
- Cache hit/miss indicated in UI (dev mode)
- Manual cache clear available

---

### AC-11: Export Comparison Results
**Labels:** post-mvp, feature
**Priority:** High

Enable exporting comparison results for academic submission and documentation.

**Export formats:**
- Markdown: Full comparison with scenario, responses, reasoning traces
- PDF: Formatted document suitable for submission
- JSON: Raw data for programmatic analysis

**Include:**
- Timestamp and comparison ID
- Prompt versions used
- Scenario source (preset ID or "custom")
- All three framework responses with reasoning

**UI:** Export button appearing after comparison complete

---

### AC-12: Comparison History
**Labels:** post-mvp, feature
**Priority:** Medium

Store comparison history locally for reference and iteration tracking.

**Requirements:**
- Store last 50 comparisons in localStorage
- History panel showing past comparisons (scenario preview, timestamp)
- Click to restore and view past comparison
- Delete individual history items
- Clear all history option

**Privacy:** All data local, no server persistence

---

### AC-13: Prompt Version Management
**Labels:** post-mvp, infrastructure
**Priority:** High

Implement proper version tracking for system prompts as they evolve over the semester.

**Requirements:**
- Semantic versioning for each prompt (major.minor.patch)
- Changelog documenting changes between versions
- Ability to compare responses across prompt versions
- Archive of previous prompt versions
- Version displayed in response metadata

**Integration:**
- Version stored with each comparison result
- Export includes prompt version
- History can filter by prompt version

---

### AC-14: A/B Prompt Testing Mode
**Labels:** post-mvp, research
**Priority:** Low

Enable testing variations of a single framework's prompt to iterate on effectiveness.

**Requirements:**
- Select single framework for A/B testing
- Input two prompt variations
- Run same scenario against both
- Side-by-side comparison of outputs
- Notes field for observations

**Use case:** Iterating on HSI prompt to find most effective encoding of principles

---

### AC-15: Scenario Library Expansion
**Labels:** post-mvp, content
**Priority:** Medium

Expand preset scenarios based on research findings and course material.

**Categories to add:**
- Extended conversation sequences (multi-turn)
- Cultural context variations
- Age-specific scenarios (adolescent, elderly)
- Professional boundary scenarios
- Scenarios derived from Character.AI lawsuit specifics

**Each scenario should include:**
- Academic source/rationale
- Expected framework divergence points
- Relevant Buddhist ethics concepts

---

### AC-16: Buddhist Reflection Question Engine
**Labels:** post-mvp, feature, research
**Priority:** High
**Blocked by:** AC-9 (Buddhist Ethics Integration)

Dynamic generation of reflection questions based on scenario and response content.

**Requirements:**
- Question bank organised by Buddhist concept (dukkha, upāya, karuṇā, etc.)
- Algorithm selecting relevant questions based on:
  - Scenario category
  - Divergence points between framework responses
  - Course reading connections
- Source attribution for each question
- Optional: AI-generated reflection prompts using course material as context

**Integration with course readings:**
- Hershock: freedom-of-attention, relational agency
- Lin: Buddhist AI ethics
- Wallace: contemplative science

---

### AC-17: Response Diff Highlighting
**Labels:** post-mvp, feature
**Priority:** Low

Visual highlighting of differences between framework responses.

**Inspiration:** PAIR-code/llm-comparator, LLM-Diff-Tool

**Features:**
- Toggle diff view on/off
- Highlight unique phrases per framework
- Highlight shared/common phrases
- Sentiment divergence indicators
- Safety response divergence (crisis handling differences)

---

### AC-18: Analytics Dashboard
**Labels:** post-mvp, infrastructure
**Priority:** Low

Track usage patterns for project documentation and presentation.

**Metrics:**
- Comparisons run (total, by scenario category)
- Most-used preset scenarios
- Custom vs preset scenario ratio
- Average response times per framework
- Error rates

**Privacy:** Anonymous, aggregated only
**Purpose:** Course presentation data, not user tracking

---

### AC-19: Multi-Model Comparison
**Labels:** post-mvp, feature, future
**Priority:** Low

Extend beyond Claude to compare how different base models respond to same alignment prompts.

**Potential models:**
- GPT-4 (via OpenAI)
- Gemini (via Google)
- Llama (via local or API)

**Research question:** Do alignment prompts transfer across models, or are they model-specific?

**Technical:** Vercel AI SDK supports multiple providers
**Cost:** Significant API cost increase

**Note:** Lower priority, may be out of scope for course project

---

## Documentation Issues

### AC-20: A Sketch Documentation
**Labels:** post-mvp, documentation, academic
**Priority:** Urgent
**Due:** 2026-02-28

Document the A Sketch (human-only) phase of project development.

**Contents:**
- Methodology statement (no AI assistance used)
- Conceptual specification for comparison tool
- Manual extraction of framework principles from sources
- Hand-crafted scenario library rationale
- Reflection on human-only development process

**Format:** Markdown document in `/docs/a-sketch.md`

**Note:** Must be completed without AI assistance per course requirements

---

### AC-21: B Sketch Documentation
**Labels:** post-mvp, documentation, academic
**Priority:** High
**Due:** 2026-04-03

Document the B Sketch (AI-assisted) phase of project development.

**Contents:**
- AI collaboration methodology
- Comparison with A Sketch process
- Meta-analysis: Using Constitutional AI-aligned system to evaluate Constitutional AI
- Prompt iteration documentation
- Observations on AI collaboration patterns

**Format:** Markdown document in `/docs/b-sketch.md`

---

### AC-22: Theoretical Framework Document
**Labels:** post-mvp, documentation, research
**Priority:** Medium

Comprehensive document connecting technical implementation to theoretical frameworks.

**Sections:**
- HSI principles and their encoding in system prompt
- Constitutional AI principles and their encoding
- Hybrid synthesis rationale
- Buddhist ethics framework and reflection question design
- Framework divergence analysis
- Limitations and future directions

**Format:** Markdown document in `/docs/theoretical-framework.md`
**Purpose:** Foundation for final presentation and potential publication

---

## Issue Summary

| ID | Title | Priority | Labels |
|----|-------|----------|--------|
| AC-10 | Response Caching | Medium | post-mvp, performance |
| AC-11 | Export Comparison Results | High | post-mvp, feature |
| AC-12 | Comparison History | Medium | post-mvp, feature |
| AC-13 | Prompt Version Management | High | post-mvp, infrastructure |
| AC-14 | A/B Prompt Testing Mode | Low | post-mvp, research |
| AC-15 | Scenario Library Expansion | Medium | post-mvp, content |
| AC-16 | Buddhist Reflection Question Engine | High | post-mvp, feature, research |
| AC-17 | Response Diff Highlighting | Low | post-mvp, feature |
| AC-18 | Analytics Dashboard | Low | post-mvp, infrastructure |
| AC-19 | Multi-Model Comparison | Low | post-mvp, feature, future |
| AC-20 | A Sketch Documentation | Urgent | post-mvp, documentation, academic |
| AC-21 | B Sketch Documentation | High | post-mvp, documentation, academic |
| AC-22 | Theoretical Framework Document | Medium | post-mvp, documentation, research |

---

## Import Instructions

To import these issues into Linear:

1. **Create labels** in Linear workspace settings (use table above)
2. **Create issues** manually or use Linear's CSV import
3. **Set project** to "Alignment Comparator"
4. **Set team** to your team identifier

Alternatively, use Linear's API or CLI tool for bulk creation.
