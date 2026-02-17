import type { HandlerContext } from '../types'

export function handleExpand(ctx: HandlerContext): string {
  const lines: string[] = []

  lines.push(`**Expanding ${ctx.issueIdentifier}**`)
  lines.push('')

  // Parse promptContext for issue title and description
  const titleMatch = ctx.promptContext.match(/<title>([\s\S]*?)<\/title>/)
  const title = titleMatch?.[1]?.trim() ?? ctx.issueIdentifier

  const descMatch = ctx.promptContext.match(/<description>([\s\S]*?)<\/description>/)
  const description = descMatch?.[1]?.trim()

  if (!description || description.length < 20) {
    lines.push(`This issue has a sparse description. Here's a suggested expansion:`)
    lines.push('')
    lines.push(`## Suggested Spec: ${title}`)
    lines.push('')
    lines.push(`### Problem`)
    lines.push(`_What problem does this solve? Who experiences it?_`)
    lines.push('')
    lines.push(`### Acceptance Criteria`)
    lines.push(`- [ ] _Criterion 1: specific, testable outcome_`)
    lines.push(`- [ ] _Criterion 2: specific, testable outcome_`)
    lines.push(`- [ ] _Criterion 3: specific, testable outcome_`)
    lines.push('')
    lines.push(`### Edge Cases`)
    lines.push(`- What happens when input is empty?`)
    lines.push(`- What happens when the user is unauthenticated?`)
    lines.push(`- What happens under concurrent access?`)
    lines.push('')
    lines.push(`### Technical Considerations`)
    lines.push(`- Dependencies: _list any required services/packages_`)
    lines.push(`- Breaking changes: _yes/no + migration plan_`)
    lines.push(`- Performance: _any latency/throughput concerns_`)
    lines.push('')
    lines.push(`> Tip: Fill in the blanks above and I can refine further. Use \`@claude expand\` again after updating the description.`)
  } else {
    // Description exists — analyze it and suggest additions
    lines.push(`The issue has a description. Here's what I'd add:`)
    lines.push('')

    const hasAC = /acceptance criteria/i.test(description) || /- \[ \]/i.test(description)
    const hasEdgeCases = /edge case/i.test(description)
    const hasTechConsiderations = /technical consideration/i.test(description) || /dependencies/i.test(description)

    if (!hasAC) {
      lines.push(`### Missing: Acceptance Criteria`)
      lines.push(`Add testable criteria. Example:`)
      lines.push(`- [ ] Given [context], when [action], then [result]`)
      lines.push('')
    }

    if (!hasEdgeCases) {
      lines.push(`### Missing: Edge Cases`)
      lines.push(`Consider:`)
      lines.push(`- Empty/null inputs`)
      lines.push(`- Permission boundaries`)
      lines.push(`- Concurrent operations`)
      lines.push(`- Rate limits / timeouts`)
      lines.push('')
    }

    if (!hasTechConsiderations) {
      lines.push(`### Missing: Technical Considerations`)
      lines.push(`Document:`)
      lines.push(`- New dependencies required`)
      lines.push(`- Breaking changes and migration`)
      lines.push(`- Performance implications`)
      lines.push('')
    }

    if (hasAC && hasEdgeCases && hasTechConsiderations) {
      lines.push(`This issue looks well-specified! It has acceptance criteria, edge cases, and technical considerations.`)
      lines.push('')
      lines.push(`**Suggestion:** Move to \`spec:ready\` and proceed to adversarial review.`)
    }
  }

  return lines.join('\n')
}
