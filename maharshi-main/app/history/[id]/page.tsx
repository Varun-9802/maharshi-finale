import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CalendarClock, Sprout } from 'lucide-react'
import { Card, CardTitle, PageIntro } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

export default async function ObservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: item, error } = await supabase.from('observations').select('*').eq('id', id).single()
  if (error || !item) notFound()
  const imageUrls: string[] = []
  for (const path of item.image_paths ?? []) {
    const { data } = await supabase.storage.from('crop-images').createSignedUrl(path, 3600)
    if (data?.signedUrl) imageUrls.push(data.signedUrl)
  }
  return <div className="mx-auto flex max-w-4xl flex-col gap-7 px-4 py-10 md:px-6 md:py-14">
    <Link href="/history" className="inline-flex items-center gap-2 text-sm font-medium text-primary"><ArrowLeft className="size-4"/>Back to history</Link>
    <PageIntro eyebrow="Saved Observation" title={`${item.crop} observation`} description={`Saved ${new Date(item.created_at).toLocaleString()}`}/>
    <Card><CardTitle icon={<Sprout/>} title="Your crop details"/><dl className="grid gap-4 sm:grid-cols-2"><div><dt className="text-xs text-muted-foreground">Crop age / planting date</dt><dd className="font-medium">{item.crop_age || 'Not provided'}</dd></div><div><dt className="text-xs text-muted-foreground">Status</dt><dd className="font-medium">{item.analysis_status === 'completed' ? 'Analysis completed' : 'Photos saved · AI model connection pending'}</dd></div><div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">Symptoms reported</dt><dd className="font-medium">{item.symptoms || 'Not provided'}</dd></div></dl></Card>
    <Card><CardTitle icon={<Sprout/>} title="Previous conversation"/>{Array.isArray(item.conversation) && item.conversation.length ? <ol className="flex flex-col gap-3">{item.conversation.map((message: {from: string; text: string}, index: number) => <li key={index} className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm ${message.from === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}><span className="mb-1 block text-[10px] font-semibold uppercase opacity-70">{message.from === 'user' ? 'You' : 'Maharshi Assistant'}</span>{message.text}</li>)}</ol> : <p className="text-sm text-muted-foreground">No conversation transcript was stored for this observation.</p>}</Card>
    <Card><CardTitle icon={<CalendarClock/>} title={`Uploaded photos (${imageUrls.length})`}/>{imageUrls.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{imageUrls.map((url, index) => <img key={url} src={url} alt={`${item.crop} photo ${index + 1}`} className="aspect-square w-full rounded-2xl object-cover"/>)}</div> : <p className="text-sm text-muted-foreground">No photo previews are available.</p>}</Card>
    <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">This record stores your crop details and original photos. A connected disease-recognition model is not included in this project yet, so no AI diagnosis or risk score is stored for this observation.</p>
    <Link href="/crop-info"><Button className="h-12 rounded-full"><Sprout/>Start another observation</Button></Link>
  </div>
}
