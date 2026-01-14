import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes.
 *
 * Combines clsx for conditional classes with tailwind-merge
 * to properly handle conflicting Tailwind utilities.
 *
 * @param inputs - Class names, conditionals, or arrays of classes
 * @returns Merged class string with conflicts resolved
 *
 * @example
 * ```tsx
 * cn('px-4 py-2', isActive && 'bg-primary', className)
 * cn('text-sm', 'text-lg') // Returns 'text-lg' (conflict resolved)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a timestamp for display.
 *
 * Uses Intl.DateTimeFormat for localised, human-readable output.
 *
 * @param date - Date to format
 * @param options - Optional formatting configuration
 * @returns Formatted date string
 *
 * @example
 * ```ts
 * formatTimestamp(new Date()) // '14 Jan 2026, 16:30'
 * formatTimestamp(new Date(), { includeSeconds: true }) // '14 Jan 2026, 16:30:45'
 * ```
 */
export function formatTimestamp(
  date: Date,
  options?: { includeSeconds?: boolean; locale?: string }
): string {
  const locale = options?.locale ?? 'en-GB'
  const formatOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...(options?.includeSeconds && { second: '2-digit' }),
  }

  return new Intl.DateTimeFormat(locale, formatOptions).format(date)
}

/**
 * Truncates text to a maximum length with ellipsis.
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum character length
 * @returns Truncated text with ellipsis if needed
 *
 * @example
 * ```ts
 * truncateText('A very long scenario...', 100)
 * ```
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Generates a unique ID for tracking comparisons.
 *
 * TODO: Consider using crypto.randomUUID() in production
 *
 * @returns Unique identifier string
 */
export function generateComparisonId(): string {
  return `cmp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Debounces a function call.
 *
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 *
 * @example
 * ```ts
 * const debouncedSearch = debounce(search, 300)
 * ```
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Safely parses JSON with a fallback value.
 *
 * @param json - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed value or fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

/**
 * Parses a framework response to extract structured content.
 *
 * The system prompts instruct Claude to use <response> and <reasoning> tags.
 * This function extracts content from those tags, falling back to the
 * raw text if tags are not present.
 *
 * @param text - Raw response text from Claude
 * @returns Parsed response and reasoning strings
 *
 * @example
 * ```ts
 * const { response, reasoning } = parseFrameworkResponse(rawText)
 * ```
 */
export function parseFrameworkResponse(text: string): {
  response: string
  reasoning: string
} {
  const responseMatch = text.match(/<response>([\s\S]*?)<\/response>/)
  const reasoningMatch = text.match(/<reasoning>([\s\S]*?)<\/reasoning>/)

  return {
    response: responseMatch?.[1]?.trim() ?? text.trim(),
    reasoning: reasoningMatch?.[1]?.trim() ?? 'Reasoning not available',
  }
}

/**
 * Creates a unique comparison ID for tracking.
 *
 * Uses crypto.randomUUID when available, falls back to timestamp-based ID.
 *
 * @returns Unique identifier string
 *
 * @example
 * ```ts
 * const id = createComparisonId() // 'cmp_550e8400-e29b-41d4-a716-446655440000'
 * ```
 */
export function createComparisonId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `cmp_${crypto.randomUUID()}`
  }
  // Fallback for environments without crypto.randomUUID
  return `cmp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}
