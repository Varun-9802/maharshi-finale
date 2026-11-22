import { Hero } from '@/components/home/hero'
import { About, Features, HowItWorks } from '@/components/home/sections'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <About />
    </>
  )
}
