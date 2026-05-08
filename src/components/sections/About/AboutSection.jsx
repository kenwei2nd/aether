import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@animations/gsap.config'
import styles from './AboutSection.module.css'

const STATS = [
  { target: 5000, suffix: '+', label: 'MISSIONS COMPLETED' },
  { target: 150,  suffix: '+', label: 'COUNTRIES SERVED' },
  { target: 24,   suffix: 'H', label: 'AVAILABILITY' },
]

const CARDS = [
  {
    index: '01',
    title: 'Direct Access to\nPrivate Travel',
    body: 'Bypass commercial terminals entirely. Your aircraft is staged, staffed, and waiting at a private facility of your choosing — departure on your schedule, not the airline\'s.',
    dir: -1,
  },
  {
    index: '02',
    title: 'Your Freedom to\nEnjoy Life',
    body: 'We value your time above all else. Aether gives you the freedom to live, work, and relax wherever life takes you — without queues, without compromise.',
    dir: 1,
  },
  {
    index: '03',
    title: 'Precision and\nExcellence',
    body: 'Every detail of your flight — from route planning and in-flight catering to ground transfers — reflects our dedication to perfection at every altitude.',
    dir: -1,
  },
  {
    index: '04',
    title: 'Global Reach,\nPersonal Touch',
    body: 'With access to 150+ destinations worldwide, Aether brings the world closer to you. Our team manages every aspect of your journey so you never have to.',
    dir: 1,
  },
]

const MARQUEE_TEXT =
  'QUIET ALTITUDE  ·  ZERO COMPROMISE  ·  PRIVATE AVIATION  ·  GLOBAL REACH  ·  BESPOKE JOURNEYS  ·  '

export default function AboutSection() {
  const sectionRef   = useRef(null)
  const eyebrowRef   = useRef(null)
  const headlineRef  = useRef(null)
  const bodyRef      = useRef(null)
  const statsRef     = useRef(null)
  const cardsRef     = useRef(null)
  const counterRefs  = useRef([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {

      // ── 1. Eyebrow fade
      gsap.fromTo(eyebrowRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
          scrollTrigger: { trigger: eyebrowRef.current, start: 'top 88%', once: true } }
      )

      // ── 2. Headline — scroll-scrubbed opacity + y per line
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

      // ── 3. Body — word stagger
      const words = bodyRef.current?.querySelectorAll(`.${styles.word}`)
      if (words?.length) {
        gsap.fromTo(words,
          { opacity: 0 },
          { opacity: 1, duration: 0.4, ease: 'power1.out', stagger: 0.018,
            scrollTrigger: { trigger: bodyRef.current, start: 'top 85%', once: true } }
        )
      }

      // ── 4. Stat counters
      STATS.forEach(({ target, suffix }, i) => {
        const el = counterRefs.current[i]
        if (!el) return
        const obj = { val: 0 }
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = Math.round(obj.val).toLocaleString() + suffix
          },
          scrollTrigger: { trigger: statsRef.current, start: 'top 85%', once: true },
        })
      })

      // ── 5. Cards — alternating x direction
      const cards = cardsRef.current?.children
      if (cards?.length) {
        Array.from(cards).forEach((card, i) => {
          const dir = i % 2 === 0 ? -1 : 1
          gsap.fromTo(card,
            { opacity: 0, x: dir * 48 },
            { opacity: 1, x: 0, duration: 0.65, ease: 'power2.out',
              scrollTrigger: { trigger: card, start: 'top 88%', once: true } }
          )
        })
      }

    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className={styles.about}>

      {/* paper→ink transition strip */}
      <div className={styles.topFade} />

      <div className={styles.inner}>

        {/* Eyebrow */}
        <p ref={eyebrowRef} className={styles.eyebrow}>ABOUT AETHER</p>

        {/* Headline — scroll-scrubbed opacity reveal */}
        <h2 ref={headlineRef} className={styles.headline}>
          <span className={styles.hLine}>We don&apos;t move people.</span>
          <span className={styles.hLine}>We move <em>time.</em></span>
        </h2>

        {/* Body — word spans */}
        <p ref={bodyRef} className={styles.body}>
          {('Aether is a private aviation collective built on a single principle — that the journey should be as extraordinary as the destination. Every aircraft in our fleet is selected, crewed, and managed for one purpose: to disappear around you at 40,000 feet.')
            .split(' ')
            .map((word, i) => (
              <span key={i} className={styles.word}>{word} </span>
            ))}
        </p>

        {/* Stats */}
        <div ref={statsRef} className={styles.stats}>
          {STATS.map(({ target, suffix, label }, i) => (
            <div key={label} className={styles.statItem}>
              <span
                ref={(el) => { counterRefs.current[i] = el }}
                className={styles.statValue}
              >
                0{suffix}
              </span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Marquee ticker */}
      <div className={styles.marqueeTrack} aria-hidden="true">
        <div className={styles.marqueeInner}>
          <span>{MARQUEE_TEXT}</span>
          <span>{MARQUEE_TEXT}</span>
          <span>{MARQUEE_TEXT}</span>
        </div>
      </div>

      {/* Cards */}
      <div className={styles.inner}>
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

    </section>
  )
}
