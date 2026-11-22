'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { ArrowRight, Camera, Check, ImagePlus, Mic, RotateCcw, Send, Sprout, Upload, User } from 'lucide-react'
import { useObservation, type DraftImage } from '@/components/observation-provider'
import { Card } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { commonSymptoms } from '@/lib/sample-data'
import { cn } from '@/lib/utils'

type Message = { from: 'bot' | 'user'; text: string; image?: string }
type Answers = { crop: string; cropAge: string; symptoms: string }

const steps = [
  {
    key: 'crop' as const,
    question: 'Namaskara! Which crop would you like to check today? You can type any crop name.',
    placeholder: 'e.g. Tomato, Paddy, Ragi…',
    chips: ['Tomato', 'Paddy', 'Chilli', 'Cotton', 'Ragi', 'Sugarcane'],
    label: 'Crop',
  },
  {
    key: 'cropAge' as const,
    question: 'When did you plant it? You can share the planting date or the crop age.',
    placeholder: 'e.g. 45 days, or 2 October',
    chips: ['Less than 30 days', '30–60 days', '60–90 days', 'More than 90 days'],
    label: 'Planting date / age',
  },
  {
    key: 'symptoms' as const,
    question: 'What do you see on the plant? Describe any spots, colour change or damage.',
    placeholder: 'Describe the symptoms…',
    chips: commonSymptoms,
    label: 'Visible symptoms',
  },
]

const photoQuestion = 'Thank you. Now upload one or more clear photos of the affected leaf or plant.'
const MAX_FILE_BYTES = 10 * 1024 * 1024

