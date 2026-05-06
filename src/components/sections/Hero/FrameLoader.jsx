import useHeroProgress from '@store/useHeroProgress'
import styles from './HeroSection.module.css'

export default function FrameLoader() {
  const loaded = useHeroProgress((s) => s.framesLoaded)
  const total = useHeroProgress((s) => s.framesTotal)
  const ready = useHeroProgress((s) => s.ready)

  const pct = total === 0 ? 0 : Math.round((loaded / total) * 100)

  return (
    <div className={styles.loader} data-ready={ready ? 'true' : 'false'} aria-hidden={ready}>
      <div className={styles.loaderInner}>
        <span className={styles.loaderMark}>AETHER</span>
        <span className={styles.loaderCount}>{pct.toString().padStart(2, '0')}</span>
        <div className={styles.loaderBar}>
          <div className={styles.loaderBarFill} style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
      </div>
    </div>
  )
}
