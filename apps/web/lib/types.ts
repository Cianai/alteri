/**
 * Type definitions for the AI Alignment Comparator.
 *
 * This module defines all TypeScript interfaces and types used throughout
 * the application, ensuring type safety and documentation.
 *
 * @module lib/types
 */

// =============================================================================
// Framework Types
// =============================================================================

/**
 * The three AI alignment frameworks being compared.
 */
export type FrameworkId = 'hsi' | 'constitutional' | 'hybrid'

/**
 * Categories for preset scenarios.
 */
export type ScenarioCategory =
  | 'crisis-explicit'
  | 'crisis-indirect'
  | 'ambiguous'
  | 'boundary'
  | 'extended'
  | 'information'

// =============================================================================
// Scenario Types
// =============================================================================

/**
 * A mental health scenario for comparison.
 */
export interface Scenario {
  /** Unique identifier */
  id: string
  /** Short title for the scenario */
  title: string
  /** Brief description of the scenario */
  description: string
  /** Full scenario content (user message) */
  content: string
  /** Category classification */
  category: ScenarioCategory
  /** Content warning for sensitive material */
  contentWarning: string
}

// =============================================================================
// Framework Prompt Types
// =============================================================================

/**
 * Framework prompt configuration with styling and system prompt.
 */
export interface FrameworkPrompt {
  /** Framework identifier */
  id: FrameworkId
  /** Full display name */
  name: string
  /** Abbreviated name for UI */
  shortName: string
  /** Brief description of the approach */
  description: string
  /** Version identifier for prompt tracking */
  version: string
  /** The system prompt content */
  systemPrompt: string
  /** Tailwind colour classes for theming */
  colour: {
    /** Background colour class */
    primary: string
    /** Text colour class */
    secondary: string
    /** Border colour class */
    border: string
  }
}

// =============================================================================
// Response Types
// =============================================================================

/**
 * Response from a single framework.
 */
export interface FrameworkResponse {
  /** The framework that generated this response */
  framework: FrameworkId
  /** Display name of the framework */
  frameworkName: string
  /** The generated response content */
  response: string
  /** Reasoning trace for transparency */
  reasoningTrace: string
  /** Version of prompt used */
  promptVersion: string
  /** When the response was generated */
  generatedAt: Date
  /** Token count for research purposes */
  tokenCount?: number
}

// =============================================================================
// API Types
// =============================================================================

/**
 * Request body for the /api/compare endpoint.
 */
export interface ComparisonRequest {
  /** The scenario text to analyse */
  scenario: string
  /** Optional preset scenario ID */
  scenarioId?: string
  /** Which frameworks to use */
  frameworks: FrameworkId[]
}

/**
 * Complete comparison result across frameworks.
 */
export interface ComparisonResult {
  /** Unique comparison ID */
  id: string
  /** The scenario being compared */
  scenario: string
  /** Optional preset scenario ID */
  scenarioId?: string
  /** Responses from each requested framework */
  responses: FrameworkResponse[]
  /** When the comparison was generated */
  generatedAt: Date
}

// =============================================================================
// Reflection Types
// =============================================================================

/**
 * A reflection question for Buddhist ethics integration.
 */
export interface ReflectionQuestion {
  /** Unique identifier */
  id: string
  /** The reflection question */
  question: string
  /** Which framework this question focuses on, or 'comparative' for cross-framework */
  frameworkFocus?: FrameworkId | 'comparative'
  /** Buddhist concept this question relates to */
  buddhistConcept: string
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard to check if a string is a valid FrameworkId.
 */
export function isFrameworkId(value: string): value is FrameworkId {
  return ['hsi', 'constitutional', 'hybrid'].includes(value)
}

/**
 * Type guard to check if a string is a valid ScenarioCategory.
 */
export function isScenarioCategory(value: string): value is ScenarioCategory {
  return [
    'crisis-explicit',
    'crisis-indirect',
    'ambiguous',
    'boundary',
    'extended',
    'information',
  ].includes(value)
}
