import { useLenisScroll } from '@hooks/useLenisScroll'
import HeroSection from '@components/sections/Hero/HeroSection'
import DarkSection from '@components/sections/Dark/DarkSection'
import ShowcaseSection from '@components/sections/Showcase/ShowcaseSection'

export default function App() {
  useLenisScroll()

  return (
    <main>
      <HeroSection />
      <DarkSection />
      <ShowcaseSection />
    </main>
  )
}
