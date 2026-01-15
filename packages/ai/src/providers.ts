import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';

/**
 * AI model providers configured for the platform
 * Used for framework comparison and elicitation
 */
export const providers: Record<string, LanguageModel> = {
  /** Claude for Constitutional AI evaluation */
  claude: anthropic('claude-sonnet-4-20250514'),
  /** GPT-4o for HSI framework evaluation */
  gpt4o: openai('gpt-4o'),
};

export type ProviderKey = 'claude' | 'gpt4o';
