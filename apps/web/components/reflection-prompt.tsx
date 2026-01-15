'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, BookOpen, Check, Save } from 'lucide-react'

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
    description: 'Exploring how AI responses affect user agency and self-determination',
    questions: [
      'How did each framework handle the user\'s attention and agency?',
      'Which response best supports the user\'s capacity for self-determination?',
      'Did any framework subtly direct attention away from important considerations?',
    ],
    courseReference: 'Hershock, Chapter 3: "Attention in the Age of AI"',
  },
  relational: {
    category: 'Relational Agency',
    description: 'Considering the interconnected context of mental health support',
    questions: [
      'How did each framework acknowledge the relational context of the scenario?',
      'Which response best recognised the interconnected nature of mental health?',
      'Did any framework inappropriately individualise a systemic issue?',
    ],
    courseReference: 'Week 5 readings on Buddhist relational ethics',
  },
  compassion: {
    category: 'Compassion & Skilful Means',
    description: 'Evaluating the balance of honesty, kindness, and effectiveness',
    questions: [
      'Which response demonstrated the most skilful compassion?',
      'How did each framework balance honesty with kindness?',
      'Did any response risk being helpful in a harmful way?',
    ],
    courseReference: 'Thich Nhat Hanh on engaged Buddhism',
  },
  boundaries: {
    category: 'Appropriate Boundaries',
    description: 'Assessing how frameworks handled their limitations',
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
 * QuestionCategory component - Expandable category with questions.
 */
interface QuestionCategoryProps {
  category: ReflectionCategory
  isOpen: boolean
  onToggle: () => void
}

function QuestionCategory({ category, isOpen, onToggle }: QuestionCategoryProps) {
  const data = REFLECTION_QUESTIONS[category]

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
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
            <span className="text-sm font-medium">{data.category}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {data.questions.length} questions
          </Badge>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="border-t px-4 py-3">
          <p className="mb-3 text-sm text-muted-foreground">{data.description}</p>
          <ol className="space-y-2 border-l-2 border-primary/30 pl-4">
            {data.questions.map((question, index) => (
              <li key={index} className="relative text-sm">
                <span className="absolute -left-[1.35rem] flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                  {index + 1}
                </span>
                <span className="ml-2 text-foreground">{question}</span>
              </li>
            ))}
          </ol>
          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <BookOpen className="h-3 w-3" />
            <span className="italic">{data.courseReference}</span>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

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
  scenario: _scenario,
  responsesComplete,
  onReflectionSubmit,
}: ReflectionPromptProps) {
  const [openCategories, setOpenCategories] = React.useState<Set<ReflectionCategory>>(
    () => new Set<ReflectionCategory>(['attention'])
  )
  const [reflection, setReflection] = React.useState('')
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  // Don't show until responses are complete
  if (!responsesComplete) {
    return null
  }

  const toggleCategory = (category: ReflectionCategory) => {
    setOpenCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const handleSubmit = () => {
    if (reflection.trim() && onReflectionSubmit) {
      onReflectionSubmit(reflection)
      setIsSubmitted(true)
    }
  }

  const categories = Object.keys(REFLECTION_QUESTIONS) as ReflectionCategory[]

  return (
    <Card className="transition-shadow duration-150 ease-in-out hover:shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="h-5 w-5 text-primary" />
          Contemplative Reflection
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Before moving on, take a moment to reflect on what you observed.
          These questions draw on course readings about Buddhist ethics and AI.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Expandable question categories */}
        <div className="rounded-lg border">
          {categories.map((category, index) => (
            <div
              key={category}
              className={index > 0 ? 'border-t' : ''}
            >
              <QuestionCategory
                category={category}
                isOpen={openCategories.has(category)}
                onToggle={() => toggleCategory(category)}
              />
            </div>
          ))}
        </div>

        {/* Reflection textarea */}
        {!isSubmitted ? (
          <div className="space-y-3">
            <label htmlFor="reflection-textarea" className="text-sm font-medium">
              Your Reflection
            </label>
            <Textarea
              id="reflection-textarea"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Write your reflection here... Consider how the three frameworks differed in their approach to this scenario and what this reveals about different AI alignment approaches."
              className="min-h-[150px] transition-colors duration-150 ease-in-out focus:border-primary"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {reflection.length} characters
              </span>
              <Button
                onClick={handleSubmit}
                disabled={reflection.trim().length === 0}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Reflection
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-green-500/30 bg-green-50 p-4 dark:bg-green-900/20">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-green-700 dark:text-green-300">
                  Reflection saved
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Thank you for your thoughtful engagement with the material.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Course context */}
        <div className="rounded-lg border border-muted bg-muted/30 p-3">
          <p className="text-center text-xs text-muted-foreground">
            RELI E-1730: Mindfulness, AI, and Ethics
            <br />
            Harvard Extension School
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
