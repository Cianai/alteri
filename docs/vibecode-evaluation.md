# Gemini Canvas Vibecode Evaluation

**Date:** 2026-01-14 (Updated: 2026-01-15)
**Context:** Evaluation of exploratory vibecodes for integration into the Conversational Research Platform
**Source:** `/Documents/ObsidianVault/1-Projects/Mindfulness & AI/Project/Gemini Vibes/`

---

## Executive Summary

Nine vibecodes were created in Gemini Canvas as exploratory prototypes for visualising limerence research concepts. These represent varying levels of maturity and technical sophistication. Key findings:

| File | Primary Value | Integration Target | Refactoring Effort |
|------|---------------|-------------------|-------------------|
| `limerence-model-enhanced.jsx` | **NEW: Best UX** - Guided walkthrough + connection highlighting | Module D (Interactive Models) | Low |
| `Unified_Limerence_Model.ts` | Complete React component with Gemini integration | Module D (Interactive Models) | Low-Medium |
| `limerence-model.jsx` | **NEW** - Clean base implementation of zone model | Module D (Interactive Models) | Low |
| `Interactive_Multilayer_Network_Visualization.ts` | Strong multilayer network visualisation with toggleable pathways | Module D (Interactive Models) | Medium |
| `Limerence-_A_Biopsychosocial_Network_Model.html` | Chart.js patterns + interactive cycle simulation | Module D (Charts/Visualisations) | Medium |
| `Visualized_Multilevel_Network_Paper.js` | Research assistant pattern + methodology visualisation | Module C (Psychoeducation) | Medium |
| `NetworkNeurophenomenologyAppGapAnalysis.md` | **NEW: Strategic** - Market gap analysis + architecture spec | Platform Strategy | N/A (reference) |
| `Measuring_Transdiagnostic_Symptoms.html` | Proxy measures reference table - educational content | Module C (Reference Content) | Low (content only) |
| `Infographic Design for Limerence Research.html` | Static infographic - conceptual reference only | Documentation | Minimal |

**Updated Recommendation:** Prioritise `limerence-model-enhanced.jsx` as the new gold standard for Module D's interactive model component. It supersedes `Unified_Limerence_Model.ts` with superior UX patterns (guided walkthrough, connection tracing). The gap analysis document (`NetworkNeurophenomenologyAppGapAnalysis.md`) validates Module B's differentiation strategy.

---

## File-by-File Analysis

### 1. Infographic Design for Limerence Research.html

**Implementation Summary:**
- Static HTML infographic explaining limerence research methodology
- Sections: What is Limerence, Network View vs Style View, Psychological Processes, Research Approach, AI Tools mention
- Uses rotating CSS animations for "gear" metaphor

**Technical Approach:**
- Tailwind CSS via CDN
- Font Awesome icons
- Google Fonts (Outfit)
- Pure HTML/CSS with inline SVG for network visualisation
- No JavaScript logic

**Libraries/Frameworks:**
```html
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

**Transferable Ideas:**
- Visual metaphor of "network view vs style view" is pedagogically valuable
- The gear/cog animation for psychological processes is memorable
- Section structure (numbered stages) provides clear narrative flow

**Gaps/Limitations:**
- Completely static - no interactivity
- Inline styles would need extraction
- Not componentised - single HTML file
- No TypeScript, no React

**Integration Value:** **Low** - Primarily useful as design reference for psychoeducation content. The visual metaphors could inform Module C copy, but the code itself has minimal reuse value.

---

### 2. Interactive Multilayer Network Visualization.ts

**Implementation Summary:**
- React component visualising a three-layer network model:
  - **Layer A:** Attachment Network (Social relationships)
  - **Layer B:** Psychological Processes (Attachment anxiety, IU, rumination, etc.)
  - **Layer C:** Semantic Clusters (Embedding-derived constructs)
- Toggleable edge visibility for different pathway types
- Click-to-select nodes with detail panel
- SVG-based rendering with hand-coded positions

**Technical Approach:**
- React functional components with hooks (`useState`, `useMemo`)
- TypeScript interfaces for nodes and edges
- SVG with markers for directed edges
- Fixed coordinate layout (not force-directed)

**Data Structures:**
```typescript
type LayerType = 'A' | 'B' | 'C';

interface NodeData {
  id: string;
  label: string;
  layer: LayerType;
  type: string; // 'person', 'process', 'cluster'
  x: number;
  y: number;
  description: string;
  details?: string[];
}

