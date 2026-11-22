'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, ScanLine, X } from 'lucide-react'
import { Logo } from '@/components/logo'
import { buttonVariants } from '@/components/ui/button'
import { navItems } from '@/lib/nav'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(!!session?.user))
    return () => listener.subscription.unsubscribe()
  }, [])
  async function signOut() { await createClient().auth.signOut(); location.assign('/login') }

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-0.5 rounded-full border border-border bg-card/70 p-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={cn(
                'rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {signedIn ? <button type="button" onClick={signOut} className="hidden rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted sm:inline-flex">Sign out</button> : <Link href="/login" className="rounded-full border border-border px-4 py-2 text-xs font-medium hover:bg-muted">Sign in</Link>}
          <Link
            href="/crop-info"
            className={cn(buttonVariants({ size: 'lg' }), 'hidden h-10 rounded-full px-5 text-[13px] sm:inline-flex')}
          >
            <ScanLine aria-hidden="true" />
            Start Analysis
          </Link>
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full border border-border bg-card lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-border bg-background px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden"
        >
          <ul className="flex flex-col gap-1 pt-3">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium',
                    isActive(item.href) ? 'bg-secondary text-secondary-foreground' : 'text-foreground hover:bg-muted',
                  )}
                >
                  <item.icon className="size-5" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/crop-info"
            onClick={() => setOpen(false)}
            className={cn(buttonVariants({ size: 'lg' }), 'mt-3 h-13 w-full rounded-full text-base sm:hidden')}
          >
            <ScanLine aria-hidden="true" />
            Start Analysis
          </Link>
          {signedIn && <button type="button" onClick={signOut} className="mt-2 flex h-12 w-full items-center justify-center rounded-full border border-border text-sm font-medium sm:hidden">Sign out</button>}
        </nav>
      )}
    </header>
  )
}
