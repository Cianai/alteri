# CIA-143: Code↔Cowork Integration Foundations

**Linear Issue:** [CIA-143](https://linear.app/cianclaude/issue/CIA-143)
**Status:** spec:draft
**Created:** 2026-02-01
**Source:** Cowork PM session (Boris tips validation)

---

## Executive Summary

Research conducted via 5 parallel subagents + staff engineer review. 75% of recommendations rejected as premature ("cargo-cult moves", "solving invisible problems"). This spec documents the full findings for Claude Code's adversarial-spec review before implementation.

---

## Research Findings (Full Detail)

### Area 1: Shared Data Sources Audit

**Current State:**
- `~/CLAUDE.md` - Root context, read by both environments
- `~/.claude/CLAUDE.md` - Claude Code specific (419 lines)
- `AGENDA.md` - Cross-environment bridge, exists but drifts (last action items Jan 23)
- `session-index.md` - One-way flow (Code→Vault), Cowork has no read access
- Linear MCP - Configured in both but different transports (stdio vs HTTP)
- 3GB `.claude/` directory - Mostly debug logs (1512 files) and shell-snapshots

**Identified Gaps:**
| Gap | Severity | Evidence |
|-----|----------|----------|
| AGENDA.md schema undefined | Medium | No frontmatter, inconsistent sections |
| Session-index one-way | Medium | Cowork can't see Code session history |
| Debug logs unbounded | Low | 3GB accumulation, no TTL |
| Hook scripts exist but not enabled | Low | `~/.claude/hooks/` has 7 scripts, settings.json has `"hooks": {}` |

**Staff Engineer Verdict:** REVISE (4/10)
> "Vague diagnostics; root causes misidentified. Before implementing, define AGENDA.md schema spec."

---

### Area 2: Configuration Recommendations

**Current State:**
```json
// ~/.claude/settings.json (relevant sections)
{
  "hooks": {},  // Empty despite hook scripts existing
  "enabledMcpjsonServers": [...],  // 20 servers enabled
  "permissions": {
    "allow": [...],  // 28 tools
    "deny": [...]    // 4 dangerous patterns
  }
}
```

**Boris Team Recommendations vs Current:**
| Tip | Boris Recommends | Current State | Gap? |
|-----|------------------|---------------|------|
| PostToolUse hooks | `bun run format \|\| true` | Not enabled | ⚠️ |
| /permissions command | Dynamic grants | Static allow/deny | ❌ Current is fine |
| Limit MCPs | 10-15 simultaneous | 20 enabled | ⚠️ Unverified issue |
| Self-writing CLAUDE.md | Update after corrections | Added to CLAUDE.md | ✅ |
| Git worktrees | Parallel sessions | Added to CLAUDE.md | ✅ |

**Staff Engineer Verdict:** REJECT (3/10)
> "Cargo-cult moves; solving invisible problems. No evidence of formatting issues. MCP token consumption unverified. Static permissions are more secure for autonomous agents."

---

### Area 3: Monitoring/Observability Tools

**Tools Researched (16 total):**

| Tool | Stars | Works In | Purpose | Recommendation |
|------|-------|----------|---------|----------------|
| ccusage | 10.2K | Code | Usage analytics by 5-hour billing windows | ✅ Evaluate |
| recall | 111 | Code | Full-text search + resume for conversations | ✅ **Priority** - Claude Island replacement |
| claude-code-hooks-multi-agent-observability | 936 | Code | Real-time WebSocket dashboard for swarms | ✅ For exec:swarm |
| CodexBar | 3.6K | macOS | Menu bar usage stats | ✅ Simpler than ccusage |
| everything-claude-code | 36.6K | Code | Battle-tested configs (hooks, skills, commands) | ✅ **Priority** - audit against current |
| claude-hud | — | Code | Statusline plugin, context/todos/agents | ⚠️ Already have statusline |
| Claude Session Restore | — | Code | Context recovery from session files | ⚠️ Redundant with recall |

**Cowork-Compatible Tools:**
- None found with meaningful observability
- Cowork runs in VM, no extension support
- Only option: Linear as visibility layer (current approach)

**Staff Engineer Verdict:** REJECT (2/10)
> "Fuzzy problem statement. What are we observing FOR? Adding tools without a goal is tech debt."

**Revised Assessment:** The problem isn't "observability tools" but "cross-environment session visibility". recall (full-text search across sessions) addresses this better than dashboards.

---

### Area 4: Claude Island Alternatives

**Claude Island Current Limitations:**
- macOS-only notification UI
- No inline response capability
- Session browser but no editing

**Alternatives Evaluated:**

| Tool | Type | Inline Response? | Cross-Env? | Verdict |
|------|------|------------------|------------|---------|
| Agent Deck | Terminal UI | No | Code only | ❌ |
| Claude Code UI | Web dashboard | No | Code only | ❌ |
| Claude Flow v3 | Enterprise framework | Overkill | Code only | ❌ |
| Agent Sessions | macOS app | No | Code only | ❌ |
| **recall** | CLI + search | Yes (resume) | Code only | ✅ Best fit |
| Linear + Obsidian | Existing tools | Via comments | Yes | ✅ Already have |

**Staff Engineer Verdict:** REJECT (2/10)
> "Confusing UX with infrastructure. The core issue (Code↔Cowork integration) isn't solved by UI layers."

**Revised Assessment:** Don't add new tools. Use:
1. **recall** for session search/resume in Code
2. **Linear comments** for cross-environment communication
3. **AGENDA.md** for context handoff (once schema defined)

---

### Area 5: Web Scraping Unblocking

**Current Blockers:**
- Reddit links → 403 in WebFetch
- Medium paywalls → No solution (respects auth)
- Some JS-heavy sites → WebFetch fails

**Solutions by Source:**

| Source | Tool | Transport | Status |
|--------|------|-----------|--------|
| Reddit | Reddit MCP (API) | stdio | Not enabled |
| Reddit | Firecrawl | HTTP | ✅ Working |
| Medium | None (paywall) | — | Accept limitation |
| General | Firecrawl | HTTP | ✅ Working |
| Complex | Bright Data | HTTP | Premium, not evaluated |

**Staff Engineer Verdict:** APPROVE (5/10)
> "Concrete and actionable. Reddit MCP or Firecrawl for Reddit. Document Firecrawl patterns."

---

## GitHub Stars - Relevant Repos Not Evaluated

These were in your starred repos but research agents missed them:

### ClaudeCode List (22 repos)
```
✅ everything-claude-code (36.6K) - PRIORITY: Audit configs
✅ ccusage (10.2K) - Usage analytics
✅ recall (111) - PRIORITY: Session search/resume
✅ claude-code-hooks-multi-agent-observability (936) - Swarm monitoring
⚠️ CodexBar (3.6K) - NOT EVALUATED: macOS menu bar stats
⚠️ trailofbits/skills (2.2K) - NOT EVALUATED: Security skills
⚠️ humanizer (3.6K) - NOT EVALUATED: AI text cleanup
```

### Cowork List (3 repos)
```
✅ anthropics/knowledge-work-plugins (354) - Already installed
```

---

## Acceptance Criteria

### Must Have (CIA-143)
- [ ] AGENDA.md schema defined with frontmatter, required sections, timestamps
- [ ] Session-index bidirectional flow (Code→Vault→Cowork readable)
- [ ] recall evaluated as session search/resume tool
- [ ] Firecrawl usage documented for Reddit/general scraping

### Should Have (CIA-143)
- [ ] everything-claude-code configs audited against current setup
- [ ] Reddit MCP evaluated vs Firecrawl for Reddit content
- [ ] Debug log TTL policy (optional, low priority)

### Won't Have (Deferred)
- PostToolUse hooks (no formatting problem identified)
- MCP limiting (token consumption unverified)
- Claude Island alternatives (Linear + recall sufficient)
- Bright Data (premium, not justified yet)

---

## Implementation Notes for Claude Code

When this spec reaches `spec:ready`:

1. **Adversarial Review Focus:**
   - Challenge the REJECT verdicts - are they correct?
   - Verify MCP token consumption claim (profile with actual measurement)
   - Test recall against current session-index workflow

2. **Suggested exec: label:** `exec:checkpoint`
   - Multiple independent sub-tasks
   - Some require validation before proceeding
   - Human approval needed for schema decisions

3. **Git worktree candidates:**
   - `alteri-agenda-schema` - AGENDA.md schema work
   - `alteri-session-sync` - Session-index bidirectional flow
   - `alteri-scraping` - Web scraping documentation

---

## References

- [Boris's 10 Team Tips](https://ykdojo.github.io/claude-code-tips/content/boris-claude-code-tips)
- [Linear Document: Cowork↔Code Learnings](https://linear.app/cianclaude/document/cowork-claude-code-integration-learnings-5f92d209952b)
- GitHub Stars: https://github.com/cianos95-dev?tab=stars
- Staff Engineer Review: Cowork session 2026-02-01 (agent ID: a9e4e03)
