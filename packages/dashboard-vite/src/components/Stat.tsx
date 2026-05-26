import type { LucideIcon } from 'lucide-react'

import { cn } from '../lib/utils'
import { Card } from './Card'

export interface StatProps {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  icon?: LucideIcon
  hue?: 'yellow' | 'green' | 'orange' | 'pink' | 'blue' | 'purple'
  className?: string
}

const hueClasses: Record<NonNullable<StatProps['hue']>, string> = {
  yellow: 'bg-[color:var(--color-hue-yellow)] text-[color:var(--color-background)]',
  green: 'bg-[color:var(--color-hue-green)] text-[color:var(--color-background)]',
  orange: 'bg-[color:var(--color-hue-orange)] text-[color:var(--color-background)]',
  pink: 'bg-[color:var(--color-hue-pink)] text-[color:var(--color-background)]',
  blue: 'bg-[color:var(--color-hue-blue)] text-[color:var(--color-background)]',
  purple: 'bg-[color:var(--color-hue-purple)] text-[color:var(--color-background)]',
}

export function Stat({ label, value, hint, icon: Icon, hue = 'blue', className }: StatProps) {
  return (
    <Card className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-muted-foreground)]">
          {label}
        </p>
        {Icon && (
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', hueClasses[hue])}>
            <Icon className="h-4 w-4" strokeWidth={2.4} />
          </span>
        )}
      </div>
      <div className="text-3xl font-semibold tracking-tight">{value}</div>
      {hint && <p className="text-xs text-[color:var(--color-muted-foreground)]">{hint}</p>}
    </Card>
  )
}