interface EdgeData {
  source: string;
  target: string;
  type: 'structural' | 'developmental' | 'uncertainty' | 'lo_path';
  label?: string;
}
```

**Reusable Patterns:**

1. **Toggle-filtered edges:**
```typescript
const activeEdges = useMemo(() => {
  return allEdges.filter(edge => {
    if (edge.type === 'developmental' && !showDev) return false;
    if (edge.type === 'uncertainty' && !showUncertainty) return false;
    if (edge.type === 'lo_path' && !showLO) return false;
    return true;
  });
}, [showDev, showUncertainty, showLO]);
```

2. **Layer-based visual encoding:**
```typescript
if (node.layer === 'A') { stroke = '#0d9488'; Icon = Network; }
if (node.layer === 'B') { stroke = '#4f46e5'; Icon = Brain; }
if (node.layer === 'C') { stroke = '#e11d48'; Icon = MessageSquare; }
```

3. **Sliding detail panel with conditional content:**
```typescript
<div className={`... ${selectedNode ? 'translate-x-0' : 'translate-x-full'}`}>
```

**Transferable Ideas:**
- Three-layer model maps directly to the theoretical framework
- Edge type system (structural, developmental, uncertainty, lo_path) is conceptually rich
- Node metadata structure (`details` array) allows for embedding neighbours or keywords
- The toggle pattern for showing/hiding edge types is highly reusable

**Gaps/Limitations:**
- Fixed coordinates - not responsive or force-directed
- No drag/zoom/pan capability
- lucide-react icons imported but some references may be placeholder
- No API integration
- No state persistence

**Integration Recommendation:** **High priority for Module D.** The data model (nodes/edges/layers) is directly applicable. Refactor to:
- Use D3.js or vis.js for force-directed layout
- Add pan/zoom controls
- Connect to platform state management
- Support dynamic node/edge data from API

---

### 3. Limerence- A Biopsychosocial Network Model.html

**Implementation Summary:**
- Comprehensive "cyberpunk-themed" dashboard explaining limerence as a system
- Multiple Chart.js visualisations:
  - Bar chart: Neurotransmitter dysregulation
  - Radar chart: "Star collapse" of social ties
  - Line chart: Hope/Fear emotional volatility
  - Doughnut chart: Cognitive load distribution
- Interactive "Reinforcement Cycle" simulation with animated paths
- **Gemini API integration** for "Neural Override Console" (CBT-style reframing tool)

**Technical Approach:**
- Vanilla JS with Chart.js
- Tailwind CSS via CDN
- Gemini 2.5 Flash API for AI feature
- CSS animations for cycle simulation
- Custom connector lines using absolute positioning (no SVG paths)

**Libraries/Frameworks:**
```html
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
```

**Reusable Patterns:**

1. **Chart.js label wrapping utility:**
```javascript
const wrapLabels = (labels, maxLen = 16) => {
  return labels.map(label => {
    if (label.length <= maxLen) return label;
    const words = label.split(' ');
    const lines = [];
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
      if (currentLine.length + 1 + words[i].length <= maxLen) {
        currentLine += ' ' + words[i];
      } else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }
    lines.push(currentLine);
    return lines;
  });
};
```

2. **Gemini API call pattern with JSON response:**
```javascript
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: input }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: { responseMimeType: "application/json" }
  })
});
```

3. **Step-by-step cycle animation:**
```javascript
function animateCycle() {
  const steps = [1, 2, 3, 4];
  const delay = 800;
  let current = 0;
  const interval = setInterval(() => {
    // Activate/deactivate steps sequentially
    // Then trigger loop-back visuals
  }, delay);
}
```

**Transferable Ideas:**
- "Neural Override Console" pattern is directly applicable to Module C (Psychoeducation)
- The system prompt for CBT-style reframing is well-crafted
- Chart configurations for comparing limerence vs healthy states
- Animated cycle simulation demonstrates maintenance loop concept
- Dual-column output (diagnostic + reality patch + action) is effective

**Gemini System Prompt (worth preserving):**
```
You are a 'Neural Network Architect' for a human brain experiencing Limerence.
Respond in JSON with:
1. "diagnostic": Identify the biological/network glitch using techno-medical jargon
2. "reality_patch": Grounded interpretation to counter limerent delusion (be the PFC)
3. "circuit_breaker": Immediate physical action to break the loop
```

**Gaps/Limitations:**
- Not React - would need complete rewrite
- Hardcoded data in charts
- No state management
- API key handling is placeholder
- Accessibility concerns with colour-only encoding

**Integration Recommendation:** **Medium-High priority.** The Chart.js configurations and Gemini integration patterns are valuable. For Module D:
- Extract chart configurations into reusable React components
- Port "Neural Override" to Module C as a guided reflection feature
- The cycle animation concept could become an interactive teaching tool

---

### 4. Measuring Transdiagnostic Symptoms.html

**Implementation Summary:**
- Educational infographic about objective psychological measurement
- Focus on behavioural proxies vs self-report questionnaires
- Three Chart.js visualisations:
  - Bar chart: Reliability gap (self-report vs behavioural task)
  - Radar chart: Online feasibility of different measures
  - Bubble chart: Subjectivity vs proxy availability matrix
- Comprehensive HTML table of validated proxy measures

**Technical Approach:**
- Tailwind CSS via CDN
- Chart.js with custom styling
- Responsive grid layout
- Static content (no API integration)

**Data Table Content (valuable reference):**

| Symptom | Proxy Task | Feasibility |
|---------|-----------|-------------|
| Impulsivity | Go/No-Go, Stop-Signal | Online Ready |
| Anhedonia | EEfRT, Probabilistic Reward | Online Ready |
| Risk-Taking | BART | Online Ready |
| Attentional Bias | Dot-Probe, Emotional Stroop | Mixed |
| Empathy | Dictator Game, Mind in Eyes | Online Ready |
| Stress | Trier Social Stress Test | Lab Required |
| Attention | CPT | Online Ready |
| Sleep | Polysomnography | Lab/Wearable |

**Transferable Ideas:**
- Bubble chart pattern for mapping construct dimensions
- The "Golden Zone" concept (high proxy availability + low subjectivity)
- Reference table structure for psychoeducation content

**Gaps/Limitations:**
- Static educational content
- Not React
- No interactivity beyond hover effects

**Integration Recommendation:** **Low code value, high content value.** The measurement reference content informs Module B (Network Relationship Mapping) methodology documentation. The bubble chart pattern is reusable for visualising construct relationships.

---

### 5. Unified Limerence Model.ts

**Implementation Summary:**
- **Most sophisticated implementation** - Full React application with:
  - Interactive network graph (custom SVG-based)
  - Biopsychosocial phases model (Predisposition → Trigger → Escalation → Maintenance)
  - Three-layer system (Biological, Psychological, Social)
  - Gemini API integration for clinical coping strategies
  - Sidebar controls for layer filtering
  - Animated "reinforcement loop" simulation
  - Synthetic case study generator

**Technical Approach:**
- React functional components with TypeScript
- Hooks: `useState`, `useEffect`, `useMemo`, `useRef`
- Custom SVG network renderer with curved edges
- Lucide React icons
- Tailwind CSS classes
- Gemini 2.5 Flash API

**Data Structures (most complete):**

```typescript
const LAYERS = {
  BIO: { id: 'bio', label: 'Biological (Neuro)', color: '#ef4444', y: 3 },
  PSYCHO: { id: 'psycho', label: 'Psychological (Cognitive)', color: '#3b82f6', y: 2 },
  SOCIAL: { id: 'social', label: 'Social (Context)', color: '#10b981', y: 1 },
};

