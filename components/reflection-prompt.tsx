'use client'

import * as React from 'react'
// TODO: Uncomment imports when components are available
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Textarea } from '@/components/ui/textarea'
// import { Button } from '@/components/ui/button'
// import { REFLECTION_QUESTIONS } from '@/lib/scenarios'
// import type { ReflectionCategory } from '@/lib/types'

/**
 * Props for the ReflectionPrompt component.
 */
export interface ReflectionPromptProps {
  /** The scenario that was compared */
  scenario: string
  /** Whether responses have completed (show reflection only after) */
  responsesComplete: boolean
  /** Callback when user submits their reflection */
  onReflectionSubmit?: (reflection: string) => void
}

/**
 * Buddhist ethics reflection questions drawing from course readings.
 *
 * These questions are designed to prompt critical thinking about:
 * - Hershock's "freedom-of-attention" concept
 * - Relational agency and interdependence
 * - Compassion and skilful means (upāya)
 * - The role of mindfulness in AI interactions
 */
const REFLECTION_QUESTIONS = {
  attention: {
    category: 'Freedom of Attention',
    questions: [
      'How did each framework handle the user\'s attention and agency?',
      'Which response best supports the user\'s capacity for self-determination?',
      'Did any framework subtly direct attention away from important considerations?',
    ],
    courseReference: 'Hershock, Chapter 3: "Attention in the Age of AI"',
  },
  relational: {
    category: 'Relational Agency',
    questions: [
      'How did each framework acknowledge the relational context of the scenario?',
      'Which response best recognised the interconnected nature of mental health?',
      'Did any framework inappropriately individualise a systemic issue?',
    ],
    courseReference: 'Week 5 readings on Buddhist relational ethics',
  },
  compassion: {
    category: 'Compassion & Skilful Means',
    questions: [
      'Which response demonstrated the most skilful compassion?',
      'How did each framework balance honesty with kindness?',
      'Did any response risk being helpful in a harmful way?',
    ],
    courseReference: 'Thich Nhat Hanh on engaged Buddhism',
  },
  boundaries: {
    category: 'Appropriate Boundaries',
    questions: [
      'How did each framework handle its own limitations?',
      'Which approach to deferring to human professionals was most appropriate?',
      'Did any response overreach its appropriate role?',
    ],
    courseReference: 'HSI containment principles & Constitutional AI soul documents',
  },
} as const

type ReflectionCategory = keyof typeof REFLECTION_QUESTIONS

/**
 * ReflectionPrompt component - Buddhist ethics questions for contemplation.
 *
 * This component appears after all three framework responses have completed.
 * It presents reflection questions drawing on course readings to help students:
 * - Critically evaluate the responses
 * - Apply Buddhist ethical principles to AI alignment
 * - Develop their own perspective on responsible AI
 *
 * Pedagogical approach:
 * Questions are designed to encourage deep engagement with the material,
 * not to lead students to predetermined conclusions.
 *
 * TODO: Implement the following features:
 * - [ ] Rotating/randomised question selection
 * - [ ] Save reflections to localStorage
 * - [ ] Export reflections as part of assignment
 * - [ ] Link to relevant course readings
 * - [ ] Timer for contemplation (mindfulness exercise)
 * - [ ] Share anonymised reflections with class
 * - [ ] Comparison of reflections across scenarios
 * - [ ] Integration with journaling/note-taking apps
 *
 * @param scenario - The scenario that was compared
 * @param responsesComplete - Only show when responses are done
 * @param onReflectionSubmit - Callback for reflection submission
 *
 * @returns Reflection prompt section with Buddhist ethics questions
 *
 * @example
 * ```tsx
 * <ReflectionPrompt
 *   scenario={currentScenario}
 *   responsesComplete={!isAnyStreaming}
 *   onReflectionSubmit={(text) => saveReflection(text)}
 * />
 * ```
 */
export function ReflectionPrompt({
  scenario,
  responsesComplete,
  onReflectionSubmit,
}: ReflectionPromptProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<ReflectionCategory>('attention')
  const [reflection, setReflection] = React.useState('')
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  // Don't show until responses are complete
  if (!responsesComplete) {
    return null
  }

  const currentQuestions = REFLECTION_QUESTIONS[selectedCategory]

  const handleSubmit = () => {
    if (reflection.trim() && onReflectionSubmit) {
      onReflectionSubmit(reflection)
      setIsSubmitted(true)
    }
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">Contemplative Reflection</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Before moving on, take a moment to reflect on what you observed.
        These questions draw on course readings about Buddhist ethics and AI.
      </p>

      {/* Category tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(REFLECTION_QUESTIONS) as ReflectionCategory[]).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`rounded-full px-3 py-1 text-sm transition-colors ${
              selectedCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {REFLECTION_QUESTIONS[category].category}
          </button>
        ))}
      </div>

      {/* Questions */}
      <div className="mb-4 rounded border bg-muted/30 p-4">
        <h3 className="mb-2 font-medium">{currentQuestions.category}</h3>
        <ul className="mb-3 space-y-2">
          {currentQuestions.questions.map((question, index) => (
            <li key={index} className="text-sm">
              <span className="mr-2 text-muted-foreground">{index + 1}.</span>
              {question}
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground italic">
          Reference: {currentQuestions.courseReference}
        </p>
      </div>

      {/* Reflection textarea */}
      {!isSubmitted ? (
        <div className="space-y-3">
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Write your reflection here... Consider how the three frameworks differed in their approach to this scenario."
            className="min-h-[120px] w-full rounded-md border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {reflection.length} characters
            </span>
            <button
              onClick={handleSubmit}
              disabled={reflection.trim().length === 0}
              className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Save Reflection
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded border border-green-500/30 bg-green-500/10 p-4 text-center">
          <p className="text-sm text-green-700 dark:text-green-300">
            Reflection saved. Thank you for your thoughtful engagement.
          </p>
        </div>
      )}

      {/* TODO: Add export and sharing options */}
      <div className="mt-4 text-center text-xs text-muted-foreground">
        TODO: Add export to Obsidian/NotebookLM functionality
      </div>
    </div>
  )
}
