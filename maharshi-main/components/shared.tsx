import type { ReactNode } from 'react'
import { FlaskConical } from 'lucide-react'
import type { RiskLevel } from '@/lib/sample-data'
import { cn } from '@/lib/utils'

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between md:pb-10">
      <div className="flex max-w-2xl flex-col gap-3">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="font-serif text-4xl font-medium leading-[1.05] text-balance md:text-5xl">{title}</h1>
        {description && (
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card p-6 shadow-soft md:p-7', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ icon, title, aside }: { icon?: ReactNode; title: string; aside?: ReactNode }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {icon && (
          <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground ring-1 ring-primary/10 [&_svg]:size-[18px]">
            {icon}
          </span>
        )}
        <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
      </div>
      {aside}
    </div>
  )
}

const riskStyles: Record<RiskLevel, string> = {
  Low: 'bg-secondary text-secondary-foreground',
  Moderate: 'bg-accent text-accent-foreground',
  High: 'bg-destructive/12 text-destructive',
}

const riskDot: Record<RiskLevel, string> = {
  Low: 'bg-primary',
  Moderate: 'bg-warning',
  High: 'bg-destructive',
}

export function RiskBadge({ risk, className }: { risk: RiskLevel; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', riskStyles[risk], className)}>
      <span className={cn('size-1.5 rounded-full', riskDot[risk])} aria-hidden="true" />
      {risk} risk
    </span>
  )
}

export function riskBarColor(risk: RiskLevel) {
  return riskDot[risk]
}

export function SampleTag({ label = 'Sample data' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
      <FlaskConical className="size-3" aria-hidden="true" />
      {label}
    </span>
  )
}
