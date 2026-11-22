'use client'

import { useEffect, useState } from 'react'
import { CloudDrizzle, CloudSun, Droplets, MapPin, Thermometer, Wind } from 'lucide-react'
import { Card, CardTitle } from '@/components/shared'
import { cn } from '@/lib/utils'

export type WeatherData = { temperature: number; humidity: number; rain: number; wind: number; location: string; updated: string; forecast: { day: string; temp: number; rain: number }[] }

export function WeatherCard({
  className,
  showForecast = true,
  onWeatherChange,
}: {
  className?: string
  showForecast?: boolean
  onWeatherChange?: (weather: WeatherData | null) => void
}) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [status, setStatus] = useState('Requesting your location…')

  useEffect(() => {
    if (!navigator.geolocation) { setStatus('Location is not supported by this browser.'); return }
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const params = new URLSearchParams({ latitude: String(coords.latitude), longitude: String(coords.longitude), current: 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m', daily: 'temperature_2m_max,precipitation_probability_max', forecast_days: '5', timezone: 'auto' })
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
        if (!response.ok) throw new Error('Weather service unavailable')
        const data = await response.json()
        const [lat, lon] = [coords.latitude.toFixed(2), coords.longitude.toFixed(2)]
        setWeather({ temperature: Math.round(data.current.temperature_2m), humidity: Math.round(data.current.relative_humidity_2m), rain: Number(data.current.precipitation), wind: Math.round(data.current.wind_speed_10m), location: `Your location (${lat}, ${lon})`, updated: new Date(data.current.time).toLocaleString(), forecast: data.daily.time.map((day: string, i: number) => ({ day: new Date(day).toLocaleDateString(undefined, { weekday: 'short' }), temp: Math.round(data.daily.temperature_2m_max[i]), rain: Math.round(data.daily.precipitation_probability_max[i] ?? 0) })) })
        setStatus('Live weather · Open-Meteo')
      } catch { setStatus('Could not load live weather. Please try again later.') }
    }, () => setStatus('Location permission denied. Allow location access to see local weather.'), { timeout: 10000, maximumAge: 10 * 60 * 1000 })
  }, [])
  useEffect(() => {
  onWeatherChange?.(weather)
}, [weather, onWeatherChange])

  const stats = weather ? [
    { icon: Thermometer, label: 'Temperature', value: `${weather.temperature}°C`, hint: 'Current' },
    { icon: Droplets, label: 'Humidity', value: `${weather.humidity}%`, hint: 'Relative humidity' },
    { icon: CloudDrizzle, label: 'Rainfall', value: `${weather.rain} mm`, hint: 'Current period' },
  ] : []

  return <Card className={className}>
    <CardTitle icon={<CloudSun />} title="Local Weather" />
    {weather ? <>
      <div className="flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-br from-secondary to-muted p-4"><div><p className="flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="size-3.5"/>{weather.location}</p><p className="mt-1 font-serif text-5xl font-semibold tracking-tight">{weather.temperature}°</p><p className="text-sm font-medium">Live conditions</p></div><CloudDrizzle className="size-16 text-primary/70"/></div>
      <dl className="mt-4 grid grid-cols-3 gap-3">{stats.map(s => <div key={s.label} className="rounded-2xl border border-border p-3"><dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><s.icon className="size-3.5"/>{s.label}</dt><dd className="mt-1 text-lg font-semibold">{s.value}</dd><dd className="text-[11px] text-muted-foreground">{s.hint}</dd></div>)}</dl>
      {showForecast && <div className="mt-4"><p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Wind className="size-3.5"/>5-day outlook · chance of rain</p><ul className="grid grid-cols-5 gap-2">{weather.forecast.map(d => <li key={d.day} className="flex flex-col items-center gap-1 rounded-xl bg-muted py-2.5 text-center"><span className="text-xs text-muted-foreground">{d.day}</span><span className="text-sm font-semibold">{d.temp}°</span><span className={cn('text-[11px] font-medium', d.rain >= 40 ? 'text-chart-5' : 'text-muted-foreground')}>{d.rain}%</span></li>)}</ul></div>}
    </> : <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground" role="status">{status}</p>}
    <p className="mt-4 text-[11px] text-muted-foreground">{weather ? `${status} · Updated ${weather.updated}` : 'Weather data is not available until location permission is granted.'}</p>
  </Card>
}
