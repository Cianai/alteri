-- Voice Intakes table for voice-to-feature pipeline
-- Run via Supabase Dashboard SQL Editor or `supabase db push`

CREATE TABLE voice_intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'shortcut',
  device TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  title TEXT,
  description TEXT,
  project TEXT,
  exec_mode TEXT,
  priority TEXT,
  readiness TEXT,
  acceptance_criteria JSONB,
  clarifying_questions JSONB,
  technical_notes TEXT,
  related_areas JSONB,
  extraction_model TEXT,
  extraction_tokens_input INTEGER,
  extraction_tokens_output INTEGER,
  extraction_duration_ms INTEGER,
  raw_extraction_json JSONB,
  linear_issue_id TEXT,
  linear_issue_url TEXT,
  auto_implement_triggered BOOLEAN DEFAULT false,
  github_pr_url TEXT,
  processing_status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: service_role only (internal tooling)
ALTER TABLE voice_intakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only"
  ON voice_intakes
  USING (auth.role() = 'service_role');

-- Indexes for common queries
CREATE INDEX idx_voice_intakes_project ON voice_intakes(project);
CREATE INDEX idx_voice_intakes_status ON voice_intakes(processing_status);
CREATE INDEX idx_voice_intakes_created ON voice_intakes(created_at DESC);
