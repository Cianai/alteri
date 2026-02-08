---
linear: CIA-259
exec: pair
status: ready
research: n/a
---

# CIA-259: Visual Feedback Loop Pattern (v0 + Vercel + Claude)

## Problem

The PM-Dev workflow playbook defines 8 stages from ideation to deployment. Stage 5 (Visual Prototype) and Stage 7 (Verification) both involve visual artifacts, but there is no defined mechanism for:

1. How v0-generated components enter the repo programmatically
2. How Vercel preview deployments feed visual state back to Claude for analysis
3. How visual feedback triggers targeted iteration (visual refinement vs business logic)
4. How the human reviews and approves visual output at each stage

Currently, visual review is entirely manual — the human opens a Vercel preview URL, mentally evaluates it, and provides unstructured feedback. This creates a bottleneck and loses context between iterations.

## Solution

Define a **Visual Feedback Loop** pattern that integrates three existing tools (v0 MCP, Vercel preview deployments, Claude in Chrome) into the existing PM-Dev workflow funnel. The pattern fits into Stages 5-7 as a sub-loop.

### Core Loop

```
Spec (approved)
  → v0 generate component (MCP)
    → Write files to feature branch
      → Push → Vercel auto-deploys preview
        → Claude navigates preview (Chrome MCP)
          → Screenshot + DOM snapshot capture
            → Multi-modal analysis against spec
              → Human reviews analysis + preview
                → Decision: approve / iterate-visual / iterate-logic
                  → If iterate-visual: v0 iterate_component (MCP)
                  → If iterate-logic: Claude Code implementation
                  → Loop back to push
```

### Integration with Workflow Stages

| Playbook Stage | Visual Loop Role |
|---------------|-----------------|
| Stage 5: Visual Prototype | **Entry point** — v0 generates initial skeleton |
| Stage 6: Implementation | Claude adds business logic to v0 skeleton |
| Stage 7: Verification | **Feedback capture** — Chrome screenshots + analysis |
| (New sub-loop) | Iteration routing between v0 and Claude Code |

## Design Decisions

### D1: Component Transfer — v0 MCP `generate_component`

**Decision:** Use v0 MCP `generate_component` tool, which returns an array of `{path, content}` file objects. Claude writes these directly to the repo.

**Rationale:**
- Programmatic, no manual copy-paste
- Files integrate with existing shadcn/ui + Tailwind patterns
- `iterate_component` maintains chat context for refinements
- Supports React + TypeScript + Tailwind (matches alteri stack)

**Risk mitigation (v0 MCP reliability):** The `v0-mcp-server` is a community package (not official Vercel). If the MCP fails or returns errors:
1. **Graceful degradation:** Fall back to manual v0.dev web UI → copy component code → Claude writes to repo
2. **Rate limit check:** Always call `mcp__v0__get_rate_limits` before generation. If exhausted, defer or use manual route
3. **No hard dependency:** The pattern works without v0 MCP — it just adds automation. The core value is the feedback loop (Steps 3-5), not the generation method

**Alternative rejected:** v0 web UI Git panel. Requires human interaction, creates separate branch naming, breaks automation.

### D2: Visual Feedback Capture — Chrome MCP

**Decision:** Claude navigates to Vercel preview URL using `browser_open`, then captures state via:
- `browser_screenshot` — full-page visual capture (multimodal analysis)
- `browser_snapshot` — accessibility tree with element refs
- `browser_eval` — computed styles, layout metrics, framework colour validation

**Rationale:**
- All tools already available (Claude in Chrome MCP)
- Screenshot enables multimodal Claude analysis (visual issues: spacing, colour, alignment)
- DOM snapshot enables semantic validation (headings, ARIA, keyboard nav)
- JavaScript eval enables programmatic checks (framework colours match HSI/Constitutional/Hybrid)

**Alternative rejected:** Manual screenshot + annotation. Higher friction, loses programmatic validation capability.

**Timing constraint:** Vercel preview must be fully deployed before capture. Wait strategy:
1. Poll Vercel deployment status via GitHub PR checks (Vercel bot posts "Ready" comment)
2. After `browser_open`, use `browser_wait({ timeout: 15000 })` for hydration
3. If page shows loading/error state in screenshot, wait 30s and retry once
4. If still failing after retry, report deployment failure to human (do not continue analysis)

### D3: Iteration Routing — Human Decision Point

**Decision:** After Claude presents analysis (screenshot + findings), the human decides:

