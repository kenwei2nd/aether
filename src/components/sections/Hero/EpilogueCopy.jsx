import { useEffect, useRef } from 'react'
import useHeroProgress from '@store/useHeroProgress'
import styles from './HeroSection.module.css'

const LINES = [
  { text: 'WHERE SILENCE MEETS THE SKY', start: 0.05, end: 0.20 },
  { text: 'YOUR JOURNEY BEGINS',         start: 0.25, end: 0.40 },
  { text: 'ABOVE THE ORDINARY',          start: 0.45, end: 0.60 },
]

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const easeOut = (t) => 1 - Math.pow(1 - t, 3)

export default function EpilogueCopy() {
  const refs = [useRef(null), useRef(null), useRef(null)]

  useEffect(() => {
    const apply = (ep) => {
      LINES.forEach(({ start, end }, i) => {
        const el = refs[i].current
        if (!el) return
        const range = end - start
        const t = easeOut(clamp01((ep - start) / range))
        el.style.opacity = String(t)
        el.style.transform = `translateY(${(1 - t) * 20}px)`
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
      {LINES.map(({ text }, i) => (
        <span key={text} ref={refs[i]} className={styles.epilogueLine}>
          {text}
        </span>
      ))}
    </div>
  )
}
