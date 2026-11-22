import type { Metadata } from 'next'
import { CropChat } from '@/components/crop-info/crop-chat'
import { PageIntro } from '@/components/shared'

export const metadata: Metadata = { title: 'Crop Information' }

export default async function CropInfoPage({ searchParams }: { searchParams: Promise<{ continue?: string }> }) {
  const params = await searchParams
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:px-6 md:py-14">
      <PageIntro
        eyebrow="New Analysis"
        title="Tell us about your crop"
        description="Answer a few simple questions and add one photo. It takes less than a minute."
      />
      <CropChat continueId={params.continue ?? null} />
    </div>
  )
}