| Feedback Type | Route | Tool |
|--------------|-------|------|
| Visual refinement (layout, colour, spacing) | v0 `iterate_component` | v0 MCP |
| Business logic (state, API, data flow) | Claude Code implementation | Direct edit |
| Accessibility issue | Either route depending on fix | Context-dependent |
| Approved | Merge PR | GitHub |

**Rationale:** Visual vs logic routing is a judgement call. Claude can suggest which route based on the nature of the feedback, but the human confirms. This aligns with `exec:pair` and `needs:human-decision` patterns.

### D4: Feedback Collection — GitHub PR Comments

**Decision:** Visual feedback flows through GitHub PR comments:
- Claude posts screenshot + analysis as PR comment
- Human replies with feedback/approval
- Linear syncs bidirectionally (existing integration)

**Rationale:**
- PR is already the unit of review (existing workflow)
- Vercel posts preview URL in same PR
- Keeps all context in one place
- Linear sync provides PM visibility

**Alternative considered:** Linear issue comments. Works but adds indirection — the PR is the canonical review location for code changes.

### D5: v0 Project Setup

**Decision:** Import alteri repo into v0 project to enable context-aware generation (component library, style system, existing patterns).

**Test required:** Verify v0 project import recognises shadcn/ui components, Tailwind config, and existing component patterns.

### D6: Vercel Preview Access Control

