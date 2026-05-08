import { useEffect, useRef, useState, lazy, Suspense, useCallback } from 'react'
import { feature } from 'topojson-client'
import { gsap } from '@animations/gsap.config'
import styles from './DarkSection.module.css'
import worldTopo from 'world-atlas/countries-110m.json'

const Globe = lazy(() => import('react-globe.gl'))

const COUNTRIES = feature(worldTopo, worldTopo.objects.countries).features

/* ── Constants ───────────────────────────────────────────────── */
const STATS = [
  { target: 5000, suffix: '+', label: 'MISSIONS COMPLETED' },
  { target: 150,  suffix: '+', label: 'COUNTRIES SERVED' },
  { target: 24,   suffix: 'H', label: 'AVAILABILITY' },
]

const CARDS = [
  { index: '01', title: 'Direct Access to\nPrivate Travel', dir: -1,
    body: "Bypass commercial terminals entirely. Your aircraft is staged, staffed, and waiting at a private facility of your choosing — departure on your schedule, not the airline's." },
  { index: '02', title: 'Your Freedom to\nEnjoy Life', dir: 1,
    body: 'We value your time above all else. Aether gives you the freedom to live, work, and relax wherever life takes you — without queues, without compromise.' },
  { index: '03', title: 'Precision and\nExcellence', dir: -1,
    body: 'Every detail of your flight — from route planning and in-flight catering to ground transfers — reflects our dedication to perfection at every altitude.' },
  { index: '04', title: 'Global Reach,\nPersonal Touch', dir: 1,
    body: 'With access to 150+ destinations worldwide, Aether brings the world closer to you. Our team manages every aspect of your journey so you never have to.' },
]

const MARQUEE_TEXT = 'QUIET ALTITUDE  ·  ZERO COMPROMISE  ·  PRIVATE AVIATION  ·  GLOBAL REACH  ·  BESPOKE JOURNEYS  ·  '

const ARCS = [
  { startLat: 25.2, startLng: 55.3,  endLat: 51.5,  endLng: -0.1,   color: ['#ffffff', '#f4b15c'] },
  { startLat: 25.2, startLng: 55.3,  endLat: 40.7,  endLng: -74.0,  color: ['#6aa6ff', '#ffffff'] },
  { startLat: 25.2, startLng: 55.3,  endLat: 1.3,   endLng: 103.8,  color: ['#ffffff', '#f4b15c'] },
  { startLat: 51.5, startLng: -0.1,  endLat: 40.7,  endLng: -74.0,  color: ['#6aa6ff', '#ffffff'] },
  { startLat: 51.5, startLng: -0.1,  endLat: 35.7,  endLng: 139.7,  color: ['#ffffff', '#f4b15c'] },
  { startLat: 40.7, startLng: -74.0, endLat: 34.0,  endLng: -118.2, color: ['#6aa6ff', '#ffffff'] },
  { startLat: 48.9, startLng: 2.3,   endLat: 25.2,  endLng: 55.3,   color: ['#ffffff', '#f4b15c'] },
  { startLat: 35.7, startLng: 139.7, endLat: -33.9, endLng: 151.2,  color: ['#6aa6ff', '#ffffff'] },
  { startLat: 1.3,  startLng: 103.8, endLat: -33.9, endLng: 151.2,  color: ['#ffffff', '#f4b15c'] },
  { startLat: 46.2, startLng: 6.1,   endLat: 40.7,  endLng: -74.0,  color: ['#6aa6ff', '#ffffff'] },
]

const CITIES = [
  { lat: 25.2,  lng: 55.3,   name: 'Dubai' },
  { lat: 51.5,  lng: -0.1,   name: 'London' },
  { lat: 40.7,  lng: -74.0,  name: 'New York' },
  { lat: 1.3,   lng: 103.8,  name: 'Singapore' },
  { lat: 35.7,  lng: 139.7,  name: 'Tokyo' },
  { lat: 48.9,  lng: 2.3,    name: 'Paris' },
  { lat: 46.2,  lng: 6.1,    name: 'Geneva' },
  { lat: 34.0,  lng: -118.2, name: 'Los Angeles' },
  { lat: -33.9, lng: 151.2,  name: 'Sydney' },
]

const OCEAN_IMG = (() => {
  if (typeof document === 'undefined') return null
  const c = document.createElement('canvas')
  c.width = 2; c.height = 2
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#0a1728'
  ctx.fillRect(0, 0, 2, 2)
  return c.toDataURL()
})()

