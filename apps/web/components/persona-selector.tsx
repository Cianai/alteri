'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/**
 * Persona selector component for landing page.
 *
 * Provides two entry paths into the application:
 * 1. Researcher - Access to analytics, methodology, and data export
 * 2. Participant - Interactive comparison experience with personal results
 *
 * @module components/persona-selector
 */

interface PersonaCardProps {
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
  href: string
  variant: 'researcher' | 'participant'
  delay?: number
}

function PersonaCard({ title, description, icon, features, href, variant, delay = 0 }: PersonaCardProps) {
  const variantStyles = {
    researcher: {
      iconBg: 'bg-violet-100 dark:bg-violet-900/30',
      iconText: 'text-violet-600 dark:text-violet-400',
      buttonVariant: 'default' as const,
    },
    participant: {
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconText: 'text-amber-600 dark:text-amber-400',
      buttonVariant: 'default' as const,
    },
  }

  const styles = variantStyles[variant]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="relative h-full overflow-hidden transition-shadow hover:shadow-lg">
        <CardHeader className="pb-4">
          <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${styles.iconBg}`}>
            <span className={`text-2xl ${styles.iconText}`}>{icon}</span>
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
          <Button asChild className="w-full" variant={styles.buttonVariant}>
            <Link href={href}>
              Get Started
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function PersonaSelector() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Choose Your Path
          </h2>
          <p className="mt-2 text-muted-foreground">
            Select the experience that matches your goals
          </p>
        </motion.div>

        {/* Persona cards */}
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          <PersonaCard
            title="Researcher"
            description="Analyse framework differences with data and methodology access"
            icon={<span role="img" aria-label="Research">&#x1F52C;</span>}
            features={[
              'View aggregate analytics across participants',
              'Export comparison data for analysis',
              'Access system prompt methodology',
              'Review Buddhist ethics integration',
            ]}
            href="/research"
            variant="researcher"
            delay={0.1}
          />

          <PersonaCard
            title="Participant"
            description="Experience the comparison and reflect on framework differences"
            icon={<span role="img" aria-label="Participant">&#x1F4AD;</span>}
            features={[
              'Compare responses across three frameworks',
              'Explore preset or custom scenarios',
              'Receive personalised results summary',
              'Contribute to research (optionally)',
            ]}
            href="/compare"
            variant="participant"
            delay={0.2}
          />
        </div>
      </div>
    </section>
  )
}
