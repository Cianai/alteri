'use client'

import * as React from 'react'
import { motion } from 'framer-motion'

/**
 * Landing page hero section with animated introduction.
 *
 * Displays the project title, tagline, and academic context.
 * Uses Framer Motion for subtle entrance animations.
 *
 * @module components/landing-hero
 */
export function LandingHero() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_50%_at_50%_50%,hsl(var(--primary)/0.1)_0%,transparent_100%)]" />

      <div className="container mx-auto px-4 text-center">
        {/* Title */}
        <motion.h1
          className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          AI Alignment Comparator
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Exploring how alignment philosophy shapes AI responses in mental health contexts
        </motion.p>

        {/* Framework preview badges */}
        <motion.div
          className="mt-8 flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="rounded-full bg-hsi-100 px-4 py-1.5 text-sm font-medium text-hsi-700 dark:bg-hsi-900/30 dark:text-hsi-300">
            Microsoft HSI
          </span>
          <span className="rounded-full bg-constitutional-100 px-4 py-1.5 text-sm font-medium text-constitutional-700 dark:bg-constitutional-900/30 dark:text-constitutional-300">
            Constitutional AI
          </span>
          <span className="rounded-full bg-hybrid-100 px-4 py-1.5 text-sm font-medium text-hybrid-700 dark:bg-hybrid-900/30 dark:text-hybrid-300">
            Hybrid Approach
          </span>
        </motion.div>

        {/* Academic context */}
        <motion.p
          className="mt-12 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Academic project for RELI E-1730: Mindfulness, AI, and Ethics
          <br />
          Harvard Extension School, Spring 2026
        </motion.p>
      </div>
    </section>
  )
}
