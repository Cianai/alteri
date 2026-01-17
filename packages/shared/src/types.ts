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

/** Session phases for participant journey */
export type SessionPhase =
  | 'consent'
  | 'demographics'
  | 'network-elicitation'
  | 'comparison'
  | 'reflection'
  | 'results';

/** Session state for elicitation flows */
export interface SessionState {
  participantId: string;
  currentPhase: SessionPhase;
  startedAt: Date;
  completedAt?: Date;
}

/** Demographics data collected from survey */
export interface DemographicsData {
  ageRange: string;
  gender: string;
  education: string;
  aiFamiliarity: string;
  techBackground: string;
  interestAreas?: string[];
  participationReason: string;
}

/** Network alter (person named in ego-centric network) */
export interface NetworkAlter {
  id: string;
  name: string;
  relationship?: string;
  closeness?: number;
}

/** Network tie (relationship between alters) */
export interface NetworkTie {
  source: string; // alter id
  target: string; // alter id
  strength?: number;
}

/** Ego-centric network data from elicitation */
export interface NetworkData {
  alters: NetworkAlter[];
  ties: NetworkTie[];
  collectedAt: Date;
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
