'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  BellRing,
  CalendarClock,
  CircleAlert,
  FlaskConical,
  History,
  Leaf,
  LocateFixed,
  MapPin,
  ScanSearch,
  ShieldCheck,
} from 'lucide-react'
import { useObservation } from '@/components/observation-provider'
import { createClient } from '@/lib/supabase/client'
import { Card, CardTitle, RiskBadge, SampleTag } from '@/components/shared'
import { Button, buttonVariants } from '@/components/ui/button'
import { WeatherCard, type WeatherData } from '@/components/weather-card'
import { getSampleResult } from '@/lib/sample-data'
import { cn } from '@/lib/utils'

const riskColor = { Low: 'text-primary', Moderate: 'text-warning', High: 'text-destructive' }

export function AnalysisView() {
  const { draft } = useObservation()
  const [reminderSet, setReminderSet] = useState(false)
  const [saveState, setSaveState] = useState('')
  const savedDraft = useRef(false)
  const [observationId, setObservationId] = useState<string | null>(null)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)

const handleWeatherChange = useCallback(
  (data: WeatherData | null) => {
    setWeatherData(data)
  },
  []
)
  type Prediction = {
  success: boolean
  crop: string
  disease: string
  confidence: number
  predicted_class: string
  top_predictions: {
    label: string
    confidence: number
  }[]
}

const [prediction, setPrediction] = useState<Prediction | null>(null)
const [predictionLoading, setPredictionLoading] = useState(false)
const [predictionError, setPredictionError] = useState('')

const imageFile = draft?.images?.[0]?.file

useEffect(() => {
  if (!imageFile) return

  const analyzeImage = async () => {
    setPredictionLoading(true)
    setPredictionError('')
    setPrediction(null)

    try {
      const formData = new FormData()
      formData.append('file', imageFile)

      const apiBase = (process.env.NEXT_PUBLIC_MAHARSHI_AI_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
      const response = await fetch(`${apiBase}/predict`, { method: 'POST', body: formData })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.detail || data.message || `AI prediction failed (${response.status})`)
      if (!data.success || !data.disease || !Array.isArray(data.top_predictions)) throw new Error('The AI service returned an unexpected response.')
      setPrediction(data)
    } catch (error) {
      setPredictionError(
        error instanceof Error ? error.message : 'Prediction failed'
      )
    } finally {
      setPredictionLoading(false)
    }
  }

  analyzeImage()
}, [imageFile])


  const crop = draft?.crop ?? 'Tomato'
  const cropAge = draft?.cropAge ?? '52 days'
  const symptoms = draft?.symptoms ?? 'Brown concentric spots on lower leaves'
  const imageSrc = draft?.images[0]?.url ?? '/images/crop-tomato.png'
  const result = getSampleResult(crop)

const diseaseName = prediction?.disease?.toLowerCase() ?? ''

const diseaseRecommendations = diseaseName.includes('septoria')
  ? [
      'Remove infected lower leaves and dispose of them safely.',
      'Avoid overhead irrigation and keep foliage dry.',
      'Maintain proper spacing to improve air circulation.',
      'Remove crop debris after harvest to reduce disease carryover.',
      'Monitor new leaves regularly for dark spots with pale centres.',
    ]
  : diseaseName.includes('early_blight')
    ? [
        'Remove infected leaves and dispose of them away from the field.',
        'Avoid wetting leaves during irrigation.',
        'Apply mulch to reduce soil splash onto lower leaves.',
        'Maintain proper plant spacing and airflow.',
        'Monitor older leaves for concentric ring-shaped spots.',
      ]
    : diseaseName.includes('late_blight')
      ? [
          'Remove and safely dispose of infected plant material.',
          'Avoid overhead watering and prolonged leaf wetness.',
          'Inspect plants frequently during cool, humid weather.',
          'Maintain good airflow between plants.',
          'Seek local agricultural guidance for appropriate disease control.',
        ]
      : diseaseName.includes('bacterial_spot')
        ? [
            'Avoid handling plants while foliage is wet.',
            'Remove severely infected plant material.',
            'Use clean tools and disinfect them between plants.',
            'Avoid overhead irrigation.',
            'Use certified disease-free seeds and transplants.',
          ]
        : diseaseName.includes('healthy')
          ? [
              'Continue regular monitoring of leaves and stems.',
              'Maintain balanced irrigation.',
              'Provide adequate spacing and sunlight.',
              'Remove dead plant debris.',
              'Continue routine crop inspections.',
            ]
          : [
              'Inspect the crop carefully for visible disease symptoms.',
              'Remove severely affected plant material when appropriate.',
              'Avoid overhead irrigation and excessive leaf moisture.',
              'Maintain proper spacing and field sanitation.',
              'Consult a local agricultural expert to confirm the diagnosis.',
            ]

const recommendations = prediction
  ? diseaseRecommendations
  : result.recommendations


