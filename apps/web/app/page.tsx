import { LandingHero } from '@/components/landing-hero'
import { PersonaSelector } from '@/components/persona-selector'
import { FrameworkCards } from '@/components/framework-cards'
import Link from 'next/link'

/**
 * Landing page for the AI Alignment Comparator.
 *
 * Provides an entry point with two persona paths:
 * - Researcher: Analytics, methodology, and data export
 * - Participant: Interactive comparison experience
 *
 * @module app/page
 */
export default function LandingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-background" tabIndex={-1}>
      {/* Hero section */}
      <LandingHero />

      {/* Persona selection */}
      <PersonaSelector />

      {/* Framework overview */}
      <FrameworkCards />

      {/* Quick links section */}
      <section className="border-t py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-8 text-xl font-semibold">Learn More</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/about"
              className="rounded-lg border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              About the Research
            </Link>
            <Link
              href="/research/methodology"
              className="rounded-lg border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              View Methodology
            </Link>
            <a
              href="https://github.com/cianos95-dev/alignment-comparator"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              View Source Code
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p className="mb-2">
          Academic project for RELI E-1730: Mindfulness, AI, and Ethics
        </p>
        <p>
          Harvard Extension School, Spring 2026
        </p>
        <p className="mt-4 text-xs">
          Created by Cian O&apos;Sullivan
        </p>
      </footer>
    </main>
  )
}
