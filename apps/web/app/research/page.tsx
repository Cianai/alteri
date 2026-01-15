'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Researcher portal dashboard.
 *
 * Provides navigation to research-focused views:
 * - Analytics: Aggregate data visualisation
 * - Methodology: System prompts and framework documentation
 *
 * @module app/research/page
 */

interface DashboardCardProps {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  stats?: { label: string; value: string }[]
  delay?: number
}

function DashboardCard({ title, description, href, icon, stats, delay = 0 }: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Link href={href}>
        <Card className="h-full transition-shadow hover:shadow-lg">
          <CardHeader>
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-xl text-primary">{icon}</span>
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          {stats && (
            <CardContent>
              <div className="flex gap-6">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      </Link>
    </motion.div>
  )
}

export default function ResearchDashboard() {
  return (
    <main id="main-content" className="min-h-screen bg-background" tabIndex={-1}>
      <div className="container mx-auto max-w-6xl px-4 py-8">
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
              Research Portal
            </h1>
            <p className="mt-2 text-muted-foreground">
              Analytics, methodology, and data export for AI alignment research
            </p>
          </motion.div>
        </header>

        {/* Dashboard cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            title="Analytics Dashboard"
            description="Visualise aggregate data across participant sessions"
            href="/research/analytics"
            icon={<span role="img" aria-label="Analytics">&#x1F4CA;</span>}
            stats={[
              { label: 'Frameworks', value: '3' },
              { label: 'Scenarios', value: '6' },
            ]}
            delay={0.1}
          />

          <DashboardCard
            title="Methodology"
            description="View system prompts and framework documentation"
            href="/research/methodology"
            icon={<span role="img" aria-label="Methodology">&#x1F4DD;</span>}
            stats={[
              { label: 'Prompt Version', value: '1.0.0' },
            ]}
            delay={0.2}
          />

          <DashboardCard
            title="Try It Yourself"
            description="Experience the comparison as a participant"
            href="/compare"
            icon={<span role="img" aria-label="Compare">&#x1F50D;</span>}
            delay={0.3}
          />
        </div>

        {/* Research context */}
        <motion.section
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Research Context</CardTitle>
              <CardDescription>
                Academic background for this project
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                This tool was developed for <strong>RELI E-1730: Mindfulness, AI, and Ethics</strong>
                at Harvard Extension School (Spring 2026). It examines how different AI alignment
                philosophies manifest in practice when applied to mental health support contexts.
              </p>
              <h4>Research Questions</h4>
              <ol>
                <li>
                  How do containment-based (HSI) and character-based (Constitutional AI) approaches
                  differ in their responses to sensitive mental health scenarios?
                </li>
                <li>
                  Can a hybrid approach effectively combine the safety of containment with the
                  warmth of character-based engagement?
                </li>
                <li>
                  How do Buddhist ethics principles (particularly those around attention and
                  compassion) inform our evaluation of AI alignment frameworks?
                </li>
              </ol>
              <h4>Theoretical Framework</h4>
              <p>
                The comparison draws on Peter D. Hershock&apos;s work on Buddhist ethics and technology,
                Amanda Askell&apos;s character-based AI alignment research at Anthropic, and
                Mustafa Suleyman&apos;s humanist superintelligence framework.
              </p>
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
