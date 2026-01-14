'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertTriangle } from 'lucide-react'

/**
 * LocalStorage key for content warning acknowledgement.
 */
const STORAGE_KEY = 'alignment-comparator-warning-acknowledged'

/**
 * Props for the ContentWarning component.
 */
export interface ContentWarningProps {
  /** Callback when user acknowledges the warning */
  onAcknowledge: () => void
}

/**
 * Hook to check if user has previously acknowledged the content warning.
 *
 * @returns Whether the content warning has been acknowledged
 */
export function useContentWarningAcknowledged(): boolean {
  const [acknowledged, setAcknowledged] = React.useState(true) // Default true to prevent flash

  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    setAcknowledged(stored === 'true')
  }, [])

  return acknowledged
}

/**
 * ContentWarning component - Initial consent modal.
 *
 * This component displays a content warning and consent form before users
 * can access the comparison tool. This is essential because:
 * - The tool involves mental health scenarios
 * - Some scenarios may be distressing
 * - Users should be aware of available resources
 * - Ethical research requires informed consent
 *
 * Content includes:
 * - Clear description of what the tool does
 * - Warning about potentially distressing content
 * - Links to mental health resources
 * - Explicit consent checkbox
 *
 * Accessibility considerations:
 * - Focus trapped within modal via Radix Dialog
 * - Screen reader announcements
 * - High contrast warning indicators
 * - Keyboard navigable
 *
 * @param onAcknowledge - Callback when user acknowledges and consents
 *
 * @returns Modal dialog with content warning and consent
 *
 * @example
 * ```tsx
 * const acknowledged = useContentWarningAcknowledged()
 *
 * if (!acknowledged) {
 *   return <ContentWarning onAcknowledge={() => {}} />
 * }
 * ```
 */
export function ContentWarning({ onAcknowledge }: ContentWarningProps) {
  const [hasCheckedConsent, setHasCheckedConsent] = React.useState(false)

  const handleAcknowledge = React.useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true')
    onAcknowledge()
  }, [onAcknowledge])

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-lg"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl">Content Warning</DialogTitle>
          </div>
        </DialogHeader>

        <DialogDescription asChild>
          <div className="space-y-4 text-sm text-foreground">
            <p>
              This tool compares how different AI alignment frameworks respond to
              <strong> mental health scenarios</strong>, including discussions of:
            </p>
            <ul className="list-inside list-disc space-y-1 pl-4 text-muted-foreground">
              <li>Suicidal ideation and self-harm</li>
              <li>Depression and anxiety</li>
              <li>Crisis situations</li>
              <li>Emotional distress</li>
            </ul>

            <p>
              This is an <strong>academic research tool</strong> designed to study AI
              alignment approaches. The AI responses are generated for comparison
              purposes and should not be considered mental health advice.
            </p>

            <div className="rounded-lg border border-blue-300 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
              <p className="font-medium text-blue-700 dark:text-blue-300">
                If you are experiencing a mental health crisis:
              </p>
              <ul className="mt-2 space-y-1 text-blue-600 dark:text-blue-400">
                <li>
                  <strong>UK:</strong> Samaritans - 116 123
                </li>
                <li>
                  <strong>US:</strong> 988 Suicide & Crisis Lifeline
                </li>
                <li>
                  <strong>International:</strong>{' '}
                  <a
                    href="https://findahelpline.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    findahelpline.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </DialogDescription>

        {/* Consent checkbox */}
        <div className="mt-2 flex items-start gap-3">
          <Checkbox
            id="consent-checkbox"
            checked={hasCheckedConsent}
            onCheckedChange={(checked) => setHasCheckedConsent(checked === true)}
            className="mt-0.5"
          />
          <label
            htmlFor="consent-checkbox"
            className="cursor-pointer text-sm leading-relaxed"
          >
            I understand that this tool contains discussions of mental health
            topics including crisis scenarios, and I consent to viewing this
            content for academic purposes.
          </label>
        </div>

        {/* Action button */}
        <div className="mt-4">
          <Button
            onClick={handleAcknowledge}
            disabled={!hasCheckedConsent}
            className="w-full transition-opacity duration-150 ease-in-out"
          >
            Continue
          </Button>
        </div>

        {/* Academic context */}
        <p className="mt-2 text-center text-xs text-muted-foreground">
          RELI E-1730: Mindfulness, AI, and Ethics
          <br />
          Harvard Extension School
        </p>
      </DialogContent>
    </Dialog>
  )
}
