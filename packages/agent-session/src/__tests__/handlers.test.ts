import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleStatus } from '../handlers/status'
import { handleExpand } from '../handlers/expand'
import { handleHelp } from '../handlers/help'
import { routeIntent } from '../handlers/index'
import { LinearAgentClient } from '../linear-client'
import type { IssueStatusData } from '../linear-client'
import type { HandlerContext } from '../types'

function makeCtx(overrides: Partial<HandlerContext> = {}): HandlerContext {
  return {
    sessionId: 'session-abc',
    issueId: 'issue-1',
    issueIdentifier: 'CIA-100',
    promptContext: '<issue identifier="CIA-100"><title>Test Issue</title><description>A test description</description></issue>',
    commentBody: '',
    ...overrides,
  }
}

function makeIssueData(overrides: Partial<IssueStatusData> = {}): IssueStatusData {
  return {
    id: 'issue-1',
    identifier: 'CIA-100',
    title: 'Test Issue',
    description: 'A test description',
    state: { name: 'In Progress' },
    assignee: { name: 'Cian' },
    labels: { nodes: [{ name: 'type:feature' }, { name: 'exec:tdd' }] },
    estimate: 3,
    priority: 2,
    children: { nodes: [] },
    attachments: { nodes: [] },
    comments: { nodes: [] },
    ...overrides,
  }
}

describe('handleStatus', () => {
  let client: LinearAgentClient
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    client = new LinearAgentClient('test-token', fetchSpy)
  })

  it('returns structured status table for an issue', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { issue: makeIssueData() } }),
    })

    const result = await handleStatus(makeCtx(), client)

    expect(result).toContain('**Status for CIA-100: Test Issue**')
    expect(result).toContain('In Progress')
    expect(result).toContain('Cian')
    expect(result).toContain('High')
    expect(result).toContain('type:feature, exec:tdd')
  })

  it('shows sub-issues table when children exist', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          issue: makeIssueData({
            children: {
              nodes: [
                { identifier: 'CIA-101', title: 'Sub 1', state: { name: 'Done' }, assignee: { name: 'Claude' } },
                { identifier: 'CIA-102', title: 'Sub 2', state: { name: 'Todo' }, assignee: null },
              ],
            },
          }),
        },
      }),
    })

    const result = await handleStatus(makeCtx(), client)

    expect(result).toContain('### Sub-issues (2)')
    expect(result).toContain('CIA-101')
    expect(result).toContain('CIA-102')
    expect(result).toContain('Done')
  })

  it('shows linked PRs when attachments include github pull URLs', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          issue: makeIssueData({
            attachments: {
              nodes: [
                { title: '#400 Fix dispatch', url: 'https://github.com/cianos95-dev/alteri/pull/400', subtitle: null },
              ],
            },
          }),
        },
      }),
    })

    const result = await handleStatus(makeCtx(), client)

    expect(result).toContain('### Linked PRs (1)')
    expect(result).toContain('#400 Fix dispatch')
  })

  it('shows recent activity when comments exist', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          issue: makeIssueData({
            comments: {
              nodes: [
                { body: 'Started implementation', createdAt: '2026-02-17T10:00:00Z', user: { name: 'Claude' } },
              ],
            },
          }),
        },
      }),
    })

    const result = await handleStatus(makeCtx(), client)

    expect(result).toContain('### Recent Activity')
    expect(result).toContain('Claude')
    expect(result).toContain('Started implementation')
  })

  it('returns error message when fetch fails', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Server Error',
    })

    const result = await handleStatus(makeCtx(), client)

    expect(result).toContain('Unable to fetch issue details')
  })
})

describe('handleExpand', () => {
  it('generates suggested spec when description is sparse', () => {
    const ctx = makeCtx({
      promptContext: '<issue identifier="CIA-100"><title>Add caching</title><description></description></issue>',
    })

    const result = handleExpand(ctx)

    expect(result).toContain('Expanding CIA-100')
    expect(result).toContain('sparse description')
    expect(result).toContain('### Acceptance Criteria')
    expect(result).toContain('### Edge Cases')
    expect(result).toContain('### Technical Considerations')
  })

  it('identifies missing sections when description exists', () => {
    const ctx = makeCtx({
      promptContext: '<issue identifier="CIA-100"><title>Add caching</title><description>We need to add Redis caching to the API layer to reduce database load. This should improve response times for read-heavy endpoints.</description></issue>',
    })

    const result = handleExpand(ctx)

    expect(result).toContain('Missing: Acceptance Criteria')
    expect(result).toContain('Missing: Edge Cases')
    expect(result).toContain('Missing: Technical Considerations')
  })

  it('recognizes well-specified issue', () => {
    const description = `
## Problem
API is slow

## Acceptance Criteria
- [ ] Response time under 200ms

## Edge Cases
- Cache miss behavior

## Technical Considerations
- Dependencies: Redis 7.x
    `
    const ctx = makeCtx({
      promptContext: `<issue identifier="CIA-100"><title>Add caching</title><description>${description}</description></issue>`,
    })

    const result = handleExpand(ctx)

    expect(result).toContain('well-specified')
    expect(result).toContain('spec:ready')
  })
})

describe('handleHelp', () => {
  it('returns capability listing with all intents', () => {
    const result = handleHelp()

    expect(result).toContain('Available Commands')
    expect(result).toContain('status')
    expect(result).toContain('expand')
    expect(result).toContain('help')
    expect(result).toContain('Handoff Patterns')
    expect(result).toContain('Delegate')
  })
})

describe('routeIntent', () => {
  let client: LinearAgentClient
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { issue: makeIssueData() } }),
    })
    client = new LinearAgentClient('test-token', fetchSpy)
  })

  it('routes status intent to status handler', async () => {
    const result = await routeIntent('status', makeCtx(), client)
    expect(result).toContain('Status for CIA-100')
  })

  it('routes expand intent to expand handler', async () => {
    const result = await routeIntent('expand', makeCtx(), client)
    expect(result).toContain('Expanding CIA-100')
  })

  it('routes help intent to help handler', async () => {
    const result = await routeIntent('help', makeCtx(), client)
    expect(result).toContain('Available Commands')
  })

  it('routes unknown intent to help handler', async () => {
    const result = await routeIntent('unknown', makeCtx(), client)
    expect(result).toContain('Available Commands')
  })
})