const PHASES = {
  PRE: { id: 'pre', label: 'Predisposition (Vulnerability)', x: 1 },
  TRIGGER: { id: 'trigger', label: 'Trigger Event', x: 2 },
  ESCALATION: { id: 'escalation', label: 'Escalation & Crystalization', x: 3 },
  MAINTENANCE: { id: 'maintenance', label: 'Maintenance (The Loop)', x: 4 },
};

// Node structure with layer + phase positioning
{ id: 'adhd', label: 'Dopaminergic Dysregulation', short: 'ADHD/Exec Func',
  layer: 'BIO', phase: 'PRE', description: '...' }

// Link structure with typed relationships
{ source: 'loop', target: 'reward', type: 'loop' }
```

**Reusable Patterns:**

1. **Gemini integration with component-scoped state:**
```typescript
const handleGetInsight = async () => {
  setLoading(true);
  const prompt = `Act as a clinical psychologist specializing in limerence...
    Focus on the mechanism: "${node.label}" (${node.description}).
    1. Briefly explain how this specific mechanism traps a person
    2. Provide one concrete, actionable Coping Strategy`;

  const result = await generateGeminiContent(prompt);
  setAiInsight(result);
  setLoading(false);
};
```

2. **Dynamic layout calculation:**
```typescript
const layout = useMemo(() => {
  const paddingX = 100;
  const paddingY = 80;
  const xStep = usableWidth / 3;
  const yStep = usableHeight / 3;

  const nodesWithPos = NODES.map(node => {
    const layerY = LAYERS[node.layer].y;
    const visualY = dimensions.height - (paddingY + ((layerY - 1) * (yStep * 0.8)));
    const phaseX = PHASES[node.phase].x;
    const stagger = (node.id.length % 3) * 15 * (layerY % 2 === 0 ? 1 : -1);
    const visualX = paddingX + ((phaseX - 1) * xStep) + stagger;
    return { ...node, x: visualX, y: visualY };
  });
  return nodesWithPos;
}, [dimensions]);
```

3. **Animated dash offset for loop visualisation:**
```typescript
useEffect(() => {
  if (!showLoop) return;
  let animationFrame;
  const animate = () => {
    setDashOffset(prev => prev - 1);
    animationFrame = requestAnimationFrame(animate);
  };
  animate();
  return () => cancelAnimationFrame(animationFrame);
}, [showLoop]);
```

4. **Curved SVG paths for feedback loops:**
```typescript
const renderLink = (link, index) => {
  const isFeedback = target.x < source.x;
  let d = '';
  if (isFeedback) {
    d = `M${source.x},${source.y} A${dr},${dr} 0 0,1 ${target.x},${target.y}`;
  } else {
    const midX = (source.x + target.x) / 2;
    d = `M${source.x},${source.y} C${midX},${source.y} ${midX},${target.y} ${target.x},${target.y}`;
  }
  return <path d={d} ... />;
};
```

**Transferable Ideas:**
- Complete theoretical model encoded in data structures
- Phase-based x-axis + layer-based y-axis layout is intuitive
- "Simulate Reinforcement Loop" feature visualises the maintenance trap
- Detail panel with contextual AI insights is powerful UX
- Synthetic case study generator demonstrates therapeutic application

**Gaps/Limitations:**
- Custom SVG renderer - could benefit from D3.js for pan/zoom
- Container dimensions read once (no resize handling)
- API key placeholder
- No state persistence
- Some animation performance concerns at scale

**Integration Recommendation:** **Highest priority.** This is the most production-ready component. For Module D:
- Wrap in Next.js page component
- Add ResizeObserver for responsive sizing
- Integrate with platform auth for Gemini API key
- Consider replacing custom SVG with vis.js for better interaction
- Extract data structures into shared types

---

### 6. Visualized Multilevel Network Paper.js

**Implementation Summary:**
- React component presenting the research proposal as an interactive infographic
- Sections: What is Limerence, Research Gap, Multilevel Network Model, Methodology, Research Questions
- **Gemini-powered "Interactive Research Assistant"** with two modes:
  - "Ask the Researcher" - Q&A about study design
  - "Analyze Scenario" - Apply model to user-described situations
- Clean card-based layout with progressive disclosure

**Technical Approach:**
- React functional components
- Lucide React icons
- Tailwind CSS
- Gemini 2.5 Flash API with embedded paper context

**Reusable Patterns:**

1. **Context-aware AI assistant with mode switching:**
```typescript
const PAPER_CONTEXT = `
  Title: Neither Just Attachment nor Pathology: A Multilevel Network Approach...
  Core Concept: Limerence is an involuntary state of intense romantic preoccupation
  Problem: It is often pathologized as addiction or BPD
  Proposed Model: A Multilevel Network Model...
`;

