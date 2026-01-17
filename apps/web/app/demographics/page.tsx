'use client'

import dynamic from 'next/dynamic'
import { demographicsSurvey } from '@/components/survey/schemas/demographics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Dynamic import to avoid SSR issues with SurveyJS
const SurveyWrapper = dynamic(
  () => import('@/components/survey/survey-wrapper').then((mod) => mod.SurveyWrapper),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-card">
        <div className="text-muted-foreground">Loading survey...</div>
      </div>
    ),
  }
)

/**
 * Demographics survey demo page.
 *
 * This page demonstrates the SurveyJS integration with framework theming.
 * In the full participant flow, this would be accessed after consent
 * and before network elicitation.
 */
export default function DemographicsPage() {
  const handleComplete = (data: Record<string, unknown>) => {
    // In production, this would save to Supabase and advance the XState machine
    alert(`Survey completed!\n\nData collected:\n${JSON.stringify(data, null, 2).slice(0, 500)}...\n\nIn production, this would save to Supabase and proceed to network elicitation.`)
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Button>
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Demographics Survey Demo</CardTitle>
          <CardDescription>
            This demonstrates the SurveyJS integration with the alignment-comparator design system.
            The survey uses our custom theming with framework colours available.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-2">
            <span className="inline-block rounded bg-hsi-100 px-2 py-1 text-xs text-hsi-700">
              HSI Theme Available
            </span>
            <span className="inline-block rounded bg-constitutional-100 px-2 py-1 text-xs text-constitutional-700">
              Constitutional Theme Available
            </span>
            <span className="inline-block rounded bg-hybrid-100 px-2 py-1 text-xs text-hybrid-700">
              Hybrid Theme Available
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Currently using neutral theme. Pass <code className="rounded bg-muted px-1">frameworkTheme=&quot;hsi&quot;</code> to apply framework colours.
          </p>
        </CardContent>
      </Card>

      <SurveyWrapper
        surveyJson={demographicsSurvey}
        frameworkTheme="neutral"
        onComplete={handleComplete}
        autoSaveKey="demographics-demo"
        className="rounded-lg border bg-card p-4"
      />

      <div className="mt-8 rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
        <p>
          <strong>Session Flow Preview:</strong> consent → <span className="text-foreground font-medium">demographics</span> → network-elicitation → comparison → reflection → results
        </p>
      </div>
    </main>
  )
}