**Decision:** Vercel preview deployments are public by default on hobby plans. For alteri (which contains no sensitive user data in previews — it's a research platform with mock data in development), public previews are acceptable.

**Rationale:**
- Preview URLs contain random hashes — not guessable
- No real user data in preview environments (mock/seed data only)
- Vercel Deployment Protection (password/SSO) requires Pro plan ($20/mo) — disproportionate for current stage
- Chrome MCP can navigate public URLs without auth

**Future upgrade path:** When alteri moves to production with real user data, enable Vercel Deployment Protection on the Pro plan. This is a CIA-260 settings audit item.

### D7: v0-to-Alteri Pattern Adaptation

**Decision:** v0 generates generic React components. A mandatory **adaptation step** runs between v0 generation and branch push:

| Pattern | v0 Output | Alteri Adaptation |
|---------|-----------|-------------------|
| State management | useState/useReducer | XState v5 machine (if stateful) |
| Colours | Tailwind defaults | Framework colour tokens (hsi-*, constitutional-*, hybrid-*) |
| Forms/Surveys | HTML forms | SurveyJS integration patterns |
| AI features | Generic fetch | Vercel AI SDK v6 `useChat`/`useCompletion` |
| Component library | Generic UI | shadcn/ui components (already in v0) |
| Data fetching | Client-side fetch | Next.js 15 server actions / RSC patterns |

**Claude Code is responsible for this adaptation** — not v0. The v0 output is a visual skeleton; Claude Code transforms it into alteri-idiomatic code before pushing. This is why Stage 6 (Implementation) exists between the visual prototype and verification.

**Conflict prevention:** v0 iterations (`iterate_component`) and Claude Code edits NEVER happen on the same files simultaneously. The routing decision (D3) is mutually exclusive per iteration — either v0 refines visuals OR Claude refines logic, never both at once.

### D8: Non-UI Spec Handling

**Decision:** This pattern only applies to specs with visual/UI requirements. Specs that are purely backend, data model, or infrastructure skip Stages 5-7 visual sub-loop entirely.

**Entry criteria for visual loop:**
- Spec contains UI mockup descriptions, screen references, or user-facing component requirements
- Spec is labelled with a component name or page name in alteri
- Human confirms visual prototype is needed (part of spec approval gate)

## Workflow Detail

### Step 1: Generate Visual Skeleton

```
Input: Approved spec with UI requirements
Tool: mcp__v0__generate_component

Prompt construction:
- Extract visual requirements from spec
- Include alteri design constraints (framework colours, accessibility)
- Reference existing component patterns
- Specify: React, TypeScript, Tailwind, shadcn/ui

Output: Array of {path, content} files
```

### Step 2: Adapt + Write to Branch + Push

```
Adaptation (D7):
- Claude Code reviews v0 output against alteri patterns
- Replace Tailwind colour defaults with framework tokens
- Wrap stateful components in XState v5 machines if needed
- Replace generic forms with SurveyJS patterns if applicable
- Ensure Next.js 15 async params compatibility

Write + Push:
- Create feature branch: feat/cia-XXX-<name>
- Write adapted files to appropriate paths (apps/web/components/)
- Commit: "feat(v0): initial visual skeleton for CIA-XXX"
- Push → triggers Vercel preview deployment
- Create PR if not exists
- Wait for Vercel "Ready" status (check PR comments or deployment API)

Failure handling:
- If Vercel build fails: check build logs, fix issues, push again
- If build fails 2x: escalate to human with build log summary
```

### Step 3: Visual Capture + Analysis

```
- Extract preview URL from PR (or construct from branch name)
- browser_open(preview_url)
- Wait for page load
- browser_screenshot({ fullPage: true }) → base64 image
- browser_snapshot({ compact: true, interactive: true }) → DOM tree
- browser_eval(framework_colour_check) → colour validation
- browser_eval(layout_metrics) → spacing/alignment data

Analysis output:
- Visual match score against spec requirements
- Specific issues found (with element refs)
- Accessibility audit results
- Framework colour compliance
```

### Step 4: Present to Human

```
Post to GitHub PR comment:
- Screenshot (uploaded as image)
- Analysis summary (pass/fail per requirement)
- Specific issues with suggestions
- Recommended route: visual (v0) or logic (Claude Code)
```

### Step 5: Human Decision + Iteration

```
Human reviews PR comment + opens preview URL for manual verification.
Responds with one of:
- "Approved" → proceed to merge
- Visual feedback → Claude calls v0 iterate_component with chatId
- Logic feedback → Claude implements in Claude Code
- Mixed → sequential: v0 visual first, then Claude logic

After iteration: loop back to Step 2 (push triggers new preview)
```

## Constraints

- **Max iterations:** 3 visual iterations before human escalation (prevent infinite loops). Rationale: each iteration involves a Vercel deploy + Chrome capture + human review cycle (~5-10min). Beyond 3, the spec likely needs revision, not more iteration.
- **v0 rate limits:** Check `mcp__v0__get_rate_limits` before generation. If limits exhausted, inform human and suggest manual v0.dev route or deferral.
- **Screenshot size:** Full-page screenshots can be large — use viewport-only for initial checks, full-page only when needed for scrollable content.
- **Preview deploy time:** ~30-60s for Vercel preview — account for wait. If deployment fails, check Vercel build logs and report to human. Do not retry automatically (build failures are usually code issues).
- **Framework specificity:** v0 generates generic React — Claude Code must adapt to alteri's specific patterns via D7 adaptation step before pushing.
- **v0 chat context:** `iterate_component` requires `chatId` from the original `generate_component` call. If chat context is lost (session restart, compaction), fall back to a new `generate_component` call with the current component code included as context in the prompt.
- **Estimated loop duration:** One full loop iteration (generate → push → deploy → capture → analyse → present) takes ~5-15 minutes depending on Vercel deploy time and human response time. A 3-iteration cycle = ~15-45 minutes.

## Acceptance Criteria

1. A documented, repeatable pattern for generating UI components via v0 MCP
2. v0 project import tested — verify it recognises alteri's shadcn/ui components and Tailwind config
3. Automated visual capture from Vercel preview deployments (with deployment wait handling)
4. Multimodal analysis comparing preview against spec requirements
5. Clear human decision point for iteration routing (visual vs logic vs approve)
6. v0-to-alteri adaptation step demonstrated (D7 pattern applied)
7. End-to-end demonstration with at least one alteri component (full loop: generate → adapt → push → capture → analyse → present)
8. Pattern documented in PM-Dev workflow playbook (Stage 5 update)
9. Graceful degradation path documented for v0 MCP failures

## Diagrams

See `docs/specs/diagrams/` for visual references:

- **[cia-259-core-loop.md](diagrams/cia-259-core-loop.md)** — Mermaid flowchart of the core iteration loop (generation → deploy → capture → decision → iterate)
- **[cia-259-core-loop.html](diagrams/cia-259-core-loop.html)** — Interactive HTML/SVG version (open in browser)
- **[cia-259-workflow-integration.md](diagrams/cia-259-workflow-integration.md)** — Integration with PM-Dev 8-stage workflow, tool mapping, decision routing, and entry criteria guard

## Out of Scope

- Visual regression testing database (future: store baseline screenshots)
- Automated layout metrics thresholds (future: pass/fail without human)
- v0 Chrome extension integration (pending: evaluate if it adds value over MCP)
- Figma integration (Stage 1 ideation — separate concern)
