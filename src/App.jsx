import { useLenisScroll } from '@hooks/useLenisScroll'
import Header from '@components/Header/Header'
import HeroSection from '@components/sections/Hero/HeroSection'
import DarkSection from '@components/sections/Dark/DarkSection'
import ShowcaseSection from '@components/sections/Showcase/ShowcaseSection'

export default function App() {
  useLenisScroll()

  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <DarkSection />
        <ShowcaseSection />
        <div className="noise" aria-hidden="true" />
      </main>
    </>
  )
}
