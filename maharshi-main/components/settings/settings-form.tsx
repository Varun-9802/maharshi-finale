'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import { Check, Globe, MapPin, Mic, UserRound } from 'lucide-react'
import { Card, CardTitle } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { languages } from '@/lib/sample-data'
import { cn } from '@/lib/utils'

function Switch({ id, checked, onChange, label }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        checked ? 'bg-primary' : 'bg-input',
      )}
    >
      <span className={cn('size-6 rounded-full bg-card shadow transition-transform', checked ? 'translate-x-7' : 'translate-x-1')} />
    </button>
  )
}

function SettingRow({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4">
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}

const inputClass =
  'h-12 w-full rounded-xl border border-input bg-background px-4 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40'

export function SettingsForm() {
  const [language, setLanguage] = useState('kn')
  const [voice, setVoice] = useState(false)
  const [readAloud, setReadAloud] = useState(true)
  const [location, setLocation] = useState(false)
  const [reminders, setReminders] = useState(true)
  const [saved, setSaved] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardTitle icon={<Globe />} title="Language" />
        <fieldset>
          <legend className="mb-3 text-sm text-muted-foreground">Choose the language for questions and results.</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {languages.map((l) => (
              <label
                key={l.code}
                className={cn(
                  'relative flex cursor-pointer flex-col gap-0.5 rounded-2xl border-2 p-4 transition-colors focus-within:ring-3 focus-within:ring-ring/50',
                  language === l.code ? 'border-primary bg-secondary' : 'border-border hover:border-primary/50',
                )}
              >
                <input type="radio" name="language" value={l.code} checked={language === l.code} onChange={() => setLanguage(l.code)} className="sr-only" />
                <span className="text-lg font-semibold">{l.native}</span>
                <span className="text-xs text-muted-foreground">{l.label}</span>
                {language === l.code && <Check className="absolute right-3 top-3 size-4 text-primary" aria-hidden="true" />}
              </label>
            ))}
          </div>
        </fieldset>
      </Card>

      <Card>
        <CardTitle icon={<Mic />} title="Voice Assistance" />
        <div className="flex flex-col gap-3">
          <SettingRow title="Voice input" description="Speak your answers instead of typing.">
            <Switch id="voice" checked={voice} onChange={setVoice} label="Voice input" />
          </SettingRow>
          <SettingRow title="Read results aloud" description="Hear the analysis in your language.">
            <Switch id="read-aloud" checked={readAloud} onChange={setReadAloud} label="Read results aloud" />
          </SettingRow>
          <p className="text-xs text-muted-foreground">Voice features are a preview and will be connected in the next phase.</p>
        </div>
      </Card>

      <Card>
        <CardTitle icon={<MapPin />} title="Location & Alerts" />
        <div className="flex flex-col gap-3">
          <SettingRow title="Location permission" description={location ? 'Preference enabled · your browser will still ask for permission' : 'Weather only uses your location after browser permission'}>
            <Switch id="location" checked={location} onChange={setLocation} label="Location permission" />
          </SettingRow>
          <SettingRow title="Follow-up reminders" description="Get reminded when the next photo is due.">
            <Switch id="reminders" checked={reminders} onChange={setReminders} label="Follow-up reminders" />
          </SettingRow>
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <CardTitle icon={<UserRound />} title="Farmer Profile" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { id: 'name', label: 'Full name', value: '', type: 'text', auto: 'name' },
            { id: 'phone', label: 'Mobile number', value: '', type: 'tel', auto: 'tel' },
            { id: 'village', label: 'Village', value: '', type: 'text', auto: 'address-level3' },
            { id: 'district', label: 'District, State', value: '', type: 'text', auto: 'address-level2' },
            { id: 'land', label: 'Total land', value: '', type: 'text', auto: 'off' },
          ].map((f) => (
            <div key={f.id} className="flex flex-col gap-1.5">
              <label htmlFor={f.id} className="text-sm font-medium">
                {f.label}
              </label>
              <input id={f.id} name={f.id} type={f.type} defaultValue={f.value} placeholder={`Enter ${f.label.toLowerCase()}`} autoComplete={f.auto} className={inputClass} />
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="main-crop" className="text-sm font-medium">
              Main crop
            </label>
            <select id="main-crop" name="main-crop" defaultValue="Paddy" className={inputClass}>
              {['Paddy', 'Tomato', 'Chilli', 'Cotton', 'Ragi', 'Sugarcane'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {saved && (
            <p role="status" className="flex items-center gap-1.5 text-sm font-medium text-primary">
              <Check className="size-4" aria-hidden="true" /> Settings saved on this screen (not stored yet)
            </p>
          )}
          <Button type="submit" size="lg" className="h-13 w-full rounded-full px-8 text-base sm:h-12 sm:w-auto">
            Save Settings
          </Button>
        </div>
      </Card>
    </form>
  )
}
