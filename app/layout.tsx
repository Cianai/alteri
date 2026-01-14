import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

/**
 * Viewport configuration for responsive behaviour.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
}

/**
 * Root metadata for the application.
 * Defines SEO-relevant information and social sharing previews.
 */
export const metadata: Metadata = {
  title: 'AI Alignment Comparator',
  description: 'Compare Microsoft HSI, Anthropic Constitutional AI, and hybrid approaches to mental health AI alignment. Academic project for RELI E-1730.',
  keywords: ['AI alignment', 'mental health', 'Constitutional AI', 'HSI', 'ethics'],
  authors: [{ name: 'Cian O\'Sullivan' }],
  openGraph: {
    title: 'AI Alignment Comparator',
    description: 'Interactive comparison of AI alignment frameworks for mental health contexts',
    type: 'website',
  },
}

/**
 * Root layout component wrapping all pages.
 * Provides consistent styling and metadata across the application.
 *
 * @param children - Child components to render within the layout
 * @returns Root HTML structure with global styles applied
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
