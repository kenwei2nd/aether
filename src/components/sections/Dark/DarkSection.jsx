import { useEffect, useRef, useState, lazy, Suspense, useCallback } from 'react'
import * as THREE from 'three'
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
  { startLat: 25.2, startLng: 55.3,  endLat: 51.5,  endLng: -0.1,   color: ['#ffffff', '#ffffff'] },
  { startLat: 25.2, startLng: 55.3,  endLat: 40.7,  endLng: -74.0,  color: ['#ffffff', '#ffffff'] },
  { startLat: 25.2, startLng: 55.3,  endLat: 1.3,   endLng: 103.8,  color: ['#ffffff', '#ffffff'] },
  { startLat: 51.5, startLng: -0.1,  endLat: 40.7,  endLng: -74.0,  color: ['#ffffff', '#ffffff'] },
  { startLat: 51.5, startLng: -0.1,  endLat: 35.7,  endLng: 139.7,  color: ['#ffffff', '#ffffff'] },
  { startLat: 40.7, startLng: -74.0, endLat: 34.0,  endLng: -118.2, color: ['#ffffff', '#ffffff'] },
  { startLat: 48.9, startLng: 2.3,   endLat: 25.2,  endLng: 55.3,   color: ['#ffffff', '#ffffff'] },
  { startLat: 35.7, startLng: 139.7, endLat: -33.9, endLng: 151.2,  color: ['#ffffff', '#ffffff'] },
  { startLat: 1.3,  startLng: 103.8, endLat: -33.9, endLng: 151.2,  color: ['#ffffff', '#ffffff'] },
  { startLat: 46.2, startLng: 6.1,   endLat: 40.7,  endLng: -74.0,  color: ['#ffffff', '#ffffff'] },
]

const CITIES = [
  { lat: 25.2,  lng: 55.3,   name: 'Dubai',       country: 'UAE' },
  { lat: 51.5,  lng: -0.1,   name: 'London',      country: 'United Kingdom' },
  { lat: 40.7,  lng: -74.0,  name: 'New York',    country: 'United States' },
  { lat: 1.3,   lng: 103.8,  name: 'Singapore',   country: 'Singapore' },
  { lat: 35.7,  lng: 139.7,  name: 'Tokyo',       country: 'Japan' },
  { lat: 48.9,  lng: 2.3,    name: 'Paris',       country: 'France' },
  { lat: 46.2,  lng: 6.1,    name: 'Geneva',      country: 'Switzerland' },
  { lat: 34.0,  lng: -118.2, name: 'Los Angeles', country: 'United States' },
  { lat: -33.9, lng: 151.2,  name: 'Sydney',      country: 'Australia' },
]

const OCEAN_IMG = (() => {
  if (typeof document === 'undefined') return null
  const c = document.createElement('canvas')
  c.width = 2; c.height = 2
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#07111f'
  ctx.fillRect(0, 0, 2, 2)
  return c.toDataURL()
})()

/* ── Plane helpers ───────────────────────────────────────────── */
function interpGreatCircle(lat1, lng1, lat2, lng2, t) {
  const toR = d => d * Math.PI / 180
  const toD = r => r * 180 / Math.PI
  const [r1, g1] = [toR(lat1), toR(lng1)]
  const [r2, g2] = [toR(lat2), toR(lng2)]
  const [x1, y1, z1] = [Math.cos(r1)*Math.cos(g1), Math.cos(r1)*Math.sin(g1), Math.sin(r1)]
  const [x2, y2, z2] = [Math.cos(r2)*Math.cos(g2), Math.cos(r2)*Math.sin(g2), Math.sin(r2)]
  const dot = Math.max(-1, Math.min(1, x1*x2 + y1*y2 + z1*z2))
  const ang = Math.acos(dot)
  if (ang < 1e-6) return { lat: lat1, lng: lng1 }
  const sa = Math.sin(ang)
  const s1 = Math.sin((1 - t) * ang) / sa
  const s2 = Math.sin(t * ang) / sa
  const [x, y, z] = [s1*x1 + s2*x2, s1*y1 + s2*y2, s1*z1 + s2*z2]
  return { lat: toD(Math.asin(z)), lng: toD(Math.atan2(y, x)) }
}

