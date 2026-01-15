'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/**
 * Participant results page.
 *
 * Displays a summary of the participant's comparison session including:
 * - Number of scenarios explored
 * - Reflection highlights
 * - Framework preference indication (future)
 *
 * Data is retrieved from localStorage (client-side only for MVP).
 *
 * @module app/results/page
 */

interface Reflection {
  timestamp: string
  scenario: string
  reflection: string
}

export default function ResultsPage() {
  const [reflections, setReflections] = React.useState<Reflection[]>([])
  const [mounted, setMounted] = React.useState(false)

  // Load reflections from localStorage on mount
  React.useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('alignment-reflections')
    if (stored) {
      try {
        setReflections(JSON.parse(stored))
      } catch {
        setReflections([])
      }
    }
  }, [])

  // Clear results
  const handleClearResults = () => {
    localStorage.removeItem('alignment-reflections')
    setReflections([])
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  const hasResults = reflections.length > 0

  return (
    <main id="main-content" className="min-h-screen bg-background" tabIndex={-1}>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <nav className="mb-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              &larr; Back to home
            </Link>
          </nav>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Your Results
            </h1>
            <p className="mt-2 text-muted-foreground">
              Summary of your framework comparison session
            </p>
          </motion.div>
        </header>

        {/* Results content */}
        {hasResults ? (
          <div className="space-y-8">
            {/* Summary stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Session Summary</CardTitle>
                  <CardDescription>
                    Your exploration of AI alignment frameworks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg bg-muted/50 p-4 text-center">
                      <div className="text-3xl font-bold">{reflections.length}</div>
                      <div className="text-sm text-muted-foreground">
                        Scenario{reflections.length > 1 ? 's' : ''} Explored
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-4 text-center">
                      <div className="text-3xl font-bold">3</div>
                      <div className="text-sm text-muted-foreground">
                        Frameworks Compared
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-4 text-center">
                      <div className="text-3xl font-bold">
                        {reflections.filter(r => r.reflection.length > 0).length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Reflections Recorded
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Reflections list */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Your Reflections</CardTitle>
                  <CardDescription>
                    Thoughts captured during your comparison sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reflections.map((reflection, index) => (
                      <div
                        key={index}
                        className="rounded-lg border p-4"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {new Date(reflection.timestamp).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="mb-2 text-sm font-medium">
                          Scenario: &ldquo;{reflection.scenario.slice(0, 100)}
                          {reflection.scenario.length > 100 ? '...' : ''}&rdquo;
                        </p>
                        {reflection.reflection && (
                          <p className="text-sm text-muted-foreground">
                            {reflection.reflection}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Framework insights (placeholder for future) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-violet-50 to-amber-50 dark:from-violet-950/30 dark:to-amber-950/30">
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                  <CardDescription>
                    What the frameworks reveal about AI alignment
                  </CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                  <p>
                    By comparing the same scenario across three different alignment frameworks,
                    you&apos;ve observed how philosophy shapes AI behaviour:
                  </p>
                  <ul>
                    <li>
                      <strong>HSI (Microsoft)</strong> prioritises containment and human oversight,
                      often deferring to professionals and maintaining clear boundaries.
                    </li>
                    <li>
                      <strong>Constitutional AI (Anthropic)</strong> emphasises character and genuine
                      engagement, balancing helpfulness with honest feedback.
                    </li>
                    <li>
                      <strong>Hybrid</strong> attempts to combine the safety of containment with the
                      warmth of character-based approaches.
                    </li>
                  </ul>
                  <p>
                    These differences matter because AI systems increasingly interact with people
                    in sensitive contexts. Understanding alignment philosophy helps us make
                    informed choices about the AI systems we build and use.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button asChild>
                <Link href="/compare">Continue Exploring</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/about">Learn More About the Research</Link>
              </Button>
              <Button variant="ghost" onClick={handleClearResults}>
                Clear My Results
              </Button>
            </motion.div>
          </div>
        ) : (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="text-center">
              <CardHeader>
                <CardTitle>No Results Yet</CardTitle>
                <CardDescription>
                  Start comparing frameworks to see your results here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-6 text-sm text-muted-foreground">
                  Once you&apos;ve explored some scenarios and recorded your reflections,
                  they&apos;ll appear on this page as a summary of your session.
                </p>
                <Button asChild>
                  <Link href="/compare">Start Comparing</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
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
