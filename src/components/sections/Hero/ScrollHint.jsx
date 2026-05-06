import { useEffect, useRef } from 'react'
import useHeroProgress from '@store/useHeroProgress'
import { readOverlayState } from '@animations/heroTimeline'
import styles from './HeroSection.module.css'

export default function ScrollHint() {
  const ref = useRef(null)

  useEffect(() => {
    const apply = (p) => {
      const { scrollHintOpacity } = readOverlayState(p)
      if (ref.current) ref.current.style.opacity = String(scrollHintOpacity)
    }
    let last = useHeroProgress.getState().progress
    apply(last)
    return useHeroProgress.subscribe((s) => {
      if (s.progress === last) return
      last = s.progress
      apply(last)
    })
  }, [])

  return (
    <div ref={ref} className={styles.scrollHint}>
      <span>Scroll</span>
      <div className={styles.scrollHintLine} />
    </div>
  )
}
