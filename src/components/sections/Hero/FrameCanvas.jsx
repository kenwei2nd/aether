import { forwardRef, useRef } from 'react'
import { useFrameSequence } from '@hooks/useFrameSequence'
import styles from './HeroSection.module.css'

const FrameCanvas = forwardRef(function FrameCanvas({ manifest }, apiRef) {
  const canvasRef = useRef(null)
  useFrameSequence(canvasRef, manifest, apiRef)
  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
})

export default FrameCanvas
