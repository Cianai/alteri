'use client'

import * as React from 'react'
import { ConfigProvider } from '@/lib/config'
import { VersionSwitcher } from '@/components/version-switcher'

/**
 * Client-side providers wrapper.
 *
 * Wraps children with all necessary context providers:
 * - ConfigProvider for configuration state
 * - VersionSwitcher for floating config panel
 *
 * @module components/providers
 */

interface ProvidersProps {
  children: React.ReactNode
  /** Show the floating version switcher */
  showVersionSwitcher?: boolean
}

export function Providers({ children, showVersionSwitcher = true }: ProvidersProps) {
  return (
    <ConfigProvider>
      {children}
      {showVersionSwitcher && <VersionSwitcher position="bottom-right" />}
    </ConfigProvider>
  )
}
