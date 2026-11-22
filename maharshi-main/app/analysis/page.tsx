import type { Metadata } from 'next'
import { AnalysisView } from '@/components/analysis/analysis-view'
import { PageIntro } from '@/components/shared'

export const metadata: Metadata = { title: 'Image Analysis' }

export default function AnalysisPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:px-6 md:py-14">
      <PageIntro
        eyebrow="Image Analysis"
        title="Your crop health report"
        description="Review your uploaded crop photos and live local weather. Disease-model integration is not connected yet."
      />
      <AnalysisView />
    </div>
  )
}
