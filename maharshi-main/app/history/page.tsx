'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarClock, ScanLine, Sprout } from 'lucide-react'
import { PageIntro } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

type Observation = { id: string; crop: string; crop_age: string | null; symptoms: string | null; image_paths: string[]; created_at: string; analysis_status: string; predicted_disease: string | null; risk_score: number | null; risk_level: string | null }

export default function HistoryPage() {
  const [items, setItems] = useState<Observation[]>([])
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data, error } = await supabase.from('observations').select('*').order('created_at', { ascending: false })
      if (error) setError(error.message)
      else {
        const rows = (data ?? []) as Observation[]; setItems(rows)
        const signed: Record<string, string> = {}
        for (const row of rows) if (row.image_paths?.[0]) {
          const { data: file } = await supabase.storage.from('crop-images').createSignedUrl(row.image_paths[0], 3600)
          if (file?.signedUrl) signed[row.id] = file.signedUrl
        }
        setUrls(signed)
      }
      setLoading(false)
    }
    load()
  }, [])
  return <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 md:px-6 md:py-14">
    <PageIntro eyebrow="Observation History" title="Your crop timeline" description="Your saved observations and uploaded crop photos, newest first." action={<Link href="/crop-info"><Button size="lg" className="h-12 rounded-full px-6 text-base"><ScanLine/>New Observation</Button></Link>}/>
    {loading ? <p className="text-sm text-muted-foreground">Loading your saved observations…</p> : error ? <p role="alert" className="rounded-2xl bg-muted p-4 text-sm">Could not load history: {error}. Check that the Supabase migration has been run.</p> : items.length === 0 ? <div className="rounded-3xl border border-dashed border-border p-10 text-center"><Sprout className="mx-auto mb-3 size-8 text-primary"/><h2 className="font-semibold">No observations yet</h2><p className="mt-1 text-sm text-muted-foreground">Your real crop observations will appear here after you submit your first photo.</p></div> : <>
      <p className="text-sm text-muted-foreground">{items.length} saved observation{items.length === 1 ? '' : 's'}</p>
      <ol className="relative flex flex-col gap-5">{items.map(item => <li key={item.id}><Link href={`/history/${item.id}`} className="flex gap-4 rounded-3xl border border-border/80 bg-card p-4 transition-colors hover:bg-muted/40 sm:p-5">{urls[item.id] ? <img src={urls[item.id]} alt={`${item.crop} uploaded crop`} className="size-24 shrink-0 rounded-2xl object-cover"/> : <div className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-muted"><Sprout className="size-8 text-primary"/></div>}<div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-semibold">{item.crop}</h2><span className="rounded-full bg-muted px-3 py-1 text-xs">{item.predicted_disease ? `AI: ${item.predicted_disease.replaceAll('_', ' ')}` : item.analysis_status === 'failed' ? 'Analysis failed' : 'Image saved · awaiting result'}</span></div><p className="mt-1 text-xs text-muted-foreground"><time>{new Date(item.created_at).toLocaleString()}</time>{item.crop_age ? ` · ${item.crop_age}` : ''}</p><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.symptoms || 'No symptoms entered'}</p><p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"><span className="flex items-center gap-1"><CalendarClock className="size-3.5"/>{item.image_paths?.length ?? 0} photo(s) saved</span>{item.risk_score != null ? <span>Risk: {item.risk_score}/100 · {item.risk_level}</span> : null}</p></div></Link></li>)}</ol>
    </>}
  </div>
}
