'use client'

import * as React from 'react'
// TODO: Uncomment imports when Radix components are available
// import * as Collapsible from '@radix-ui/react-collapsible'
// import { ChevronDown, ChevronRight } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import type { FrameworkType } from '@/lib/types'

/**
 * Props for the ReasoningTrace component.
 */
export interface ReasoningTraceProps {
  /** Which framework this reasoning trace belongs to */
  framework: 'hsi' | 'constitutional' | 'hybrid'
  /** Array of reasoning steps from the AI's decision process */
  steps: string[]
  /** Whether the trace should be expanded by default */
  defaultOpen?: boolean
}

/**
 * Framework-specific reasoning labels.
 */
const REASONING_LABELS = {
  hsi: {
    title: 'HSI Reasoning Trace',
    description: 'How the HSI framework processed this scenario',
    principles: [
      'Domain Containment',
      'Human-in-Loop',
      'Interpretability',
      'Subordinate AI Framing',
    ],
  },
  constitutional: {
    title: 'Constitutional AI Reasoning',
    description: 'How Constitutional AI principles were applied',
    principles: [
      'Soul Document Hierarchy',
      'Brilliant Friend Model',
      'Anti-Sycophancy',
      'Psychological Stability',
    ],
  },
  hybrid: {
    title: 'Hybrid Reasoning Synthesis',
    description: 'How HSI and Constitutional AI were combined',
    principles: [
      'Containment Architecture',
      'Character Training',
      'Domain-Aware Character',
      'Integrated Safety',
    ],
  },
} as const

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
 * TODO: Implement the following features:
 * - [ ] Syntax highlighting for principle names
 * - [ ] Step numbering with timestamps
 * - [ ] "Explain this step" expansion for each reasoning step
 * - [ ] Export reasoning trace as JSON
 * - [ ] Comparison mode to highlight differences in reasoning
 * - [ ] Link to relevant course readings for each principle
 * - [ ] Copy individual steps to clipboard
 * - [ ] Collapsible sub-sections for complex reasoning
 *
 * @param framework - The framework type for styling and labels
 * @param steps - Array of reasoning steps to display
 * @param defaultOpen - Whether to expand by default
 *
 * @returns Collapsible reasoning trace section
 *
 * @example
 * ```tsx
 * <ReasoningTrace
 *   framework="constitutional"
 *   steps={[
 *     'Evaluated scenario for crisis indicators',
 *     'Applied brilliant friend model principles',
 *     'Considered anti-sycophancy constraints'
 *   ]}
 *   defaultOpen={false}
 * />
 * ```
 */
export function ReasoningTrace({
  framework,
  steps,
  defaultOpen = false,
}: ReasoningTraceProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const config = REASONING_LABELS[framework]

  // TODO: Implement Radix Collapsible
  // return (
  //   <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
  //     <Collapsible.Trigger asChild>
  //       <Button variant="ghost" className="w-full justify-between">
  //         <span>{config.title}</span>
  //         {isOpen ? <ChevronDown /> : <ChevronRight />}
  //       </Button>
  //     </Collapsible.Trigger>
  //     <Collapsible.Content>
  //       {steps.map((step, index) => (
  //         <div key={index} className="pl-4 border-l-2">
  //           <p className="text-sm">{step}</p>
  //         </div>
  //       ))}
  //     </Collapsible.Content>
  //   </Collapsible.Root>
  // )

  return (
    <div className="mt-3 rounded border">
      {/* Collapsible trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-3 text-left hover:bg-muted/50"
        aria-expanded={isOpen}
      >
        <div>
          <span className="text-sm font-medium">{config.title}</span>
          <span className="ml-2 text-xs text-muted-foreground">
            ({steps.length} steps)
          </span>
        </div>
        <span className="text-muted-foreground">
          {isOpen ? '▼' : '▶'}
        </span>
      </button>

      {/* Collapsible content */}
      {isOpen && (
        <div className="border-t p-3">
          <p className="mb-3 text-xs text-muted-foreground">
            {config.description}
          </p>

          {/* Principles overview */}
          <div className="mb-3 flex flex-wrap gap-1">
            {config.principles.map((principle) => (
              <span
                key={principle}
                className="rounded bg-muted px-2 py-0.5 text-xs"
              >
                {principle}
              </span>
            ))}
          </div>

          {/* Reasoning steps */}
          <ol className="space-y-2 border-l-2 border-muted pl-4">
            {steps.map((step, index) => (
              <li key={index} className="text-sm">
                <span className="mr-2 text-xs text-muted-foreground">
                  {index + 1}.
                </span>
                {step}
              </li>
            ))}
          </ol>

          {/* TODO: Add export functionality */}
          <div className="mt-3 text-right">
            <span className="text-xs text-muted-foreground">
              TODO: Add export/copy functionality
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