function makePlaneCanvas() {
  const s = 96, m = s / 2
  const c = document.createElement('canvas')
  c.width = s; c.height = s
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#ffffff'
  // Body
  ctx.beginPath()
  ctx.ellipse(m, m - 6, 4, 24, 0, 0, Math.PI * 2)
  ctx.fill()
  // Main wings
  ctx.beginPath()
  ctx.moveTo(m - 30, m + 4)
  ctx.lineTo(m + 30, m + 4)
  ctx.lineTo(m + 6, m + 16)
  ctx.lineTo(m - 6, m + 16)
  ctx.closePath()
  ctx.fill()
  // Tail
  ctx.beginPath()
  ctx.moveTo(m - 14, m + 20)
  ctx.lineTo(m + 14, m + 20)
  ctx.lineTo(m + 5, m + 30)
  ctx.lineTo(m - 5, m + 30)
  ctx.closePath()
  ctx.fill()
  return c
}

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

    // Background stars — fully uniform distribution for density throughout
    for (let i = 0; i < 1000; i++) {
      const yBias = Math.random()
      const x = rand(0, w)
      const y = yBias * h
      const r = rand(0.2, 1.3)
      const a = rand(0.25, 0.9) * (0.75 + yBias * 0.25)
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${a})`
      ctx.fill()
    }

    // Glowing stars — uniform for visible sparkle throughout
    for (let i = 0; i < 80; i++) {
      const yBias = Math.random()
      const x = rand(0, w)
      const y = yBias * h
      const r = rand(1.0, 2.8)
      const a = rand(0.18, 0.55) * (0.65 + yBias * 0.35)
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
  const bgTitleRef   = useRef(null)
  const globeWrapRef = useRef(null)
  const globeRef        = useRef(null)
  const counterRefs     = useRef([])
  const planeCleanupRef = useRef(null)

  const [mounted, setMounted]           = useState(false)
  const [globeSize, setGlobeSize]       = useState(700)
  const [sectionH, setSectionH]         = useState(0)
  const [expandedCard, setExpandedCard] = useState(null)
  const [activeCity, setActiveCity]     = useState(null)
  const ctrlRef         = useRef(null)
  const autoRotateTimer = useRef(null)

  // Lazy-mount globe when near viewport
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setMounted(true); obs.disconnect() } },
      { rootMargin: '300px' }
    )
    if (globeWrapRef.current) obs.observe(globeWrapRef.current)
    return () => obs.disconnect()
  }, [])

  // Globe size — sized to fit alongside bg title + city bar in one viewport
  useEffect(() => {
    const calc = () => {
      setGlobeSize(Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.85))
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

  // Globe init: auto-rotate, initial POV, plane animation
  const onGlobeReady = useCallback(() => {
    if (!globeRef.current) return
    const ctrl = globeRef.current.controls()
    ctrl.autoRotate = false
    ctrl.enableDamping = true
    ctrl.dampingFactor = 0.08
    ctrl.enableZoom = false
    ctrl.enablePan = false
    globeRef.current.pointOfView({ lat: 28, lng: 28, altitude: 2.0 })
    ctrlRef.current = ctrl

    // Animated plane (Dubai → London great-circle route)
    const scene = globeRef.current.scene()
    const texture = new THREE.CanvasTexture(makePlaneCanvas())
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
    )
    sprite.scale.set(6, 6, 1)
    scene.add(sprite)

    const LOOP = 16000 // ms per Dubai→London traversal
    let animId
    const tick = () => {
      const t = (Date.now() % LOOP) / LOOP
      const { lat, lng } = interpGreatCircle(25.2, 55.3, 51.5, -0.1, t)
      const alt = Math.sin(Math.PI * t) * 0.38
      const g = globeRef.current
      if (g) {
        const coords = g.getCoords(lat, lng, alt)
        sprite.position.set(coords.x, coords.y, coords.z)
      }
      animId = requestAnimationFrame(tick)
    }
    animId = requestAnimationFrame(tick)

    planeCleanupRef.current = () => {
      cancelAnimationFrame(animId)
      scene.remove(sprite)
      texture.dispose()
    }
  }, [])

  // Cleanup plane animation and city cycle on unmount
  useEffect(() => () => {
    planeCleanupRef.current?.()
    clearInterval(autoRotateTimer.current)
  }, [])

  // Auto-cycle through cities once globe is mounted
  useEffect(() => {
    if (!mounted) return
    let idx = 0
    const flyTo = () => {
      setActiveCity(null)
      setTimeout(() => {
        setActiveCity(idx)
        if (globeRef.current) {
          globeRef.current.pointOfView(
            { lat: CITIES[idx].lat, lng: CITIES[idx].lng, altitude: 1.8 },
            1200
          )
        }
        idx = (idx + 1) % CITIES.length
      }, 350)
    }
    const startDelay = setTimeout(() => {
      flyTo()
      autoRotateTimer.current = setInterval(flyTo, 3800)
    }, 1800)
    return () => {
      clearTimeout(startDelay)
      clearInterval(autoRotateTimer.current)
    }
  }, [mounted])

  const handleCitySelect = useCallback((idx) => {
    clearInterval(autoRotateTimer.current)
    setActiveCity(idx)
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: CITIES[idx].lat, lng: CITIES[idx].lng, altitude: 1.8 }, 1200)
    }
    // Restart auto-cycle from the next city after a pause
    let currentIdx = (idx + 1) % CITIES.length
    autoRotateTimer.current = setInterval(() => {
      setActiveCity(null)
      setTimeout(() => {
        setActiveCity(currentIdx)
        if (globeRef.current) {
          globeRef.current.pointOfView(
            { lat: CITIES[currentIdx].lat, lng: CITIES[currentIdx].lng, altitude: 1.8 },
            1200
          )
        }
        currentIdx = (currentIdx + 1) % CITIES.length
      }, 350)
    }, 3800)
  }, [])

  // All scroll animations
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      // Eyebrow
      gsap.fromTo(eyebrowRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, ease: 'power2.out',
          scrollTrigger: { trigger: eyebrowRef.current, start: 'top 92%', end: 'top 55%', scrub: 0.8 } }
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
          { opacity: 1, ease: 'power1.out', stagger: 0.016,
            scrollTrigger: { trigger: bodyRef.current, start: 'top 88%', end: 'bottom 55%', scrub: 1 } }
        )
      }

      // Stats counters
      STATS.forEach(({ target, suffix }, i) => {
        const el = counterRefs.current[i]
        if (!el) return
        const obj = { val: 0 }
        gsap.to(obj, {
          val: target, ease: 'power1.inOut',
          onUpdate: () => { el.textContent = Math.round(obj.val).toLocaleString() + suffix },
          scrollTrigger: { trigger: statsRef.current, start: 'top 85%', end: 'top 30%', scrub: 1 },
        })
      })

      // Cards — alternating x
      if (cardsRef.current?.children) {
        Array.from(cardsRef.current.children).forEach((card, i) => {
          gsap.fromTo(card,
            { opacity: 0, x: (i % 2 === 0 ? -1 : 1) * 48 },
            { opacity: 1, x: 0, ease: 'power2.out',
              scrollTrigger: { trigger: card, start: 'top 92%', end: 'top 40%', scrub: 0.9 } }
          )
        })
      }

      // Massive background title words — start revealing while still in cards section
      const bgWords = bgTitleRef.current?.querySelectorAll(`.${styles.globeBgWord}`)
      if (bgWords?.length) {
        gsap.fromTo(bgWords,
          { opacity: 0, y: 80 },
          {
            opacity: 1, y: 0, ease: 'power2.out', stagger: 0.15,
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'bottom 85%',
              end: 'bottom 20%',
              scrub: 1.5,
            },
          }
        )
      }

      // Globe scale in
      gsap.fromTo(globeWrapRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, ease: 'power2.out',
          scrollTrigger: { trigger: globeWrapRef.current, start: 'top 90%', end: 'top 25%', scrub: 1 } }
      )
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className={styles.dark}>

      {/* Starfield — absolute, behind everything, masked at top */}
      <Starfield sectionHeight={sectionH} />

      {/* Brief space buffer before content — lets stars breathe */}
      <div className={styles.entryBuffer} aria-hidden="true" />

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

      {/* Cards — click to expand */}
      <div className={styles.cardsWrap}>
        <div ref={cardsRef} className={styles.grid}>
          {CARDS.map(({ index, title, body }) => {
            const isOpen = expandedCard === index
            return (
              <button
                key={index}
                type="button"
                className={`${styles.card} ${isOpen ? styles.cardOpen : ''}`}
                onClick={() => setExpandedCard(isOpen ? null : index)}
                aria-expanded={isOpen}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.cardIndex}>{index}</span>
                  <span className={styles.cardToggle} aria-hidden="true">
                    {isOpen ? '×' : '+'}
                  </span>
                </div>
                <h3 className={styles.cardTitle}>
                  {title.split('\n').map((line, i, arr) => (
                    <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                  ))}
                </h3>
                <div className={styles.cardRule} />
                <div className={styles.cardBodyWrap}>
                  <p className={styles.cardBody}>{body}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── GLOBE BLOCK ─────────────────────────────────────── */}
      <div className={styles.globeBlock}>

        {/* Massive background words — Jesko Jets style, behind the globe */}
        <div ref={bgTitleRef} className={styles.globeBgTitle} aria-hidden="true">
          <span className={styles.globeBgWord}>YOUR</span>
          <span className={`${styles.globeBgWord} ${styles.globeBgWordRight}`}>WORLD</span>
          <span className={styles.globeBgWord}>WITHOUT</span>
          <span className={`${styles.globeBgWord} ${styles.globeBgWordRight}`}>LIMITS</span>
        </div>

        {/* Globe frame — ring + globe + city overlay */}
        <div className={styles.globeFrame}>
          <div className={styles.globeRing} aria-hidden="true" />

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
                  showAtmosphere={false}
                  polygonsData={COUNTRIES}
                  polygonCapColor={() => '#0d1a28'}
                  polygonSideColor={() => '#080f1a'}
                  polygonStrokeColor={() => 'rgba(255,255,255,0.65)'}
                  polygonAltitude={0.006}
                  arcsData={ARCS}
                  arcStartLat="startLat"
                  arcStartLng="startLng"
                  arcEndLat="endLat"
                  arcEndLng="endLng"
                  arcColor="color"
                  arcAltitude={0.35}
                  arcStroke={0.9}
                  arcDashLength={0.45}
                  arcDashGap={0.2}
                  arcDashAnimateTime={2600}
                  pointsData={CITIES}
                  pointLat="lat"
                  pointLng="lng"
                  pointColor={() => '#ffffff'}
                  pointAltitude={0.015}
                  pointRadius={0.5}
                  pointResolution={8}
                  ringsData={CITIES}
                  ringLat="lat"
                  ringLng="lng"
                  ringColor={() => (t) => `rgba(255,255,255,${1 - t})`}
                  ringMaxRadius={4}
                  ringPropagationSpeed={1.5}
                  ringRepeatPeriod={1200}
                  enablePointerInteraction
                />
              )}
            </Suspense>
          </div>

          {/* City info — fades in when a city is selected */}
          <div className={`${styles.cityOverlay} ${activeCity !== null ? styles.cityOverlayVisible : ''}`}>
            {activeCity !== null && (
              <>
                <span className={styles.cityOverlayName}>{CITIES[activeCity].name}</span>
                <span className={styles.cityOverlayCountry}>{CITIES[activeCity].country}</span>
                <span className={styles.cityCoords}>
                  {Math.abs(CITIES[activeCity].lat).toFixed(1)}°{CITIES[activeCity].lat >= 0 ? 'N' : 'S'}
                  {' '}
                  {Math.abs(CITIES[activeCity].lng).toFixed(1)}°{CITIES[activeCity].lng >= 0 ? 'E' : 'W'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* City switcher bar */}
        <div className={styles.cityBar} role="group" aria-label="Select destination city">
          {CITIES.map((city, idx) => (
            <button
              key={city.name}
              type="button"
              className={`${styles.cityItem} ${activeCity === idx ? styles.cityItemActive : ''}`}
              onClick={() => handleCitySelect(idx)}
            >
              {city.name}
            </button>
          ))}
        </div>

        <p className={styles.globeSub}>150+ destinations · Every continent · On demand</p>

      </div>

      {/* ink → paper for Showcase */}
      <div className={styles.bottomFade} />

    </section>
  )
}
