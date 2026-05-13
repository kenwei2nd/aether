import { useEffect, useRef } from 'react'
import { gsap } from '@animations/gsap.config'
import styles from './ShowcaseSection.module.css'

/* ── Spec data ───────────────────────────────────────────────── */
const OVERVIEW = [
  { label: 'Maximum operating range', value: '7,500 NM' },
  { label: 'Speed',                   value: '0.92 Mach' },
  { label: 'Passenger capacity',      value: 'Up to 12 seats' },
  { label: 'Endurance',               value: '14 hrs' },
  { label: 'Baggage capacity',        value: '5.52 m³' },
  { label: 'Cruising altitude',       value: '51,000 ft' },
]

const SPECS = [
  { label: 'Cabin length', value: '14.05 m' },
  { label: 'Cabin width',  value: '2.49 m'  },
  { label: 'Cabin height', value: '1.92 m'  },
]

/* ── Feature zones ───────────────────────────────────────────── */
/* zoom: how the blueprint pans to highlight the zone.
   line: 3 pts in 0-100 SVG coordinate space (% of viewport).
   All line/zoom values are approximate — tune visually.         */
const ZONES = [
  {
    id: 'cabin',
    eyebrow: 'Passenger Cabin',
    stat: '12 Guests',
    body: 'A bespoke cabin appointed for up to twelve, with hand-stitched leather, dedicated attendant, and a pressurised cabin altitude of 4,800 ft.',
    calloutSide: 'left',                           // callout left, plane shifts right
    zoom: { x: '20vw', y: '8vh',  scale: 1.4 },  // cabin = upper-mid fuselage
    line: { x1: 27, y1: 44, xM: 42, yM: 44, x2: 53, y2: 38 },
  },
  {
    id: 'engines',
    eyebrow: 'Propulsion',
    stat: '0.92 Mach',
    body: 'Twin Rolls-Royce BR725 engines deliver 16,900 lbf of thrust each — silence moving at 92% of the speed of sound.',
    calloutSide: 'right',                          // callout right, plane shifts left
    zoom: { x: '-20vw', y: '-42vh', scale: 1.5 }, // engines = rear fuselage
    line: { x1: 73, y1: 54, xM: 58, yM: 54, x2: 47, y2: 60 },
  },
  {
    id: 'wing',
    eyebrow: 'Wing & Range',
    stat: '7,500 NM',
    body: 'Carbon-composite wings carry 20,000 kg of fuel — enough to link any two cities on earth in a single non-stop flight.',
    calloutSide: 'left',                           // callout left, plane shifts right
    zoom: { x: '22vw', y: '2vh',  scale: 1.6 },  // wing = mid-plane, extends left
    line: { x1: 27, y1: 52, xM: 36, yM: 52, x2: 42, y2: 56 },
  },
]

/* ── Char helper ─────────────────────────────────────────────── */
function renderChars(text) {
  return text.split('').map((char, i) => (
    <span key={i} className={styles.char}>{char === ' ' ? ' ' : char}</span>
  ))
}

