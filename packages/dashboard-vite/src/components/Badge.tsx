import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'

import { cn } from '../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[10px] font-semibold rounded-md',
  {
    variants: {
      variant: {
        gold: 'bg-[color:var(--color-warning)] text-[color:var(--color-background)] mmtx-glow-yellow',
        muted: 'bg-[color:var(--color-surface-2)] text-[color:var(--color-muted-foreground)]',
        success: 'bg-[color:var(--color-success)] text-[color:var(--color-background)]',
        destructive: 'bg-[color:var(--color-destructive)] text-[color:var(--color-destructive-foreground)]',
        outline: 'border border-[color:var(--color-border-strong)] text-[color:var(--color-foreground)]',
      },
    },
    defaultVariants: { variant: 'muted' },
  },
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />
}
