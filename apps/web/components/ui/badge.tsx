import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        // Framework-specific variants
        hsi: 'border-blue-300 bg-blue-50 text-blue-700',
        constitutional: 'border-amber-300 bg-amber-50 text-amber-700',
        hybrid: 'border-violet-300 bg-violet-50 text-violet-700',
        // Category variants
        'crisis-explicit': 'border-red-300 bg-red-50 text-red-700',
        'crisis-indirect': 'border-orange-300 bg-orange-50 text-orange-700',
        ambiguous: 'border-yellow-300 bg-yellow-50 text-yellow-700',
        boundary: 'border-purple-300 bg-purple-50 text-purple-700',
        extended: 'border-indigo-300 bg-indigo-50 text-indigo-700',
        information: 'border-gray-300 bg-gray-50 text-gray-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