export function CropChat() {
  const router = useRouter()
  const { setDraft } = useObservation()
  const [messages, setMessages] = useState<Message[]>([{ from: 'bot', text: steps[0].question }])
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({ crop: '', cropAge: '', symptoms: '' })
  const [input, setInput] = useState('')
  const [images, setImages] = useState<DraftImage[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [voiceNote, setVoiceNote] = useState(false)
  const [dragging, setDragging] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  const onPhotoStep = step === steps.length
  const current = steps[step]

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, images])

  function answer(value: string) {
    const text = value.trim()
    if (!text || onPhotoStep) return
    const nextAnswers = { ...answers, [current.key]: text }
    setAnswers(nextAnswers)
    const next = step + 1
    const botText = next < steps.length ? steps[next].question : photoQuestion
    setMessages((m) => [...m, { from: 'user', text }, { from: 'bot', text: botText }])
    setStep(next)
    setInput('')
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    answer(input)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
  }

  function handleFiles(files: FileList | File[] | undefined) {
    if (!files?.length) return
    const accepted: DraftImage[] = []
    const errors: string[] = []
    for (const file of Array.from(files)) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { errors.push(`${file.name}: use JPG, PNG or WEBP`); continue }
      if (file.size > MAX_FILE_BYTES) { errors.push(`${file.name}: larger than 10 MB`); continue }
      accepted.push({ url: URL.createObjectURL(file), name: file.name, file })
    }
    if (accepted.length) {
      const remaining = Math.max(0, 8 - images.length)
      if (accepted.length > remaining) {
        accepted.slice(remaining).forEach((item) => URL.revokeObjectURL(item.url))
        setUploadError('You can add up to 8 photos per observation.')
      }
      setImages([...images, ...accepted.slice(0, remaining)])
    }
    if (errors.length) setUploadError(`${errors.join('; ')}. Use JPG, PNG or WEBP images under 10 MB.`)
  }

  function removeImage(index: number) {
    setImages((current) => {
      const removed = current[index]
      if (removed) URL.revokeObjectURL(removed.url)
      return current.filter((_, i) => i !== index)
    })
  }

  function analyse() {
    if (!images.length) return
    setDraft({ ...answers, images, messages })
    router.push('/analysis')
  }

  function restart() {
    images.forEach((item) => URL.revokeObjectURL(item.url))
    setImages([])
    setAnswers({ crop: '', cropAge: '', symptoms: '' })
    setStep(0)
    setInput('')
    setUploadError(null)
    setMessages([{ from: 'bot', text: steps[0].question }])
  }

  const progress = Math.round(((step + (images.length ? 1 : 0)) / (steps.length + 1)) * 100)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="flex h-[calc(100dvh-6.5rem)] min-h-[480px] flex-col overflow-hidden p-0 md:p-0 lg:h-[680px]">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Sprout className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold leading-tight">Maharshi Assistant</p>
              <p className="text-xs text-muted-foreground">
                Step {Math.min(step + 1, steps.length + 1)} of {steps.length + 1}
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={restart} className="h-11 shrink-0 rounded-full px-4">
            <RotateCcw aria-hidden="true" /> Restart
          </Button>
        </div>

        <div className="h-1 w-full bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-3 py-5 sm:px-4 md:px-6 md:py-6" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={cn('flex items-end gap-2.5', m.from === 'user' && 'flex-row-reverse')}>
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full',
                  m.from === 'bot' ? 'bg-secondary text-secondary-foreground' : 'bg-accent text-accent-foreground',
                )}
                aria-hidden="true"
              >
                {m.from === 'bot' ? <Sprout className="size-4" /> : <User className="size-4" />}
              </span>
              <p
                className={cn(
                  'max-w-[85%] rounded-3xl px-4 py-3 text-[15px] leading-relaxed sm:max-w-[80%]',
                  m.from === 'bot'
                    ? 'rounded-bl-md bg-muted text-foreground'
                    : 'rounded-br-md bg-primary text-primary-foreground',
                )}
              >
                <span className="sr-only">{m.from === 'bot' ? 'Assistant: ' : 'You: '}</span>
                {m.text}
              </p>
            </div>
          ))}

          {onPhotoStep && (
            <div className="flex flex-col gap-3 sm:ml-10">
              {images.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map((item, index) => (
                    <div key={`${item.name}-${index}`} className="relative overflow-hidden rounded-2xl border border-border">
                      <Image src={item.url} alt={`Uploaded photo ${index + 1} of ${answers.crop}`} width={320} height={320} unoptimized className="aspect-square w-full object-cover" />
                      <button type="button" onClick={() => removeImage(index)} aria-label={`Remove ${item.name}`} className="absolute right-2 top-2 rounded-full bg-card px-2 py-1 text-xs font-semibold shadow">Remove</button>
                      <p className="truncate px-2 py-1 text-xs text-muted-foreground">{item.name}</p>
                    </div>
                  ))}
                  <label htmlFor="crop-photo-add" className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/40 text-sm font-medium text-primary"><ImagePlus className="size-6"/>Add photos<input id="crop-photo-add" type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { handleFiles(e.target.files ?? undefined); e.currentTarget.value = '' }} /></label>
                </div>
              ) : (
                <>
                <div className="flex flex-col gap-3 sm:hidden">
                  <label
                    htmlFor="crop-photo-camera"
                    className="flex min-h-16 cursor-pointer items-center gap-4 rounded-2xl bg-primary px-5 py-4 text-primary-foreground shadow-sm focus-within:ring-3 focus-within:ring-ring/50 active:scale-[0.99]"
                  >
                    <Camera className="size-6 shrink-0" aria-hidden="true" />
                    <span className="flex flex-col">
                      <span className="font-semibold">Take a photo</span>
                      <span className="text-xs text-primary-foreground/80">Opens your phone camera</span>
                    </span>
                    <input
                      id="crop-photo-camera"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="sr-only"
                      onChange={(e) => { handleFiles(e.target.files ?? undefined); e.currentTarget.value = '' }}
                    />
                  </label>
                  <label
                    htmlFor="crop-photo-gallery"
                    className="flex min-h-16 cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-border bg-muted/40 px-5 py-4 focus-within:ring-3 focus-within:ring-ring/50 active:bg-secondary/60"
                  >
                    <ImagePlus className="size-6 shrink-0 text-primary" aria-hidden="true" />
                    <span className="flex flex-col">
                      <span className="font-semibold">Choose from gallery</span>
                      <span className="text-xs text-muted-foreground">Up to 8 photos, 10 MB each</span>
                    </span>
                    <input
                      id="crop-photo-gallery"
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={(e) => { handleFiles(e.target.files ?? undefined); e.currentTarget.value = '' }}
                    />
                  </label>
                </div>
                <label
                  htmlFor="crop-photo"
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragging(true)
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragging(false)
                    handleFiles(e.dataTransfer.files)
                  }}
                  className={cn(
                    'hidden cursor-pointer flex-col items-center gap-3 rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-colors focus-within:ring-3 focus-within:ring-ring/50 sm:flex',
                    dragging ? 'border-primary bg-secondary' : 'border-border bg-muted/40 hover:border-primary/60 hover:bg-secondary/50',
                  )}
                >
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-card text-primary shadow-sm">
                    <ImagePlus className="size-7" aria-hidden="true" />
                  </span>
                  <span className="font-semibold">Click to upload or drag a photo here</span>
                  <span className="text-sm text-muted-foreground">Up to 8 photos · JPG, PNG or WebP · 10 MB each</span>
                  <input
                    id="crop-photo"
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={(e) => { handleFiles(e.target.files ?? undefined); e.currentTarget.value = '' }}
                  />
                </label>
                </>
              )}
              {uploadError && (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {uploadError}
                </p>
              )}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-border bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 md:p-5">
          {!onPhotoStep ? (
            <>
              <div
                className="-mx-3 mb-3 flex snap-x gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden"
                role="group"
                aria-label="Quick answers"
              >
                {current.chips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => answer(chip)}
                    className="min-h-11 shrink-0 snap-start whitespace-nowrap rounded-full border border-border bg-card px-4 text-sm font-medium transition-colors hover:border-primary hover:bg-secondary active:bg-secondary"
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <label htmlFor="chat-input" className="sr-only">
                  {current.label}
                </label>
                <input
                  id="chat-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={current.placeholder}
                  autoComplete="off"
                  enterKeyHint="send"
                  className="h-12 min-w-0 flex-1 rounded-full border border-input bg-background px-4 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 sm:h-13 sm:px-5"
                />
                <button
                  type="button"
                  onClick={() => setVoiceNote((v) => !v)}
                  aria-pressed={voiceNote}
                  aria-label="Voice input (preview)"
                  className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-muted sm:size-13"
                >
                  <Mic className="size-5" aria-hidden="true" />
                </button>
                <Button type="submit" disabled={!input.trim()} className="size-12 shrink-0 rounded-full sm:size-13" aria-label="Send answer">
                  <Send className="size-5" aria-hidden="true" />
                </Button>
              </form>
              {voiceNote && (
                <p className="mt-2 text-xs text-muted-foreground" role="status">
                  Voice input is shown as a preview. Speech recognition is not connected yet.
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
              <Button
                variant="outline"
                size="lg"
                className="h-13 rounded-full px-6 text-base"
                onClick={() => {
                  images.forEach((item) => URL.revokeObjectURL(item.url))
                  setImages([])
                }}
                disabled={!images.length}
              >
                <Upload aria-hidden="true" />
                Change photo
              </Button>
              <Button size="lg" className="h-13 flex-1 rounded-full px-6 text-base" onClick={analyse} disabled={!images.length}>
                Analyse My Crop <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>
      </Card>

      <aside className="flex flex-col gap-4">
        <Card>
          <h2 className="mb-4 font-semibold">Your observation</h2>
          <ol className="flex flex-col gap-4">
            {[...steps.map((s) => ({ label: s.label, value: answers[s.key] })), { label: 'Crop photos', value: images.length ? `${images.length} added` : '' }].map(
              (item, i) => (
                <li key={item.label} className="flex items-start gap-3">
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                      item.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {item.value ? <Check className="size-3.5" aria-hidden="true" /> : i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="truncate text-sm font-medium">{item.value || '—'}</p>
                  </div>
                </li>
              ),
            )}
          </ol>
        </Card>
        <Card className="bg-secondary/60">
          <h2 className="mb-2 font-semibold">Photo tips</h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-4 text-sm text-muted-foreground">
            <li>Take the photo in daylight, without flash.</li>
            <li>Keep the affected leaf in focus and fill the frame.</li>
            <li>Use the same spot for follow-up photos.</li>
          </ul>
        </Card>
      </aside>
    </div>
  )
}
