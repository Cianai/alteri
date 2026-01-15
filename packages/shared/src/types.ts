/**
 * Core types for the Alignment Comparator platform
 */

/** AI alignment frameworks compared in the platform */
export type Framework = 'hsi' | 'constitutional' | 'hybrid';

/** Framework metadata for display and comparison */
export interface FrameworkInfo {
  id: Framework;
  name: string;
  shortName: string;
  description: string;
  colour: string;
}

/** Mental health scenario categories */
export type ScenarioCategory =
  | 'crisis-explicit'
  | 'crisis-indirect'
  | 'ambiguous'
  | 'boundary'
  | 'extended'
  | 'information';

/** Scenario definition */
export interface Scenario {
  id: string;
  category: ScenarioCategory;
  title: string;
  content: string;
  contentWarning?: string;
  source?: string;
}

/** Participant in the research study */
export interface Participant {
  id: string;
  pseudonymId: string;
  createdAt: Date;
  consentedAt?: Date;
}

/** Session state for elicitation flows */
export interface SessionState {
  participantId: string;
  currentPhase: 'consent' | 'demographics' | 'elicitation' | 'results';
  startedAt: Date;
  completedAt?: Date;
}

/** Buddhist ethics evaluation dimensions */
export type BuddhistDimension =
  | 'compassion'
  | 'non-harm'
  | 'equanimity'
  | 'freedom-of-attention'
  | 'relational-agency';

/** Evaluation response from participant */
export interface EvaluationResponse {
  scenarioId: string;
  frameworkA: string;
  frameworkB: string;
  preferredFramework: 'A' | 'B' | 'equal';
  dimensions: Record<BuddhistDimension, number>;
  freeText?: string;
}
