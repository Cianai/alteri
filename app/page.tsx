'use client'

/**
 * Main comparison interface page.
 *
 * This is the primary entry point for the AI Alignment Comparator application.
 * It orchestrates the comparison of three AI alignment frameworks:
 * 1. Microsoft HSI (Humanist Superintelligence)
 * 2. Anthropic Constitutional AI
 * 3. Hybrid approach combining both frameworks
 *
 * @module app/page
 */

// TODO: Import components once implemented
// import { ContentWarning } from '@/components/content-warning'
// import { ScenarioInput } from '@/components/scenario-input'
// import { ComparisonView } from '@/components/comparison-view'
// import { ReflectionPrompt } from '@/components/reflection-prompt'

// TODO: Import hooks and state management
// import { useState } from 'react'
// import { useChat } from 'ai/react'

/**
 * HomePage component - Main comparison interface.
 *
 * Responsibilities:
 * - Display content warning modal on first visit
 * - Provide scenario input (custom text or presets)
 * - Trigger parallel API calls to three framework endpoints
 * - Display streaming responses in three-column comparison view
 * - Show reflection prompts after responses complete
 *
 * State management:
 * - hasAcceptedWarning: boolean - Track consent modal dismissal
 * - currentScenario: string - User's input scenario
 * - isComparing: boolean - Loading state during API calls
 * - responses: FrameworkResponse[] - Responses from each framework
 *
 * @returns The main comparison interface
 */
export default function HomePage() {
  // TODO: Implement state management
  // const [hasAcceptedWarning, setHasAcceptedWarning] = useState(false)
  // const [currentScenario, setCurrentScenario] = useState('')

  // TODO: Implement comparison logic
  // const handleCompare = async (scenario: string) => {
  //   // Trigger parallel API calls to /api/compare
  //   // Update responses state as streams arrive
  // }

  return (
    <main className="min-h-screen bg-background">
      {/* TODO: Add ContentWarning modal */}
      {/* {!hasAcceptedWarning && (
        <ContentWarning onAccept={() => setHasAcceptedWarning(true)} />
      )} */}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            AI Alignment Comparator
          </h1>
          <p className="mt-2 text-muted-foreground">
            Compare how different AI alignment frameworks respond to mental health scenarios
          </p>
        </header>

        {/* TODO: Add ScenarioInput component */}
        <section className="mb-8">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Enter a Scenario</h2>
            <p className="text-sm text-muted-foreground">
              TODO: Implement ScenarioInput component with text input and preset selector
            </p>
          </div>
        </section>

        {/* TODO: Add ComparisonView component */}
        <section className="mb-8">
          <div className="grid gap-4 md:grid-cols-3">
            {/* HSI Column */}
            <div className="rounded-lg border bg-card p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-hsi" />
                <h3 className="font-semibold">Microsoft HSI</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                TODO: Implement FrameworkResponse component
              </p>
            </div>

            {/* Constitutional AI Column */}
            <div className="rounded-lg border bg-card p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-constitutional" />
                <h3 className="font-semibold">Constitutional AI</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                TODO: Implement FrameworkResponse component
              </p>
            </div>

            {/* Hybrid Column */}
            <div className="rounded-lg border bg-card p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-hybrid" />
                <h3 className="font-semibold">Hybrid Approach</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                TODO: Implement FrameworkResponse component
              </p>
            </div>
          </div>
        </section>

        {/* TODO: Add ReflectionPrompt component */}
        <section>
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Reflection</h2>
            <p className="text-sm text-muted-foreground">
              TODO: Implement ReflectionPrompt component with Buddhist ethics questions
            </p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>
          Academic project for RELI E-1730: Mindfulness, AI, and Ethics
          <br />
          Harvard Extension School
        </p>
      </footer>
    </main>
  )
}
