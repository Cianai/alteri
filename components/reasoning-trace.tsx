'use client'

import * as React from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react'
import type { FrameworkId } from '@/lib/types'
import { FRAMEWORK_PROMPTS } from '@/lib/prompts'

/**
 * Props for the ReasoningTrace component.
 */
export interface ReasoningTraceProps {
  /** Which framework this reasoning trace belongs to */
  framework: FrameworkId
  /** Reasoning trace string from the model (may contain XML tags) */
  trace: string
  /** Whether the trace should be expanded by default */
  defaultOpen?: boolean
}

/**
 * Framework-specific reasoning principles for labelling.
 */
const REASONING_PRINCIPLES: Record<FrameworkId, string[]> = {
  hsi: [
    'Domain Containment',
    'Human-in-Loop',
    'Interpretability',
    'Subordinate AI Framing',
  ],
  constitutional: [
    'Principal Hierarchy',
    'Brilliant Friend Model',
    'Anti-Sycophancy',
    'Psychological Stability',
  ],
  hybrid: [
    'Architectural Containment',
    'Character Depth',
    'Interpretable Character',
    'Calibrated Autonomy',
  ],
}

/**
 * Parse reasoning trace to extract structured steps.
 *
 * Handles both plain text and XML-formatted reasoning traces.
 */
function parseReasoningTrace(trace: string): string[] {
  // Try to extract from <reasoning> tags first
  const reasoningMatch = trace.match(/<reasoning>([\s\S]*?)<\/reasoning>/i)
  const content = reasoningMatch ? reasoningMatch[1].trim() : trace.trim()

  // Split by common delimiters (newlines, numbered steps)
  const steps = content
    .split(/\n+/)
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
    .filter((line) => line.length > 0)

  return steps
}

/**
 * ReasoningTrace component - Collapsible reasoning section.
 *
 * This component displays the AI's decision-making process in a transparent,
 * collapsible format. It helps users understand:
 * - Which principles were applied
 * - How the framework reached its response
 * - Potential tensions between different considerations
 *
 * Educational purpose:
 * This aligns with the course's focus on interpretability and understanding
 * how AI systems make decisions, particularly in sensitive contexts.
 *
 * @param framework - The framework type for styling and labels
 * @param trace - Reasoning trace string to display
 * @param defaultOpen - Whether to expand by default
 *
 * @returns Collapsible reasoning trace section
 *
 * @example
 * ```tsx
 * <ReasoningTrace
 *   framework="constitutional"
 *   trace="<reasoning>Step 1: Evaluated scenario...</reasoning>"
 *   defaultOpen={false}
 * />
 * ```
 */
export function ReasoningTrace({
  framework,
  trace,
  defaultOpen = false,
}: ReasoningTraceProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const [copied, setCopied] = React.useState(false)

  const config = FRAMEWORK_PROMPTS[framework]
  const principles = REASONING_PRINCIPLES[framework]
  const steps = parseReasoningTrace(trace)

  const handleCopy = React.useCallback(async () => {
    await navigator.clipboard.writeText(trace)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [trace])

  if (steps.length === 0) {
    return null
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={`rounded-lg border ${config.colour.border}`}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between px-4 py-3 hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">
                {config.shortName} Reasoning Trace
              </span>
              <Badge variant="outline" className="text-xs">
                {steps.length} {steps.length === 1 ? 'step' : 'steps'}
              </Badge>
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t px-4 py-3">
            {/* Principles overview */}
            <div className="mb-3 flex flex-wrap gap-1">
              {principles.map((principle) => (
                <Badge
                  key={principle}
                  variant="secondary"
                  className="text-xs font-normal"
                >
                  {principle}
                </Badge>
              ))}
            </div>

            {/* Reasoning steps */}
            <ol className={`space-y-2 border-l-2 pl-4 ${config.colour.border}`}>
              {steps.map((step, index) => (
                <li key={index} className="relative text-sm">
                  <span
                    className={`absolute -left-[1.35rem] flex h-5 w-5 items-center justify-center rounded-full text-xs ${config.colour.primary} ${config.colour.secondary}`}
                  >
                    {index + 1}
                  </span>
                  <span className="ml-2 text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>

            {/* Actions */}
            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="mr-1 h-3 w-3 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-3 w-3" />
                    Copy trace
                  </>
                )}
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
