import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@animations/gsap.config'
import styles from './InteriorSection.module.css'

/* ──────────────────────────────────────────────────────────────
   Interior — pinned cinematic that reveals the G650ER cabin.
   Phase 0  Plane flies up from below, blueprint → realistic crossfade
   Phase 1  Zoom into cockpit (top of plane)
   Phase 2  Pan + zoom to main cabin (middle)
   Phase 3  Pan + zoom to private suite (rear)
   Final    Zoom back out, section unpins
   ────────────────────────────────────────────────────────────── */

const ZONES = [
  {
    id: 'cockpit',
    label: 'Flight Deck',
    copy: 'Two senior captains. Avionics tuned for transoceanic precision. Every climb, descent and altitude change choreographed for whisper-smooth motion.',
    // Top-down image: nose is at top → y negative pans the image UP, revealing the front of the plane
    scale: 2.6,
    x: '0%',
    y: '38%',
  },
  {
    id: 'cabin',
    label: 'Main Cabin',
    copy: 'Reclining captain chairs, hand-stitched leather, curated dining. Cabin altitude held at 4,800 ft — you step off without the fog of a long-haul.',
    scale: 2.6,
    x: '0%',
    y: '-2%',
  },
  {
    id: 'suite',
    label: 'Private Suite',
    copy: "The G650ER's rear converts to a full flat-bed cabin. Sleep across continents. Land in the city you woke up dreaming of.",
    scale: 2.8,
    x: '0%',
    y: '-38%',
  },
]

