/** Request from Apple Shortcut or CLI */
export interface VoiceIntakeRequest {
  transcript: string;
  timestamp: string;
  source: 'shortcut' | 'cli' | 'web';
  device?: string;
  /** Force a specific project */
  project?: ProjectId;
  /** Force a specific execution mode */
  execMode?: ExecMode;
}

export type ProjectId = 'alteri' | 'claude-infra-devops' | 'prototype';
export type ExecMode = 'quick' | 'tdd' | 'pair' | 'checkpoint' | 'swarm';
export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type Readiness = 'implementable' | 'needs-clarification';

/** Structured concept extracted by Claude from voice transcription */
export interface VoiceIntakeConcept {
  title: string;
  description: string;
  project: ProjectId;
  projectRationale: string;
  execMode: ExecMode;
  execRationale: string;
  priority: Priority;
  readiness: Readiness;
  acceptanceCriteria: string[] | null;
  clarifyingQuestions: string[] | null;
  technicalNotes: string;
  relatedAreas: string[];
}

/** Response returned to the caller */
export interface VoiceIntakeResponse {
  status: 'created' | 'error';
  issueId?: string;
  issueUrl?: string;
  title?: string;
  project?: string;
  readiness?: Readiness;
  questions?: string[];
  autoImplement?: boolean;
  error?: string;
}

/** Data to log to the storage backend */
export interface VoiceIntakeLog {
  transcript: string;
  source: string;
  device?: string;
  recordedAt: string;
  title?: string;
  description?: string;
  project?: ProjectId;
  execMode?: ExecMode;
  priority?: Priority;
  readiness?: Readiness;
  acceptanceCriteria?: string[] | null;
  clarifyingQuestions?: string[] | null;
  technicalNotes?: string;
  relatedAreas?: string[];
  extractionModel?: string;
  extractionTokensInput?: number;
  extractionTokensOutput?: number;
  extractionDurationMs?: number;
  rawExtractionJson?: unknown;
  linearIssueId?: string;
  linearIssueUrl?: string;
  autoImplementTriggered?: boolean;
  processingStatus: 'pending' | 'extracted' | 'linear_created' | 'completed' | 'failed';
  errorMessage?: string;
}
