# CIA-225: Interactive Ego-Network Viewer Component - Search Results

**Date:** 2026-02-07
**Searches Conducted:** 11 of 11 planned (Firecrawl credit limits hit for detailed scraping)

---

## Literature Findings

### 1. Zotero Semantic Search: "ego network visualisation interactive web"

#### **egoSlider: visual analysis of egocentric network evolution**
- **Authors:** Wu, Yanhong; Pitipornvivat, Naveen; Zhao, Jian; Yang, Sixiao; Huang, Guowei; Qu, Huamin
- **Year:** 2016
- **Journal:** IEEE Transactions on Visualization and Computer Graphics, 22(1), 260-269
- **DOI:** 10.1109/TVCG.2015.2468151
- **URL:** http://ieeexplore.ieee.org/document/7192725/
- **Similarity:** 0.524 (highest match)
- **Relevance:** Direct match - visual analysis tool for egocentric network evolution with temporal dimension

#### **Integrating networks and survey research: egocentric network analysis**
- **Authors:** Vacca, Raffaele
- **Year:** 2025
- **Type:** Book Section
- **Item Key:** MJVUT2CH
- **Similarity:** 0.262
- **Relevance:** Foundational methodology for egocentric network analysis, likely covers visualization principles

#### **Collecting egocentric network data with visual tools: a comparative study**
- **Authors:** Hollstein, Betina; Töpfer, Tom; Pfeffer, Jürgen
- **Year:** 2020
- **Journal:** Network Science, 8(2), 223-250
- **DOI:** 10.1017/nws.2020.4
- **Similarity:** 0.244
- **Abstract:** Comparative study of 4 visual tools for collecting egocentric networks. Found that concentric circles method is preferred by respondents. Examines structured vs. unstructured tools and their impact on network size/composition.
- **Relevance:** Critical for understanding user preferences in ego-network visualization design (concentric circles preferred)

#### **Egocentric network analysis: foundations, methods, and models**
- **Authors:** Perry, Brea L.; Pescosolido, Bernice A.; Borgatti, Stephen P.
- **Year:** 2018
- **Type:** Book
- **Item Key:** J3M95LBN
- **Similarity:** 0.185
- **Relevance:** Comprehensive foundational text on ego-network analysis methods

#### **Personal Networks: Classic Readings and New Directions in Egocentric Analysis**
- **Authors:** Pescosolido, Bernice; Smith, Edward B.; Small, Mario L.; Perry, Brea L.
- **Year:** 2021
- **Type:** Book
- **Similarity:** 0.122
- **Relevance:** Modern collection covering state-of-the-art in personal network analysis

### 2. Zotero Semantic Search: "personal network visualization design"

*(Overlapping results with Search 1 - egoSlider, Vacca, Perry et al.)*

#### **Storytelling with networks: realizing the explanatory potential of network diagrams through the integration of qualitative data**
- **Authors:** Cowhitt, Thomas; Greany, Toby; Downey, Chris
- **Year:** 2023
- **Journal:** International Journal of Qualitative Methods, 22, 16094069231189369
- **DOI:** 10.1177/16094069231189369
- **Similarity:** 0.156
- **Abstract:** Introduces "Narrated Network Diagrams" (NND) - interactive network visualizations integrating qualitative data via tooltips, legends, titles. Uses interactivity to hide significant text without sacrificing perceptual efficiency.
- **Relevance:** Innovative approach to adding contextual information to network visualizations through interactivity

#### **Introduzione alla personal network analysis e alle statistiche tie churn attraverso l'uso di E-NET**
- **Authors:** Halgin, Daniel S.; Borgatti, Stephen P.
- **Year:** 2012
- **Journal:** Article
- **Abstract:** Reviews foundational aspects of personal network analysis and introduces E-NET (Borgatti 2006), a computer program for personal network collection and analysis.
- **Similarity:** 0.140
- **Relevance:** Early software tool for personal network visualization

#### **Network science by albert-lászló barabási**
- **Year:** 2025
- **Type:** Book
- **Abstract:** "The power of network science, the beauty of network visualization."
- **Similarity:** 0.234
- **Relevance:** General network science foundation with visualization focus

