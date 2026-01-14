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
export type FrameworkType = 'hsi' | 'constitutional' | 'hybrid'

/**
 * Display information for each framework.
 */
export interface FrameworkConfig {
  /** Short identifier */
  id: FrameworkType
  /** Display name */
  name: string
  /** Full descriptive name */
  fullName: string
  /** Brief description of the approach */
  description: string
  /** Tailwind CSS colour class */
  colorClass: string
  /** Key principles this framework embodies */
  principles: string[]
}

// =============================================================================
// Scenario Types
// =============================================================================

/**
 * Categories for preset scenarios.
 */
export type ScenarioCategory = 'crisis' | 'ambiguous' | 'boundary' | 'extended'

/**
 * A mental health scenario for comparison.
 */
export interface Scenario {
  /** Unique identifier */
  id: string
  /** Short title for the scenario */
  title: string
  /** Full scenario content */
  content: string
  /** Category classification */
  category: ScenarioCategory
  /** Brief description of why this scenario is interesting */
  rationale?: string
  /** Course readings relevant to this scenario */
  courseReferences?: string[]
  /** Version for tracking prompt evolution */
  version: string
}

// =============================================================================
// API Types
// =============================================================================

/**
 * Request body for the /api/compare endpoint.
 */
export interface CompareRequest {
  /** The scenario to analyse */
  scenario: string
  /** Which framework to use */
  framework: FrameworkType
  /** Optional session ID for tracking */
  sessionId?: string
}

/**
 * Response from a single framework.
 */
export interface FrameworkResponse {
  /** The framework that generated this response */
  framework: FrameworkType
  /** The generated response content */
  content: string
  /** Whether the response is still streaming */
  isStreaming: boolean
  /** Reasoning trace steps for transparency */
  reasoningTrace?: string[]
  /** Error message if the request failed */
  error?: string
  /** Response generation time in milliseconds */
  responseTimeMs?: number
  /** Token count for research purposes */
  tokenCount?: {
    input: number
    output: number
  }
}

/**
 * Complete comparison result across all frameworks.
 */
export interface ComparisonResult {
  /** Unique comparison ID */
  id: string
  /** The scenario being compared */
  scenario: string
  /** Timestamp of the comparison */
  timestamp: Date
  /** Response from HSI framework */
  hsi: FrameworkResponse
  /** Response from Constitutional AI */
  constitutional: FrameworkResponse
  /** Response from Hybrid approach */
  hybrid: FrameworkResponse
}

// =============================================================================
// System Prompt Types
// =============================================================================

/**
 * System prompt with version tracking.
 */
export interface SystemPrompt {
  /** Which framework this prompt is for */
  framework: FrameworkType
  /** The system prompt content */
  content: string
  /** Version identifier */
  version: string
  /** When this version was created */
  createdAt: Date
  /** Brief description of changes from previous version */
  changelog?: string
}

// =============================================================================
// Reflection Types
// =============================================================================

/**
 * Categories of reflection questions.
 */
export type ReflectionCategory =
  | 'attention'
  | 'relational'
  | 'compassion'
  | 'boundaries'

/**
 * A reflection question set.
 */
export interface ReflectionQuestionSet {
  /** Category of questions */
  category: ReflectionCategory
  /** Display title */
  title: string
  /** Questions to prompt reflection */
  questions: string[]
  /** Reference to course readings */
  courseReference: string
}

/**
 * User's saved reflection.
 */
export interface UserReflection {
  /** Unique ID */
  id: string
  /** Comparison this reflection is about */
  comparisonId: string
  /** The reflection category */
  category: ReflectionCategory
  /** User's written reflection */
  content: string
  /** When the reflection was created */
  createdAt: Date
}

// =============================================================================
// UI State Types
// =============================================================================

/**
 * Application state for the comparison interface.
 */
export interface ComparisonState {
  /** Current scenario text */
  scenario: string
  /** Whether user has accepted content warning */
  hasAcceptedWarning: boolean
  /** Whether comparison is in progress */
  isComparing: boolean
  /** Current responses from each framework */
  responses: {
    hsi: FrameworkResponse | null
    constitutional: FrameworkResponse | null
    hybrid: FrameworkResponse | null
  }
  /** History of comparisons in this session */
  comparisonHistory: ComparisonResult[]
}

// =============================================================================
// Export Helpers
// =============================================================================

/**
 * Type guard to check if a string is a valid FrameworkType.
 */
export function isFrameworkType(value: string): value is FrameworkType {
  return ['hsi', 'constitutional', 'hybrid'].includes(value)
}

/**
 * Type guard to check if a string is a valid ScenarioCategory.
 */
export function isScenarioCategory(value: string): value is ScenarioCategory {
  return ['crisis', 'ambiguous', 'boundary', 'extended'].includes(value)
}