export default function InteriorSection() {
  const sectionRef    = useRef(null)
  const stageRef      = useRef(null)
  const planeWrapRef  = useRef(null)
  const planeRenderRef    = useRef(null)
  const planeBlueprintRef = useRef(null)
  const headlineRef   = useRef(null)
  const zoneRefs      = useRef([])
  const dotRefs       = useRef([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      /* Pinned section length. Scroll distance is generous so each phase
         feels slow and cinematic instead of snapping between zones. */
      const totalScroll = window.innerHeight * 7

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${totalScroll}`,
          pin: stageRef.current,
          pinSpacing: true,
          scrub: 1.5,
          anticipatePin: 1,
        },
      })

      /* ── Act 0 ─ headline visible + plane rises from below ────
         Both run in parallel. Render (realistic) is the entry visual. */
      tl.fromTo(headlineRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, ease: 'power2.out', duration: 0.6 }, 0)

      tl.fromTo(planeWrapRef.current,
        { y: '70vh', opacity: 0 },
        { y: '0vh', opacity: 1, ease: 'power3.out', duration: 1.4 }, 0.05)

      /* Render visible throughout entry — fades out once landed */
      tl.fromTo(planeRenderRef.current,
        { opacity: 1 },
        { opacity: 0, ease: 'power2.inOut', duration: 0.8 }, 1.5)

      /* Blueprint fades in as the zoom-feature image */
      tl.fromTo(planeBlueprintRef.current,
        { opacity: 0 },
        { opacity: 1, ease: 'power2.inOut', duration: 0.8 }, 1.5)

      /* Headline lifts away as we begin the zoom */
      tl.to(headlineRef.current,
        { opacity: 0, y: -40, ease: 'power2.in', duration: 0.6 }, 1.6)

      /* ── Act 1 ─ zoom into Zone 1 (cockpit / nose) ──────────── */
      tl.to(planeWrapRef.current,
        { scale: ZONES[0].scale, x: ZONES[0].x, y: ZONES[0].y,
          ease: 'power2.inOut', duration: 1.6 }, 2.4)

      tl.fromTo(zoneRefs.current[0],
        { opacity: 0, x: 60 },
        { opacity: 1, x: 0, ease: 'power2.out', duration: 0.9 }, 3.4)

      tl.to(zoneRefs.current[0],
        { opacity: 0, x: -60, ease: 'power2.in', duration: 0.7 }, 4.6)

      /* ── Act 2 ─ pan + zoom to Zone 2 (main cabin / middle) ── */
      tl.to(planeWrapRef.current,
        { scale: ZONES[1].scale, x: ZONES[1].x, y: ZONES[1].y,
          ease: 'power2.inOut', duration: 1.6 }, 4.9)

      tl.fromTo(zoneRefs.current[1],
        { opacity: 0, x: 60 },
        { opacity: 1, x: 0, ease: 'power2.out', duration: 0.9 }, 5.9)

      tl.to(zoneRefs.current[1],
        { opacity: 0, x: -60, ease: 'power2.in', duration: 0.7 }, 7.1)

      /* ── Act 3 ─ pan + zoom to Zone 3 (private suite / rear) ── */
      tl.to(planeWrapRef.current,
        { scale: ZONES[2].scale, x: ZONES[2].x, y: ZONES[2].y,
          ease: 'power2.inOut', duration: 1.6 }, 7.4)

      tl.fromTo(zoneRefs.current[2],
        { opacity: 0, x: 60 },
        { opacity: 1, x: 0, ease: 'power2.out', duration: 0.9 }, 8.4)

      tl.to(zoneRefs.current[2],
        { opacity: 0, x: -60, ease: 'power2.in', duration: 0.7 }, 9.6)

      /* ── Final ─ zoom back out, render crossfades back in ──── */
      tl.to(planeWrapRef.current,
        { scale: 1, x: '0%', y: '0%', ease: 'power2.inOut', duration: 1.2 }, 9.9)
      tl.to(planeBlueprintRef.current,
        { opacity: 0, ease: 'power2.inOut', duration: 0.8 }, 10.3)
      tl.to(planeRenderRef.current,
        { opacity: 1, ease: 'power2.inOut', duration: 0.8 }, 10.3)

      /* Zone dot toggles — based on timeline position rather than scroll
         ratios so they stay accurate even when timeline lengths change. */
      const tlDuration = tl.duration()
      const zoneActiveRanges = [
        { start: 2.4, end: 4.9 },   // zone 1 active
        { start: 4.9, end: 7.4 },   // zone 2 active
        { start: 7.4, end: 9.9 },   // zone 3 active
      ]
      zoneActiveRanges.forEach(({ start, end }, i) => {
        ScrollTrigger.create({
          trigger: section,
          start: `top+=${(start / tlDuration) * totalScroll} top`,
          end:   `top+=${(end   / tlDuration) * totalScroll} top`,
          onToggle: (self) => {
            const dot = dotRefs.current[i]
            if (dot) dot.classList.toggle(styles.zoneDotActive, self.isActive)
          },
        })
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className={styles.interior}>
      <div ref={stageRef} className={styles.stage}>

        {/* Opening headline — visible only during Act 0 */}
        <div ref={headlineRef} className={styles.headline}>
          <p className={styles.headlineEyebrow}>STEP INSIDE</p>
          <h2 className={styles.headlineText}>
            A cabin engineered<br />around <em>you.</em>
          </h2>
        </div>

        {/* Plane — wrapper handles transform, two imgs crossfade */}
        <div ref={planeWrapRef} className={styles.planeWrap}>
          <img
            ref={planeBlueprintRef}
            src="/plane-blueprint.png"
            alt=""
            aria-hidden="true"
            className={`${styles.plane} ${styles.planeBlueprint}`}
            draggable={false}
          />
          <img
            ref={planeRenderRef}
            src="/plane-render.png"
            alt="Gulfstream G650ER top view"
            className={`${styles.plane} ${styles.planeRender}`}
            draggable={false}
          />
        </div>

        {/* Zone copy — absolute right side, fades in per phase */}
        {ZONES.map((zone, i) => (
          <div
            key={zone.id}
            ref={(el) => (zoneRefs.current[i] = el)}
            className={styles.zoneCopy}
          >
            <p className={styles.zoneIndex}>0{i + 1}</p>
            <p className={styles.zoneLabel}>{zone.label}</p>
            <p className={styles.zoneText}>{zone.copy}</p>
          </div>
        ))}

        {/* Progress dots — left edge */}
        <div className={styles.zoneNav} aria-hidden="true">
          {ZONES.map((zone, i) => (
            <div
              key={zone.id}
              ref={(el) => (dotRefs.current[i] = el)}
              className={styles.zoneDot}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