### 3. Zotero Semantic Search: "force-directed graph ego network"

#### **Ego-centered networks and the ripple effect**
- **Authors:** Newman, M.E.J.
- **Year:** 2003
- **Journal:** Social Networks
- **Item Key:** 7SXTFCER
- **Similarity:** 0.088
- **Relevance:** Theoretical foundation on how degree distributions impact ego-network structure

#### **Link prediction for egocentrically sampled networks**
- **Authors:** Li, Tianxi; Wu, Yun-Jhong; Levina, Elizaveta; Zhu, Ji
- **Year:** 2023
- **DOI:** (check item)
- **Similarity:** 0.137
- **Relevance:** Modern statistical methods for ego-network analysis, potential for visualization enhancement

---

## Technical / Code Findings

### 4. Firecrawl Search: "interactive ego network visualization web-based tool"

#### **MyNetworkmap**
- **URL:** https://mynetworkmap.com/
- **Type:** Commercial tool
- **Description:** Online sociogram editor combining surveys, social network analysis, and visualization
- **Relevance:** Existing commercial solution for ego-network visualization online

#### **EgoNet (SourceForge)**
- **URL:** https://sourceforge.net/projects/egonet/
- **Type:** Open-source desktop application
- **Description:** Analysis and interactive visualization of web-based communities. Supports different focuses on social networks to present community groups.
- **Relevance:** Mature open-source project for ego-network analysis (desktop, not web)

#### **Cytoscape**
- **URL:** https://cytoscape.org/
- **Type:** Open-source platform
- **Description:** Open source software platform for visualizing complex networks and integrating with attribute data
- **Relevance:** General-purpose network visualization, could be adapted for ego-networks

#### **Flourish Network Charts**
- **URL:** https://flourish.studio/visualisations/network-charts/
- **Type:** Commercial no-code tool
- **Description:** Make interactive network graphs without coding. Animated node links for displaying connections/relationships.
- **Relevance:** Modern interactive approach, but not ego-network specific

#### **Vizster: Visualizing Online Social Networks**
- **URL:** https://homes.cs.washington.edu/~jheer/projects/vizster/early_design/
- **Authors/Org:** University of Washington (Jeffrey Heer)
- **Year:** ~2005-2007
- **Description:** Interactive visualization tool for online social networks, exploring community structure of social networking services
- **Relevance:** Historical reference for interactive social network visualization design patterns

### 5. Firecrawl Search: "Network Canvas visualization design ego-centered"

#### **Network Canvas: Key decisions in design (PMC article)**
- **URL:** https://pmc.ncbi.nlm.nih.gov/articles/PMC8153363/
- **Type:** Academic paper
- **Description:** Outlines critical decisions in developing interviewer-assisted software suite for network research community
- **Relevance:** Primary reference for ego-network data collection interface design (attempted scrape timed out)

