# Linear Updates: 2026-01-15 Session

## Issues to Mark DONE

### CIA-22: Project Setup / Monorepo Migration
**Status:** Done → **Complete**

**Work completed:**
- Turborepo monorepo structure created
- All packages initialised (`shared`, `state-machines`, `database`, `ai`)
- Supabase schema with 5 tables and RLS policies
- Next.js 15 + React 19 + ESLint 9 upgrade
- Claude Code configuration complete (CLAUDE.md, skills, MCP)
- Context7 documentation patterns added

**Commits:**
- `81dfc67` - Monorepo migration
- `7699d13` - Supabase configuration
- `0f91c0d` - Tech stack upgrade
- `f13a6fd` - Documentation cleanup

---

## Issues to Update

### CIA-23: State Machines / UI Components
**Status:** Backlog → **In Progress**

**Add comment:**
> Skeleton state machine package created. Full implementation blocked on design document.
>
> Next steps:
> 1. Create `docs/state-machines.md` with Mermaid diagrams
> 2. Implement consentMachine, elicitationMachine, comparisonMachine
> 3. See `docs/implementation-phases.md` Phase 2 for dispatch prompt

### CIA-24: AI Integration / Routes
**Status:** Backlog → **In Progress**

**Add comment:**
> Basic comparison API functional (`/api/compare`). Full integration pending:
> - State machine orchestration
> - Route groups `(participant)/` and `(researcher)/`
> - Full elicitation flow
>
> Gap identified: Vercel AI SDK 4.0 → 5.0 upgrade needed for UIMessage/ModelMessage pattern

---

## New Issues to Create

### CIA-49: Upgrade Vercel AI SDK 4.0 → 5.0
**Priority:** Medium
**Labels:** tech-debt, infrastructure
**Description:**
Upgrade to Vercel AI SDK 5.0 for UIMessage/ModelMessage separation pattern.

**Rationale:** Building AI Mediate guide recommends SDK 5.0+ for proper message persistence separation. Current implementation uses SDK 4.0.

**Acceptance criteria:**
- [ ] Upgrade `ai` package to 5.x
- [ ] Implement UIMessage/ModelMessage separation in chat routes
- [ ] Update database schema if needed for message persistence

---

### CIA-50: Port limerence-model-enhanced.jsx to TypeScript
**Priority:** Low (Module D - post-MVP)
**Labels:** module-d, vibecode, feature
**Description:**
Port the highest-priority vibecode component for Module D Interactive Models.

**Source:** `limerence-model-enhanced.jsx` from Gemini Canvas vibecodes

**Key features to preserve:**
- Guided walkthrough mode (7 steps)
- Connection tracing on node selection
- Animated feedback loop visualisation
- Three-zone temporal model (Installation → Activation → Maintenance)

**Technical requirements:**
- Convert JSX → TypeScript
- Add ResizeObserver for responsive SVG
- Integrate AI insights from Unified_Limerence_Model.ts
- Extract `<GuidedTour>` as reusable component

**Reference:** `docs/vibecode-evaluation.md`

---

### CIA-51: Document Future State Architecture
**Priority:** Done
**Labels:** documentation
**Description:**
Synthesise platform architecture across all modules.

**Completed:** Created in Obsidian vault at `00 System/Claude/AI Conversational Research Platform Guides/Future State Architecture.md`

**Contents:**
- Current state assessment
- Module breakdown (A-D)
- Decision log (avatar, network viz, prompt versioning)
- Implementation roadmap
- Academic timeline alignment

---

## Labels to Create

| Label | Colour | Description |
|-------|--------|-------------|
| `module-d` | Violet | Interactive Models features |
| `vibecode` | Cyan | Ported Gemini Canvas components |
| `tech-debt` | Orange | Technical debt cleanup |

---

## Summary

| Action | Count |
|--------|-------|
| Issues marked complete | 1 (CIA-22) |
| Issues updated | 2 (CIA-23, CIA-24) |
| New issues to create | 3 (CIA-49, CIA-50, CIA-51) |
| New labels | 3 |
