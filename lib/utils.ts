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
 * TODO: Implement proper date formatting with Intl.DateTimeFormat
 *
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatTimestamp(date: Date): string {
  // TODO: Implement proper formatting
  return date.toISOString()
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
