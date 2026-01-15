'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { FRAMEWORK_PROMPTS } from '@/lib/prompts'

/**
 * Methodology page showing system prompts and framework documentation.
 *
 * Provides transparency about the prompts used for each framework,
 * supporting reproducibility and academic review.
 *
 * @module app/research/methodology/page
 */

export default function MethodologyPage() {
  const frameworks = Object.values(FRAMEWORK_PROMPTS)

  return (
    <main id="main-content" className="min-h-screen bg-background" tabIndex={-1}>
      <div className="container mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/research" className="hover:text-foreground">Research</Link>
            <span>/</span>
            <span className="text-foreground">Methodology</span>
          </nav>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Methodology
            </h1>
            <p className="mt-2 text-muted-foreground">
              System prompts and framework documentation for research transparency
            </p>
          </motion.div>
        </header>

        {/* Overview */}
        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>
                The comparison methodology
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                The AI Alignment Comparator sends identical user scenarios to Claude
                with three different system prompts, each encoding a distinct alignment
                philosophy. This allows direct comparison of how alignment framework
                choices shape AI behaviour in identical contexts.
              </p>
              <h4>Technical Details</h4>
              <ul>
                <li>
                  <strong>Model:</strong> Claude Sonnet 4 (claude-sonnet-4-20250514)
                </li>
                <li>
                  <strong>API:</strong> Anthropic via Vercel AI SDK 6.x
                </li>
                <li>
                  <strong>Streaming:</strong> Parallel multiplexed NDJSON responses
                </li>
                <li>
                  <strong>Output format:</strong> Structured XML (&lt;response&gt; + &lt;reasoning&gt;)
                </li>
              </ul>
              <h4>Reproducibility</h4>
              <p>
                System prompts are versioned (currently v1.0.0) and displayed in full below.
                All comparison sessions use identical prompts to ensure consistency.
                The reasoning trace in each response shows how the framework principles
                were applied.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        {/* System prompts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="mb-4 text-xl font-semibold">System Prompts</h2>
          <Tabs defaultValue="hsi" className="w-full">
            <TabsList className="mb-4 w-full justify-start">
              {frameworks.map((framework) => (
                <TabsTrigger key={framework.id} value={framework.id} className="flex-1 sm:flex-none">
                  {framework.shortName}
                </TabsTrigger>
              ))}
            </TabsList>

            {frameworks.map((framework) => (
              <TabsContent key={framework.id} value={framework.id}>
                <Card className={`${framework.colour.primary} ${framework.colour.border}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{framework.name}</CardTitle>
                      <Badge variant="outline">v{framework.version}</Badge>
                    </div>
                    <CardDescription>{framework.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg bg-background/80 p-4">
                      <pre className="whitespace-pre-wrap text-xs leading-relaxed">
                        {framework.systemPrompt}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </motion.section>

        {/* Framework comparison table */}
        <motion.section
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Framework Comparison</CardTitle>
              <CardDescription>
                Key differences between the three alignment approaches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 pr-4 text-left font-medium">Dimension</th>
                      <th className="pb-3 pr-4 text-left font-medium text-hsi-700 dark:text-hsi-300">HSI</th>
                      <th className="pb-3 pr-4 text-left font-medium text-constitutional-700 dark:text-constitutional-300">Constitutional</th>
                      <th className="pb-3 text-left font-medium text-hybrid-700 dark:text-hybrid-300">Hybrid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-3 pr-4 font-medium">Safety Model</td>
                      <td className="py-3 pr-4">Containment</td>
                      <td className="py-3 pr-4">Character</td>
                      <td className="py-3">Both layers</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-medium">AI Identity</td>
                      <td className="py-3 pr-4">Tool/subordinate</td>
                      <td className="py-3 pr-4">Caring friend</td>
                      <td className="py-3">Bounded presence</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-medium">Professional Deference</td>
                      <td className="py-3 pr-4">Mandatory</td>
                      <td className="py-3 pr-4">Contextual</td>
                      <td className="py-3">Calibrated</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-medium">Response Style</td>
                      <td className="py-3 pr-4">Bounded, explicit</td>
                      <td className="py-3 pr-4">Substantive, honest</td>
                      <td className="py-3">Genuine within scope</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-medium">Crisis Protocol</td>
                      <td className="py-3 pr-4">Immediate escalation</td>
                      <td className="py-3 pr-4">Present + resources</td>
                      <td className="py-3">Both approaches</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Academic references */}
        <motion.section
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>References</CardTitle>
              <CardDescription>
                Sources informing the framework implementations
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <h4>HSI Framework</h4>
              <ul>
                <li>Suleyman, M. (2023). <em>The Coming Wave</em>. Crown.</li>
                <li>Microsoft AI. (2024). Responsible AI principles documentation.</li>
              </ul>

              <h4>Constitutional AI</h4>
              <ul>
                <li>
                  Askell, A. et al. (2024). &quot;The Claude Model Spec.&quot; Anthropic research documentation.
                </li>
                <li>
                  Bai, Y. et al. (2022). &quot;Constitutional AI: Harmlessness from AI Feedback.&quot;
                </li>
              </ul>

              <h4>Buddhist Ethics Integration</h4>
              <ul>
                <li>
                  Hershock, P. D. (2021). <em>Buddhism and Intelligent Technology</em>.
                  Bloomsbury Academic.
                </li>
                <li>
                  RELI E-1730 Course Materials (2026). Harvard Extension School.
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.section>
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
