/** Math helpers — kept tiny, no dependencies. */
const clamp01 = (v) => Math.min(1, Math.max(0, v))
const lerp = (a, b, t) => a + (b - a) * t
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

/**
 * The pop-out / 3D screen-reveal effect is now baked directly into the video
 * (last ~2s of the cinematic = camera pulls back to reveal the cinema monitor).
 * The website's job is just to hold the canvas at the final frame and fade in
 * the brand copy + CTA over that revealed scene.
 *
 * Phase model (now driven entirely by the video, not by DOM state):
 *  0.00 – 0.10  Title fades up over the cabin opening
 *  0.10 – 0.20  Title fades out as camera passes through window
 *  0.30 – 0.45  Tagline fades in/out across the open-sky breathing beat
 *  0.85 – 1.00  Final reveal — CTA fades in over the popped-out screen frame
 */
export function readOverlayState(p) {
  // Hero copy: fully visible on the first frame, fades out before window dive.
  const heroOpacity = 1 - clamp01((p - 0.10) / 0.10)

  // Tagline: floats in during the open-sky beat.
  const taglineOpacity = bell(p, 0.30, 0.45, 0.05)

  // CTA: appears as the screen-reveal completes.
  const ctaOpacity = easeOutCubic(clamp01((p - 0.85) / 0.15))

  // Scroll hint fades out almost immediately.
  const scrollHintOpacity = 1 - clamp01(p / 0.05)

  return {
    copy: {
      heroOpacity: clamp01(heroOpacity),
      taglineOpacity,
      ctaOpacity,
    },
    scrollHintOpacity,
  }
}

function bell(x, a, b, ramp) {
  if (x < a || x > b) return 0
  const fadeIn = clamp01((x - a) / ramp)
  const fadeOut = clamp01((b - x) / ramp)
  return Math.min(fadeIn, fadeOut)
}
