import Link from 'next/link'
import { Logo } from '@/components/logo'
import { navItems } from '@/lib/nav'

export function SiteFooter() {
  return (
    <footer className="mt-28 bg-[oklch(0.27_0.05_155)] text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-[1.6fr_1fr_1fr] md:px-6 md:py-20">
        <div className="flex flex-col gap-5">
          <Logo inverted />
          <p className="max-w-sm text-sm leading-relaxed text-primary-foreground/70">
            A college mini-project on weather-based crop disease prediction, designed to help farmers
            notice risks early and take preventive action.
          </p>
        </div>
        <div>
          <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground/50">Explore</h2>
          <ul className="flex flex-col gap-3 text-sm">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-primary-foreground/85 transition-colors hover:text-primary-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground/50">Project</h2>
          <ul className="flex flex-col gap-3 text-sm leading-relaxed text-primary-foreground/85">
            <li>Weather Based Crop Disease Prediction</li>
            <li>Artificial Intelligence with Data science department</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-primary-foreground/55 md:px-6">
          {'© 2026 MAHARSHI. Predictions are indicative only and do not replace advice from agricultural experts.'}
        </p>
      </div>
    </footer>
  )
}
