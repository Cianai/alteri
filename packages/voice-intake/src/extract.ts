import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { VOICE_EXTRACTION_PROMPT } from './prompt';
import type { VoiceIntakeConcept } from './types';

const EXTRACTION_MODEL = 'claude-haiku-4-5-20251001';

export interface ExtractionResult {
  concept: VoiceIntakeConcept;
  model: string;
  tokensInput: number;
  tokensOutput: number;
  durationMs: number;
  rawJson: unknown;
}

export async function extractConcept(transcript: string): Promise<ExtractionResult> {
  const start = Date.now();

  const result = await generateText({
    model: anthropic(EXTRACTION_MODEL),
    system: VOICE_EXTRACTION_PROMPT,
    prompt: transcript,
    maxOutputTokens: 1024,
  });

  const durationMs = Date.now() - start;
  const rawJson = JSON.parse(result.text);

  // Validate required fields
  const concept = validateConcept(rawJson);

  return {
    concept,
    model: EXTRACTION_MODEL,
    tokensInput: result.usage?.inputTokens ?? 0,
    tokensOutput: result.usage?.outputTokens ?? 0,
    durationMs,
    rawJson,
  };
}

function validateConcept(raw: Record<string, unknown>): VoiceIntakeConcept {
  const required = ['title', 'description', 'project', 'execMode', 'priority', 'readiness'];
  for (const field of required) {
    if (!(field in raw)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  const validProjects = ['alteri', 'claude-infra-devops', 'prototype'];
  if (!validProjects.includes(raw.project as string)) {
    throw new Error(`Invalid project: ${raw.project}`);
  }

  const validExecModes = ['quick', 'tdd', 'pair', 'checkpoint', 'swarm'];
  if (!validExecModes.includes(raw.execMode as string)) {
    throw new Error(`Invalid execMode: ${raw.execMode}`);
  }

  const validPriorities = ['urgent', 'high', 'medium', 'low'];
  if (!validPriorities.includes(raw.priority as string)) {
    throw new Error(`Invalid priority: ${raw.priority}`);
  }

  const validReadiness = ['implementable', 'needs-clarification'];
  if (!validReadiness.includes(raw.readiness as string)) {
    throw new Error(`Invalid readiness: ${raw.readiness}`);
  }

  // Enforce readiness rules
  if (raw.readiness === 'implementable') {
    if (!Array.isArray(raw.acceptanceCriteria) || raw.acceptanceCriteria.length < 2) {
      throw new Error('Implementable features must have at least 2 acceptance criteria');
    }
  }

  if (raw.readiness === 'needs-clarification') {
    if (!Array.isArray(raw.clarifyingQuestions) || raw.clarifyingQuestions.length < 1) {
      throw new Error('Needs-clarification features must have at least 1 clarifying question');
    }
  }

  return raw as unknown as VoiceIntakeConcept;
}
