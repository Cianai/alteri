'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

/**
 * Analytics dashboard for researchers.
 *
 * Displays aggregate visualisations of framework comparison data.
 * Currently uses mock data; will integrate with Supabase in future.
 *
 * @module app/research/analytics/page
 */

// Mock data for demonstration
const frameworkPreferences = [
  { name: 'HSI', value: 28, colour: '#3b82f6' },
  { name: 'Constitutional', value: 45, colour: '#f59e0b' },
  { name: 'Hybrid', value: 27, colour: '#8b5cf6' },
]

const scenarioCategories = [
  { name: 'Crisis (Explicit)', hsi: 85, constitutional: 72, hybrid: 78 },
  { name: 'Crisis (Indirect)', hsi: 70, constitutional: 82, hybrid: 76 },
  { name: 'Ambiguous', hsi: 55, constitutional: 78, hybrid: 68 },
  { name: 'Boundary', hsi: 90, constitutional: 65, hybrid: 75 },
  { name: 'Extended', hsi: 60, constitutional: 88, hybrid: 74 },
  { name: 'Information', hsi: 95, constitutional: 70, hybrid: 80 },
]

const responseLengths = [
  { framework: 'HSI', avgWords: 185, avgTokens: 245 },
  { framework: 'Constitutional', avgWords: 312, avgTokens: 418 },
  { framework: 'Hybrid', avgWords: 268, avgTokens: 356 },
]

export default function AnalyticsDashboard() {
  return (
    <main id="main-content" className="min-h-screen bg-background" tabIndex={-1}>
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/research" className="hover:text-foreground">Research</Link>
            <span>/</span>
            <span className="text-foreground">Analytics</span>
          </nav>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Analytics Dashboard
            </h1>
            <p className="mt-2 text-muted-foreground">
              Aggregate data visualisation across participant sessions
            </p>
          </motion.div>
        </header>

        {/* Notice about mock data */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30"
        >
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Note:</strong> This dashboard currently displays illustrative mock data
            for demonstration purposes. Real analytics will be available once the platform
            is deployed with participant data collection.
          </p>
        </motion.div>

        {/* Charts grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Framework preference pie chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Framework Preferences</CardTitle>
                <CardDescription>
                  Which framework resonated most with participants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={frameworkPreferences}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {frameworkPreferences.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.colour} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Response length comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Response Length by Framework</CardTitle>
                <CardDescription>
                  Average words and tokens per response
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={responseLengths}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="framework" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="avgWords" fill="#3b82f6" name="Avg Words" />
                      <Bar dataKey="avgTokens" fill="#8b5cf6" name="Avg Tokens" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Scenario category effectiveness */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle>Framework Effectiveness by Scenario Category</CardTitle>
                <CardDescription>
                  Participant satisfaction scores (0-100) by scenario type and framework
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scenarioCategories} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" domain={[0, 100]} className="text-xs" />
                      <YAxis dataKey="name" type="category" width={120} className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="hsi" fill="#3b82f6" name="HSI" />
                      <Bar dataKey="constitutional" fill="#f59e0b" name="Constitutional" />
                      <Bar dataKey="hybrid" fill="#8b5cf6" name="Hybrid" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Key findings */}
        <motion.section
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Key Observations (Illustrative)</CardTitle>
              <CardDescription>
                Patterns emerging from framework comparison data
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <ul>
                <li>
                  <strong>HSI excels in boundary scenarios:</strong> The containment-first
                  approach shows highest satisfaction when clear limits are needed.
                </li>
                <li>
                  <strong>Constitutional AI preferred for extended conversations:</strong>
                  Character-based engagement resonates more in longer interactions.
                </li>
                <li>
                  <strong>Hybrid shows consistent middle-ground performance:</strong>
                  Rarely the strongest but avoids the weaknesses of either extreme.
                </li>
                <li>
                  <strong>Response length correlates with framework philosophy:</strong>
                  Constitutional AI produces longer, more detailed responses on average.
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.section>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>
          Academic project for RELI E-1730: Mindfulness, AI, and Ethics
          <br />
          Harvard Extension School
        </p>
      </footer>
    </main>
  )
}
