# CIA-143: Code↔Cowork Integration Foundations

**Linear Issue:** [CIA-143](https://linear.app/cianclaude/issue/CIA-143)
**Status:** spec:ready
**Created:** 2026-02-01
**Source:** Cowork PM session (Boris tips validation)
**Adversarial Review:** Claude Code, 2026-02-01 (this document)

---

## Executive Summary

Research conducted via 5 parallel subagents + staff engineer review. 75% of recommendations rejected as premature ("cargo-cult moves", "solving invisible problems"). This spec documents the full findings with Claude Code's adversarial review validating/challenging the staff engineer verdicts.

**Adversarial Review Outcome:** The staff engineer verdicts are **largely correct** but require nuance. MCP token consumption claim has been verified as a non-issue. Three of four REJECTs are upheld; one (Area 3) upgraded to APPROVE with refined scope.

---

## Adversarial Review: Challenging the REJECT Verdicts

### Summary Table

| Area | Staff Verdict | Adversarial Verdict | Reasoning |
|------|---------------|---------------------|-----------|
| Area 1: Data Sources | REVISE (4/10) | **UPHOLD** | AGENDA.md schema must come first |
| Area 2: Configuration | REJECT (3/10) | **UPHOLD** ✅ | MCP token consumption verified as <15% |
| Area 3: Monitoring | REJECT (2/10) | **UPGRADE to APPROVE (6/10)** | `recall` solves a real problem |
| Area 4: Claude Island | REJECT (2/10) | **UPHOLD** | Linear + AGENDA.md sufficient |
| Area 5: Web Scraping | APPROVE (5/10) | **UPHOLD** ✅ | Firecrawl working |

---

## Evidence-Based Verdict Analysis

### Area 2: MCP Token Consumption - VERIFIED NON-ISSUE

The spec claimed "MCP token consumption unverified" regarding the Boris tip to limit MCPs to 10-15. **I profiled actual sessions:**

```
=== MCP Usage Analysis Across 10 Recent Sessions ===
Session (142MB): 9 MCP calls / 4,915 total tools = 0.18%
Session (8.4MB): 41 MCP calls / 371 total tools = 11%
Session (7.8MB): 13 MCP calls / 463 total tools = 2.8%
Session (5.5MB): 16 MCP calls / 427 total tools = 3.7%
Session (1.6MB): 8 MCP calls / 56 total tools = 14.2%

Average MCP usage: ~6.5% of tool calls
```

**Finding:** With 20 MCPs enabled, MCP tool calls represent 2-15% of session activity. The dominant tools are Read (1982 calls), Bash (1773 calls), Glob (590 calls). MCP calls are infrequent even in MCP-heavy sessions.

**Conclusion:** Staff engineer is correct. No evidence that 20 MCPs causes token bloat. The Boris tip applies to different usage patterns (constant MCP polling). Current static configuration is fine.

---

### Area 3: Observability Tools - UPGRADED TO APPROVE

Staff engineer rejected observability tools as "fuzzy problem statement." However, the revised assessment in the spec correctly identified the real problem: **cross-environment session visibility**.

**Evidence from tool research:**

| Tool | Verdict | Justification |
|------|---------|---------------|
| [recall](https://github.com/zippoxer/recall) (111★) | ✅ PRIORITY | Full-text search + resume across all Claude sessions. Replaces Claude Island session browsing. Direct integration: "tell your agent to use `recall search --help`" |
| [CodexBar](https://github.com/steipete/CodexBar) (3.6K★) | ✅ INSTALL | macOS menu bar showing session/weekly usage, reset countdowns, cost calculations. Simpler than ccusage, supports Claude Code OAuth |
| [trailofbits/skills](https://github.com/trailofbits/skills) (2.2K★) | ✅ EVALUATE | Security-focused plugin: smart contract audits, vulnerability detection, YARA rules. Defensive/research focus, not offensive |
| [everything-claude-code](https://github.com/affaan-m/everything-claude-code) (36.7K★) | ✅ AUDIT | Complete config collection from Anthropic hackathon winner. Cross-platform scripts, token optimization guides |

**Upgraded Verdict:** APPROVE (6/10) with scope limited to `recall` (session search) and `CodexBar` (usage visibility). The observability goal is now concrete: "find and resume previous sessions."

---

### Area 4: Claude Island Alternatives - UPHOLD REJECT

Staff engineer correctly identified that UI tools don't solve infrastructure problems. The revised assessment already converged to the right answer:

1. **recall** for session search in Code ✅
2. **Linear comments** for cross-environment communication ✅
3. **AGENDA.md** for context handoff ✅

No new tools needed beyond recall.

---

## Unreviewed Starred Repos - Now Evaluated

### CodexBar (3.6K★)
**Purpose:** macOS menu bar usage stats for Claude Code and Codex
**Install:** `brew install --cask codexbar` or download from releases
**Value:** Real-time visibility into 5-hour session windows and weekly quotas without leaving the terminal
**Verdict:** ✅ Install - complements CodexBar for passive monitoring

### trailofbits/skills (2.2K★)
**Purpose:** Security skills for Claude Code - vulnerability detection, audit workflows, YARA rules
**Focus:** Defensive security and research (not offensive)
**Skills included:** Smart contract analysis, code audit, malware analysis, cryptographic verification
**Verdict:** ✅ Evaluate for Alteri security hardening (future spec)

### everything-claude-code (36.7K★)
**Purpose:** Complete Claude Code config collection - agents, skills, hooks, commands, rules, MCPs
**Key features:**
- Automatic package manager detection (npm, pnpm, yarn, bun)
- Token optimization and context management guides
- Cross-platform Node.js scripts
**Verdict:** ✅ Audit against current setup - may have better patterns for hooks and skills

### humanizer (3.6K★)
**Purpose:** Claude Code skill to remove AI-generated writing markers
**Verdict:** ⚠️ Not relevant to Code↔Cowork integration. Defer to separate evaluation.

---

## CIA-148 Solution: GitHub Access from Cowork

**Related Issue:** [CIA-148](https://linear.app/cianclaude/issue/CIA-148)

### Root Cause Confirmed
Cowork runs in a sandboxed VM with restricted network access. The pre-built GitHub connector uses OAuth that doesn't expose MCP tools to Claude.

### Solution: mcp-proxy (stdio → HTTP bridge)

[mcp-proxy](https://github.com/sparfenyuk/mcp-proxy) can expose a local stdio MCP server as an SSE endpoint:

```bash
# Install on local machine (outside VM)
uv tool install mcp-proxy

# Run proxy exposing GitHub MCP on port 8080
mcp-proxy --sse-port 8080 -- npx -y @modelcontextprotocol/server-github
```

Cowork can then connect to `http://localhost:8080` (or via tunnel for remote access).

### Alternative: GitHub's Remote Server
GitHub provides a hosted MCP server at `https://api.githubcopilot.com/mcp/` with HTTP transport. This requires:
1. OAuth flow or PAT in Authorization header
2. Cowork to support remote MCP servers (verify capability)

### Recommended Approach
1. Test if Cowork can reach external HTTPS endpoints
2. If yes → Use GitHub's hosted remote server
3. If no → Self-host mcp-proxy on a reachable machine

**Sources:**
- [mcp-proxy](https://github.com/sparfenyuk/mcp-proxy) - stdio to SSE bridge
- [Microsoft MCP Gateway](https://microsoft.github.io/mcp-gateway/sample-servers/mcp-proxy/) - enterprise alternative
- [GitHub MCP Server](https://github.com/github/github-mcp-server) - official with remote option

---

## Research Findings (Full Detail)

### Area 1: Shared Data Sources Audit

**Current State:**
- `~/CLAUDE.md` - Root context, read by both environments
- `~/.claude/CLAUDE.md` - Claude Code specific (419 lines)
- `AGENDA.md` - Cross-environment bridge, exists but drifts (last action items Jan 23)
- `session-index.md` - One-way flow (Code→Vault), Cowork has no read access
- Linear MCP - Configured in both but different transports (stdio vs HTTP)
- 2.9GB `.claude/` directory - 42,589 files (mostly debug logs and shell-snapshots)

**Identified Gaps:**
| Gap | Severity | Evidence |
|-----|----------|----------|
| AGENDA.md schema undefined | Medium | No frontmatter, inconsistent sections |
| Session-index one-way | Medium | Cowork can't see Code session history |
| Debug logs unbounded | Low | 2.9GB accumulation, no TTL |
| Hook scripts exist but not enabled | Low | `~/.claude/hooks/` has 7 scripts, settings.json has `"hooks": {}` |

**Staff Engineer Verdict:** REVISE (4/10)
> "Vague diagnostics; root causes misidentified. Before implementing, define AGENDA.md schema spec."

**Adversarial Review:** UPHOLD. Define AGENDA.md schema before other work.

---

### Area 2: Configuration Recommendations

**Current State (verified):**
```json
// ~/.claude/settings.json (actual)
{
  "hooks": {},  // Empty - hooks disabled Jan 2026 due to context drain
  "enabledMcpjsonServers": [...],  // 20 servers enabled
  "permissions": {
    "allow": [...],  // 24 tools (mcp__* wildcard)
    "deny": [...]    // 4 dangerous patterns
  }
}
```

**Boris Team Recommendations vs Current:**
| Tip | Boris Recommends | Current State | Gap? | Adversarial Verdict |
|-----|------------------|---------------|------|---------------------|
| PostToolUse hooks | `bun run format \|\| true` | Not enabled | ⚠️ | ❌ Hooks disabled intentionally (context drain) |
| /permissions command | Dynamic grants | Static allow/deny | ❌ | ✅ Static is correct for autonomous agents |
| Limit MCPs | 10-15 simultaneous | 20 enabled | ⚠️ | ✅ **Verified non-issue** (see above) |
| Self-writing CLAUDE.md | Update after corrections | Added to CLAUDE.md | ✅ | ✅ Already implemented |
| Git worktrees | Parallel sessions | Added to CLAUDE.md | ✅ | ✅ Already implemented |

**Staff Engineer Verdict:** REJECT (3/10)
> "Cargo-cult moves; solving invisible problems. No evidence of formatting issues. MCP token consumption unverified. Static permissions are more secure for autonomous agents."

**Adversarial Review:** UPHOLD. MCP token consumption verified as 2-15% of calls. No changes needed.

---

### Area 3: Monitoring/Observability Tools

**Tools Researched (16 total):**

| Tool | Stars | Works In | Purpose | Recommendation |
|------|-------|----------|---------|----------------|
| ccusage | 10.2K | Code | Usage analytics by 5-hour billing windows | ⚠️ Not installed, CodexBar simpler |
| recall | 111 | Code | Full-text search + resume for conversations | ✅ **PRIORITY** - Claude Island replacement |
| claude-code-hooks-multi-agent-observability | 936 | Code | Real-time WebSocket dashboard for swarms | ⚠️ Only for exec:swarm |
| CodexBar | 3.6K | macOS | Menu bar usage stats | ✅ **INSTALL** - passive monitoring |
| everything-claude-code | 36.6K | Code | Battle-tested configs (hooks, skills, commands) | ✅ **AUDIT** - compare to current |
| trailofbits/skills | 2.2K | Code | Security skills for audits | ✅ **EVALUATE** - future security spec |

**Staff Engineer Verdict:** REJECT (2/10)
> "Fuzzy problem statement. What are we observing FOR? Adding tools without a goal is tech debt."

**Adversarial Review:** UPGRADE to APPROVE (6/10). The refined problem is "find and resume previous sessions." `recall` + `CodexBar` solve this with minimal footprint.

---

### Area 4: Claude Island Alternatives

**Staff Engineer Verdict:** REJECT (2/10)
> "Confusing UX with infrastructure. The core issue (Code↔Cowork integration) isn't solved by UI layers."

**Adversarial Review:** UPHOLD. The spec already converged to the right answer:
1. `recall` for session search in Code
2. Linear comments for cross-environment communication
3. AGENDA.md for context handoff

No UI layer tools needed.

---

### Area 5: Web Scraping Unblocking

**Solutions by Source:**

| Source | Tool | Transport | Status |
|--------|------|-----------|--------|
| Reddit | Firecrawl | HTTP | ✅ Working (already configured) |
| Medium | None (paywall) | — | Accept limitation |
| General | Firecrawl | HTTP | ✅ Working |

**Staff Engineer Verdict:** APPROVE (5/10)
> "Concrete and actionable. Reddit MCP or Firecrawl for Reddit. Document Firecrawl patterns."

**Adversarial Review:** UPHOLD. Firecrawl already in `~/.mcp.json`. Document usage patterns.

---

## Revised Acceptance Criteria

### Must Have (CIA-143)
- [ ] AGENDA.md schema defined with frontmatter, required sections, timestamps
- [ ] `recall` installed and integrated (`brew install zippoxer/tap/recall`)
- [ ] CodexBar installed (`brew install --cask codexbar`)
- [ ] Firecrawl usage documented for Reddit/general scraping

### Should Have (CIA-143)
- [ ] everything-claude-code configs audited against current setup
- [ ] Session-index export to format Cowork can read (or Linear as bridge)

### Won't Have (Deferred)
- PostToolUse hooks (hooks disabled Jan 2026 due to context drain)
- MCP limiting (verified as non-issue: 2-15% of calls)
- Claude Island alternatives (recall + Linear sufficient)
- Debug log TTL (low priority, 2.9GB acceptable)
- trailofbits/skills (defer to security hardening spec)

---

## Implementation Notes

**Recommended exec: label:** `exec:quick`
- Tasks are concrete and well-scoped
- No architectural decisions remaining
- Schema design is the only user input needed

**Implementation Order:**
1. Install recall + CodexBar (immediate, no design needed)
2. Define AGENDA.md schema (requires user input on sections)
3. Document Firecrawl patterns (documentation task)
4. Audit everything-claude-code (comparison task)

---

## References

- [Boris's 10 Team Tips](https://ykdojo.github.io/claude-code-tips/content/boris-claude-code-tips)
- [Linear Document: Cowork↔Code Learnings](https://linear.app/cianclaude/document/cowork-claude-code-integration-learnings-5f92d209952b)
- [recall](https://github.com/zippoxer/recall) - Session search/resume
- [CodexBar](https://github.com/steipete/CodexBar) - Usage monitoring
- [mcp-proxy](https://github.com/sparfenyuk/mcp-proxy) - CIA-148 solution
- [trailofbits/skills](https://github.com/trailofbits/skills) - Security skills
- [everything-claude-code](https://github.com/affaan-m/everything-claude-code) - Config collection
- Staff Engineer Review: Cowork session 2026-02-01 (agent ID: a9e4e03)
- Adversarial Review: Claude Code session 2026-02-01
