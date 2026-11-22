import type { Metadata } from 'next'
import { SettingsForm } from '@/components/settings/settings-form'
import { PageIntro } from '@/components/shared'

export const metadata: Metadata = { title: 'Settings' }

export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:px-6 md:py-14">
      <PageIntro eyebrow="Settings" title="Make MAHARSHI work for you" description="Language, voice, location and your farm profile." />
      <SettingsForm />
    </div>
  )
}
