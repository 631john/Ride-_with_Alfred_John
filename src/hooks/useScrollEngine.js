/**
 * useScrollEngine
 * ───────────────
 * Reads scroll from #scroll-driver div (a fixed full-screen overflow-y:scroll element).
 * Returns progress [0,1] and velocity via a ref-based approach.
 * Uses requestAnimationFrame instead of GSAP ScrollTrigger to avoid
 * dependency version conflicts.
 */

import { useEffect, useRef, useCallback } from 'react'

export function useScrollEngine(onProgress) {
  const progressRef = useRef(0)
  const targetProgressRef = useRef(0)
  const velocityRef = useRef(0)
  const lastScrollRef = useRef(0)
  const rafRef = useRef(null)
  const onProgressRef = useRef(onProgress)

  useEffect(() => {
    onProgressRef.current = onProgress
  }, [onProgress])

  useEffect(() => {
    const driver = document.getElementById('scroll-driver')
    if (!driver) return

    const onScroll = () => {
      const inner = document.getElementById('scroll-inner')
      if (!inner) return
      const maxScroll = inner.scrollHeight - driver.clientHeight
      if (maxScroll <= 0) return

      const raw = driver.scrollTop / maxScroll
      targetProgressRef.current = Math.min(1, Math.max(0, raw))

      // velocity
      velocityRef.current = driver.scrollTop - lastScrollRef.current
      lastScrollRef.current = driver.scrollTop
    }

    driver.addEventListener('scroll', onScroll, { passive: true })

    const tick = () => {
      // Smooth lerp toward target
      const current = progressRef.current
      const target = targetProgressRef.current
      const lerped = current + (target - current) * 0.07

      progressRef.current = lerped

      // Decay velocity
      velocityRef.current *= 0.85

      // Update progress bar
      const bar = document.getElementById('progress-bar')
      if (bar) bar.style.width = `${lerped * 100}%`

      // Fire callback
      if (onProgressRef.current) {
        onProgressRef.current(lerped, velocityRef.current)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      driver.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return { progressRef, velocityRef }
}