/* ── Component ───────────────────────────────────────────────── */
export default function ShowcaseSection() {
  const sectionRef     = useRef(null)
  const stageRef       = useRef(null)
  const titleSlideRef  = useRef(null)
  const specSlideRef   = useRef(null)
  const flyInRef       = useRef(null)
  const luxuryRef      = useRef(null)
  const subtitleRef    = useRef(null)
  const brandRef       = useRef(null)
  const descRef        = useRef(null)
  const planeWrapRef   = useRef(null)
  const planeRenderRef = useRef(null)
  const planeBpRef     = useRef(null)
  const specLeftRef    = useRef(null)
  const specRightRef   = useRef(null)
  const zoneRefs       = useRef([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      /* Initial states */
      gsap.set(planeWrapRef.current,  { xPercent: -50, yPercent: -50, y: '110vh' })
      gsap.set(planeBpRef.current,    { opacity: 0 })
      gsap.set(specSlideRef.current,  { opacity: 0 })
      gsap.set(titleSlideRef.current, { opacity: 0 })
      zoneRefs.current.forEach(el => el && gsap.set(el, { opacity: 0 }))

      /* CSS sticky handles pinning — timeline scrubs across full section */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end:   'bottom bottom',
          scrub: 1.6,
        },
      })

      /* Snap titleSlide visible when sticky kicks in */
      tl.to(titleSlideRef.current, { opacity: 1, ease: 'none', duration: 0.01 }, 0)

      /* ── Phase 0 — Char reveals ─────────────────────────────── */
      const flyChars = flyInRef.current?.querySelectorAll(`.${styles.char}`)
      const luxChars = luxuryRef.current?.querySelectorAll(`.${styles.char}`)
      if (flyChars?.length) {
        tl.fromTo(flyChars,
          { yPercent: 100, opacity: 0 },
          { yPercent: 0, opacity: 1, stagger: 0.04, ease: 'power3.out', duration: 1.2 }, 0)
      }
      if (luxChars?.length) {
        tl.fromTo(luxChars,
          { yPercent: 100, opacity: 0 },
          { yPercent: 0, opacity: 1, stagger: 0.04, ease: 'power3.out', duration: 1.2 }, 0.18)
      }

      tl.fromTo(
        [subtitleRef.current, brandRef.current, descRef.current],
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, ease: 'power2.out', duration: 0.9, stagger: 0.16 }, 0.6)

      /* ── Phase 1 — Plane rises + shrinks (pre-pin start) ─────── */
      tl.to(planeWrapRef.current,
        { y: '0vh', scale: 0.38, ease: 'power2.out', duration: 2.8 }, 0)

      /* ── Phase 2 — Render → Blueprint crossfade ─────────────── */
      tl.to(planeRenderRef.current, { opacity: 0, ease: 'power2.inOut', duration: 1.0 }, 3.5)
      tl.to(planeBpRef.current,     { opacity: 1, ease: 'power2.inOut', duration: 1.0 }, 3.5)

      /* ── Phase 3 — Title slide exits ────────────────────────── */
      tl.to(titleSlideRef.current, { opacity: 0, ease: 'power2.in', duration: 1.0 }, 4.2)

      /* ── Phase 4 — Spec slide reveals ───────────────────────── */
      tl.to(specSlideRef.current, { opacity: 1, ease: 'power2.out', duration: 0.8 }, 5.1)
      const leftRows  = specLeftRef.current  ? Array.from(specLeftRef.current.children)  : []
      const rightRows = specRightRef.current ? Array.from(specRightRef.current.children) : []
      if (leftRows.length)  tl.fromTo(leftRows,  { opacity: 0, x: -36 }, { opacity: 1, x: 0, ease: 'power2.out', stagger: 0.07, duration: 0.7 }, 5.3)
      if (rightRows.length) tl.fromTo(rightRows, { opacity: 0, x: 36  }, { opacity: 1, x: 0, ease: 'power2.out', stagger: 0.09, duration: 0.7 }, 5.3)

      /* ── Phases 5-7 — Feature zone zoom-ins ─────────────────── */
      const ZONE_SPACING = 2.4

      ZONES.forEach((zone, i) => {
        const start = 7.2 + i * ZONE_SPACING

        // Spec slide fades out before first zone
        if (i === 0) {
          tl.to(specSlideRef.current, { opacity: 0, ease: 'power2.in', duration: 0.7 }, start - 0.8)
        }

        // Blueprint zooms + plane shifts to expose the zone
        tl.to(planeWrapRef.current, {
          x: zone.zoom.x, y: zone.zoom.y, scale: zone.zoom.scale,
          ease: 'power2.inOut', duration: 1.3,
        }, start)

        // Zone callout + annotation line appear
        tl.to(zoneRefs.current[i], {
          opacity: 1, ease: 'power2.out', duration: 0.7,
        }, start + 0.6)

        // Zone callout exits before next zone transitions
        tl.to(zoneRefs.current[i], {
          opacity: 0, ease: 'power2.in', duration: 0.5,
        }, start + ZONE_SPACING - 0.6)
      })

      /* ── Phase 8 — Zoom back out to spec state ───────────────── */
      const returnStart = 7.2 + ZONES.length * ZONE_SPACING
      tl.to(planeWrapRef.current,
        { x: 0, y: '0vh', scale: 0.38, ease: 'power2.inOut', duration: 1.4 }, returnStart)
      tl.to(specSlideRef.current,
        { opacity: 1, ease: 'power2.out', duration: 0.8 }, returnStart + 0.9)
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className={styles.showcase} id="aircraft">
      <div ref={stageRef} className={styles.stage}>

        {/* ── View 1 — Title ──────────────────────────────────── */}
        <div ref={titleSlideRef} className={styles.titleSlide}>
          <div className={styles.titleRow}>
            <h1 ref={flyInRef} className={styles.headLeft} aria-label="Fly in">
              {renderChars('Fly in')}
            </h1>
            <div className={styles.titleDivider} aria-hidden="true" />
            <h1 ref={luxuryRef} className={styles.headRight} aria-label="Luxury">
              {renderChars('Luxury')}
            </h1>
          </div>

          <div className={styles.titleBot}>
            <div className={styles.titleBotLeft}>
              <h3 ref={subtitleRef} className={styles.subtitle}>
                Luxury that moves<br />with you
              </h3>
            </div>
            <div className={styles.titleBotRight}>
              <div ref={brandRef} className={styles.brandBlock}>
                <div className={styles.brandLine} aria-hidden="true" />
                <div className={styles.brandName}>
                  <span className={styles.brandManu}>Gulfstream</span>
                  <strong className={styles.brandModel}>650ER</strong>
                </div>
              </div>
              <p ref={descRef} className={styles.titleDesc}>
                Featuring wings designed to minimise anything that
                could disrupt its natural aerodynamic balance, and
                powered by twin Rolls-Royce BR725 engines, the G650ER
                is engineered for exceptional range and top-end speed.
              </p>
            </div>
          </div>
        </div>

        {/* ── View 2 — Spec ───────────────────────────────────── */}
        <div ref={specSlideRef} className={styles.specSlide}>
          <div ref={specLeftRef} className={styles.specLeft}>
            <div className={styles.specLineH} aria-hidden="true" />
            <p className={styles.specManu}>Gulfstream</p>
            <h2 className={styles.specModel}>650ER</h2>
            <div className={styles.specDivider} aria-hidden="true" />
            {OVERVIEW.map(({ label, value }) => (
              <div key={label} className={styles.overviewRow}>
                <span className={styles.overviewLabel}>{label}</span>
                <span className={styles.overviewValue}>{value}</span>
              </div>
            ))}
            <div className={styles.specDivider} aria-hidden="true" />
            <span className={styles.specHeading}>Specification</span>
            {SPECS.map(({ label, value }) => (
              <div key={label} className={styles.specRow}>
                <span className={styles.specRowLabel}>{label}</span>
                <span className={styles.specRowValue}>{value}</span>
              </div>
            ))}
          </div>
          <div className={styles.specCenter} aria-hidden="true" />
          <div ref={specRightRef} className={styles.specRight}>
            <h2 className={styles.specRightTitle}>Ultra-long-range<br />Aircraft</h2>
            <div className={styles.specLineH} aria-hidden="true" />
            <h3 className={styles.specRightSub}>Direct Access to<br />Private Travel</h3>
            <p className={styles.specRightBody}>
              A true time-saving machine — it brings Tokyo and New York
              an hour closer, and at 92% of the speed of sound it can
              circle the globe with just a single stop.
            </p>
          </div>
        </div>

        {/* ── Views 3-5 — Feature zone overlays ───────────────── */}
        {ZONES.map((zone, i) => (
          <div
            key={zone.id}
            ref={(el) => { zoneRefs.current[i] = el }}
            className={`${styles.zonePanel} ${zone.calloutSide === 'left' ? styles.zonePanelLeft : styles.zonePanelRight}`}
          >
            {/* Callout text */}
            <div className={styles.zoneCallout}>
              <p className={styles.zoneEyebrow}>{zone.eyebrow}</p>
              <h3 className={styles.zoneStat}>{zone.stat}</h3>
              <p className={styles.zoneBody}>{zone.body}</p>
            </div>

            {/* Zigzag annotation line — connects callout to feature zone */}
            <svg
              className={styles.zoneSvg}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polyline
                className={styles.zoneLine}
                points={`${zone.line.x1},${zone.line.y1} ${zone.line.xM},${zone.line.yM} ${zone.line.x2},${zone.line.y2}`}
              />
              <circle
                className={styles.zoneDot}
                cx={zone.line.x2}
                cy={zone.line.y2}
                r="0.8"
              />
            </svg>
          </div>
        ))}

        {/* ── Plane — floats above all slides, below zone text ── */}
        <div ref={planeWrapRef} className={styles.planeWrap}>
          <img
            ref={planeRenderRef}
            src="/plane-render.png"
            alt="Gulfstream G650ER top view"
            className={styles.planeImg}
            draggable={false}
          />
          <img
            ref={planeBpRef}
            src="/plane-blueprint.png"
            alt=""
            aria-hidden="true"
            className={`${styles.planeImg} ${styles.planeBp}`}
            draggable={false}
          />
        </div>

      </div>
    </section>
  )
}
