'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  useConfig,
  THEME_METADATA,
  PROMPT_VERSIONS,
  type ThemeVariant,
  type AnimationIntensity,
  type ChartStyle,
} from '@/lib/config'

/**
 * Floating version switcher panel for testing different configurations.
 *
 * Provides quick access to:
 * - Theme switching
 * - Component toggles
 * - Prompt version selection
 * - Feature flags
 *
 * @module components/version-switcher
 */

interface VersionSwitcherProps {
  /** Whether the panel starts open */
  defaultOpen?: boolean
  /** Position on screen */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

export function VersionSwitcher({
  defaultOpen = false,
  position = 'bottom-right',
}: VersionSwitcherProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const {
    config,
    isDirty,
    setTheme,
    setPromptVersion,
    toggleAnimations,
    setAnimationIntensity,
    toggleGuidedTour,
    toggleReasoning,
    setChartStyle,
    toggleFeature,
    save,
    reset,
  } = useConfig()

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="mb-2"
          >
            <Card className="w-80 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Configuration</CardTitle>
                  {isDirty && (
                    <Badge variant="secondary" className="text-xs">
                      Unsaved
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs">
                  Test different frontend variants
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="theme" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="theme" className="text-xs">
                      Theme
                    </TabsTrigger>
                    <TabsTrigger value="components" className="text-xs">
                      Components
                    </TabsTrigger>
                    <TabsTrigger value="features" className="text-xs">
                      Features
                    </TabsTrigger>
                  </TabsList>

                  {/* Theme Tab */}
                  <TabsContent value="theme" className="space-y-3 pt-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Visual Theme</Label>
                      <Select
                        value={config.theme}
                        onValueChange={(value) => setTheme(value as ThemeVariant)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(THEME_METADATA).map(([key, meta]) => (
                            <SelectItem key={key} value={key} className="text-xs">
                              <span className="font-medium">{meta.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {THEME_METADATA[config.theme].description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Prompt Version</Label>
                      <Select
                        value={config.promptVersion}
                        onValueChange={setPromptVersion}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PROMPT_VERSIONS.map((v) => (
                            <SelectItem key={v.version} value={v.version} className="text-xs">
                              v{v.version} - {v.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  {/* Components Tab */}
                  <TabsContent value="components" className="space-y-3 pt-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="animations" className="text-xs">
                        Animations
                      </Label>
                      <Switch
                        id="animations"
                        checked={config.components.animations.enabled}
                        onCheckedChange={toggleAnimations}
                      />
                    </div>

                    {config.components.animations.enabled && (
                      <div className="space-y-1 pl-4">
                        <Label className="text-xs text-muted-foreground">Intensity</Label>
                        <Select
                          value={config.components.animations.intensity}
                          onValueChange={(v) => setAnimationIntensity(v as AnimationIntensity)}
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="subtle" className="text-xs">
                              Subtle
                            </SelectItem>
                            <SelectItem value="full" className="text-xs">
                              Full
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Label htmlFor="tour" className="text-xs">
                        Guided Tour
                      </Label>
                      <Switch
                        id="tour"
                        checked={config.components.guidedTour.enabled}
                        onCheckedChange={toggleGuidedTour}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="reasoning" className="text-xs">
                        Show Reasoning
                      </Label>
                      <Switch
                        id="reasoning"
                        checked={config.components.reasoning.visible}
                        onCheckedChange={toggleReasoning}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Chart Style</Label>
                      <Select
                        value={config.components.charts.style}
                        onValueChange={(v) => setChartStyle(v as ChartStyle)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recharts" className="text-xs">
                            Recharts (Full)
                          </SelectItem>
                          <SelectItem value="minimal" className="text-xs">
                            Minimal
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  {/* Features Tab */}
                  <TabsContent value="features" className="space-y-3 pt-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="rag" className="text-xs">
                          RAG Grounding
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Research literature context
                        </p>
                      </div>
                      <Switch
                        id="rag"
                        checked={config.features.ragEnabled}
                        onCheckedChange={(v) => toggleFeature('ragEnabled', v)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="avatar" className="text-xs">
                          D-ID Avatars
                        </Label>
                        <p className="text-xs text-muted-foreground">Video responses</p>
                      </div>
                      <Switch
                        id="avatar"
                        checked={config.features.avatarEnabled}
                        onCheckedChange={(v) => toggleFeature('avatarEnabled', v)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="pdf" className="text-xs">
                          PDF Export
                        </Label>
                        <p className="text-xs text-muted-foreground">Download results</p>
                      </div>
                      <Switch
                        id="pdf"
                        checked={config.features.exportPdf}
                        onCheckedChange={(v) => toggleFeature('exportPdf', v)}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Actions */}
                <div className="flex gap-2 border-t pt-3">
                  <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={reset}>
                    Reset
                  </Button>
                  <Button size="sm" className="flex-1 text-xs" onClick={save} disabled={!isDirty}>
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <Button
        variant={isOpen ? 'default' : 'outline'}
        size="icon"
        className="h-10 w-10 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close configuration panel' : 'Open configuration panel'}
      >
        <span className="text-lg" role="img" aria-hidden="true">
          ⚙️
        </span>
      </Button>
    </div>
  )
}
