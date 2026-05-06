import { useLenisScroll } from '@hooks/useLenisScroll'
import HeroSection from '@components/sections/Hero/HeroSection'

export default function App() {
  useLenisScroll()

  return (
    <main>
      <HeroSection />
      <section
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: 'var(--paper)',
          color: 'var(--ink)',
        }}
      >
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>
          Next section — your story continues here.
        </p>
      </section>
    </main>
  )
}