let systemPrompt = "";
if (mode === 'ask') {
  systemPrompt = `You are an AI assistant representing the research researcher...
    Use the following context to answer questions about the research proposal`;
} else {
  systemPrompt = `You are an expert on the 'Multilevel Network Model of Limerence'...
    The user will provide a scenario. Analyze it through the lens of the paper's framework.
    Identify potential 'Distal Factors', 'Mechanisms', and signs of 'Limerence' vs 'Normative Love'`;
}
```

2. **Exponential backoff retry pattern:**
```typescript
let attempt = 0;
let success = false;
while (attempt < 5 && !success) {
  try {
    const response = await fetch(url, { ... });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    resultData = await response.json();
    success = true;
  } catch (e) {
    attempt++;
    await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
  }
}
```

3. **Reusable card and section title components:**
```typescript
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-6 border-b border-indigo-100 pb-4">
    <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
      <Icon size={24} />
    </div>
    <div>
      <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
    </div>
  </div>
);
```

**Transferable Ideas:**
- "Ask the Researcher" pattern is directly applicable to Module C (Psychoeducation)
- "Analyze Scenario" mode demonstrates therapeutic application
- Research methodology visualisation (snowball sampling, instruments) informs Module B documentation
- The three-column model layout (Distal Factors → Mechanisms → Outcomes) is pedagogically clear

**Gaps/Limitations:**
- Presentation-focused rather than interactive data exploration
- No network visualisation (text-based model description)
- No state persistence
- Single-component architecture

**Integration Recommendation:** **High priority for Module C.** The AI assistant patterns are production-ready:
- Port GeminiAssistant component with mode switching
- Adapt system prompts for psychoeducation context
- Extract Card/SectionTitle as shared UI components
- The retry pattern should become a platform utility

---

### 7. limerence-model.jsx (NEW)

**Implementation Summary:**
- React component visualising the "Emergent Relational-Developmental Model of Limerence"
- Three-zone temporal model:
  - **Zone 1 (Installation):** Developmental history, parent figures, ACEs, attachment templates
  - **Zone 2 (Activation):** LO encounter, uncertainty cloud, trigger moment
  - **Zone 3 (Maintenance):** Coupled networks (social + symptom) with feedback loop
- Dual network visualisation within Zone 3:
  - Social/Attachment Network (Self, LO, Friends, Family, Partner)
  - Symptom/Mechanism Network (IOU, Rumination, Attentional Bias, Reward Sensitivity, Emotion Dysregulation, Hope-Despair)
- Cross-network coupling lines showing how social and symptom networks interact

**Technical Approach:**
- React functional component with `useState`
- Pure SVG rendering with inline definitions (gradients, filters, markers)
- Hover-based interactivity (zones and nodes)
- Description panel updates based on active element
- Toggle for cross-network coupling visibility

**Data Structures:**
```javascript
const symptomNodes = [
  { id: 'iou', label: 'Intolerance of\nUncertainty', x: 680, y: 180, color: '#ef4444' },
  { id: 'rum', label: 'Rumination', x: 760, y: 240, color: '#f97316' },
  // ...
];

