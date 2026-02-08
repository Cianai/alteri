import type { NextRequest } from 'next/server'
import {
  extractConcept,
  createLinearIssue,
  type VoiceIntakeRequest,
  type VoiceIntakeResponse,
  type VoiceIntakeLog,
  type LinearConfig,
} from '@alteri/voice-intake'

export const runtime = 'edge'
export const maxDuration = 60

// Simple in-memory rate limiting (resets on cold start, fine for single-user)
const rateLimiter = { minute: 0, hour: 0, day: 0, lastMinute: 0, lastHour: 0, lastDay: 0 }
const LIMITS = { minute: 5, hour: 30, day: 100 }

function checkRateLimit(): boolean {
  const now = Date.now()
  const minute = Math.floor(now / 60000)
  const hour = Math.floor(now / 3600000)
  const day = Math.floor(now / 86400000)

  if (minute !== rateLimiter.lastMinute) { rateLimiter.minute = 0; rateLimiter.lastMinute = minute }
  if (hour !== rateLimiter.lastHour) { rateLimiter.hour = 0; rateLimiter.lastHour = hour }
  if (day !== rateLimiter.lastDay) { rateLimiter.day = 0; rateLimiter.lastDay = day }

  if (rateLimiter.minute >= LIMITS.minute) return false
  if (rateLimiter.hour >= LIMITS.hour) return false
  if (rateLimiter.day >= LIMITS.day) return false

  rateLimiter.minute++
  rateLimiter.hour++
  rateLimiter.day++
  return true
}

function jsonResponse(body: VoiceIntakeResponse, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function getLinearConfig(): LinearConfig {
  return {
    apiKey: process.env.LINEAR_ACCESS_TOKEN!,
    teamId: process.env.LINEAR_TEAM_ID!,
    projectIds: {
      alteri: process.env.LINEAR_PROJECT_ALTERI ?? '',
      'claude-infra-devops': process.env.LINEAR_PROJECT_INFRA ?? '',
      prototype: process.env.LINEAR_PROJECT_PROTOTYPE ?? '',
    },
    labelIds: JSON.parse(process.env.LINEAR_LABEL_IDS ?? '{}'),
  }
}

async function logToSupabase(log: VoiceIntakeLog): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) return

  try {
    await fetch(`${supabaseUrl}/rest/v1/voice_intakes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        transcript: log.transcript,
        source: log.source,
        device: log.device,
        recorded_at: log.recordedAt,
        title: log.title,
        description: log.description,
        project: log.project,
        exec_mode: log.execMode,
        priority: log.priority,
        readiness: log.readiness,
        acceptance_criteria: log.acceptanceCriteria,
        clarifying_questions: log.clarifyingQuestions,
        technical_notes: log.technicalNotes,
        related_areas: log.relatedAreas,
        extraction_model: log.extractionModel,
        extraction_tokens_input: log.extractionTokensInput,
        extraction_tokens_output: log.extractionTokensOutput,
        extraction_duration_ms: log.extractionDurationMs,
        raw_extraction_json: log.rawExtractionJson,
        linear_issue_id: log.linearIssueId,
        linear_issue_url: log.linearIssueUrl,
        auto_implement_triggered: log.autoImplementTriggered,
        processing_status: log.processingStatus,
        error_message: log.errorMessage,
      }),
    })
  } catch (err) {
    console.error('Failed to log to Supabase:', err)
  }
}

async function triggerAutoImplement(issueId: string, title: string): Promise<boolean> {
  if (process.env.VOICE_AUTO_IMPLEMENT !== 'true') return false

  const ghToken = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO ?? 'cianosullivan/alteri'
  if (!ghToken) return false

  try {
    const resp = await fetch(
      `https://api.github.com/repos/${repo}/actions/workflows/voice-auto-implement.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${ghToken}`,
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            issue_id: issueId,
            title,
          },
        }),
      }
    )
    return resp.ok
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  // Auth check
  const authHeader = request.headers.get('authorization')
  const expectedSecret = process.env.VOICE_INTAKE_SECRET
  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return jsonResponse({ status: 'error', error: 'Unauthorized' }, 401)
  }

  // Rate limit
  if (!checkRateLimit()) {
    return jsonResponse({ status: 'error', error: 'Rate limit exceeded' }, 429)
  }

  // Parse request
  let body: VoiceIntakeRequest
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ status: 'error', error: 'Invalid JSON' }, 400)
  }

  if (!body.transcript || typeof body.transcript !== 'string' || body.transcript.trim().length === 0) {
    return jsonResponse({ status: 'error', error: 'transcript is required' }, 400)
  }

  // Initialize log
  const log: VoiceIntakeLog = {
    transcript: body.transcript,
    source: body.source ?? 'shortcut',
    device: body.device,
    recordedAt: body.timestamp ?? new Date().toISOString(),
    processingStatus: 'pending',
  }

  try {
    // 1. Extract concept via Claude Haiku
    const extraction = await extractConcept(body.transcript)
    const concept = extraction.concept

    // Apply overrides from request
    if (body.project) concept.project = body.project
    if (body.execMode) concept.execMode = body.execMode

    log.title = concept.title
    log.description = concept.description
    log.project = concept.project
    log.execMode = concept.execMode
    log.priority = concept.priority
    log.readiness = concept.readiness
    log.acceptanceCriteria = concept.acceptanceCriteria
    log.clarifyingQuestions = concept.clarifyingQuestions
    log.technicalNotes = concept.technicalNotes
    log.relatedAreas = concept.relatedAreas
    log.extractionModel = extraction.model
    log.extractionTokensInput = extraction.tokensInput
    log.extractionTokensOutput = extraction.tokensOutput
    log.extractionDurationMs = extraction.durationMs
    log.rawExtractionJson = extraction.rawJson
    log.processingStatus = 'extracted'

    // 2. Create Linear issue
    const linearConfig = getLinearConfig()
    const issue = await createLinearIssue(concept, body.transcript, linearConfig, {
      device: body.device,
      timestamp: body.timestamp,
    })

    log.linearIssueId = issue.issueId
    log.linearIssueUrl = issue.issueUrl
    log.processingStatus = 'linear_created'

    // 3. Auto-implement if enabled and appropriate
    let autoImplemented = false
    if (
      concept.readiness === 'implementable' &&
      (concept.execMode === 'quick' || concept.execMode === 'tdd')
    ) {
      autoImplemented = await triggerAutoImplement(issue.issueId, concept.title)
    }
    log.autoImplementTriggered = autoImplemented
    log.processingStatus = 'completed'

    // 4. Log to Supabase (fire-and-forget)
    logToSupabase(log).catch(() => {})

    return jsonResponse(
      {
        status: 'created',
        issueId: issue.issueId,
        issueUrl: issue.issueUrl,
        title: concept.title,
        project: concept.project,
        readiness: concept.readiness,
        questions: concept.clarifyingQuestions ?? undefined,
        autoImplement: autoImplemented,
      },
      201
    )
  } catch (err) {
    log.processingStatus = 'failed'
    log.errorMessage = err instanceof Error ? err.message : String(err)
    logToSupabase(log).catch(() => {})

    console.error('Voice intake error:', err)
    return jsonResponse(
      {
        status: 'error',
        error: err instanceof Error ? err.message : 'Internal error',
      },
      500
    )
  }
}
