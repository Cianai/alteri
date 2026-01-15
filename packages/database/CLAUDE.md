# Database Package

Supabase client, types, and RLS policies for participant data.

## Documentation-First

Query Context7 before implementing:
- `context7:resolve-library-id` with "supabase"
- `context7:query-docs` for RLS, realtime, auth patterns

## Schema Principles

- **snake_case** for all identifiers (tables, columns)
- **RLS policies required** on all participant-facing tables
- **Pseudonymisation**: separate linking table with restricted access
- **Audit trail**: `created_at`, `updated_at` on all tables

## Table Structure

```sql
-- Participants (pseudonymised)
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pseudonym_id TEXT UNIQUE NOT NULL,
  consent_given_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Session snapshots for XState persistence
CREATE TABLE session_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  participant_id UUID REFERENCES participants(id),
  snapshot JSONB NOT NULL,
  phase TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Evaluation responses
CREATE TABLE evaluation_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id),
  scenario_id TEXT NOT NULL,
  framework_order TEXT NOT NULL, -- 'AB' or 'BA'
  preferred_framework TEXT, -- 'A', 'B', or 'equal'
  dimension_scores JSONB,
  free_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Linking table (restricted access)
CREATE TABLE participant_links (
  pseudonym_id TEXT PRIMARY KEY,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## RLS Policies

```sql
-- Participants can only see their own data
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read own data"
  ON participants FOR SELECT
  USING (auth.uid()::text = pseudonym_id);

-- Linking table: service role only
ALTER TABLE participant_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only"
  ON participant_links
  USING (auth.role() = 'service_role');
```

## Client Usage

```typescript
// Browser client (uses anon key, RLS protected)
import { supabase } from '@alignment-comparator/database';

const { data } = await supabase
  .from('participants')
  .select('*')
  .eq('pseudonym_id', participantId);

// Server client (uses service role, bypasses RLS)
import { createServiceClient } from '@alignment-comparator/database';

const adminClient = createServiceClient();
const { data } = await adminClient
  .from('participant_links')
  .select('*');
```

## Type Generation

```bash
# Generate types from Supabase schema
pnpm db:generate

# This creates packages/database/src/types.ts
```
