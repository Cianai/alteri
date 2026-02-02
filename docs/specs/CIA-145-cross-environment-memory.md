---
linear: CIA-145
exec: quick
env: desktop
status: ready
---

# Cross-Environment Context Sharing via claude-flow Memory

## Overview

Configure claude-flow's built-in memory system for automatic cross-environment context sharing between Claude Code and Claude Desktop. This spec covers **configuration and documentation** of existing infrastructure, not building new systems.

## Goals and Non-Goals

### Goals
- Enable automatic context sharing between Claude Code and Claude Desktop
- Document memory workflow for consistent usage
- Verify cross-environment functionality works as discovered

### Non-Goals
- Building new APIs (claude-flow already provides MCP tools)
- Custom memory UI/dashboard
- Cloud sync functionality
- Cowork integration (separate scope)

## Background

### Problem Statement

When switching between Claude Code and Claude Desktop:
1. Context is lost between sessions
2. Manual pasting of AGENDA.md content is required
3. No automatic memory persistence across environments

### Solution Discovery

claude-flow v3alpha (already installed) includes:
- Vector memory with sql.js + HNSW backend
- Automatic embedding generation (384 dimensions)
- Semantic search capability
- Persistent storage at `~/.swarm/memory.db`

**Critical finding:** Both Claude Code and Claude Desktop run MCP servers from `~` (home directory), meaning they share the same memory database.

## System Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   claude-flow Memory Layer                   │
│           (~/.swarm/memory.db + ~/.swarm/hnsw.index)         │
└─────────────────────────┬───────────────────────────────────┘
                          │ Shared storage (same cwd)
         ┌────────────────┼────────────────┐
         │                │                │
    ┌────▼────┐     ┌─────▼─────┐    ┌─────▼─────┐
    │ Desktop │     │   Code    │    │  Cowork*  │
    │  (Chat) │     │           │    │           │
    └─────────┘     └───────────┘    └───────────┘
                                     * via MCP connector (future)
