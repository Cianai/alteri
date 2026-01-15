import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';

/**
 * AI model providers configured for the platform
 * Used for framework comparison and elicitation
 */
export const providers = {
  /** Claude for Constitutional AI evaluation */
  claude: anthropic('claude-sonnet-4-20250514'),
  /** GPT-4o for HSI framework evaluation */
  gpt4o: openai('gpt-4o'),
} as const;

export type ProviderKey = keyof typeof providers;
