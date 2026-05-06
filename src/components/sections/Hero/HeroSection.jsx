import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@animations/gsap.config'
import useHeroProgress from '@store/useHeroProgress'
import { useReducedMotion } from '@hooks/useReducedMotion'
import { heroFrameManifest } from './frameManifest'

import FrameCanvas from './FrameCanvas'
import FrameLoader from './FrameLoader'
import HeroCopy from './HeroCopy'
import ScrollHint from './ScrollHint'

import styles from './HeroSection.module.css'

export default function HeroSection() {
  const sectionRef = useRef(null)
  const canvasApiRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!sectionRef.current) return
    if (reduced) {
      useHeroProgress.setState({ progress: 1 })
      canvasApiRef.current?.setProgress(1)
      return
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=400%',
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress
          useHeroProgress.setState({ progress: p })
          canvasApiRef.current?.setProgress(p)
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

      <ScrollHint />
      <FrameLoader />
    </section>
  )
}
