import type { Metadata } from 'next'
import Link from 'next/link'
import { Activity, ScanLine, Sprout } from 'lucide-react'
import { Card, CardTitle, PageIntro } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { WeatherCard } from '@/components/weather-card'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Farmer Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { count } = await supabase.from('observations').select('*', { count: 'exact', head: true })
  const { data: recent } = await supabase.from('observations').select('id,crop,crop_age,created_at,analysis_status').order('created_at', { ascending: false }).limit(5)
  return <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 md:px-6 md:py-16">
    <PageIntro eyebrow="Farmer Dashboard" title={`Namaskara${user?.email ? `, ${user.email.split('@')[0]}` : ''}`} description="Your saved crop observations and local weather, in one place." action={<Link href="/crop-info"><Button size="lg" className="h-12 rounded-full px-6"><ScanLine/>New Crop Analysis</Button></Link>}/>
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      <Card><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Saved observations</p><Activity className="size-4 text-primary"/></div><p className="mt-4 font-serif text-4xl">{count ?? 0}</p></Card>
      <Card><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Account</p><Sprout className="size-4 text-primary"/></div><p className="mt-4 truncate text-sm font-semibold">{user?.email}</p><p className="mt-1 text-xs text-muted-foreground">Signed in securely</p></Card>
      <Card className="col-span-2 lg:col-span-1"><p className="text-sm text-muted-foreground">Disease model status</p><p className="mt-4 text-lg font-semibold">38-class model included</p><p className="mt-1 text-xs text-muted-foreground">Start the local Python API to enable image predictions.</p></Card>
    </section>
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <Card><CardTitle icon={<Sprout/>} title="Recent observations" aside={<Link href="/history" className="text-sm font-medium text-primary hover:underline">View history</Link>}/>
        {!recent?.length ? <div className="py-8 text-center"><p className="font-medium">No observations saved yet</p><p className="mt-1 text-sm text-muted-foreground">Upload your first crop photos to start your timeline.</p></div> : <ul className="divide-y divide-border">{recent.map(item => <li key={item.id} className="flex items-center justify-between gap-3 py-3"><div><p className="font-semibold">{item.crop}</p><p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()} · {item.crop_age || 'Age not entered'}</p></div><span className="rounded-full bg-muted px-3 py-1 text-xs">{item.analysis_status === 'completed' ? 'Analysed' : 'Saved'}</span></li>)}</ul>}
      </Card>
      <WeatherCard/>
    </div>
  </div>
}
