import { useEffect, useRef, useState, lazy, Suspense, useCallback } from 'react'
import { feature } from 'topojson-client'
import { gsap } from '@animations/gsap.config'
import styles from './GlobeSection.module.css'
import worldTopo from 'world-atlas/countries-110m.json'

const Globe = lazy(() => import('react-globe.gl'))

const COUNTRIES = feature(worldTopo, worldTopo.objects.countries).features

/* Unique city hub — start/end of every arc */
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

/* Dark ocean base texture (1×1 canvas) */
const OCEAN_IMG = (() => {
  if (typeof document === 'undefined') return null
  const c = document.createElement('canvas')
  c.width = 2; c.height = 2
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#0a1728'
  ctx.fillRect(0, 0, 2, 2)
  return c.toDataURL()
})()

/* ── Starfield canvas component ─────────────────────────────── */
function Starfield() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio, 2)
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    canvas.width  = w * dpr
    canvas.height = h * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    const rand = (min, max) => Math.random() * (max - min) + min

    /* small background stars */
    for (let i = 0; i < 320; i++) {
      const x = rand(0, w)
      const y = rand(0, h)
      const r = rand(0.2, 1.1)
      const a = rand(0.15, 0.75)
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${a})`
      ctx.fill()
    }

    /* larger glowing stars */
    for (let i = 0; i < 28; i++) {
      const x = rand(0, w)
      const y = rand(0, h)
      const r = rand(1.2, 2.8)
      const a = rand(0.12, 0.45)
      const grd = ctx.createRadialGradient(x, y, 0, x, y, r * 4)
      grd.addColorStop(0, `rgba(180,210,255,${a})`)
      grd.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(x, y, r * 4, 0, Math.PI * 2)
      ctx.fillStyle = grd
      ctx.fill()
    }

    /* subtle nebula clouds */
    const nebulae = [
      { x: rand(0.1, 0.4) * w, y: rand(0.1, 0.4) * h, rx: rand(80, 200), ry: rand(60, 140), color: '30,58,138' },
      { x: rand(0.5, 0.9) * w, y: rand(0.5, 0.9) * h, rx: rand(100, 220), ry: rand(80, 160), color: '100,30,80' },
    ]
    nebulae.forEach(({ x, y, rx, ry, color }) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.scale(1, ry / rx)
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx)
      g.addColorStop(0, `rgba(${color},0.08)`)
      g.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(0, 0, rx, 0, Math.PI * 2)
      ctx.fillStyle = g
      ctx.fill()
      ctx.restore()
    })
  }, [])

  return (
    <canvas
      ref={ref}
      className={styles.starfield}
      aria-hidden="true"
    />
  )
}

/* ── Main section ────────────────────────────────────────────── */
export default function GlobeSection() {
  const sectionRef = useRef(null)
  const textRef    = useRef(null)
  const globeRef   = useRef(null)
  const wrapRef    = useRef(null)
  const [mounted, setMounted] = useState(false)
  const [globeSize, setGlobeSize] = useState(700)

  /* lazy-mount when near viewport */
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setMounted(true); obs.disconnect() } },
      { rootMargin: '300px' }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  /* size = shortest side of viewport (fills the screen) */
  useEffect(() => {
    const calc = () => {
      setGlobeSize(Math.round(Math.min(window.innerWidth, window.innerHeight) * 1.05))
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  /* auto-rotate + initial POV once globe loads */
  const onGlobeReady = useCallback(() => {
    if (!globeRef.current) return
    const ctrl = globeRef.current.controls()
    ctrl.autoRotate = true
    ctrl.autoRotateSpeed = 0.55
    ctrl.enableZoom = false
    ctrl.enablePan = false
    globeRef.current.pointOfView({ lat: 28, lng: 28, altitude: 2.0 })
  }, [])

  /* scroll-in animations */
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      /* text fades in */
      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out',
          scrollTrigger: { trigger: textRef.current, start: 'top 85%', once: true } }
      )

      /* globe scales in */
      gsap.fromTo(
        wrapRef.current,
        { opacity: 0, scale: 0.88 },
        { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out',
          scrollTrigger: { trigger: wrapRef.current, start: 'top 90%', once: true } }
      )
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className={styles.section}>
      <Starfield />

      {/* Text overlay */}
      <div ref={textRef} className={styles.text} style={{ opacity: 0 }}>
        <p className={styles.eyebrow}>GLOBAL NETWORK</p>
        <h2 className={styles.headline}>
          Your world<br />without limits.
        </h2>
        <p className={styles.sub}>
          150+ destinations · Every continent · On demand
        </p>
      </div>

      {/* Globe — fills section */}
      <div ref={wrapRef} className={styles.globeWrap} style={{ opacity: 0 }}>
        <Suspense fallback={<div className={styles.placeholder} style={{ width: globeSize, height: globeSize }} />}>
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

              /* Land */
              polygonsData={COUNTRIES}
              polygonCapColor={() => '#1c2a3a'}
              polygonSideColor={() => '#0f1a28'}
              polygonStrokeColor={() => 'rgba(100,166,255,0.12)'}
              polygonAltitude={0.008}

              /* Arcs */
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

              /* City dots */
              pointsData={CITIES}
              pointLat="lat"
              pointLng="lng"
              pointColor={() => '#f4b15c'}
              pointAltitude={0.015}
              pointRadius={0.5}
              pointResolution={8}

              /* Rings (pulse around cities) */
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

      {/* ink → paper gradient for Showcase */}
      <div className={styles.bottomFade} />
    </section>
  )
}