const symptomEdges = [
  { from: 'iou', to: 'rum' },
  { from: 'rum', to: 'att' },
  // ...
];

const socialNodes = [
  { id: 'self', label: 'Self', x: 500, y: 280, size: 24, color: '#3b82f6' },
  { id: 'lo', label: 'LO', x: 540, y: 200, size: 36, color: '#ec4899', glow: true },
  // faded: true for peripheral relationships
];
```

**Reusable Patterns:**

1. **SVG filter definitions for glow effects:**
```javascript
<filter id="glow">
  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
  <feMerge>
    <feMergeNode in="coloredBlur"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>
```

2. **Zone-based hover highlighting:**
```javascript
<rect
  fill={activeZone === 'installation' ? 'rgba(59, 130, 246, 0.2)' : 'transparent'}
  onMouseEnter={() => setActiveZone('installation')}
  onMouseLeave={() => setActiveZone(null)}
/>
```

3. **Multiline SVG text labels:**
```javascript
{node.label.split('\n').map((line, i) => (
  <text x={node.x} y={node.y + (i - 0.5) * 11 + 4} fontSize="8" textAnchor="middle">
    {line}
  </text>
))}
```

**Transferable Ideas:**
- Three-zone temporal model (Installation → Activation → Maintenance) is pedagogically clear
- Dual coupled networks within maintenance zone captures the theoretical model precisely
- "Faded" peripheral nodes visually communicate network collapse
- Description dictionary pattern for hover-based explanations
- Cross-network coupling as toggleable layer

**Gaps/Limitations:**
- Fixed SVG coordinates (not responsive)
- No click-to-select or connection tracing
- No animation beyond hover states
- No AI integration
- JSX (not TypeScript)

**Integration Recommendation:** **Good foundation, superseded by enhanced version.** Use as reference for the theoretical model encoding, but `limerence-model-enhanced.jsx` implements all these features plus more.

---

### 8. limerence-model-enhanced.jsx (NEW - HIGHEST PRIORITY)

**Implementation Summary:**
- **Most polished UX implementation** - Extends base model with:
  - **Guided Walkthrough Mode:** 7-step educational tour with prev/next navigation
  - **Click-to-Select Nodes:** Highlights selected node and all connected nodes/edges
  - **Animated Feedback Loop:** Pulsing SVG gradient showing maintenance cycle
  - **Connection Tracing:** Visual highlighting of node connections across networks
  - **Control Bar:** Toggle buttons for coupling, animation, walkthrough mode

**Technical Approach:**
- React functional component with `useState`, `useEffect`
- `useEffect` animation loop for pulsing effects
- Enhanced state: `selectedNode`, `isWalkthrough`, `walkthroughStep`, `pulsePhase`
- Node connection metadata (`connections` array on each node)
- Computed highlighting via `isNodeHighlighted()` and `isEdgeHighlighted()` functions

**Key Enhancements Over Base Version:**

1. **Connection metadata on nodes:**
```javascript
const symptomNodes = [
  { id: 'iou', label: 'Intolerance of\nUncertainty', x: 680, y: 180, color: '#ef4444',
    connections: ['rum', 'att', 'hope'] },  // NEW: explicit connections
  // ...
];
```

2. **Connection highlighting logic:**
```javascript
const isNodeHighlighted = (nodeId) => {
  if (!selectedNode) return false;
  const selected = getNodeById(selectedNode);
  return nodeId === selectedNode || (selected?.connections || []).includes(nodeId);
};

