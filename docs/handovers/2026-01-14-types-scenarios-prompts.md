# Handover: Type Definitions, Scenario Library, and Prompt Structure

**Date:** 2026-01-14
**Issue:** Contributes to CIA-25 (Scenario Library), CIA-27, CIA-28, CIA-29 (System Prompts)
**Status:** Complete

## Summary

Updated the core library files with refined type definitions, 6 preset mental health scenarios, and framework prompt structures with placeholder system prompts. These changes establish the foundation for the comparison functionality and align the codebase with the project's pedagogical goals.

## Changes Made

### lib/types.ts

| Type/Interface | Description |
|----------------|-------------|
| `FrameworkId` | Union type: `'hsi' \| 'constitutional' \| 'hybrid'` |
| `ScenarioCategory` | 6 categories: crisis-explicit, crisis-indirect, ambiguous, boundary, extended, information |
| `Scenario` | Mental health scenario with id, title, description, content, category, contentWarning |
| `FrameworkPrompt` | Framework config with id, name, shortName, description, version, systemPrompt, colour |
| `FrameworkResponse` | API response with framework, frameworkName, response, reasoningTrace, promptVersion, generatedAt, tokenCount |
| `ComparisonRequest` | API request with scenario, scenarioId, frameworks[] |
| `ComparisonResult` | Complete comparison with id, scenario, scenarioId, responses[], generatedAt |
| `ReflectionQuestion` | Buddhist ethics integration with id, question, frameworkFocus, buddhistConcept |
| `isFrameworkId()` | Type guard function |
| `isScenarioCategory()` | Type guard function |

### lib/scenarios.ts

| Scenario ID | Category | Title | Content Warning |
|-------------|----------|-------|-----------------|
| `crisis-explicit-001` | crisis-explicit | Direct Suicidal Ideation | Explicit suicidal ideation |
| `crisis-indirect-001` | crisis-indirect | Expressions of Hopelessness | Expressions of hopelessness |
| `ambiguous-001` | ambiguous | Medication Research Request | Potentially concerning medication inquiry |
| `boundary-001` | boundary | AI Dependency | AI dependency patterns |
| `extended-001` | extended | Therapeutic Replacement | Therapeutic replacement, abandonment concerns |
| `information-001` | information | Creative Writing Request | Self-harm information request framed as creative |

**Helper functions:** `getScenarioById()`, `getScenariosByCategory()`, `getScenarioCategoryCounts()`

### lib/prompts.ts

| Framework | Short Name | Colour Theme | Key Principles |
|-----------|------------|--------------|----------------|
| Microsoft HSI | HSI | Blue (`bg-blue-50`, `text-blue-700`, `border-blue-300`) | Domain containment, human-in-loop, interpretability, subordinate AI |
| Anthropic Constitutional AI | Constitutional | Amber (`bg-amber-50`, `text-amber-700`, `border-amber-300`) | Principal hierarchy, brilliant friend model, anti-sycophancy, psychological stability |
| Integrated Hybrid | Hybrid | Violet (`bg-violet-50`, `text-violet-700`, `border-violet-300`) | Synthesised containment + character training |

**Helper functions:** `getPromptByFramework()`, `getAllPrompts()`, `getPromptVersion()`

## Technical Decisions

1. **Renamed `FrameworkType` to `FrameworkId`**: More descriptive naming for the union type
2. **Expanded ScenarioCategory**: From 4 to 6 categories to better capture scenario nuances
3. **Added `contentWarning` field**: Required for each scenario to support user consent UI
4. **Structured XML output format**: System prompts specify `<response>` and `<reasoning>` tags for parsing
5. **Colour theming via Tailwind classes**: Each framework has primary (bg), secondary (text), and border classes
6. **Version tracking**: All prompts include version string (`0.1.0-placeholder`) for research tracking

## Verification

```bash
cd ~/Developer/alignment-comparator

# Verify TypeScript compilation (no errors in updated files)
pnpm exec tsc --noEmit 2>&1 | grep -E "(lib/types|lib/scenarios|lib/prompts)"
# Expected: No output (no errors)

# Verify files exist and have content
wc -l lib/types.ts lib/scenarios.ts lib/prompts.ts
# Expected: ~180, ~109, ~170 lines respectively
```

## Git

```
Commit: 09d58b0
Message: feat: add type definitions, scenario library, and prompt structure

Contributes to AC-4, AC-6, AC-7, AC-8

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

## Next Steps

1. **CIA-23 Core UI Components**: Update components to use new types (FrameworkId, Scenario, etc.)
2. **CIA-24 API Route**: Implement `/api/compare/route.ts` using FrameworkPrompt system prompts
3. **CIA-27/28/29**: Develop full system prompts based on research (replace placeholders)
4. **CIA-30**: Add reflection questions using ReflectionQuestion interface

## Dependencies Updated

Components that may need updates due to type changes:
- `components/scenario-input.tsx` - Uses Scenario type
- `components/framework-response.tsx` - Uses FrameworkResponse type
- `components/comparison-view.tsx` - Uses ComparisonResult type
- `app/api/compare/route.ts` - Uses ComparisonRequest, FrameworkPrompt

## Repository Links

- **GitHub**: https://github.com/cianos95-dev/alignment-comparator
- **Commit**: https://github.com/cianos95-dev/alignment-comparator/commit/09d58b0
- **Linear Project**: https://linear.app/cianclaude/project/alignment-comparator-43a46801c049
