import { useEffect, useRef } from 'react'
import useHeroProgress from '@store/useHeroProgress'
import { readOverlayState } from '@animations/heroTimeline'
import styles from './HeroSection.module.css'

export default function HeroCopy() {
  const heroRef = useRef(null)
  const taglineRef = useRef(null)
  const ctaRef = useRef(null)

  useEffect(() => {
    const apply = (p) => {
      const { copy } = readOverlayState(p)
      if (heroRef.current) heroRef.current.style.opacity = String(copy.heroOpacity)
      if (taglineRef.current) taglineRef.current.style.opacity = String(copy.taglineOpacity)
      if (ctaRef.current) ctaRef.current.style.opacity = String(copy.ctaOpacity)
    }
    let last = useHeroProgress.getState().progress
    apply(last)
    return useHeroProgress.subscribe((s) => {
      if (s.progress === last) return
      last = s.progress
      apply(last)
    })
  }, [])

  return (
    <>
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
    </>
  )
}
