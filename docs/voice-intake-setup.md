# Voice-to-Feature Pipeline Setup

## Prerequisites

1. Alteri deployed on Vercel with the voice-intake API route
2. Supabase `voice_intakes` table created (run `packages/database/migrations/001_voice_intakes.sql`)
3. Linear API access token with issue creation permissions

## Environment Variables (Vercel)

Add these to your Vercel project environment variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `VOICE_INTAKE_SECRET` | `openssl rand -hex 32` | 64-char hex, also in Shortcut |
| `LINEAR_ACCESS_TOKEN` | Your Linear API key | From Linear Settings > API |
| `LINEAR_TEAM_ID` | CianClaude team UUID | From Linear team settings |
| `LINEAR_PROJECT_ALTERI` | Alteri project UUID | From Linear project URL |
| `LINEAR_PROJECT_INFRA` | Claude Infra DevOps project UUID | Same |
| `LINEAR_PROJECT_PROTOTYPE` | Prototype project UUID | Same |
| `LINEAR_LABEL_IDS` | JSON map of label names to IDs | e.g. `{"source:voice":"uuid","spec:ready":"uuid",...}` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | From Supabase project settings |
| `VOICE_AUTO_IMPLEMENT` | `false` | Set to `true` for Phase 2 autonomous mode |
| `GITHUB_TOKEN` | GitHub PAT with workflow dispatch | Only needed for auto-implement |
| `GITHUB_REPO` | `cianosullivan/alteri` | Default if not set |

### Getting Linear IDs

```bash
# Team ID - from Linear Settings > Workspace > API
# Project IDs - hover over project name in sidebar, copy from URL
# Label IDs - use Linear API:
curl -s -X POST https://api.linear.app/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: YOUR_TOKEN" \
  -d '{"query": "{ issueLabels { nodes { id name } } }"}' | jq '.data.issueLabels.nodes'
```

## Apple Shortcut: "Voice Feature" (iPhone)

### Steps to Build

1. Open **Shortcuts** app on iPhone
2. Tap **+** to create new shortcut
3. Name it: **Voice Feature**
4. Add these actions in order:

#### Action 1: Dictate Text
- Search for **"Dictate Text"**
- Stop listening: **After Pause**
- Language: English

#### Action 2: Set Variable
- Name: `transcript`
- Input: Dictated Text

#### Action 3: Date
- Search for **"Date"**
- Format: ISO 8601

#### Action 4: Set Variable
- Name: `timestamp`
- Input: Current Date

#### Action 5: Get Contents of URL
- URL: `https://YOUR_VERCEL_DOMAIN/api/voice-intake`
- Method: **POST**
- Headers:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer YOUR_VOICE_INTAKE_SECRET`
- Request Body (JSON):
  ```json
  {
    "transcript": transcript,
    "timestamp": timestamp,
    "source": "shortcut",
    "device": "iphone"
  }
  ```
  (Use Magic Variables to insert `transcript` and `timestamp` variables)

#### Action 6: Get Dictionary Value
- Key: (leave blank, gets full response)
- This parses the JSON response

#### Action 7: Show Notification
- Title: Get Value for `issueId` from Dictionary
- Body: Get Value for `title` from Dictionary

#### Action 8 (Optional): Open URL
- URL: Get Value for `issueUrl` from Dictionary

### Assign to Action Button

1. Go to **Settings > Action Button**
2. Select **Shortcut**
3. Choose **Voice Feature**

Now: press Action Button -> speak your idea -> release -> notification with Linear issue link.

## Apple Shortcut: "Voice Feature" (Mac)

Same flow but:
- Action 1 uses **"Dictate Text"** (requires macOS Sequoia+)
- Action 5 URL uses same Vercel endpoint
- Assign a global keyboard shortcut via **Shortcuts > right-click shortcut > Add Keyboard Shortcut**

Recommended shortcut: `Ctrl+Opt+V` (V for Voice)

## Testing

### curl Test

```bash
# Replace with your actual domain and secret
curl -X POST https://YOUR_DOMAIN/api/voice-intake \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -d '{
    "transcript": "I want to add a loading spinner to the comparison page when AI responses are streaming. It should show a pulsing animation and disappear when all frameworks have finished responding.",
    "timestamp": "2026-02-06T12:00:00Z",
    "source": "cli",
    "device": "mac"
  }'
```

Expected response:
```json
{
  "status": "created",
  "issueId": "CIA-42",
  "issueUrl": "https://linear.app/cianclaude/issue/CIA-42/...",
  "title": "Add loading spinner to comparison page during streaming",
  "project": "alteri",
  "readiness": "implementable",
  "autoImplement": false
}
```

### Verify Pipeline

1. Check Linear: issue should appear with correct project, labels, formatted description
2. Check Supabase: `voice_intakes` table should have the full log entry
3. Check response time: should be <10s total (extraction ~2-3s, Linear API ~1s)

## Auto-Implementation (Phase 2)

Once you trust the extraction quality:

1. Set `VOICE_AUTO_IMPLEMENT=true` in Vercel env vars
2. Ensure `GITHUB_TOKEN` is set with `workflow_dispatch` permissions
3. Test with a well-specified voice memo
4. Verify: GitHub Actions triggers -> branch created -> PR opened -> Vercel preview

### Phase 1 (Manual Trigger)

Before enabling autonomous mode, you can manually trigger auto-implementation:
1. Go to the Linear issue
2. Add the `auto:implement` label
3. GitHub Actions workflow triggers on label addition
4. Check Actions tab for progress

## Architecture

```
iPhone/Mac Voice Memo
  -> Apple Shortcut (Dictate Text = on-device transcription)
  -> HTTPS POST to /api/voice-intake
  -> Claude Haiku extracts structured concept (~$0.001/memo)
  -> Linear issue created (spec:draft or spec:ready)
  -> Supabase logs the full event
  -> [If implementable + quick/tdd + VOICE_AUTO_IMPLEMENT=true]
     -> GitHub Actions dispatched
     -> Claude Code implements feature
     -> PR created with Vercel preview
  -> Response notification on phone with issue link
```
