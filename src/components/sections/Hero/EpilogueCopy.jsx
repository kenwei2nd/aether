import { useEffect, useRef } from 'react'
import useHeroProgress from '@store/useHeroProgress'
import styles from './HeroSection.module.css'

/* First ~28% of epilogue is static (no animation) — gives ~1 scroll
   of "hold" before text starts appearing.                           */
const LINES = [
  { text: 'Where silence',                           start: 0.28, end: 0.42, cls: styles.epilogueLineA },
  { text: 'meets the sky.',                          start: 0.40, end: 0.55, cls: styles.epilogueLineB },
  { text: 'your journey begins above the ordinary',  start: 0.58, end: 0.72, cls: styles.epilogueLineC },
]

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const easeOut = (t) => 1 - Math.pow(1 - t, 3)

export default function EpilogueCopy() {
  const refs = useRef([])

  useEffect(() => {
    const apply = (ep) => {
      LINES.forEach(({ start, end }, i) => {
        const el = refs.current[i]
        if (!el) return
        const t = easeOut(clamp01((ep - start) / (end - start)))
        el.style.opacity = String(t)
        el.style.transform = `translateY(${(1 - t) * 22}px)`
      })
    }

    let last = useHeroProgress.getState().epilogueProgress
    apply(last)
    return useHeroProgress.subscribe((s) => {
      if (s.epilogueProgress === last) return
      last = s.epilogueProgress
      apply(last)
    })
  }, [])

  return (
    <div className={styles.epilogueCopy} aria-hidden="true">
      {LINES.map(({ text, cls }, i) => (
        <span
          key={text}
          ref={(el) => { refs.current[i] = el }}
          className={`${styles.epilogueLineBase} ${cls}`}
        >
          {text}
        </span>
      ))}
    </div>
  )
}
