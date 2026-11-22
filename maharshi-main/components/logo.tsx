import Link from 'next/link'
import { Sprout } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link
      href="/"
      className={cn('flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50', className)}
      aria-label="Maharshi home"
    >
      <span
        className={cn(
          'flex size-10 items-center justify-center rounded-xl',
          inverted ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground',
        )}
      >
        <Sprout className="size-5" aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-xl font-semibold tracking-tight">MAHARSHI</span>
        <span className={cn('text-[11px] font-medium', inverted ? 'text-primary-foreground/75' : 'text-muted-foreground')}>
          Smart Crop Health Assistant
        </span>
      </span>
    </Link>
  )
}