```

### Component Design

| Component | Location | Purpose |
|-----------|----------|---------|
| Memory Database | `~/.swarm/memory.db` | SQLite with sql.js |
| HNSW Index | `~/.swarm/hnsw.index` | Vector similarity search |
| MCP Server | `npx claude-flow@v3alpha mcp start` | Exposes memory tools |

## API Design (Existing MCP Tools)

These are **existing tools** provided by claude-flow v3alpha. We document them here for reference.

### mcp__claude-flow__memory_store

**Purpose:** Store data with vector embedding for semantic search.

**Request Schema:**
```json
{
  "namespace": "string",     // Required. Organization namespace
  "key": "string",           // Required. Unique key within namespace
  "value": "string|object",  // Required. Data to store
  "tags": ["string"],        // Optional. Filtering tags
  "ttl": "number"            // Optional. Time-to-live in seconds
}
```

**Response Schema:**
```json
{
  "success": true,
  "key": "string",
  "namespace": "string",
  "stored": true,
  "storedAt": "ISO8601",
  "hasEmbedding": true,
  "embeddingDimensions": 384,
  "backend": "sql.js + HNSW",
  "storeTime": "string"      // e.g., "21.41ms"
}
```

**Error Handling:**
- Returns `success: false` with error message on failure
- Validates required fields before storage

### mcp__claude-flow__memory_search

**Purpose:** Semantic search across stored memories.

**Request Schema:**
```json
{
  "query": "string",         // Required. Natural language query
  "namespace": "string",     // Optional. Filter by namespace
  "limit": "number",         // Optional. Max results (default: 10)
  "tags": ["string"]         // Optional. Filter by tags
}
```

**Response Schema:**
```json
{
  "results": [
    {
      "key": "string",
      "namespace": "string",
      "value": "object",
      "score": "number",     // Similarity score 0-1
      "tags": ["string"]
    }
  ],
  "total": "number",
  "backend": "sql.js + HNSW"
}
```

### mcp__claude-flow__memory_list

**Purpose:** List entries for debugging and inspection.

**Request Schema:**
```json
{
  "namespace": "string",     // Optional. Filter by namespace
  "limit": "number",         // Optional. Max results (default: 50)
  "offset": "number"         // Optional. Pagination offset
}
```

### mcp__claude-flow__memory_stats

**Purpose:** Get storage statistics.

**Response Schema:**
```json
{
  "initialized": true,
  "totalEntries": "number",
  "entriesWithEmbeddings": "number",
  "embeddingCoverage": "string",  // e.g., "100.0%"
  "namespaces": {"name": "count"},
  "backend": "sql.js + HNSW",
  "version": "string",
  "features": {
    "vectorEmbeddings": true,
    "patternLearning": true,
    "temporalDecay": true
  }
}
```

## Data Models

### Memory Namespaces

| Namespace | Purpose | Example Keys |
|-----------|---------|--------------|
| `sessions` | Session continuity | `session-2026-02-02-workflow-test` |
| `specs` | Spec execution records | `cia-infra-audit-2026-02-01` |
| `cross-env-test` | Verification entries | `code-to-desktop-verification` |
| `context` | Working context | `current-task`, `active-issues` |

### Session Value Schema

```json
{
  "date": "ISO8601",
  "environment": "code|desktop",
  "context": "string",           // Free-form context summary
  "todos": ["string"],           // Pending tasks
  "decisions": [                 // Decisions made
    {
      "decision": "string",
      "rationale": "string"
    }
  ],
  "files_modified": ["string"],  // Paths modified
  "plan_file": "string"          // Active plan if any
}
```

## Security Considerations

### File Permissions
- `~/.swarm/memory.db` should have 600 permissions (user read/write only)
- Verified via: `chmod 600 ~/.swarm/memory.db`

### Data Sensitivity
- Memory may contain session context, file paths, and decisions
- Do NOT store: API keys, passwords, or credentials
- Tags like `sensitive` can flag entries for careful handling

### Access Control
- MCP server runs as current user
- No network exposure (stdio transport)
- Both Desktop and Code run as same user, sharing access

### Input Validation
- claude-flow validates namespace/key formats
- Value field accepts any JSON-serializable data
- Tags must be string arrays

## Error Handling Strategy

| Scenario | Handling |
|----------|----------|
| Database locked | Retry with exponential backoff (claude-flow handles) |
| Invalid namespace | Return error with message |
| Storage full | Log warning, oldest entries may be pruned |
| MCP unavailable | Claude falls back to no-memory mode |

## Performance Requirements

| Operation | Target Latency | Notes |
|-----------|---------------|-------|
| `memory_store` | < 100ms | Includes embedding generation |
| `memory_search` | < 500ms | HNSW provides O(log n) search |
| `memory_list` | < 50ms | Direct SQL query |

**Observed:** Store operations completing in ~21ms in testing.

## Observability

### Logging
- claude-flow logs operations to stderr
- View with: `npx claude-flow@v3alpha memory list`

### Metrics (from memory_stats)
- Total entries
- Embedding coverage percentage
- Namespace distribution

### Health Checks
- `memory_stats` returns `initialized: true` if healthy
- Database integrity checked on startup

## Testing Strategy

### Manual Verification Test
1. Store entry from Code with verification token
2. Retrieve entry from Desktop
3. Confirm token matches

**Verification entry created:**
- Namespace: `cross-env-test`
- Key: `code-to-desktop-verification`
- Token: `XENV-TEST-7842`

### Automated Tests (Future)
- Unit tests for namespace conventions
- Integration test for cross-environment retrieval
- Performance regression tests

## Deployment Strategy

### Prerequisites
1. claude-flow v3alpha installed: `npx claude-flow@v3alpha --version`
2. Desktop configuration updated (already done)
3. `~/.swarm/` directory exists with correct permissions

### Rollout
1. Configuration already complete (Phase 1)
2. Verify Desktop can read Code's entries (manual test)
3. Document in CLAUDE.md
4. Close Linear issues

### Rollback
- Remove claude-flow from Desktop config to disable
- Memory database persists but won't be accessed
- No data migration needed

## Acceptance Criteria

1. **Cross-environment verification:**
   - [ ] Entry stored from Code can be retrieved from Desktop
   - [ ] Verification token `XENV-TEST-7842` readable from both environments

2. **Documentation:**
   - [ ] CLAUDE.md updated with memory workflow guidance
   - [ ] Memory namespaces documented
   - [ ] API usage examples provided

3. **Linear closure:**
   - [ ] CIA-145 closed with implementation evidence
   - [ ] CIA-143 shows 4/4 subtasks complete

## Implementation Steps

1. **Verify cross-environment access** (manual test in Desktop)
   - Retrieve `cross-env-test/code-to-desktop-verification`
   - Confirm token `XENV-TEST-7842` matches

2. **Document memory workflow in CLAUDE.md**
   - Add Session Persistence section update
   - Document namespace conventions
   - Add memory operation examples

3. **Close Linear issues**
   - CIA-145: Add implementation evidence
   - CIA-143: Verify 4/4 complete

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Desktop cwd differs | Low | High | Verified both run from `~` via `lsof` |
| Memory corruption | Low | Medium | Separate namespaces, database backups |
| API changes in v3 | Medium | Low | Pin to v3alpha, track releases |
| Concurrent access conflicts | Low | Low | SQLite handles locking |

## Dependencies

- claude-flow v3alpha (installed)
- Desktop claude-flow configuration (added to `claude_desktop_config.json`)
- `~/.swarm/` directory (exists with memory.db, hnsw.index)

## Out of Scope

- Cowork memory integration (requires MCP connector setup)
- Custom memory UI/dashboard
- Cloud sync (local-only for now)
- Building new APIs (using existing claude-flow tools)
