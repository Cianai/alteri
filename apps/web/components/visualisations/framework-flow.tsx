'use client'

import * as React from 'react'
import { motion } from 'framer-motion'

/**
 * Animated framework comparison visualisation.
 *
 * Displays the three frameworks as connected nodes with
 * animated paths showing relationships and distinctions.
 *
 * Inspired by vibecode network visualisation patterns.
 *
 * @module components/visualisations/framework-flow
 */

interface FrameworkNode {
  id: string
  name: string
  shortName: string
  x: number
  y: number
  colour: string
  principles: string[]
}

const frameworks: FrameworkNode[] = [
  {
    id: 'hsi',
    name: 'HSI',
    shortName: 'Containment',
    x: 100,
    y: 150,
    colour: '#3b82f6',
    principles: ['Domain boundaries', 'Human oversight', 'Tool positioning'],
  },
  {
    id: 'constitutional',
    name: 'Constitutional',
    shortName: 'Character',
    x: 300,
    y: 150,
    colour: '#f59e0b',
    principles: ['Internalised values', 'Genuine engagement', 'Anti-sycophancy'],
  },
  {
    id: 'hybrid',
    name: 'Hybrid',
    shortName: 'Synthesis',
    x: 200,
    y: 50,
    colour: '#8b5cf6',
    principles: ['Bounded authenticity', 'Calibrated deference', 'Robust safety'],
  },
]

const connections = [
  { from: 'hsi', to: 'hybrid', label: 'Containment principles' },
  { from: 'constitutional', to: 'hybrid', label: 'Character training' },
  { from: 'hsi', to: 'constitutional', label: 'Different approaches', dashed: true },
]

interface FrameworkFlowProps {
  selectedFramework?: string
  onFrameworkSelect?: (id: string) => void
  showLabels?: boolean
  className?: string
}

export function FrameworkFlow({
  selectedFramework,
  onFrameworkSelect,
  showLabels = true,
  className,
}: FrameworkFlowProps) {
  const [hoveredNode, setHoveredNode] = React.useState<string | null>(null)
  const [animationPhase, setAnimationPhase] = React.useState(0)

  // Animate connection flow
  React.useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const getNodeById = (id: string) => frameworks.find((f) => f.id === id)

  const isHighlighted = (id: string) => {
    if (selectedFramework) return id === selectedFramework
    if (hoveredNode) return id === hoveredNode
    return true
  }

  return (
    <div className={`relative ${className ?? ''}`}>
      <svg
        viewBox="0 0 400 200"
        className="h-full w-full"
        aria-label="Framework relationship diagram"
      >
        {/* Definitions */}
        <defs>
          {/* Animated gradient for flow */}
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop
              offset={`${animationPhase}%`}
              stopColor="hsl(var(--primary))"
              stopOpacity="0.2"
            />
            <stop
              offset={`${(animationPhase + 20) % 100}%`}
              stopColor="hsl(var(--primary))"
              stopOpacity="0.8"
            />
            <stop
              offset={`${(animationPhase + 40) % 100}%`}
              stopColor="hsl(var(--primary))"
              stopOpacity="0.2"
            />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connections */}
        {connections.map((conn, index) => {
          const from = getNodeById(conn.from)
          const to = getNodeById(conn.to)
          if (!from || !to) return null

          const midX = (from.x + to.x) / 2
          const midY = (from.y + to.y) / 2 - 20

          // Curved path
          const d = `M${from.x},${from.y} Q${midX},${midY} ${to.x},${to.y}`

          const isActive = isHighlighted(from.id) || isHighlighted(to.id)

          return (
            <g key={index}>
              <motion.path
                d={d}
                fill="none"
                stroke={conn.dashed ? 'hsl(var(--muted-foreground))' : 'url(#flowGradient)'}
                strokeWidth={isActive ? 2 : 1}
                strokeDasharray={conn.dashed ? '4 4' : undefined}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: isActive ? 1 : 0.3 }}
                transition={{ duration: 1, delay: index * 0.2 }}
              />
              {showLabels && (
                <text
                  x={midX}
                  y={midY - 8}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[8px]"
                  opacity={isActive ? 1 : 0.5}
                >
                  {conn.label}
                </text>
              )}
            </g>
          )
        })}

        {/* Nodes */}
        {frameworks.map((framework, index) => {
          const highlighted = isHighlighted(framework.id)
          const isSelected = selectedFramework === framework.id

          return (
            <motion.g
              key={framework.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: highlighted ? 1 : 0.9,
                opacity: highlighted ? 1 : 0.5,
              }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              style={{ transformOrigin: `${framework.x}px ${framework.y}px` }}
              onMouseEnter={() => setHoveredNode(framework.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => onFrameworkSelect?.(framework.id)}
              className="cursor-pointer"
            >
              {/* Node circle */}
              <circle
                cx={framework.x}
                cy={framework.y}
                r={isSelected ? 32 : 28}
                fill={framework.colour}
                opacity={0.15}
                filter={isSelected ? 'url(#glow)' : undefined}
              />
              <circle
                cx={framework.x}
                cy={framework.y}
                r={isSelected ? 28 : 24}
                fill="hsl(var(--background))"
                stroke={framework.colour}
                strokeWidth={isSelected ? 3 : 2}
              />

              {/* Node label */}
              <text
                x={framework.x}
                y={framework.y - 4}
                textAnchor="middle"
                className="fill-foreground text-[10px] font-semibold"
              >
                {framework.name}
              </text>
              <text
                x={framework.x}
                y={framework.y + 8}
                textAnchor="middle"
                className="fill-muted-foreground text-[7px]"
              >
                {framework.shortName}
              </text>
            </motion.g>
          )
        })}
      </svg>

      {/* Selected framework details */}
      {selectedFramework && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-lg border p-4"
        >
          {(() => {
            const selected = getNodeById(selectedFramework)
            if (!selected) return null
            return (
              <>
                <h4
                  className="mb-2 font-semibold"
                  style={{ color: selected.colour }}
                >
                  {selected.name} Principles
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {selected.principles.map((principle, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: selected.colour }}
                      />
                      {principle}
                    </li>
                  ))}
                </ul>
              </>
            )
          })()}
        </motion.div>
      )}
    </div>
  )
}
