'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

/**
 * Reusable guided tour component inspired by vibecode patterns.
 *
 * Provides step-by-step navigation through content with:
 * - Previous/next navigation
 * - Step indicators
 * - Animated transitions
 * - Callback for step changes
 *
 * @module components/visualisations/guided-tour
 */

export interface TourStep {
  id: string
  title: string
  content: React.ReactNode
  highlight?: string // CSS selector or identifier to highlight
}

interface GuidedTourProps {
  steps: TourStep[]
  onStepChange?: (step: TourStep, index: number) => void
  onComplete?: () => void
  className?: string
}

export function GuidedTour({ steps, onStepChange, onComplete, className }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isActive, setIsActive] = React.useState(true)

  const step = steps[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1

  // Notify on step change
  React.useEffect(() => {
    if (onStepChange && step) {
      onStepChange(step, currentStep)
    }
  }, [currentStep, step, onStepChange])

  const handleNext = () => {
    if (isLast) {
      setIsActive(false)
      onComplete?.()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSkip = () => {
    setIsActive(false)
    onComplete?.()
  }

  if (!isActive || !step) return null

  return (
    <motion.div
      className={`rounded-lg border bg-card p-6 shadow-lg ${className ?? ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {/* Step indicators */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-primary'
                  : index < currentStep
                    ? 'bg-primary/50'
                    : 'bg-muted'
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {currentStep + 1} / {steps.length}
        </span>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
          <div className="mb-4 text-sm text-muted-foreground">
            {step.content}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
        >
          Skip Tour
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={isFirst}
          >
            Previous
          </Button>
          <Button
            size="sm"
            onClick={handleNext}
          >
            {isLast ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Hook for managing guided tour state.
 */
export function useGuidedTour(steps: TourStep[]) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isActive, setIsActive] = React.useState(true)
  const [highlightedElement, setHighlightedElement] = React.useState<string | undefined>()

  const step = steps[currentStep]

  React.useEffect(() => {
    setHighlightedElement(step?.highlight)
  }, [step])

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      setIsActive(false)
    }
  }

  const previous = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const goTo = (index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStep(index)
    }
  }

  const start = () => {
    setCurrentStep(0)
    setIsActive(true)
  }

  const stop = () => {
    setIsActive(false)
  }

  return {
    currentStep,
    step,
    isActive,
    highlightedElement,
    isFirst: currentStep === 0,
    isLast: currentStep === steps.length - 1,
    progress: (currentStep + 1) / steps.length,
    next,
    previous,
    goTo,
    start,
    stop,
  }
}
