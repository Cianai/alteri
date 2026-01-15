'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/**
 * About page - Research narrative for portfolio and reviewers.
 *
 * Provides a comprehensive overview of the project suitable for:
 * - Academic reviewers
 * - Potential employers
 * - Portfolio visitors
 *
 * @module app/about/page
 */

export default function AboutPage() {
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
              About This Project
            </h1>
            <p className="mt-2 text-muted-foreground">
              An interactive exploration of AI alignment philosophy
            </p>
          </motion.div>
        </header>

        {/* Main content */}
        <div className="space-y-8">
          {/* Project overview */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  The <strong>AI Alignment Comparator</strong> is an interactive research tool
                  that demonstrates how different AI alignment philosophies shape AI behaviour
                  in practice. By comparing responses from three distinct frameworks to identical
                  mental health scenarios, users can directly observe how alignment choices
                  manifest in real interactions.
                </p>
                <p>
                  This project was developed for <strong>RELI E-1730: Mindfulness, AI, and Ethics</strong>
                  at Harvard Extension School (Spring 2026), examining the intersection of AI
                  alignment approaches and Buddhist ethics principles.
                </p>
              </CardContent>
            </Card>
          </motion.section>

          {/* The frameworks */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>The Three Frameworks</CardTitle>
                <CardDescription>
                  Distinct philosophies for making AI safe and beneficial
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* HSI */}
                <div className="rounded-lg border border-hsi-200 bg-hsi-50 p-4 dark:border-hsi-800 dark:bg-hsi-950">
                  <h3 className="mb-2 font-semibold text-hsi-700 dark:text-hsi-300">
                    Humanist Superintelligence (HSI)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Developed by Microsoft and articulated by Mustafa Suleyman, HSI emphasises
                    <strong> containment</strong> as the primary safety mechanism. AI operates
                    within strictly defined domains, with mandatory human oversight and
                    transparent, interpretable decision-making. The AI positions itself
                    as a subordinate tool rather than an autonomous agent.
                  </p>
                </div>

                {/* Constitutional */}
                <div className="rounded-lg border border-constitutional-200 bg-constitutional-50 p-4 dark:border-constitutional-800 dark:bg-constitutional-950">
                  <h3 className="mb-2 font-semibold text-constitutional-700 dark:text-constitutional-300">
                    Constitutional AI
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Developed by Anthropic and informed by Amanda Askell&apos;s research,
                    Constitutional AI emphasises <strong>character</strong> as the foundation
                    of safety. Through training, the AI internalises values that guide behaviour.
                    The &quot;brilliant friend&quot; model prioritises genuine engagement, honest
                    feedback over sycophancy, and psychological stability under pressure.
                  </p>
                </div>

                {/* Hybrid */}
                <div className="rounded-lg border border-hybrid-200 bg-hybrid-50 p-4 dark:border-hybrid-800 dark:bg-hybrid-950">
                  <h3 className="mb-2 font-semibold text-hybrid-700 dark:text-hybrid-300">
                    Integrated Approach (Hybrid)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    A synthesised framework that combines containment architecture with
                    character training. Clear boundaries define the scope of operation
                    (from HSI), while genuine character determines how the AI engages
                    within those bounds (from Constitutional). This creates
                    &quot;bounded authenticity&quot; - genuine presence within defined limits.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Buddhist ethics connection */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Buddhist Ethics Integration</CardTitle>
                <CardDescription>
                  Ancient wisdom applied to contemporary AI challenges
                </CardDescription>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  The reflection questions integrated into the comparison experience draw
                  on Buddhist ethical frameworks, particularly Peter D. Hershock&apos;s work
                  on technology and Buddhist principles:
                </p>
                <ul>
                  <li>
                    <strong>Attention quality:</strong> How does each framework shape what
                    we notice and how we engage with the interaction?
                  </li>
                  <li>
                    <strong>Relational dynamics:</strong> What kind of relationship does
                    each framework foster between human and AI?
                  </li>
                  <li>
                    <strong>Compassion expression:</strong> How does genuine care manifest
                    differently across alignment approaches?
                  </li>
                  <li>
                    <strong>Appropriate boundaries:</strong> When are limits supportive,
                    and when do they become barriers to genuine connection?
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.section>

          {/* Technical implementation */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Technical Implementation</CardTitle>
                <CardDescription>
                  Modern web technologies for research reproducibility
                </CardDescription>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <div className="not-prose mb-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="mb-2 font-semibold">Frontend</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>Next.js 15 (App Router)</li>
                      <li>React 19</li>
                      <li>TypeScript (strict mode)</li>
                      <li>Tailwind CSS + shadcn/ui</li>
                      <li>Framer Motion</li>
                      <li>Recharts</li>
                    </ul>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="mb-2 font-semibold">Backend</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>Vercel AI SDK 6.x</li>
                      <li>Claude Sonnet 4 (Anthropic)</li>
                      <li>Edge runtime (streaming)</li>
                      <li>Multiplexed NDJSON</li>
                      <li>Turborepo monorepo</li>
                    </ul>
                  </div>
                </div>
                <p>
                  The architecture supports parallel streaming responses from all three
                  frameworks simultaneously, providing real-time comparison as responses
                  generate. System prompts are versioned for research reproducibility,
                  and reasoning traces are captured for analysis.
                </p>
              </CardContent>
            </Card>
          </motion.section>

          {/* About the author */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>About the Author</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  <strong>Cian O&apos;Sullivan</strong> is a dual MSc student in Psychology
                  and Neuroscience of Mental Health (King&apos;s College London) and
                  Psychology (Harvard Extension School). His research focuses on limerence
                  using multilevel network analysis, exploring how intense romantic
                  preoccupation emerges from the interaction of psychological, social,
                  and biological factors.
                </p>
                <p>
                  This project bridges academic research in AI ethics with practical
                  software development, demonstrating how alignment philosophy translates
                  into observable differences in AI behaviour.
                </p>
              </CardContent>
            </Card>
          </motion.section>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4 pt-4"
          >
            <Button asChild>
              <Link href="/compare">Try the Comparison</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/research/methodology">View Methodology</Link>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://github.com/cianos95-dev/alignment-comparator"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Source Code
              </a>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>
          Academic project for RELI E-1730: Mindfulness, AI, and Ethics
          <br />
          Harvard Extension School, Spring 2026
        </p>
      </footer>
    </main>
  )
}