/* ── Starfield canvas ────────────────────────────────────────── */
function Starfield({ sectionHeight }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio, 2)
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight || sectionHeight || window.innerHeight * 3
    canvas.width  = w * dpr
    canvas.height = h * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    const rand = (min, max) => Math.random() * (max - min) + min

    // Background stars — concentrated in lower 60% (globe area)
    for (let i = 0; i < 400; i++) {
      // Bias star placement toward the lower portion
      const yBias = Math.pow(Math.random(), 0.6)
      const x = rand(0, w)
      const y = yBias * h
      const r = rand(0.2, 1.2)
      const a = rand(0.1, 0.8) * (0.2 + yBias * 0.8) // dimmer at top
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${a})`
      ctx.fill()
    }

    // Glowing stars
    for (let i = 0; i < 35; i++) {
      const yBias = Math.pow(Math.random(), 0.5)
      const x = rand(0, w)
      const y = yBias * h
      const r = rand(1.0, 2.6)
      const a = rand(0.08, 0.4) * (0.1 + yBias * 0.9)
      const grd = ctx.createRadialGradient(x, y, 0, x, y, r * 4)
      grd.addColorStop(0, `rgba(180,210,255,${a})`)
      grd.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(x, y, r * 4, 0, Math.PI * 2)
      ctx.fillStyle = grd
      ctx.fill()
    }

    // Nebula clouds in lower half
    const nebulae = [
      { x: rand(0.1, 0.35) * w, y: rand(0.55, 0.75) * h, rx: rand(120, 260), ry: rand(80, 160), color: '30,58,138' },
      { x: rand(0.6, 0.9)  * w, y: rand(0.60, 0.85) * h, rx: rand(100, 220), ry: rand(70, 140), color: '80,20,60' },
      { x: rand(0.3, 0.7)  * w, y: rand(0.75, 0.95) * h, rx: rand(160, 300), ry: rand(100, 200), color: '10,40,90' },
    ]
    nebulae.forEach(({ x, y, rx, ry, color }) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.scale(1, ry / rx)
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx)
      g.addColorStop(0, `rgba(${color},0.1)`)
      g.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(0, 0, rx, 0, Math.PI * 2)
      ctx.fillStyle = g
      ctx.fill()
      ctx.restore()
    })
  }, [sectionHeight])

  return <canvas ref={ref} className={styles.starfield} aria-hidden="true" />
}

/* ── Main component ──────────────────────────────────────────── */
export default function DarkSection() {
  const sectionRef   = useRef(null)
  const eyebrowRef   = useRef(null)
  const headlineRef  = useRef(null)
  const bodyRef      = useRef(null)
  const statsRef     = useRef(null)
  const cardsRef     = useRef(null)
  const globeTextRef = useRef(null)
  const globeWrapRef = useRef(null)
  const globeRef     = useRef(null)
  const counterRefs  = useRef([])

  const [mounted, setMounted]       = useState(false)
  const [globeSize, setGlobeSize]   = useState(700)
  const [sectionH, setSectionH]     = useState(0)

  // Lazy-mount globe when near viewport
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setMounted(true); obs.disconnect() } },
      { rootMargin: '300px' }
    )
    if (globeWrapRef.current) obs.observe(globeWrapRef.current)
    return () => obs.disconnect()
  }, [])

  // Globe size = viewport width (immersive full-width)
  useEffect(() => {
    const calc = () => {
      setGlobeSize(Math.round(Math.min(window.innerWidth, window.innerHeight) * 1.1))
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  // Capture section height for starfield canvas sizing
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setSectionH(e.contentRect.height))
    if (sectionRef.current) ro.observe(sectionRef.current)
    return () => ro.disconnect()
  }, [])

  // Globe init: auto-rotate, initial POV
  const onGlobeReady = useCallback(() => {
    if (!globeRef.current) return
    const ctrl = globeRef.current.controls()
    ctrl.autoRotate = true
    ctrl.autoRotateSpeed = 0.55
    ctrl.enableZoom = false
    ctrl.enablePan = false
    globeRef.current.pointOfView({ lat: 28, lng: 28, altitude: 2.0 })
  }, [])

  // All scroll animations
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      // Eyebrow
      gsap.fromTo(eyebrowRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: eyebrowRef.current, start: 'top 90%', once: true } }
      )

      // Headline — scrubbed opacity reveal
      const hLines = headlineRef.current?.querySelectorAll(`.${styles.hLine}`)
      if (hLines?.length) {
        gsap.timeline({
          scrollTrigger: {
            trigger: headlineRef.current,
            start: 'top 95%',
            end: 'center 40%',
            scrub: 1.8,
          },
        })
          .fromTo(hLines[0], { opacity: 0, y: 48 }, { opacity: 1, y: 0, ease: 'none' }, 0)
          .fromTo(hLines[1], { opacity: 0, y: 48 }, { opacity: 1, y: 0, ease: 'none' }, 0.35)
      }

      // Body word stagger
      const words = bodyRef.current?.querySelectorAll(`.${styles.word}`)
      if (words?.length) {
        gsap.fromTo(words,
          { opacity: 0 },
          { opacity: 1, duration: 0.4, ease: 'power1.out', stagger: 0.016,
            scrollTrigger: { trigger: bodyRef.current, start: 'top 85%', once: true } }
        )
      }

      // Stats counters
      STATS.forEach(({ target, suffix }, i) => {
        const el = counterRefs.current[i]
        if (!el) return
        const obj = { val: 0 }
        gsap.to(obj, {
          val: target, duration: 2, ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.val).toLocaleString() + suffix },
          scrollTrigger: { trigger: statsRef.current, start: 'top 85%', once: true },
        })
      })

      // Cards — alternating x
      if (cardsRef.current?.children) {
        Array.from(cardsRef.current.children).forEach((card, i) => {
          gsap.fromTo(card,
            { opacity: 0, x: (i % 2 === 0 ? -1 : 1) * 48 },
            { opacity: 1, x: 0, duration: 0.65, ease: 'power2.out',
              scrollTrigger: { trigger: card, start: 'top 88%', once: true } }
          )
        })
      }

      // Globe text
      gsap.fromTo(globeTextRef.current,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out',
          scrollTrigger: { trigger: globeTextRef.current, start: 'top 85%', once: true } }
      )

      // Globe scale in
      gsap.fromTo(globeWrapRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out',
          scrollTrigger: { trigger: globeWrapRef.current, start: 'top 85%', once: true } }
      )
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className={styles.dark}>

      {/* Starfield — absolute, behind everything, masked at top */}
      <Starfield sectionHeight={sectionH} />

      {/* ── ABOUT BLOCK ─────────────────────────────────────── */}
      <div className={styles.aboutBlock}>

        <p ref={eyebrowRef} className={styles.eyebrow} style={{ opacity: 0 }}>ABOUT AETHER</p>

        <h2 ref={headlineRef} className={styles.headline}>
          <span className={styles.hLine}>We don&apos;t move people.</span>
          <span className={styles.hLine}>We move <em>time.</em></span>
        </h2>

        <p ref={bodyRef} className={styles.body}>
          {('Aether is a private aviation collective built on a single principle — that the journey should be as extraordinary as the destination. Every aircraft in our fleet is selected, crewed, and managed for one purpose: to disappear around you at 40,000 feet.')
            .split(' ')
            .map((word, i) => <span key={i} className={styles.word}>{word} </span>)}
        </p>

        <div ref={statsRef} className={styles.stats}>
          {STATS.map(({ suffix, label }, i) => (
            <div key={label} className={styles.statItem}>
              <span ref={(el) => { counterRefs.current[i] = el }} className={styles.statValue}>
                0{suffix}
              </span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Marquee */}
      <div className={styles.marqueeTrack} aria-hidden="true">
        <div className={styles.marqueeInner}>
          <span>{MARQUEE_TEXT}</span>
          <span>{MARQUEE_TEXT}</span>
          <span>{MARQUEE_TEXT}</span>
        </div>
      </div>

      {/* Cards */}
      <div className={styles.cardsWrap}>
        <div ref={cardsRef} className={styles.grid}>
          {CARDS.map(({ index, title, body }) => (
            <div key={index} className={styles.card}>
              <span className={styles.cardIndex}>{index}</span>
              <h3 className={styles.cardTitle}>
                {title.split('\n').map((line, i, arr) => (
                  <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                ))}
              </h3>
              <div className={styles.cardRule} />
              <p className={styles.cardBody}>{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── GLOBE BLOCK ─────────────────────────────────────── */}
      <div className={styles.globeBlock}>

        <div ref={globeTextRef} className={styles.globeText} style={{ opacity: 0 }}>
          <p className={styles.globeEyebrow}>GLOBAL NETWORK</p>
          <h2 className={styles.globeHeadline}>
            Your world<br />without limits.
          </h2>
          <p className={styles.globeSub}>150+ destinations · Every continent · On demand</p>
        </div>

        <div ref={globeWrapRef} className={styles.globeWrap} style={{ opacity: 0 }}>
          <Suspense fallback={
            <div className={styles.globePlaceholder} style={{ width: globeSize, height: globeSize }} />
          }>
            {mounted && (
              <Globe
                ref={globeRef}
                width={globeSize}
                height={globeSize}
                onGlobeReady={onGlobeReady}
                backgroundColor="rgba(0,0,0,0)"
                globeImageUrl={OCEAN_IMG}
                atmosphereColor="#6aa6ff"
                atmosphereAltitude={0.22}
                showAtmosphere
                polygonsData={COUNTRIES}
                polygonCapColor={() => '#1c2a3a'}
                polygonSideColor={() => '#0f1a28'}
                polygonStrokeColor={() => 'rgba(100,166,255,0.12)'}
                polygonAltitude={0.008}
                arcsData={ARCS}
                arcStartLat="startLat"
                arcStartLng="startLng"
                arcEndLat="endLat"
                arcEndLng="endLng"
                arcColor="color"
                arcAltitude={0.35}
                arcStroke={0.7}
                arcDashLength={0.45}
                arcDashGap={0.2}
                arcDashAnimateTime={2600}
                pointsData={CITIES}
                pointLat="lat"
                pointLng="lng"
                pointColor={() => '#f4b15c'}
                pointAltitude={0.015}
                pointRadius={0.5}
                pointResolution={8}
                ringsData={CITIES}
                ringLat="lat"
                ringLng="lng"
                ringColor={() => (t) => `rgba(244,177,92,${1 - t})`}
                ringMaxRadius={4}
                ringPropagationSpeed={1.5}
                ringRepeatPeriod={1200}
                enablePointerInteraction
              />
            )}
          </Suspense>
        </div>

      </div>

      {/* ink → paper for Showcase */}
      <div className={styles.bottomFade} />

    </section>
  )
}
