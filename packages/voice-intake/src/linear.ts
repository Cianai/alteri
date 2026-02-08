import type { VoiceIntakeConcept } from './types';
import { formatIssueDescription, getLabels, mapPriority } from './format';

/** Linear project IDs -- must be configured per-environment */
export interface LinearConfig {
  apiKey: string;
  teamId: string;
  projectIds: Record<string, string>;
  labelIds: Record<string, string>;
}

interface LinearIssueResult {
  issueId: string;
  issueUrl: string;
  issueNumber: number;
}

export async function createLinearIssue(
  concept: VoiceIntakeConcept,
  transcript: string,
  config: LinearConfig,
  metadata?: { device?: string; timestamp?: string }
): Promise<LinearIssueResult> {
  const description = formatIssueDescription(concept, transcript, metadata);
  const labelNames = getLabels(concept);
  const priority = mapPriority(concept.priority);

  // Resolve label IDs from names
  const labelIds = labelNames
    .map((name) => config.labelIds[name])
    .filter(Boolean);

  const projectId = config.projectIds[concept.project];

  const mutation = `
    mutation CreateIssue($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          id
          identifier
          url
          number
        }
      }
    }
  `;

  const variables = {
    input: {
      title: concept.title,
      description,
      teamId: config.teamId,
      priority,
      ...(projectId && { projectId }),
      ...(labelIds.length > 0 && { labelIds }),
    },
  };

  const response = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: config.apiKey,
    },
    body: JSON.stringify({ query: mutation, variables }),
  });

  if (!response.ok) {
    throw new Error(`Linear API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.data?.issueCreate?.success) {
    throw new Error(`Linear issue creation failed: ${JSON.stringify(data.errors ?? data)}`);
  }

  const issue = data.data.issueCreate.issue;
  return {
    issueId: issue.identifier,
    issueUrl: issue.url,
    issueNumber: issue.number,
  };
}
