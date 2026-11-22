import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Camera, CloudRain, ShieldPlus, Sprout, MessageCircle, BellRing } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: Camera,
    title: 'AI Image Analysis',
    body: 'Upload one clear photo of a leaf or plant. The system looks for visible signs such as spots, yellowing or curling.',
  },
  {
    icon: CloudRain,
    title: 'Local Weather Monitoring',
    body: 'Temperature, humidity and rainfall around your field are used to judge whether conditions favour disease.',
  },
  {
    icon: ShieldPlus,
    title: 'Disease Prevention',
    body: 'Get simple, practical steps to protect your crop — before a small problem becomes a big loss.',
  },
]

const steps = [
  { icon: MessageCircle, title: 'Tell us about your crop', body: 'Crop name, age and what you see.' },
  { icon: Camera, title: 'Add one photo', body: 'A clear close-up of the affected part.' },
  { icon: CloudRain, title: 'Weather is checked', body: 'Local conditions are matched with risk.' },
  { icon: BellRing, title: 'Follow up', body: 'Get a reminder for your next photo.' },
]

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="font-serif text-4xl font-medium leading-[1.08] text-balance md:text-5xl">{title}</h2>
      {description && <p className="text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">{description}</p>}
    </div>
  )
}

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 pt-24 md:px-6 md:pt-32">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="What MAHARSHI does"
          title="Three simple helpers for a healthier harvest"
        />
        <p className="max-w-sm text-base leading-relaxed text-muted-foreground md:pb-2">
          Photo analysis and weather data work together, so you get a warning you can actually act on.
        </p>
      </div>
      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-soft md:grid-cols-3">
        {features.map((f, i) => (
          <article key={f.title} className="group flex flex-col gap-5 bg-card p-8 transition-colors hover:bg-secondary/40 md:p-9">
            <div className="flex items-center justify-between">
              <span className="flex size-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground ring-1 ring-primary/10">
                <f.icon className="size-6" aria-hidden="true" />
              </span>
              <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
            </div>
            <h3 className="mt-4 text-xl font-semibold tracking-tight">{f.title}</h3>
            <p className="leading-relaxed text-muted-foreground">{f.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-24 md:px-6 md:pt-32">
      <div className="relative overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground sm:p-12 md:p-16">
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-[oklch(0.6_0.12_140/0.35)] blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-xl flex-col gap-4">
            <p className="eyebrow text-primary-foreground/70">How it works</p>
            <h2 className="font-serif text-4xl font-medium leading-[1.08] text-balance md:text-5xl">
              From photo to prevention in four steps
            </h2>
          </div>
          <Link
            href="/crop-info"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'group h-12 w-fit rounded-full bg-primary-foreground px-6 text-[15px] text-primary hover:bg-primary-foreground/95',
            )}
          >
            Try it now <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
        <ol className="relative mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="flex flex-col gap-4 rounded-2xl border border-primary-foreground/10 bg-primary-foreground/[0.06] p-6 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary-foreground text-primary">
                  <s.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="font-serif text-2xl italic text-primary-foreground/40">0{i + 1}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-semibold tracking-tight">{s.title}</h3>
                <p className="text-sm leading-relaxed text-primary-foreground/70">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function About() {
  return (
    <section id="about" className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-24 md:grid-cols-2 md:gap-20 md:px-6 md:pt-32">
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-soft ring-1 ring-black/5 sm:aspect-[4/3] md:aspect-[4/5]">
        <Image
          src="/images/farmer-phone.png"
          alt="A farmer photographing a crop leaf with a smartphone"
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-xl border border-white/40 bg-card/90 p-4 shadow-lg backdrop-blur-md">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sprout className="size-5" aria-hidden="true" />
          </span>
          <p className="text-sm font-medium leading-snug">Designed for mobile phones, in your own language.</p>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <SectionHeading eyebrow="About the project" title="Weather-Aware Crop Health Monitoring" />
        <div className="flex flex-col gap-4 text-base leading-relaxed text-muted-foreground">
          <p>
            Many crop diseases spread fastest during specific weather — warm, humid days or long spells of
            drizzle. MAHARSHI is a college mini-project that brings together crop photos and local weather to
            give farmers an early, easy-to-understand warning.
          </p>
          <p>
            {"Your account, observation storage, photo uploads and local weather are connected. Crop disease predictions are still demonstration results until a trained image model and validated weather-risk rules are integrated."}
          </p>
        </div>
        <dl className="mt-2 grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card shadow-soft">
          {[
            { k: '6', v: 'Languages' },
            { k: '8', v: 'Photos per check' },
            { k: '3–4', v: 'Days to follow up' },
          ].map((s) => (
            <div key={s.v} className="flex flex-col-reverse gap-1 p-5">
              <dt className="text-xs text-muted-foreground">{s.v}</dt>
              <dd className="font-serif text-3xl font-medium text-primary md:text-4xl">{s.k}</dd>
            </div>
          ))}
        </dl>
        <Link href="/crop-info" className="group inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primary">
          Start your first check
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