#### **Network Canvas Community Discussion**
- **URL:** https://community.networkcanvas.com/t/including-ego-in-sociogram-visualization/169
- **Note:** Ego node NOT represented in their network model (sociogram is from ego's perspective)
- **Relevance:** Design decision insight - whether to show ego as a node

#### **NetCanvas (SONIC Lab, Northwestern)**
- **URL:** https://sonic.northwestern.edu/home/projects-2/netcanvas/
- **Org:** Science of Networks in Communities (SONIC), Northwestern University
- **Description:** Research project on ego-centered network stability over time using digital participant-aided sociogram tool
- **Relevance:** Academic research project using Network Canvas, validation of approach

#### **Assessing Ego-Centered Social Networks in formr: A Tutorial**
- **URL:** https://journals.sagepub.com/doi/10.1177/2515245920985467
- **Type:** Academic tutorial
- **Description:** formr-based approach to ego-centered network assessment in psychological science
- **Relevance:** Alternative web-based implementation approach

### 6. Firecrawl Search: "personal network concentric circles OR force-directed software"

#### **The concentric circles method as powerful tool (PDF)**
- **URL:** https://repository.uantwerpen.be/docman/irua/1ecd74/166351.pdf
- **Authors:** Van Waes, S. et al.
- **Year:** 2020
- **Citations:** 34
- **Description:** Demonstrates how concentric circles method offers straightforward and dynamic way to visualize and co-construct personal network information
- **Relevance:** Evidence-based support for concentric circles layout in ego-network visualization

#### **Force-Directed Immersive 3D Network Visualization (ResearchGate)**
- **URL:** https://www.researchgate.net/publication/382902502_Force-Directed_Immersive_3D_Network_Visualization
- **Year:** ~2024
- **Description:** Presents egocentric metaphor for graph visualization positioning graph between two concentric spheres
- **Relevance:** Novel 3D approach using concentric spheres for ego-centered metaphor

#### **NAViGaTOR: Network Analysis, Visualization and Graphing Toronto**
- **URL:** https://academic.oup.com/bioinformatics/article/25/24/3327/236345
- **Authors:** Brown, K.R. et al.
- **Year:** 2009
- **Citations:** 319
- **Journal:** Bioinformatics
- **Description:** Powerful graphing application for 2D and 3D visualization of biological networks
- **Relevance:** Mature visualization tool with 2D/3D capabilities (biology focus but transferable)

#### **yFiles Organic Layout**
- **URL:** https://www.yfiles.com/the-yfiles-sdk/features/automatic-layouts/organic-layout
- **Type:** Commercial SDK
- **Description:** Force-directed model for natural, cluster-revealing graph visualizations, adaptable to any use case
- **Relevance:** Commercial force-directed layout algorithm (licensing consideration)

### 7. Firecrawl Search: "site:github.com complexdatacollective Network Canvas source code architecture"

#### **complexdatacollective/Architect**
- **URL:** https://github.com/complexdatacollective/Architect
- **Stars:** (not retrieved)
- **Description:** Survey design tool for Network Canvas suite. Built on Electron and React.
- **Tech Stack:** Electron, React
- **Relevance:** Survey builder component of Network Canvas - architecture reference

#### **complexdatacollective/Interviewer**
- **URL:** https://github.com/complexdatacollective/Interviewer
- **Description:** Simplifying complex network data collection. Latest release: 6.5.4 (focused on canvas visualizations and UI improvements)
- **Tech Stack:** Node 14.21.3, npm 8.3.2 (outdated but stable)
- **Relevance:** Main interviewer component of Network Canvas - data collection interface with canvas viz

### 8. Firecrawl Search: "site:npmjs.com react-force-graph OR @visx/network OR vis-network"

#### **react-force-graph**
- **URL:** https://www.npmjs.com/package/react-force-graph
- **Version:** 1.48.1 (updated 5 months ago as of Feb 2026)
- **Description:** React component for 2D, 3D, VR and AR force directed graphs
- **Downloads:** (not retrieved but popular)
- **Relevance:** PRIMARY CANDIDATE - mature React component with multiple rendering modes

#### **react-force-graph-2d**
- **URL:** https://npmjs.com/package/react-force-graph-2d
- **Version:** 1.29.0 (updated 5 months ago)
- **Description:** React component for 2D force directed graphs (subset of react-force-graph)
- **Relevance:** Lighter-weight 2D-only version if 3D/VR not needed

#### **@visx/network**
- **URL:** https://www.npmjs.com/package/@visx/network
- **Org:** Airbnb (visx family)
- **Description:** Simple package to visualize network/graph layout. Does NOT handle network layout (you provide positions).
- **Relevance:** Low-level rendering only, not suitable without separate layout algorithm

#### **vis-network**
- **URL:** https://www.npmjs.com/package/vis-network
- **Description:** Network visualization with custom shapes, styles, colors, sizes, images. Smooth performance.
- **Relevance:** Alternative to react-force-graph, mature library (not React-specific)

### 9. Firecrawl Search: "site:paperswithcode.com network visualization interactive"

*(No highly relevant results - general ML datasets, not visualization tools)*

### 10. Firecrawl Search: "site:github.com ego network visualization react d3"

*(Search returned general geospatial/dev tool repos, no specific ego-network visualization libraries identified)*

### 11. Additional GitHub Search: "egocentric network sigma.js OR cytoscape.js"

#### **awesome-network-analysis (briatte)**
- **URL:** https://github.com/briatte/awesome-network-analysis
- **Description:** Curated list of awesome network analysis resources. Mentions UC Berkeley Social Networks Study (UCNets) with ego-centric data.
- **Relevance:** Comprehensive resource list for network analysis tools and datasets

### Additional Technical Findings from Search Results

#### **vistorian-widgets (npm)**
- **URL:** https://www.npmjs.com/package/vistorian-widgets
- **Description:** Networkcube - TypeScript library and framework for interactive network visualizations including ego network visualization
- **Relevance:** TypeScript-based framework with explicit ego-network support

#### **ProtEGOnist: Visual Analysis of Interactions in Small World Networks**
- **URL:** https://onlinelibrary.wiley.com/doi/10.1111/cgf.15078
- **Year:** ~2024 (Computer Graphics Forum)
- **Description:** Research tool for visual exploration of dynamic ego-network evolution using React
- **Relevance:** Recent research implementation using React for ego-network analysis

#### **Gephi Lite v0.6**
- **URL:** https://www.ouestware.com/2025/02/26/gephi-lite-0-6-en/
- **Release Date:** Feb 2025
- **Description:** TypeScript library to control Gephi Lite from web. Includes ego network filter (keeps only subgraph within N-hops)
- **Relevance:** Very recent web-based tool with ego-network filtering built-in

---

## Summary & Recommendations

### Key Findings

**Literature:**
1. **Concentric circles layout is preferred by users** (Hollstein et al. 2020) over other structured/unstructured approaches
2. **Interactive tooltips/legends** can add contextual information without sacrificing perceptual efficiency (Cowhitt et al. 2023)
3. **Temporal evolution** is an important dimension for ego-network analysis (egoSlider 2016)
4. **Design decision:** Whether to show ego as a node is debatable (Network Canvas excludes it)

**Technical:**
1. **react-force-graph** (v1.48.1) is the most mature React component for force-directed graphs with 2D/3D/VR/AR support
2. **Network Canvas** (complexdatacollective) is the most comprehensive open-source ego-network data collection suite (Electron + React)
3. **vistorian-widgets** is a TypeScript framework with explicit ego-network visualization support
4. **Gephi Lite** (v0.6, Feb 2025) has built-in ego-network filtering in a web-based TypeScript library
5. **vis-network** is a mature alternative to react-force-graph (not React-specific)

### Recommended Implementation Approach

**Primary Stack:**
- **react-force-graph-2d** for force-directed layout (mature, actively maintained)
- **Consider concentric circles layout** as alternative/complement based on user preference research
- **Interactive tooltips** for node/edge attributes (following Narrated Network Diagrams approach)

**Architecture Inspiration:**
- Study **Network Canvas Interviewer** source code for canvas-based interaction patterns
- Review **Gephi Lite** for ego-network filtering algorithms (N-hop neighborhoods)
- Consider **vistorian-widgets** if need for multiple coordinated views

**Design Decisions to Make:**
1. Show ego as node or assume ego's perspective (Network Canvas excludes ego)?
2. Force-directed OR concentric circles OR both with toggle?
3. 2D only or support 3D exploration (react-force-graph supports both)?
4. Temporal dimension needed (egoSlider approach)?

### Next Steps

1. Deep-dive into **react-force-graph** documentation and examples
2. Clone and examine **complexdatacollective/Interviewer** for interaction patterns
3. Prototype both force-directed and concentric circles layouts for user testing
4. Design tooltip/legend system for attribute display (Narrated Network Diagram approach)

---

## Notes

- Firecrawl credit limits prevented detailed scraping of PMC article on Network Canvas design decisions
- GitHub API permission denied for direct repository search - used Firecrawl site search instead
- Several Zotero items returned 404 errors (may need manual download or library sync)
- Van Waes 2020 concentric circles paper highly relevant but couldn't retrieve full text via search
