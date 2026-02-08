# Kumu.io Research Brief: Inspiration for Alteri

> **Date:** 6 Feb 2026
> **Source:** [kumu.io](https://kumu.io) | [docs.kumu.io](https://docs.kumu.io)
> **Relevance:** Phase 6 (Network Visualization Module) design inspiration

## What Kumu Is

Kumu.io is a **web-based network visualization and systems mapping platform** (Hawaiian for "teacher/source of wisdom"). It targets the social sector — foundations, NGOs, consultants, community organizers — making network complexity accessible to non-technical users. Cloud-hosted, no install required, freemium model.

**Scale:** Used by Stanford, Gates Foundation, World Bank, USAID, Yale, GE, Omidyar Network, Government of Canada, and hundreds of research/social sector organizations.

---

## Core Capabilities

### Data Model
```
Project
├── Maps (collections of elements/connections/loops)
│   ├── Elements (nodes — people, orgs, concepts)
│   ├── Connections (edges — directed, undirected, mutual)
│   └── Loops (feedback cycles for systems mapping)
├── Views (visual rules applied to maps)
├── Fields (Label, Type, Description, Tags, + unlimited custom fields)
└── Presentations (slide-based walkthroughs of maps)
```

### SNA Metrics (Built-in)
| Metric | What It Measures |
|--------|-----------------|
| Degree / Indegree / Outdegree | Connection count |
| Betweenness Centrality | Bridge/broker identification |
| Closeness Centrality | Information spread efficiency |
| Eigenvector Centrality | Influence via well-connected neighbours |
| Community Detection (SLPA) | Overlapping community membership |
| Reach (2-step) | Friend-of-friend influence |
| Reach Efficiency | Reach / size ratio |
| MICMAC | Systems leverage/exposure analysis |

All metrics support **weighting** via custom fields (strength, frequency, etc.).

### Visualization
- **Layouts:** Force-directed (with gravity/charge/connection tuning), fixed/manual, geographic, hierarchical
- **Decorations:** Data-driven sizing, coloring, opacity, borders, shadows, icons — all via point-and-click or CSS-like syntax
- **Clustering:** Auto-connect elements by shared field values
- **Filtering/Focus/Showcase:** Show/hide by rules, focus N-degrees from selection, fade non-matching
- **Templates:** Systems, Causal Loop, Stakeholder, SNA (Big Data), Stock & Flow, Geo, Custom

### Collaboration & Publishing
- Real-time multi-user editing (via Google Sheets data layer)
- Built-in **presentation builder** with text, video, image, and map slides
- Embeddable interactive maps (iframe)
- CDN-backed publishing (Amazon CloudFront)
- Password protection for private projects

### Data Integration
| Format | Direction | Notes |
|--------|-----------|-------|
| Excel/CSV | Import/Export | Bulk editing workflow |
| Google Sheets | Live sync | Auto-updates on refresh, enables crowdsourcing |
| JSON Blueprints | Import/Export | Closest to API (no REST API exists) |
| PNG/PDF | Export | Screenshots and print-quality output |

**No public REST API.** Integration is via JSON blueprints or Google Sheets as middleware.

### Pricing
- **Public projects:** Always free, unlimited
- **Private projects:** $9/month per project
- **Pro workspace:** $10/month + $20/month per private project (adds branding, hourly backups, view-only roles, commenting)
- **Students:** Free private projects with .edu email
- **Enterprise:** Custom pricing, SAML SSO, air-gap compatible

---

## Academic Usage (Published Research)

### Confirmed Papers (10 found)

| # | Paper | Year | DOI / Link | Domain | How Kumu Was Used |
|---|-------|------|-----------|--------|-------------------|
| 1 | Brahmachari R et al. — Leveraging social networks of informal healthcare providers. *Health Res Policy Syst* 22(1):141 | 2024 | [10.1186/s12961-024-01226-4](https://doi.org/10.1186/s12961-024-01226-4) | Public health | Ego-network visualization |
| 2 | Power DD, Lambe BM, Murphy NM — Using systems science methods to enhance walking partnerships. *Eur J Public Health* 32(Suppl 1):i8-i13 | 2022 | [10.1093/eurpub/ckac076](https://doi.org/10.1093/eurpub/ckac076) | Physical activity | Systems mapping + SNA with R (igraph) |
| 3 | Wilkinson H et al. — Building a system-based Theory of Change using Participatory Systems Mapping. *Evaluation* 27(1):80-101 | 2021 | [10.1177/1356389020980493](https://doi.org/10.1177/1356389020980493) | Program evaluation | Tool assessment ("reasonable functionality") |
| 4 | Camacho N et al. — Can participatory processes lead to changes in youth mental health professional networks? *Front Public Health* 11:1282662 | 2023 | [10.3389/fpubh.2023.1282662](https://doi.org/10.3389/fpubh.2023.1282662) | Mental health | Professional network visualization |
| 5 | Murphy RJA, Jones P — Leverage analysis: locating points of influence in systemic design. *FormAkademisk* 13(2):1-25 | 2020 | [10.7577/formakademisk.3384](https://doi.org/10.7577/formakademisk.3384) | Systemic design | Full SNA metrics (degree, betweenness, closeness, eigenvector, reach) |
| 6 | Pusz M, Jonas AEG, Deutz P — Knitting Circular Ties. *Circ Econ Sustain* 4(1):201-228 | 2024 | [10.1007/s43615-023-00271-4](https://doi.org/10.1007/s43615-023-00271-4) | Social economy | Excel-to-network conversion |
| 7 | Patmisari E, McLaren H, Jones M — Socio-Developmental Network Analysis. *Soc Sci* 12(3):129 | 2023 | [10.3390/socsci12030129](https://doi.org/10.3390/socsci12030129) | Child development | Listed as tool in network studies |
| 8 | Naumann RB et al. — Organizational networks in Vision Zero cities. *Traffic Inj Prev* 20(4):378-385 | 2019 | [10.1080/15389588.2019.1587752](https://doi.org/10.1080/15389588.2019.1587752) | Road safety | Referenced Kumu SNA documentation |
| 9 | Mills SA et al. — Bioaerosol stakeholder mapping for community building. *Microbiology* 171(1):001574 | 2025 | [10.1099/mic.0.001574](https://doi.org/10.1099/mic.0.001574) | Environmental | Stakeholder identification |
| 10 | Brouwer S et al. — CommunitySensor: Participatory Community Network Mapping. *Responsible Innovation Conf.* | 2017 | [ResearchGate](https://www.researchgate.net/publication/320555753) | Community dev | Primary visualization tool |

### Key Pattern: The Hybrid Workflow
The most rigorous papers (Power et al. 2022 is the gold standard) use Kumu + R together:
```
1. Collect data (surveys, interviews)
2. Import to Kumu for exploration and stakeholder engagement
3. Export to R for rigorous statistical analysis (igraph, ergm, etc.)
4. Return to Kumu for final visualization and presentation
```

**This is exactly the workflow Alteri should enable natively** — integrated into a single platform rather than requiring manual CSV round-trips.

---

## Kumu vs. Alteri: Positioning

| Dimension | Kumu | Alteri |
|-----------|------|--------|
| **Primary audience** | Social sector practitioners, consultants | Academic researchers, social scientists |
| **Network type** | Whole-network, systems maps, stakeholder maps | Ego-network, whole-network, AND stakeholder maps (all core) |
| **Analysis depth** | Basic SNA metrics (6-8 measures) | Full R statistical stack (397 packages: igraph, ergm, RSiena, egor, bootnet, etc.) |
| **Methodology** | Practitioner-oriented ("metrics get you started") | Research-grade (Bayesian, longitudinal, multilevel) |
| **Data collection** | Manual entry, CSV/Sheets import | Structured elicitation flow with state machines |
| **Visualization** | Interactive web maps (their core strength) | Interactive web maps (core feature) + R-based plots (qgraph, ggraph) |
| **Collaboration** | Real-time web collaboration | Not yet implemented |
| **Platform** | Pure web, no-code | Web + R backend, code-heavy |

**Key insight:** Kumu and Alteri overlap significantly in scope. The differentiation is Alteri's **R-powered analytical depth** and **research-grade methodology**. Alteri should support ego-networks, whole-networks, AND stakeholder maps as core capabilities, with interactive web-based maps as a first-class feature.

---

## What Alteri Should Learn from Kumu

### 1. Presentation-First Visualization (HIGH PRIORITY — Phase 6)

Kumu's killer feature isn't analysis — it's making networks **legible to non-experts**. Their presentation builder walks users through a network step-by-step: start with full map, focus on a cluster, highlight key nodes, annotate with text/images, share as embeddable URL.

**Alteri action:** Phase 6 should include a **guided walkthrough mode** for ego-networks. Progressive disclosure from ego to alteri to ties to clusters to structural features.

### 2. Data-Driven Decorations (HIGH PRIORITY — Phase 6)

Kumu lets you visually encode any field as size, color, opacity, or shape — all via point-and-click.

**Alteri action:** Expose R-computed metrics (closeness, emotional support, contact frequency) as visual encodings that participants and researchers can toggle via a dropdown control panel.

### 3. Clustering by Shared Attributes (MEDIUM PRIORITY — Phase 6)

Kumu's clustering auto-creates connections between elements sharing field values, transforming flat attribute data into visible network structure.

**Alteri action:** Auto-clustering by attributes (context, age group, gender) reveals structural patterns participants may not articulate verbally.

### 4. Focus/Filter/Showcase Controls (MEDIUM PRIORITY — Phase 6)

Kumu's three-tier visibility:
- **Filter:** Hide elements by rule
- **Focus:** Show N-degrees from selection
- **Showcase:** Highlight matching, fade rest

**Alteri action:** For ego-networks, "focus" lets researchers/participants explore a specific alter's 1-2 degree neighborhood. Useful for identifying structural holes and bridges.

### 5. Embeddable/Shareable Maps (LOW PRIORITY — Phase 7-8)

Generate shareable (anonymized) network visualizations for research papers, participant feedback, and clinical contexts.

### 6. Templates as Onboarding (LOW PRIORITY)

Consider templates for different research designs: "Emotional Support Network", "Information Flow Network", "Limerence Attachment Network".

---

## What Alteri Should NOT Copy

1. **No-code-everything** — Keep R as analytical engine. Provide accessible *outputs* from rigorous analysis.
2. **Org charts, Lombardi diagrams, concept maps** — Out of scope.
3. **Lack of API** — Alteri should have a proper API from the start.
4. **Shallow metrics** — Alteri's R stack is vastly superior.

---

## Presentation Builder Deep Dive

### Kumu's 5 Slide Types
1. **Title slides** — Section dividers with background image + title/subtitle
2. **Map slides** — Interactive network views with independent filter/focus/zoom per slide
3. **Text slides** — Markdown content
4. **Image slides** — Full-screen static images
5. **Embed slides** — Rich media from 300+ providers

### How Map Slides Control Visibility
Each map slide independently sets: View (saved state), Focus (N-degree neighbors), Filter (by field values), Zoom & Position (auto-fit or custom viewport). This creates **progressive disclosure**.

### Gaps = Alteri Opportunities
- No branching logic (choose-your-own-adventure)
- No annotation layer (arrows, callouts)
- No comparison view (side-by-side networks)
- No audio narration
- Linear navigation only

### Ego-Network Walkthrough Patterns

**Pattern 1: Progressive Disclosure**
```
Slide 1: Ego alone at center
Slide 2: Add immediate alteri
Slide 3: Add ties between alteri (network closure)
Slide 4: Highlight strongest relationships
Slide 5: Show clusters/communities
Slide 6: Highlight structural holes and bridges
```

**Pattern 2: Question-Driven Views**
```
View A: "Who provides emotional support?"
View B: "Who do you collaborate with professionally?"
View C: "Where do your contexts overlap?"
```

**Pattern 3: Mixed Media Narrative**
Alternate map slides with reflection prompts and R-generated statistical plots.

**Pattern 4: Longitudinal Comparison**
Show network evolution over time with highlighted additions and losses.

---

## Public Maps: Visual Patterns

### Most Relevant for Alteri

**Austin Social Entrepreneurship** (`kumu.io/UnLtdUSA/austin-social-entrepreneurship`)
- **Uses ego-network focus mode** (`focus: #unltd-usa out 99`)
- People (teal circles) vs. Organizations (red hexagons)
- Force-directed with tuned physics (gravity: 0.001, particle-charge: 200)

### Visual Design Principles for Ego-Networks (15-50 nodes)
1. Always show labels (small enough to read everything)
2. Ego distinct — larger, bordered, shadowed, center position
3. 3-6 categorical colors for alter types
4. Tie strength as line weight
5. Tie type as line style (solid/dashed/dotted)
6. Force-directed with low gravity (room to breathe)
7. Dark theme for presentations, light for research papers

### CSS-Like Styling (Transferable to React Props)
```css
@settings {
  layout: force;
  layout-gravity: 0.001;
  layout-particle-charge: 200;
  focus: #ego out 99;
}

element[type="Family"]       { color: #E74C3C; }
element[type="Friend"]       { color: #27AE60; }
element[type="Colleague"]    { color: #F39C12; }
connection[type="strong"]    { size: 3; }
connection[type="weak"]      { size: 1; style: dashed; }
```

---

## UI/UX Patterns Worth Adopting

1. **Force-directed layout with tunable parameters** (gravity, charge, connection strength)
2. **Hover/click profiles** showing alter attributes, metrics, centrality scores
3. **Color-by-metric toggle** dropdown
4. **Size-by-metric toggle** dropdown
5. **Connection styling** by type (dashed, thick, colored)
6. **Animated transitions** between views/filters
7. **Map overview text** panel for context

---

## Technology Candidates

| Library | Strengths | Considerations |
|---------|-----------|----------------|
| **react-force-graph** | React-native, 2D/3D/VR, force-directed | Good fit for React 19 |
| **D3.js (d3-force)** | Maximum control, widely used | More manual work |
| **Sigma.js** | WebGL rendering, large graphs | Less React-native |
| **vis-network** | Full-featured, easy setup | Less modern |
| **Cytoscape.js** | Academic pedigree, extensive layouts | Heavier |

**Recommendation:** Start with **react-force-graph** for Phase 6 prototyping.