const liveRiskScore = (() => {
  if (!prediction || !weatherData) return null

  let score = 0

  // Humidity contribution
  if (weatherData.humidity >= 85) score += 35
  else if (weatherData.humidity >= 70) score += 25
  else if (weatherData.humidity >= 60) score += 15

  // Rainfall contribution
  if (weatherData.rain >= 2) score += 30
  else if (weatherData.rain > 0) score += 20

  // Temperature contribution
  if (weatherData.temperature >= 20 && weatherData.temperature <= 30) {
    score += 20
  } else if (weatherData.temperature >= 15 && weatherData.temperature <= 35) {
    score += 10
  }

  return Math.min(score, 100)
})()

const liveRiskLevel =
  liveRiskScore === null
    ? null
    : liveRiskScore >= 65
      ? 'High'
      : liveRiskScore >= 35
        ? 'Moderate'
        : 'Low'

const liveRiskColor =
  liveRiskLevel === 'High'
    ? 'text-destructive'
    : liveRiskLevel === 'Moderate'
      ? 'text-warning'
      : 'text-primary'


  // Save the observation and private photos once, then retain its row ID.
  useEffect(() => {
    if (!draft || savedDraft.current) return
    savedDraft.current = true
    let cancelled = false

    ;(async () => {
      const uploadedPaths: string[] = []
      try {
        setSaveState('Saving your observation and photos…')
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          setSaveState('Please sign in again to save this observation.')
          return
        }

        for (const [index, photo] of draft.images.entries()) {
          const safeName = photo.name.replace(/[^a-zA-Z0-9._-]/g, '_')
          const path = `${user.id}/${crypto.randomUUID()}-${index}-${safeName}`
          const { error } = await supabase.storage.from('crop-images')
            .upload(path, photo.file, { contentType: photo.file.type, upsert: false })
          if (error) throw new Error(`Photo upload failed: ${error.message}`)
          uploadedPaths.push(path)
        }

        const { data, error } = await supabase.from('observations').insert({
          user_id: user.id,
          crop: draft.crop,
          crop_age: draft.cropAge,
          symptoms: draft.symptoms,
          image_paths: uploadedPaths,
          conversation: draft.messages,
          analysis_status: 'pending',
        }).select('id').single()

        if (error) throw new Error(`Observation save failed: ${error.message}`)
        if (!cancelled) {
          setObservationId(data.id)
          setSaveState('Observation and photos saved. Waiting for AI analysis…')
        }
      } catch (error) {
        if (uploadedPaths.length) {
          await createClient().storage.from('crop-images').remove(uploadedPaths)
        }
        if (!cancelled) setSaveState(error instanceof Error ? error.message : 'Could not save this observation.')
      }
    })()

    return () => { cancelled = true }
  }, [draft])

  // Persist the AI output, and refresh the same row when weather data arrives.
  useEffect(() => {
    if (!observationId || !prediction) return
    let cancelled = false

    ;(async () => {
      try {
        const supabase = createClient()
        const { error } = await supabase.from('observations').update({
          predicted_crop: prediction.crop,
          predicted_disease: prediction.disease,
          prediction_confidence: prediction.confidence,
          predicted_class: prediction.predicted_class,
          top_predictions: prediction.top_predictions,
          risk_score: liveRiskScore,
          risk_level: liveRiskLevel,
          weather_snapshot: weatherData,
          analysis_status: 'completed',
        }).eq('id', observationId)

        if (error) throw new Error(error.message)
        if (!cancelled) setSaveState(liveRiskScore === null
          ? 'Crop photo and AI prediction saved. Risk estimate is waiting for weather data.'
          : 'Observation, AI prediction and weather-based risk saved successfully.')
      } catch (error) {
        if (!cancelled) setSaveState(`AI result save failed: ${error instanceof Error ? error.message : 'Unexpected error'}`)
      }
    })()

    return () => { cancelled = true }
  }, [observationId, prediction, liveRiskScore, liveRiskLevel, weatherData])

  return (
    <div className="flex flex-col gap-6">
      {!draft && (
        <div className="flex items-start gap-3 rounded-2xl border border-dashed border-border bg-muted/50 p-4 text-sm">
          <FlaskConical className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <p className="text-muted-foreground">
            {"You're viewing a sample analysis. "}
            <Link href="/crop-info" className="font-medium text-primary underline underline-offset-4">
              Start a new analysis
            </Link>{' '}
            to see results for your own crop.
          </p>
        </div>
      )}

            {draft && saveState && <p role="status" className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">{saveState}</p>}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="p-0 md:p-0">
          <div className="relative aspect-[4/3] overflow-hidden rounded-t-3xl">
            <Image src={imageSrc} alt={`Photo of ${crop} being analysed`} fill unoptimized={!!draft} sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1.5 text-xs font-semibold backdrop-blur">
              <ScanSearch className="size-3.5 text-primary" aria-hidden="true" /> Analysed photo
            </span>
          </div>
          {draft?.images?.length ? <div className="border-t border-border px-5 pt-3 text-xs text-muted-foreground">{draft.images.length} photos attached to this observation</div> : null}
          <dl className="grid grid-cols-2 gap-4 p-5 md:p-6">
            <div>
              <dt className="text-xs text-muted-foreground">Crop</dt>
              <dd className="font-semibold">{crop}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Planting date / age</dt>
              <dd className="font-semibold">{cropAge}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-muted-foreground">Reported symptoms</dt>
              <dd className="font-medium">{symptoms}</dd>
            </div>
          </dl>
        </Card>

        <div className="flex flex-col gap-6">
          
<Card>
  <CardTitle
    icon={<Leaf />}
    title="Possible Disease"
    aside={
      <SampleTag label={prediction ? 'AI Prediction' : 'Waiting'} />
    }
  />

  <div className="flex flex-col gap-3">
    {predictionLoading ? (
      <p className="text-muted-foreground">
        Analyzing crop image with Maharshi AI...
      </p>
    ) : predictionError ? (
      <p className="text-destructive">{predictionError}</p>
    ) : prediction ? (
      <>
        <h2 className="font-serif text-2xl font-semibold">
          {prediction.disease.replaceAll('_', ' ')}
        </h2>

        <p className="text-sm text-muted-foreground">
          Crop: {prediction.crop}
        </p>

        <p className="text-sm font-semibold">
          AI Confidence: {prediction.confidence}%
        </p>

        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${prediction.confidence}%` }}
          />
        </div>

        <div className="mt-2">
          <p className="mb-2 text-sm font-semibold">
            Other possible predictions
          </p>

          {prediction.top_predictions.map((item) => (
            <div
              key={item.label}
              className="flex justify-between border-b py-2 text-sm"
            >
              <span>{item.label.replaceAll('_', ' ')}</span>
              <span>{item.confidence}%</span>
            </div>
          ))}
        </div>
      </>
    ) : (
      <p className="text-muted-foreground">
        Upload a crop image to start AI disease detection.
      </p>
    )}
  </div>
</Card>

          
<Card>
  <CardTitle icon={<CircleAlert />} title="Disease Risk Level" />

  {liveRiskScore !== null && liveRiskLevel ? (
    <>
      <p className="mb-4 text-xs text-muted-foreground">
        Prototype risk estimate based on AI disease detection
        and live weather conditions.
      </p>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex items-baseline gap-1">
          <span className={cn(
            'font-serif text-6xl font-semibold',
            liveRiskColor
          )}>
            {liveRiskScore}
          </span>
          <span className="text-muted-foreground">/100</span>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <RiskBadge risk={liveRiskLevel} className="w-fit text-sm" />

          <div
            className="relative h-3 w-full rounded-full bg-gradient-to-r from-primary via-warning to-destructive"
            role="meter"
            aria-label="Weather-based disease risk score"
            aria-valuenow={liveRiskScore}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span
              className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-card bg-foreground shadow"
              style={{ left: `${liveRiskScore}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>Low</span>
            <span>Moderate</span>
            <span>High</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Humidity: {weatherData?.humidity}% ·
        Temperature: {weatherData?.temperature}°C ·
        Rainfall: {weatherData?.rain} mm
      </p>
    </>
  ) : (
    <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
      {predictionLoading
        ? 'Waiting for AI disease prediction...'
        : !prediction
          ? 'Upload a crop image and wait for AI disease detection.'
          : 'Waiting for live weather data. Allow browser location access.'}
    </p>
  )}
</Card>

        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardTitle icon={<MapPin />} title="Location" />
            <p className="text-sm leading-relaxed text-muted-foreground">Maharshi requests your browser location to retrieve nearby weather. You can allow or deny this in your browser; weather access is optional.</p>
          </Card>
          <WeatherCard
  showForecast={false}
  onWeatherChange={handleWeatherChange}
/>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardTitle icon={<ShieldCheck />} title="Prevention Recommendations" />
            <ol className="flex flex-col gap-3">
              {recommendations.map((r, i) => (
                <li key={r} className="flex gap-3 rounded-2xl bg-secondary/50 p-4">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                  <p className="leading-relaxed">{r}</p>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/15">
                  <CalendarClock className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm text-primary-foreground/80">Next photo recommended</p>
                  <p className="text-xl font-semibold">Friday, 20 Nov 2026</p>
                  <p className="text-xs text-primary-foreground/75">In 3 days · same spot, same time of day</p>
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => setReminderSet(true)}
                aria-pressed={reminderSet}
                className="h-12 rounded-full bg-primary-foreground px-5 text-base text-primary hover:bg-primary-foreground/90"
              >
                <BellRing aria-hidden="true" /> {reminderSet ? 'Reminder set' : 'Remind me'}
              </Button>
            </div>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/history" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-12 flex-1 rounded-full text-base')}>
              <History aria-hidden="true" /> View History
            </Link>
            <Link href="/crop-info" className={cn(buttonVariants({ size: 'lg' }), 'h-12 flex-1 rounded-full text-base')}>
              <ScanSearch aria-hidden="true" /> New Analysis
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
