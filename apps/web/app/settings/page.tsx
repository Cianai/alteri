'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  useConfig,
  THEME_METADATA,
  PROMPT_VERSIONS,
  exportConfig,
  importConfig,
  type ThemeVariant,
  type AnimationIntensity,
  type ChartStyle,
  type VariantId,
} from '@/lib/config'

/**
 * Full settings page for configuration management.
 *
 * Provides comprehensive access to all configuration options
 * with import/export capabilities.
 *
 * @module app/settings/page
 */

export default function SettingsPage() {
  const {
    config,
    isDirty,
    isLoading,
    setTheme,
    setPromptVersion,
    setVariant,
    setExperiment,
    toggleAnimations,
    setAnimationIntensity,
    toggleGuidedTour,
    toggleReasoning,
    setChartStyle,
    toggleFeature,
    save,
    reset,
  } = useConfig()

  const [exportData, setExportData] = React.useState<string>('')
  const [importData, setImportData] = React.useState<string>('')
  const [importError, setImportError] = React.useState<string>('')

  const handleExport = () => {
    setExportData(exportConfig(config))
  }

  const handleImport = () => {
    const imported = importConfig(importData)
    if (imported) {
      setTheme(imported.theme)
      setPromptVersion(imported.promptVersion)
      setVariant(imported.variantId)
      if (imported.experimentId) setExperiment(imported.experimentId)
      toggleAnimations(imported.components.animations.enabled)
      setAnimationIntensity(imported.components.animations.intensity)
      toggleGuidedTour(imported.components.guidedTour.enabled)
      toggleReasoning(imported.components.reasoning.visible)
      setChartStyle(imported.components.charts.style)
      Object.entries(imported.features).forEach(([key, value]) => {
        toggleFeature(key as keyof typeof imported.features, value)
      })
      setImportData('')
      setImportError('')
    } else {
      setImportError('Invalid configuration format')
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main id="main-content" className="min-h-screen bg-background" tabIndex={-1}>
      <div className="container mx-auto max-w-4xl px-4 py-8">
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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Settings</h1>
              {isDirty && (
                <Badge variant="secondary">Unsaved changes</Badge>
              )}
            </div>
            <p className="mt-2 text-muted-foreground">
              Configure the platform appearance and behaviour
            </p>
          </motion.div>
        </header>

        <div className="space-y-6">
          {/* Theme Settings */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Visual theme and styling options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {Object.entries(THEME_METADATA).map(([key, meta]) => (
                    <button
                      key={key}
                      onClick={() => setTheme(key as ThemeVariant)}
                      className={`rounded-lg border p-4 text-left transition-colors ${
                        config.theme === key
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="mb-1 font-medium">{meta.name}</div>
                      <div className="text-sm text-muted-foreground">{meta.description}</div>
                      {config.theme === key && (
                        <Badge className="mt-2" variant="default">
                          Active
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Component Settings */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Components</CardTitle>
                <CardDescription>Toggle individual UI features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Animations */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="animations" className="font-medium">
                        Animations
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Enable motion effects throughout the interface
                      </p>
                    </div>
                    <Switch
                      id="animations"
                      checked={config.components.animations.enabled}
                      onCheckedChange={toggleAnimations}
                    />
                  </div>

                  {config.components.animations.enabled && (
                    <div className="ml-6 space-y-2">
                      <Label>Animation Intensity</Label>
                      <Select
                        value={config.components.animations.intensity}
                        onValueChange={(v) => setAnimationIntensity(v as AnimationIntensity)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="subtle">Subtle</SelectItem>
                          <SelectItem value="full">Full</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Guided Tour */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="tour" className="font-medium">
                      Guided Tour
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Show introductory walkthrough for new users
                    </p>
                  </div>
                  <Switch
                    id="tour"
                    checked={config.components.guidedTour.enabled}
                    onCheckedChange={toggleGuidedTour}
                  />
                </div>

                <Separator />

                {/* Reasoning Traces */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reasoning" className="font-medium">
                      Reasoning Traces
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Display AI reasoning in comparison responses
                    </p>
                  </div>
                  <Switch
                    id="reasoning"
                    checked={config.components.reasoning.visible}
                    onCheckedChange={toggleReasoning}
                  />
                </div>

                <Separator />

                {/* Chart Style */}
                <div className="space-y-2">
                  <Label className="font-medium">Chart Rendering</Label>
                  <p className="text-sm text-muted-foreground">
                    Visual style for analytics charts
                  </p>
                  <Select
                    value={config.components.charts.style}
                    onValueChange={(v) => setChartStyle(v as ChartStyle)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recharts">Recharts (Rich)</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Prompt & Experiment Settings */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Research Configuration</CardTitle>
                <CardDescription>Prompt versions and experiment tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Prompt Version */}
                <div className="space-y-3">
                  <Label className="font-medium">System Prompt Version</Label>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {PROMPT_VERSIONS.map((v) => (
                      <button
                        key={v.version}
                        onClick={() => setPromptVersion(v.version)}
                        className={`rounded-lg border p-3 text-left transition-colors ${
                          config.promptVersion === v.version
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <span className="font-mono text-sm">v{v.version}</span>
                          <Badge variant="outline" className="text-xs">
                            {v.label}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">{v.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Experiment Variant */}
                <div className="space-y-2">
                  <Label className="font-medium">Experiment Variant</Label>
                  <p className="text-sm text-muted-foreground">
                    A/B testing variant for analytics tracking
                  </p>
                  <Select
                    value={config.variantId}
                    onValueChange={(v) => setVariant(v as VariantId)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="control">Control</SelectItem>
                      <SelectItem value="treatment_a">Treatment A</SelectItem>
                      <SelectItem value="treatment_b">Treatment B</SelectItem>
                      <SelectItem value="treatment_c">Treatment C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Feature Flags */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
                <CardDescription>Enable experimental features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="rag" className="font-medium">
                      RAG Grounding
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Augment responses with research literature
                    </p>
                  </div>
                  <Switch
                    id="rag"
                    checked={config.features.ragEnabled}
                    onCheckedChange={(v) => toggleFeature('ragEnabled', v)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="avatar" className="font-medium">
                      D-ID Avatars
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Video avatars for response narration
                    </p>
                  </div>
                  <Switch
                    id="avatar"
                    checked={config.features.avatarEnabled}
                    onCheckedChange={(v) => toggleFeature('avatarEnabled', v)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pdf" className="font-medium">
                      PDF Export
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Download comparison results as PDF
                    </p>
                  </div>
                  <Switch
                    id="pdf"
                    checked={config.features.exportPdf}
                    onCheckedChange={(v) => toggleFeature('exportPdf', v)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Import/Export */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Configuration Management</CardTitle>
                <CardDescription>Export, import, or reset configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Export */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={handleExport}>
                      Export Config
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Copy current configuration as JSON
                    </p>
                  </div>
                  {exportData && (
                    <textarea
                      readOnly
                      value={exportData}
                      className="h-32 w-full rounded-md border bg-muted p-3 font-mono text-xs"
                      onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                    />
                  )}
                </div>

                <Separator />

                {/* Import */}
                <div className="space-y-3">
                  <Label>Import Configuration</Label>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Paste JSON configuration here..."
                    className="h-32 w-full rounded-md border bg-background p-3 font-mono text-xs"
                  />
                  {importError && (
                    <p className="text-sm text-destructive">{importError}</p>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleImport}
                    disabled={!importData.trim()}
                  >
                    Import Config
                  </Button>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button variant="destructive" onClick={reset}>
                    Reset to Defaults
                  </Button>
                  <Button onClick={save} disabled={!isDirty}>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>
          Configuration v{config.promptVersion} • Variant: {config.variantId}
        </p>
      </footer>
    </main>
  )
}