const isEdgeHighlighted = (from, to) => {
  if (!selectedNode) return false;
  const selected = getNodeById(selectedNode);
  return (selectedNode === from && selected.connections?.includes(to)) ||
         (selectedNode === to && selected.connections?.includes(from));
};
```

3. **Walkthrough step definitions:**
```javascript
const walkthroughSteps = [
  { zone: 'installation', node: null, title: 'Stage 1: Installation',
    text: 'Limerence begins long before the LO appears...' },
  { zone: 'activation', node: 'lo', title: 'Stage 2: The Trigger',
    text: 'A specific person activates the dormant machinery...' },
  { zone: 'maintenance', node: 'iou', title: 'Stage 3: Uncertainty Drives the System',
    text: 'Intolerance of Uncertainty is the engine...' },
  // 7 steps total covering the full model
];
```

4. **Animated gradient for feedback loop:**
```javascript
useEffect(() => {
  if (animateFeedback) {
    const interval = setInterval(() => {
      setPulsePhase(p => (p + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }
}, [animateFeedback]);

// In SVG defs:
<linearGradient id="flowGradient">
  <stop offset={`${pulsePhase}%`} stopColor="#f97316" stopOpacity="0.2" />
  <stop offset={`${(pulsePhase + 20) % 100}%`} stopColor="#f97316" stopOpacity="1" />
  <stop offset={`${(pulsePhase + 40) % 100}%`} stopColor="#f97316" stopOpacity="0.2" />
</linearGradient>
```

5. **Walkthrough navigation with state sync:**
```javascript
const handleWalkthroughNext = () => {
  if (walkthroughStep < walkthroughSteps.length - 1) {
    setWalkthroughStep(walkthroughStep + 1);
    const nextStep = walkthroughSteps[walkthroughStep + 1];
    setActiveZone(nextStep.zone);      // Sync zone highlight
    setSelectedNode(nextStep.node);    // Sync node selection
  } else {
    setIsWalkthrough(false);
    // Reset all state
  }
};
```

**Transferable Ideas:**
- **Guided walkthrough pattern** is directly applicable to Module C psychoeducation
- **Connection tracing** makes network relationships explorable
- **Animated feedback loop** visualises the maintenance trap compellingly
- **Control bar with toggle states** provides user agency
- **Dual-panel layout** (walkthrough panel vs description panel) based on mode
- Extended descriptions provide clinical-level detail for each node

**Gaps/Limitations:**
- JSX (not TypeScript) - needs type annotations
- Fixed coordinates (not force-directed)
- No AI integration (unlike Unified Model)
- No state persistence
- Animation could be optimised with `requestAnimationFrame` instead of `setInterval`

**Integration Recommendation:** **HIGHEST PRIORITY for Module D.** This is the most user-friendly implementation:
- Add TypeScript types
- Integrate AI insight generation for selected nodes (port from Unified Model)
- Consider adding ResizeObserver for responsive SVG
- The walkthrough pattern should be extracted as a reusable `<GuidedTour>` component
- Connection metadata pattern should become standard for all network visualisations

---

### 9. NetworkNeurophenomenologyAppGapAnalysis.md (NEW - STRATEGIC REFERENCE)

**Implementation Summary:**
- Comprehensive market analysis document validating the platform's differentiation strategy
- Surveys existing ego-network data collection tools (NetworkCanvas, EgoWeb, GENSI, VennMaker, OpenEddi, EgoNet)
- Identifies two major gaps:
  1. **No existing tools use conversational AI for network elicitation**
  2. **Most tools extract data without providing participant feedback**
- Evaluates vibe-coding platforms (Lovable, Replit, Bolt, v0.dev) vs traditional development with Cursor
- Proposes technical architecture for production implementation

**Key Findings (Relevant to Platform):**

**Market Gap Validation:**
| Tool | Platform | Conversational AI | Participant Feedback |
|------|----------|-------------------|----------------------|
| Network Canvas | Desktop/Mobile | **No** | Limited |
| EgoWeb 2.0 | Web | **No** | Limited |
| GENSI | JavaScript | **No** | Basic |
| VennMaker | Desktop | **No** | Yes (commercial) |

**Research Evidence:**
- Kim et al. (CHI 2019): Chatbots produce higher-quality response data
- Xiao et al. (2020): Chatbots draw out more relevant, richer responses
- CHI 2025: LLM-based chatbots with interview probes (descriptive, idiographic, clarifying)
- **No published research applies these findings to network elicitation**

**Proposed Architecture (aligns with platform plan):**
```
- Python backend: FastAPI serving networkx graph algorithms
- LangChain orchestration: Conversational flows with OpenAI/Anthropic APIs
- D3.js visualization: Force-directed network graphs
- PostgreSQL/Supabase: Secure multi-user data with RLS
- Export pipeline: GraphML, CSV, JSON for igraph/egor
```

**Vibe-Coding Assessment:**
- Lovable: 170/1645 apps had security vulnerabilities (May 2025)
- Replit: "Works best for prototypes, not production with real users"
- Bolt: No Python/R support, Supabase only
- **Cursor with developer guidance is the viable path**

**Transferable Ideas:**
- **Module B differentiation confirmed:** Conversational AI for network elicitation is genuinely novel
- **GENIE precedent:** Combining network mapping with psychoeducation creates "light bulb moments"
- **Ethical framing:** Participant-benefit approach aligns with CBPR ethics
- **Technical constraints validated:** Traditional development required, vibe-coding for UI prototyping only
- **Timeline estimate:** 3-6 months for experienced full-stack developer

**Integration Relevance:**
- **Module B (Network Relationship Mapping):** Direct validation of the conversational elicitation approach
- **Module C (Psychoeducation Companion):** GENIE's "light bulb moments" inform feedback design
- **Platform Architecture:** Confirms FastAPI + LangChain + D3.js stack choice
- **Export Requirements:** GraphML/CSV/JSON formats for `igraph`/`egor` compatibility

**Gaps/Limitations:**
- Analysis document, not code - no implementation to port
- Some tool assessments may be dated (references May 2025)
- Doesn't address Claude API specifically (focuses on OpenAI/Anthropic generally)

**Strategic Value:** **Critical reference document.** Should be preserved in `/docs/` and referenced during Module B development. The market gap analysis provides evidence-based justification for the platform's unique positioning.

---

## Cross-File Synthesis

### Relationship Between Files

```
Most Mature ────────────────────────────────────────────────► Least Mature

limerence-model-enhanced.jsx  →  limerence-model.jsx (base version)
[Best UX: walkthrough + tracing]     [Clean foundation]
            ↓
Unified_Limerence_Model.ts    →    Interactive_Multilayer_Network_Visualization.ts
      ↓                                        ↓
[Complete app with AI]              [Focused network vis]
      ↓                                        ↓
      └──────────────┬─────────────────────────┘
                     ↓
        Visualized_Multilevel_Network_Paper.js
        [Research presentation + AI assistant]
                     ↓
    Limerence-_A_Biopsychosocial_Network_Model.html
    [Charts + cycle animation + AI]
                     ↓
    Measuring_Transdiagnostic_Symptoms.html
    [Static charts + reference table]
                     ↓
    Infographic Design for Limerence Research.html
    [Static infographic]

Strategic Documents (Non-Code):
    NetworkNeurophenomenologyAppGapAnalysis.md
    [Market validation + architecture spec]
```

### Duplication Analysis

| Concept | Files Implementing | Most Mature Version |
|---------|-------------------|---------------------|
| Three-zone temporal model | limerence-model-enhanced, limerence-model, Unified Model | **limerence-model-enhanced.jsx** |
| Guided walkthrough/tour | limerence-model-enhanced only | **limerence-model-enhanced.jsx** (unique) |
| Connection tracing | limerence-model-enhanced only | **limerence-model-enhanced.jsx** (unique) |
| Three-layer model (Bio/Psycho/Social) | Unified Model, Interactive Multilayer | **Unified_Limerence_Model.ts** |
| Gemini AI integration | Unified Model, Biopsychosocial, Paper Viz | **Visualized_Multilevel_Network_Paper.js** (best prompt engineering) |
| Network visualisation | Interactive Multilayer, Unified Model, limerence-model-enhanced | **limerence-model-enhanced.jsx** (best UX) |
| Cycle/loop animation | limerence-model-enhanced, Biopsychosocial, Unified Model | **limerence-model-enhanced.jsx** (animated gradient) |
| Chart.js visualisations | Biopsychosocial, Transdiagnostic | **Limerence-_A_Biopsychosocial_Network_Model.html** (most charts) |
| Market/competitive analysis | NetworkNeurophenomenologyAppGapAnalysis only | **NetworkNeurophenomenologyAppGapAnalysis.md** (unique) |

### Data Model Convergence

All files converge on similar theoretical constructs:

```typescript
// Unified data model for platform integration
interface TheoreticalNode {
  id: string;
  label: string;
  shortLabel?: string;
  layer: 'biological' | 'psychological' | 'social';
  phase?: 'predisposition' | 'trigger' | 'escalation' | 'maintenance';
  type: 'person' | 'process' | 'cluster' | 'construct';
  description: string;
  metadata?: Record<string, unknown>;
}

interface TheoreticalEdge {
  source: string;
  target: string;
  type: 'structural' | 'developmental' | 'reinforcing' | 'inhibitory' | 'loop';
  label?: string;
  weight?: number;
}

interface TheoreticalModel {
  nodes: TheoreticalNode[];
  edges: TheoreticalEdge[];
  layers: Layer[];
  phases?: Phase[];
}
```

---

## Integration Recommendations

### Module D (Interactive Models) - Primary Integration Target

**Components to build:**

1. **MultilayerNetworkVisualization** - Port from `Interactive_Multilayer_Network_Visualization.ts`
   - Replace fixed positions with force-directed layout (D3.js or vis.js)
   - Add pan/zoom/drag interactions
   - Preserve layer-based filtering and edge type toggles
   - Connect to API for dynamic data

2. **BiopsychosocialPhaseModel** - Port from `Unified_Limerence_Model.ts`
   - Keep 4-phase horizontal layout
   - Add animated loop simulation
   - Integrate AI insights via platform Claude API

3. **MetricsDashboard** - Adapt from `Limerence-_A_Biopsychosocial_Network_Model.html`
   - Convert Chart.js configs to React-Chart.js-2 or Recharts
   - Charts: Volatility, Star Collapse, Cognitive Load
   - Add time-series support for longitudinal data

### Module B (Network Relationship Mapping) - Data Model Integration

**Relevant patterns:**
- Ego-network node structure from Interactive Multilayer
- Relationship-specific attachment encoding
- SRM variance decomposition visualisation concept

### Module C (Psychoeducation Companion) - AI Assistant Integration

**Components to build:**

1. **ResearchAssistant** - Port from `Visualized_Multilevel_Network_Paper.js`
   - Two-mode interface (Q&A + Scenario Analysis)
   - Adapt system prompts for psychoeducation
   - Add conversation history

2. **NeuralOverrideConsole** - Port from `Limerence-_A_Biopsychosocial_Network_Model.html`
   - CBT-style reframing tool
   - Preserve diagnostic/reality_patch/circuit_breaker structure
   - Soften language for non-clinical context

---

## Technical Debt Assessment

### Required Refactoring for Next.js/React/TypeScript Integration

| Task | Effort | Priority |
|------|--------|----------|
| Convert HTML files to React components | High | Medium |
| Replace CDN imports with npm packages | Low | High |
| Add TypeScript types to .js/.html files | Medium | High |
| Implement responsive sizing (ResizeObserver) | Low | Medium |
| Replace inline styles with Tailwind classes | Low | Low |
| Add proper error boundaries | Low | High |
| Implement state persistence (localStorage/API) | Medium | Medium |
| Replace Gemini API calls with platform API wrapper | Low | High |
| Add accessibility (ARIA labels, keyboard nav) | Medium | Medium |
| Add unit tests for data transformations | Medium | Low |

### Package Dependencies to Add

```json
{
  "dependencies": {
    "d3": "^7.x",  // or "vis-network": "^9.x"
    "chart.js": "^4.x",
    "react-chartjs-2": "^5.x",
    "lucide-react": "^0.x",
    "@tanstack/react-query": "^5.x"  // for API state management
  }
}
```

### Architectural Considerations

1. **Shared Type System**: Create `/lib/types/theoretical-model.ts` with unified interfaces
2. **API Wrapper**: Create `/lib/api/gemini.ts` to centralise AI calls with auth
3. **Chart Configurations**: Create `/lib/charts/` with reusable Chart.js configs
4. **Network Renderer**: Evaluate D3.js vs vis.js vs custom SVG based on interaction needs

---

## Conclusion

The Gemini Canvas vibecodes represent valuable exploratory work that maps theoretical concepts to interactive visualisations. With the addition of three new files, the collection now totals nine artefacts spanning code implementations, market analysis, and strategic planning.

**Key updates from new files:**

1. **`limerence-model-enhanced.jsx`** is now the **highest priority** for Module D integration. It implements the best UX patterns (guided walkthrough, connection tracing, animated feedback loops) and should supersede `Unified_Limerence_Model.ts` as the primary interactive model component.

2. **`limerence-model.jsx`** provides a clean base implementation useful for understanding the theoretical model encoding, but the enhanced version is preferred for production.

3. **`NetworkNeurophenomenologyAppGapAnalysis.md`** validates the platform's differentiation strategy with market research showing that conversational AI for network elicitation is genuinely novel. This document should be preserved as strategic reference material.

**Updated immediate next steps:**
1. Port `limerence-model-enhanced.jsx` to TypeScript as the primary Module D component
2. Extract `<GuidedTour>` pattern as reusable component for Module C psychoeducation
3. Integrate AI insight generation from `Unified_Limerence_Model.ts` into the enhanced model
4. Copy `NetworkNeurophenomenologyAppGapAnalysis.md` to platform docs as competitive analysis reference
5. Create shared TypeScript interfaces for theoretical model data (nodes, edges, zones, phases)
6. Extract AI assistant from `Visualized_Multilevel_Network_Paper.js` for Module C
