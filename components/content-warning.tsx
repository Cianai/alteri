'use client'

import * as React from 'react'
// TODO: Uncomment imports when Radix Dialog is available
// import * as Dialog from '@radix-ui/react-dialog'
// import { Button } from '@/components/ui/button'
// import { AlertTriangle } from 'lucide-react'

/**
 * Props for the ContentWarning component.
 */
export interface ContentWarningProps {
  /** Callback when user accepts the warning and gives consent */
  onAccept: () => void
  /** Optional callback if user declines (navigate away) */
  onDecline?: () => void
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
 * - Option to leave without proceeding
 *
 * Accessibility considerations:
 * - Focus trapped within modal
 * - Escape key behaviour (should NOT dismiss - require explicit choice)
 * - Screen reader announcements
 * - High contrast warning indicators
 *
 * TODO: Implement the following features:
 * - [ ] Store consent in localStorage with timestamp
 * - [ ] Add "Don't show again" checkbox for returning users
 * - [ ] Track consent for research compliance
 * - [ ] Add emergency contact numbers for different regions
 * - [ ] Implement proper Radix Dialog for accessibility
 * - [ ] Add animation for modal entrance
 * - [ ] Support multiple languages for warnings
 * - [ ] Add audio option for reading warning aloud
 *
 * @param onAccept - Callback when user consents
 * @param onDecline - Optional callback when user declines
 *
 * @returns Modal dialog with content warning and consent
 *
 * @example
 * ```tsx
 * {!hasConsented && (
 *   <ContentWarning
 *     onAccept={() => setHasConsented(true)}
 *     onDecline={() => router.push('/')}
 *   />
 * )}
 * ```
 */
export function ContentWarning({ onAccept, onDecline }: ContentWarningProps) {
  const [hasCheckedConsent, setHasCheckedConsent] = React.useState(false)

  // TODO: Implement with Radix Dialog for proper accessibility
  // return (
  //   <Dialog.Root open={true}>
  //     <Dialog.Portal>
  //       <Dialog.Overlay className="fixed inset-0 bg-black/50" />
  //       <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
  //         {/* Content here */}
  //       </Dialog.Content>
  //     </Dialog.Portal>
  //   </Dialog.Root>
  // )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-background p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="content-warning-title"
        aria-describedby="content-warning-description"
      >
        {/* Warning header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
            <span className="text-xl">⚠️</span>
          </div>
          <h2 id="content-warning-title" className="text-xl font-semibold">
            Content Warning
          </h2>
        </div>

        {/* Warning description */}
        <div id="content-warning-description" className="space-y-4 text-sm">
          <p>
            This tool compares how different AI alignment frameworks respond to
            <strong> mental health scenarios</strong>, including discussions of:
          </p>
          <ul className="list-inside list-disc space-y-1 pl-4">
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

          <div className="rounded border border-blue-500/30 bg-blue-500/10 p-3">
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
                  className="underline"
                >
                  findahelpline.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Consent checkbox */}
        <div className="mt-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasCheckedConsent}
              onChange={(e) => setHasCheckedConsent(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm">
              I understand that this tool contains discussions of mental health
              topics including crisis scenarios, and I consent to viewing this
              content for academic purposes.
            </span>
          </label>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex gap-3">
          {onDecline && (
            <button
              onClick={onDecline}
              className="flex-1 rounded border px-4 py-2 text-sm hover:bg-muted"
            >
              Leave
            </button>
          )}
          <button
            onClick={onAccept}
            disabled={!hasCheckedConsent}
            className="flex-1 rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            I Understand, Continue
          </button>
        </div>

        {/* Academic context */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          RELI E-1730: Mindfulness, AI, and Ethics
          <br />
          Harvard Extension School
        </p>
      </div>
    </div>
  )
}
