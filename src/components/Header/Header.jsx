import { useEffect, useRef } from 'react'
import styles from './Header.module.css'

export default function Header() {
  const headerRef = useRef(null)

  useEffect(() => {
    const el = headerRef.current
    if (!el) return

    const onScroll = () => {
      // Fade from 1→0 over the first 80px of scroll
      const opacity = Math.max(0, 1 - window.scrollY / 80)
      el.style.opacity       = String(opacity)
      el.style.pointerEvents = opacity === 0 ? 'none' : ''
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header ref={headerRef} className={styles.header}>
      <nav className={styles.nav}>
        <a href="#about"    className={styles.navLink}>About</a>
        <a href="#aircraft" className={styles.navLink}>Fleet</a>
        <a href="#services" className={styles.navLink}>Services</a>
        <a href="#global"   className={styles.navLink}>Global</a>
      </nav>

      <a href="#hero" className={styles.logo}>AETHER</a>

      <div className={styles.contact}>
        <a href="tel:+971544325050"   className={styles.contactLink}>+971 54 432 5050</a>
        <a href="mailto:info@aether.com" className={styles.contactLink}>info@aether.com</a>
      </div>
    </header>
  )
}
