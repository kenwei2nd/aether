import { useEffect, useRef } from 'react'
import useHeroProgress from '@store/useHeroProgress'
import { readOverlayState } from '@animations/heroTimeline'
import styles from './HeroSection.module.css'

const clamp01 = (v) => Math.min(1, Math.max(0, v))

export default function HeroCopy() {
  const heroRef    = useRef(null)
  const taglineRef = useRef(null)
  const ctaRef     = useRef(null)
  const sideRef    = useRef(null)

  useEffect(() => {
    const state = {
      p:  useHeroProgress.getState().progress,
      ep: useHeroProgress.getState().epilogueProgress,
    }

    const apply = () => {
      const { p, ep } = state
      const { copy } = readOverlayState(p)
      if (heroRef.current)    heroRef.current.style.opacity    = String(copy.heroOpacity)
      if (taglineRef.current) taglineRef.current.style.opacity = String(copy.taglineOpacity)
      if (sideRef.current)    sideRef.current.style.opacity    = String(copy.heroOpacity)
      if (ctaRef.current) {
        const exitT = clamp01((ep - 0.60) / 0.22)
        ctaRef.current.style.opacity   = String(copy.ctaOpacity * (1 - exitT))
        ctaRef.current.style.transform = `translateY(${exitT * 24}px)`
      }
    }

    apply()
    return useHeroProgress.subscribe((s) => {
      state.p  = s.progress
      state.ep = s.epilogueProgress
      apply()
    })
  }, [])

  return (
    <>
      {/* Main centered copy */}
      <div ref={heroRef} className={styles.heroCopy}>
        <span className={styles.brandMark}>AETHER</span>
        <h1 className={styles.headline}>
          Quiet
          <br />
          altitude.
        </h1>
      </div>

      <p ref={taglineRef} className={styles.tagline}>
        A jet engineered around stillness.
      </p>

      <a ref={ctaRef} className={styles.cta} href="#story">
        <span>Begin the journey</span>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path d="M4 11h14M11 4l7 7-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>

      {/* Left-side hero words — fades with hero copy */}
      <div ref={sideRef} className={styles.heroSide} aria-hidden="true">
        <p className={styles.heroSideLabel}>PRIVATE AVIATION</p>
        <p className={styles.heroSideText}>
          Your freedom<br />to enjoy life.
        </p>
        <div className={styles.heroSideLine} />
        <p className={styles.heroSideDesc}>
          Every flight is designed around your comfort,<br />
          time, and ambitions.
        </p>
      </div>
    </>
  )
}
