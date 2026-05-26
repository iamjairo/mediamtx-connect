import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

import { cn } from '../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-[color:var(--color-brand)] text-[color:var(--color-brand-foreground)] hover:opacity-95 mmtx-glow-blue',
        secondary:
          'bg-[color:var(--color-surface-2)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-accent)]',
        ghost:
          'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-accent)]',
        outline:
          'border border-[color:var(--color-border-strong)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-accent)]',
        destructive:
          'bg-[color:var(--color-destructive)] text-[color:var(--color-destructive-foreground)] hover:opacity-95',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-11 px-6',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { buttonVariants }
