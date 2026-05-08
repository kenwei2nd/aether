import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@animations/gsap.config'
import useHeroProgress from '@store/useHeroProgress'
import { useReducedMotion } from '@hooks/useReducedMotion'
import { heroFrameManifest } from './frameManifest'

import FrameCanvas from './FrameCanvas'
import FrameLoader from './FrameLoader'
import HeroCopy from './HeroCopy'
import EpilogueCopy from './EpilogueCopy'
import ScrollHint from './ScrollHint'

import styles from './HeroSection.module.css'

const FRAME_PHASE = 2 / 3
const EPILOGUE_PHASE = 1 / 3
const clamp01 = (v) => Math.min(1, Math.max(0, v))

export default function HeroSection() {
  const sectionRef = useRef(null)
  const canvasApiRef = useRef(null)
  const gradientRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!sectionRef.current) return
    if (reduced) {
      useHeroProgress.setState({ progress: 1, epilogueProgress: 1 })
      canvasApiRef.current?.setProgress(1)
      if (gradientRef.current) gradientRef.current.style.opacity = '1'
      return
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=600%',
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const raw = self.progress
          const frameP = clamp01(raw / FRAME_PHASE)
          const epilogueP = clamp01((raw - FRAME_PHASE) / EPILOGUE_PHASE)
          useHeroProgress.setState({ progress: frameP, epilogueProgress: epilogueP })
          canvasApiRef.current?.setProgress(frameP)
          if (gradientRef.current) {
            gradientRef.current.style.opacity = String(clamp01((epilogueP - 0.3) / 0.55))
          }
        },
      })
    }, sectionRef)

    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 80)

    return () => {
      clearTimeout(refreshTimer)
      ctx.revert()
    }
  }, [reduced])

  return (
    <section ref={sectionRef} className={styles.hero} aria-label="AETHER hero">
      <FrameCanvas ref={canvasApiRef} manifest={heroFrameManifest} />

      <div className={styles.copyLayer}>
        <HeroCopy />
      </div>

      <EpilogueCopy />
      <div ref={gradientRef} className={styles.bottomGradient} />

      <ScrollHint />
      <FrameLoader />
    </section>
  )
}
