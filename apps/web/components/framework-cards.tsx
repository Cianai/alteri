'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Framework explanation cards for the landing page.
 *
 * Provides accessible summaries of each AI alignment framework
 * being compared in the application.
 *
 * @module components/framework-cards
 */

interface FrameworkData {
  id: string
  name: string
  shortName: string
  source: string
  description: string
  keyPrinciples: string[]
  colour: {
    bg: string
    border: string
    text: string
  }
}

const frameworks: FrameworkData[] = [
  {
    id: 'hsi',
    name: 'Humanist Superintelligence',
    shortName: 'HSI',
    source: 'Microsoft / Mustafa Suleyman',
    description:
      'A containment-first approach that keeps AI safely bounded within defined domains, with mandatory human oversight.',
    keyPrinciples: [
      'Domain containment - strict operational boundaries',
      'Human-in-loop - professional oversight required',
      'Interpretable decisions - transparent reasoning',
      'Subordinate positioning - AI as tool, not agent',
    ],
    colour: {
      bg: 'bg-hsi-50 dark:bg-hsi-950',
      border: 'border-hsi-200 dark:border-hsi-800',
      text: 'text-hsi-700 dark:text-hsi-300',
    },
  },
  {
    id: 'constitutional',
    name: 'Constitutional AI',
    shortName: 'Constitutional',
    source: 'Anthropic',
    description:
      'A character-based approach where AI internalises values through training, enabling nuanced judgment within ethical bounds.',
    keyPrinciples: [
      'Principal hierarchy - safety > ethics > guidelines > helpfulness',
      'Brilliant friend model - substantive engagement over deflection',
      'Anti-sycophancy - honest feedback over validation',
      'Psychological stability - consistent character under pressure',
    ],
    colour: {
      bg: 'bg-constitutional-50 dark:bg-constitutional-950',
      border: 'border-constitutional-200 dark:border-constitutional-800',
      text: 'text-constitutional-700 dark:text-constitutional-300',
    },
  },
  {
    id: 'hybrid',
    name: 'Integrated Approach',
    shortName: 'Hybrid',
    source: 'Synthesised',
    description:
      'A combined framework that uses containment architecture to define boundaries while character training guides engagement within them.',
    keyPrinciples: [
      'Bounded authenticity - genuine within defined scope',
      'Calibrated deference - knowing when to step back vs lean in',
      'Transparent values - visible reasoning with genuine care',
      'Robust safety - technical safeguards plus internalised values',
    ],
    colour: {
      bg: 'bg-hybrid-50 dark:bg-hybrid-950',
      border: 'border-hybrid-200 dark:border-hybrid-800',
      text: 'text-hybrid-700 dark:text-hybrid-300',
    },
  },
]

function FrameworkCard({ framework, index }: { framework: FrameworkData; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
    >
      <Card className={`h-full ${framework.colour.bg} ${framework.colour.border}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium uppercase tracking-wide ${framework.colour.text}`}>
              {framework.source}
            </span>
          </div>
          <CardTitle className="text-lg">{framework.name}</CardTitle>
          <CardDescription className="text-sm">
            {framework.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Key Principles
          </h4>
          <ul className="space-y-1.5 text-sm">
            {framework.keyPrinciples.map((principle, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${framework.colour.text.replace('text-', 'bg-')}`} />
                <span className="text-muted-foreground">{principle}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function FrameworkCards() {
  return (
    <section className="border-t bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Three Alignment Philosophies
          </h2>
          <p className="mt-2 text-muted-foreground">
            Each framework represents a distinct approach to making AI safe and beneficial
          </p>
        </motion.div>

        {/* Framework cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {frameworks.map((framework, index) => (
            <FrameworkCard key={framework.id} framework={framework} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
