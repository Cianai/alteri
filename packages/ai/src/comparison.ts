import { generateText } from 'ai';
import { providers } from './providers';
import type { Framework } from '@alignment-comparator/shared';

export interface ComparisonResult {
  frameworkA: {
    id: Framework;
    response: string;
  };
  frameworkB: {
    id: Framework;
    response: string;
  };
  order: 'AB' | 'BA';
}

/**
 * Generate anonymous side-by-side comparison of framework responses
 * Randomises order to prevent brand bias in evaluation
 */
export async function generateComparison(
  scenario: string,
  hsiPrompt: string,
  caiPrompt: string
): Promise<ComparisonResult> {
  const [hsiResult, caiResult] = await Promise.all([
    generateText({
      model: providers.gpt4o,
      system: hsiPrompt,
      prompt: scenario,
    }),
    generateText({
      model: providers.claude,
      system: caiPrompt,
      prompt: scenario,
    }),
  ]);

  // Randomise presentation order to prevent position bias
  const order = Math.random() > 0.5 ? 'AB' : 'BA';

  return {
    frameworkA: {
      id: order === 'AB' ? 'hsi' : 'constitutional',
      response: order === 'AB' ? hsiResult.text : caiResult.text,
    },
    frameworkB: {
      id: order === 'AB' ? 'constitutional' : 'hsi',
      response: order === 'AB' ? caiResult.text : hsiResult.text,
    },
    order,
  };
}
