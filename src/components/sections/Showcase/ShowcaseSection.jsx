import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@animations/gsap.config'
import styles from './ShowcaseSection.module.css'

const SPECS = [
  { label: 'Range',         value: '7,500 NM' },
  { label: 'Speed',         value: '0.92 Mach' },
  { label: 'Passengers',    value: 'Up to 12' },
  { label: 'Endurance',     value: '14 HRS' },
  { label: 'Cabin Length',  value: '14.05 M' },
  { label: 'Max Altitude',  value: '15,544 M' },
]

export default function ShowcaseSection() {
  const sectionRef = useRef(null)
  const leftRef = useRef(null)
  const rightRef = useRef(null)
  const aircraftRef = useRef(null)
  const specsRef = useRef(null)
  const ctaRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          once: true,
        },
      })

      tl.fromTo(
        aircraftRef.current,
        { opacity: 0, scale: 0.88 },
        { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' },
        0
      )
        .fromTo(
          leftRef.current,
          { opacity: 0, x: -60 },
          { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out' },
          0.1
        )
        .fromTo(
          rightRef.current,
          { opacity: 0, x: 60 },
          { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out' },
          0.15
        )
        .fromTo(
          specsRef.current.children,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.07 },
          0.4
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          0.7
        )
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className={styles.showcase} id="story">
      <div className={styles.inner}>

        {/* Left headline */}
        <div ref={leftRef} className={styles.headlineLeft}>
          <p className={styles.kicker}>GULFSTREAM</p>
          <h2 className={styles.headlineText}>
            Engineered
            <br />
            for zero
            <br />
            compromise.
          </h2>
        </div>

        {/* Aircraft placeholder */}
        <div ref={aircraftRef} className={styles.aircraftWrap}>
          <svg className={styles.aircraftSvg} viewBox="0 0 220 480" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Gulfstream G650ER aircraft silhouette">
            {/* Fuselage */}
            <path d="M110 20 C116 20 122 60 124 120 L124 340 C124 380 120 430 110 460 C100 430 96 380 96 340 L96 120 C98 60 104 20 110 20Z" fill="currentColor" opacity="0.18"/>
            {/* Nose */}
            <path d="M110 20 C113 20 118 40 120 70 L100 70 C102 40 107 20 110 20Z" fill="currentColor" opacity="0.28"/>
            {/* Main wings */}
            <path d="M113 180 L200 240 L196 248 L113 196 Z" fill="currentColor" opacity="0.22"/>
            <path d="M107 180 L20 240 L24 248 L107 196 Z" fill="currentColor" opacity="0.22"/>
            {/* Wing leading edge detail */}
            <path d="M113 178 L198 237" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
            <path d="M107 178 L22 237" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
            {/* Tail wings */}
            <path d="M114 340 L158 368 L156 374 L114 350 Z" fill="currentColor" opacity="0.2"/>
            <path d="M106 340 L62 368 L64 374 L106 350 Z" fill="currentColor" opacity="0.2"/>
            {/* Engines */}
            <rect x="148" y="222" width="28" height="10" rx="5" fill="currentColor" opacity="0.3"/>
            <rect x="44" y="222" width="28" height="10" rx="5" fill="currentColor" opacity="0.3"/>
            {/* Fuselage centerline detail */}
            <line x1="110" y1="70" x2="110" y2="420" stroke="currentColor" strokeWidth="0.5" opacity="0.2" strokeDasharray="4 4"/>
            {/* Windows row */}
            <rect x="106" y="140" width="3" height="5" rx="1.5" fill="currentColor" opacity="0.5"/>
            <rect x="106" y="155" width="3" height="5" rx="1.5" fill="currentColor" opacity="0.5"/>
            <rect x="106" y="170" width="3" height="5" rx="1.5" fill="currentColor" opacity="0.5"/>
            <rect x="111" y="140" width="3" height="5" rx="1.5" fill="currentColor" opacity="0.5"/>
            <rect x="111" y="155" width="3" height="5" rx="1.5" fill="currentColor" opacity="0.5"/>
            <rect x="111" y="170" width="3" height="5" rx="1.5" fill="currentColor" opacity="0.5"/>
          </svg>
        </div>

        {/* Right model label */}
        <div ref={rightRef} className={styles.headlineRight}>
          <p className={styles.modelNumber}>G650ER</p>
          <p className={styles.modelCategory}>Ultra-long-range<br />Aircraft</p>
          <p className={styles.modelDesc}>
            At 92% of the speed of sound, the G650ER brings
            any two cities on earth within a single flight.
            Silence has never moved this fast.
          </p>
        </div>

      </div>

      {/* Divider */}
      <div className={styles.divider} />

      {/* Spec grid */}
      <div ref={specsRef} className={styles.specs}>
        {SPECS.map(({ label, value }) => (
          <div key={label} className={styles.specItem}>
            <span className={styles.specLabel}>{label}</span>
            <span className={styles.specValue}>{value}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div ref={ctaRef} className={styles.ctaWrap}>
        <a className={styles.cta} href="#contact">
          <span>Book a private consultation</span>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <path d="M4 11h14M11 4l7 7-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </section>
  )
}
