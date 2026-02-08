/**
 * Voice intake pipeline for extracting features from voice memos
 * @module @alteri/voice-intake
 */

export { extractConcept } from './extract';
export type { ExtractionResult } from './extract';
export { createLinearIssue } from './linear';
export type { LinearConfig } from './linear';
export { formatIssueDescription, getLabels, mapPriority } from './format';
export type {
  VoiceIntakeRequest,
  VoiceIntakeConcept,
  VoiceIntakeResponse,
  VoiceIntakeLog,
  ProjectId,
  ExecMode,
  Priority,
  Readiness,
} from './types';
