import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CloudSun, ShieldCheck, Smartphone } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const highlights = [
  { icon: ShieldCheck, label: 'Early disease warning' },
  { icon: CloudSun, label: 'Local weather risk' },
  { icon: Smartphone, label: 'Built for mobile' },
]

export function Hero() {
  return (
    <section className="px-4 pt-4 md:px-6 md:pt-6">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl ring-1 ring-black/5">
        <Image
          src="/images/hero-farm.png"
          alt="Lush green farmland in soft morning light"
          fill
          priority
          sizes="(min-width: 1152px) 1152px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.18_0.04_155/0.95)] via-[oklch(0.22_0.045_155/0.6)] to-[oklch(0.22_0.045_155/0.1)] md:bg-gradient-to-r md:via-[oklch(0.22_0.045_155/0.55)] md:to-transparent" />

        <div className="relative flex min-h-[580px] flex-col justify-end gap-7 p-7 text-primary-foreground sm:p-10 md:min-h-[640px] md:justify-center md:p-16">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3.5 py-1.5 text-xs font-medium tracking-wide backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-[oklch(0.85_0.15_130)]" aria-hidden="true" />
            AI + Weather for every field
          </span>
          <h1 className="max-w-2xl font-serif text-5xl font-medium leading-[1.02] text-balance sm:text-6xl md:text-7xl">
            Healthy crops, <em className="font-normal italic text-[oklch(0.88_0.08_130)]">smarter</em> farming.
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-primary-foreground/80 text-pretty md:text-lg">
            Take one photo of your crop. MAHARSHI checks it for signs of disease and combines it with
            your local weather to tell you how high the risk is — and what you can do today to prevent it.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/crop-info"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'group h-13 rounded-full bg-primary-foreground px-7 text-[15px] text-primary shadow-lg shadow-black/10 hover:bg-primary-foreground/95',
              )}
            >
              Start Crop Analysis
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'h-13 rounded-full border-primary-foreground/30 bg-primary-foreground/5 px-7 text-[15px] text-primary-foreground backdrop-blur-sm hover:bg-primary-foreground/15 hover:text-primary-foreground',
              )}
            >
              View Dashboard
            </Link>
          </div>
          <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-3 border-t border-primary-foreground/15 pt-6 text-sm text-primary-foreground/75 md:max-w-xl">
            {highlights.map((h) => (
              <li key={h.label} className="flex items-center gap-2">
                <h.icon className="size-4 text-primary-foreground/90" aria-hidden="true" /> {h.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
