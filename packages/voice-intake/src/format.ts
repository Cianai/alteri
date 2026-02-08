import type { VoiceIntakeConcept } from './types';

export function formatIssueDescription(
  concept: VoiceIntakeConcept,
  transcript: string,
  metadata?: { device?: string; timestamp?: string }
): string {
  const frontmatter = [
    '---',
    `exec: ${concept.execMode}`,
    `status: ${concept.readiness === 'implementable' ? 'ready' : 'draft'}`,
    'source: voice',
    metadata?.timestamp ? `recorded: ${metadata.timestamp}` : null,
    metadata?.device ? `device: ${metadata.device}` : null,
    '---',
  ].filter(Boolean).join('\n');

  const sections: string[] = [frontmatter, '', `## ${concept.title}`, '', concept.description];

  if (concept.acceptanceCriteria && concept.acceptanceCriteria.length > 0) {
    sections.push('', '## Acceptance Criteria');
    for (const ac of concept.acceptanceCriteria) {
      sections.push(`- [ ] ${ac}`);
    }
  }

  if (concept.clarifyingQuestions && concept.clarifyingQuestions.length > 0) {
    sections.push('', '## Open Questions');
    for (const q of concept.clarifyingQuestions) {
      sections.push(`- ${q}`);
    }
  }

  if (concept.technicalNotes) {
    sections.push('', '## Technical Notes', '', concept.technicalNotes);
  }

  if (concept.relatedAreas && concept.relatedAreas.length > 0) {
    sections.push('', '## Related Areas');
    for (const area of concept.relatedAreas) {
      sections.push(`- ${area}`);
    }
  }

  sections.push('', '## Raw Transcript', '', `> ${transcript.replace(/\n/g, '\n> ')}`);
  sections.push('', '---', '*Auto-generated from voice memo via voice-intake pipeline*');

  return sections.join('\n');
}

/** Determine which labels to apply based on the concept */
export function getLabels(concept: VoiceIntakeConcept): string[] {
  const labels: string[] = ['source:voice', `exec:${concept.execMode}`];

  if (concept.readiness === 'implementable') {
    labels.push('spec:ready');
  } else {
    labels.push('spec:draft', 'needs:human-decision');
  }

  return labels;
}

/** Map priority string to Linear priority number */
export function mapPriority(priority: string): number {
  switch (priority) {
    case 'urgent': return 1;
    case 'high': return 2;
    case 'medium': return 3;
    case 'low': return 4;
    default: return 3;
  }
}
