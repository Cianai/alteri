/**
 * localStorage persistence for configuration.
 *
 * Handles saving/loading config with validation and
 * graceful degradation for SSR contexts.
 *
 * @module lib/config/storage
 */

import { type ConfigRegistry, DEFAULT_CONFIG, mergeConfig, validateConfig } from './registry'

const STORAGE_KEY = 'alignment-comparator-config'
const STORAGE_VERSION = 1

interface StoredConfig {
  version: number
  config: ConfigRegistry
}

/**
 * Check if localStorage is available (client-side only)
 */
function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const test = '__storage_test__'
    window.localStorage.setItem(test, test)
    window.localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

/**
 * Load configuration from localStorage.
 * Returns default config if not found or invalid.
 */
export function loadConfig(): ConfigRegistry {
  if (!isStorageAvailable()) {
    return DEFAULT_CONFIG
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return DEFAULT_CONFIG
    }

    const parsed: StoredConfig = JSON.parse(stored)

    // Version migration if needed
    if (parsed.version !== STORAGE_VERSION) {
      // For now, just merge with defaults on version mismatch
      return mergeConfig(parsed.config)
    }

    // Validate the loaded config
    const errors = validateConfig(parsed.config)
    if (errors.length > 0) {
      console.warn('[Config] Validation errors, using defaults:', errors)
      return DEFAULT_CONFIG
    }

    return mergeConfig(parsed.config)
  } catch (error) {
    console.warn('[Config] Failed to load config:', error)
    return DEFAULT_CONFIG
  }
}

/**
 * Save configuration to localStorage.
 */
export function saveConfig(config: ConfigRegistry): boolean {
  if (!isStorageAvailable()) {
    console.warn('[Config] localStorage not available')
    return false
  }

  try {
    const stored: StoredConfig = {
      version: STORAGE_VERSION,
      config: {
        ...config,
        updatedAt: new Date().toISOString(),
      },
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    return true
  } catch (error) {
    console.error('[Config] Failed to save config:', error)
    return false
  }
}

/**
 * Clear stored configuration (reset to defaults).
 */
export function clearConfig(): boolean {
  if (!isStorageAvailable()) {
    return false
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('[Config] Failed to clear config:', error)
    return false
  }
}

/**
 * Export configuration as JSON string for backup/sharing.
 */
export function exportConfig(config: ConfigRegistry): string {
  return JSON.stringify(config, null, 2)
}

/**
 * Import configuration from JSON string.
 * Returns null if invalid.
 */
export function importConfig(json: string): ConfigRegistry | null {
  try {
    const parsed = JSON.parse(json) as Partial<ConfigRegistry>
    const errors = validateConfig(parsed)

    if (errors.length > 0) {
      console.warn('[Config] Import validation errors:', errors)
      return null
    }

    return mergeConfig(parsed)
  } catch (error) {
    console.error('[Config] Import parse error:', error)
    return null
  }
}

/**
 * Get a hash of the current config for change detection.
 */
export function getConfigHash(config: ConfigRegistry): string {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { updatedAt, ...rest } = config
  return btoa(JSON.stringify(rest)).slice(0, 16)
}
