import { useEffect, useRef, useImperativeHandle } from 'react'
import useHeroProgress from '@store/useHeroProgress'

/**
 * Preloads frames and exposes a `setProgress(p)` method via the imperative
 * handle. Bypasses the store subscribe machinery for the canvas hot path,
 * because rAF + Zustand notify ordering was leaving the canvas stuck on the
 * first frame on some renders.
 */
export function useFrameSequence(canvasRef, manifest, apiRef) {
  const imagesRef = useRef([])
  const lastDrawnRef = useRef(-1)
  const rafRef = useRef(0)
  const pendingProgressRef = useRef(0)

  // Preload + decode every frame, then mark ready in the store.
  useEffect(() => {
    if (!manifest || manifest.length === 0) return
    let cancelled = false

    useHeroProgress.setState({
      framesTotal: manifest.length,
      framesLoaded: 0,
      ready: false,
    })

    const images = new Array(manifest.length)
    let loaded = 0

    const onSettled = (i, img) => {
      if (cancelled) return
      images[i] = img
      loaded += 1
      useHeroProgress.setState({ framesLoaded: loaded })
      if (loaded === manifest.length) {
        imagesRef.current = images
        useHeroProgress.setState({ ready: true })
        paint(pendingProgressRef.current, true)
      }
    }

    manifest.forEach((src, i) => {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => onSettled(i, img)
      img.onerror = () => onSettled(i, img)
      img.src = src
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manifest])

  // Resize observer redraws current frame at new canvas dimensions.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(() => {
      sizeCanvas(canvas)
      paint(pendingProgressRef.current, true)
    })
    ro.observe(canvas)
    sizeCanvas(canvas)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef])

  // Imperative API: HeroSection's ScrollTrigger.onUpdate calls this directly.
  useImperativeHandle(
    apiRef,
    () => ({
      setProgress(p) {
        pendingProgressRef.current = p
        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(() => {
            rafRef.current = 0
            paint(pendingProgressRef.current)
          })
        }
      },
    }),
    [],
  )

  function paint(progress, force = false) {
    const images = imagesRef.current
    const canvas = canvasRef.current
    if (!canvas || images.length === 0) return
    const idx = Math.max(
      0,
      Math.min(images.length - 1, Math.round(progress * (images.length - 1))),
    )
    if (!force && idx === lastDrawnRef.current) return
    const img = images[idx]
    if (!img || !img.complete || img.naturalWidth === 0) return
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    drawCover(ctx, img, canvas.width, canvas.height)
    lastDrawnRef.current = idx
  }
}

function sizeCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
  const { clientWidth, clientHeight } = canvas
  canvas.width = Math.floor(clientWidth * dpr)
  canvas.height = Math.floor(clientHeight * dpr)
}

function drawCover(ctx, img, cw, ch) {
  const iw = img.naturalWidth || img.width
  const ih = img.naturalHeight || img.height
  if (!iw || !ih) return
  const canvasRatio = cw / ch
  const imgRatio = iw / ih
  let sx = 0
  let sy = 0
  let sw = iw
  let sh = ih
  if (imgRatio > canvasRatio) {
    sw = ih * canvasRatio
    sx = (iw - sw) / 2
  } else {
    sh = iw / canvasRatio
    sy = (ih - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch)
}
