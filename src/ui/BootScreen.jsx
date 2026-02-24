/**
 * BootScreen
 * ──────────
 * Cyberpunk terminal boot sequence.
 * Pure CSS + GSAP animation. No Three.js.
 * Glitch effect, progress bar, text reveal.
 */

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const LINES = [
  { text: 'SYSTEM BOOTING...', delay: 0.3 },
  { text: 'ENGINE IGNITION SEQUENCE INITIATED...', delay: 0.9 },
  { text: 'NEURAL INTERFACE CONNECTED...', delay: 1.5 },
  { text: 'LOADING ENVIRONMENT ASSETS... [▓▓▓▓▓▓▓▓▓▓▓▓] 100%', delay: 2.1 },
  { text: 'ALL SYSTEMS NOMINAL.', delay: 2.8 },
]

export function BootScreen({ onComplete }) {
  const rootRef  = useRef()
  const linesRef = useRef([])
  const nameRef  = useRef()
  const subRef   = useRef()
  const barRef   = useRef()
  const barFill  = useRef()

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(rootRef.current, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: () => {
            if (rootRef.current) rootRef.current.style.display = 'none'
            onComplete?.()
          },
        })
      },
    })

    // Boot lines
    LINES.forEach((line, i) => {
      tl.to(linesRef.current[i], { opacity: 1, duration: 0.3, ease: 'none' }, line.delay)
    })

    // Bar
    tl.to(barRef.current, { opacity: 1, duration: 0.2 }, 1.8)
    tl.to(barFill.current, { width: '100%', duration: 1.2, ease: 'power1.inOut' }, 1.9)

    // Name reveal with glitch
    tl.to(nameRef.current, { opacity: 1, duration: 0 }, 3.2)
    tl.to(nameRef.current, {
      keyframes: [
        { x: -4, duration: 0.05 },
        { x: 4,  duration: 0.05 },
        { x: -2, duration: 0.05 },
        { x: 0,  duration: 0.05 },
      ],
    }, 3.2)
    tl.to(subRef.current, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 3.5)

    // Hold then exit
    tl.to({}, { duration: 1.2 }, 4.2)

    return () => tl.kill()
  }, [onComplete])

  return (
    <div id="boot-screen" ref={rootRef}>
      <div className="boot-scanline" />

      <div className="boot-content">
        <div className="boot-tag">// SYSTEM OVERRIDE v3.1 — ALFRED JOHN PORTFOLIO</div>

        {LINES.map((line, i) => (
          <div
            key={i}
            className="boot-line"
            ref={el => linesRef.current[i] = el}
          >
            {line.text}
          </div>
        ))}

        <div className="boot-bar-wrap" ref={barRef}>
          <div className="boot-bar-fill" ref={barFill} />
        </div>

        <div className="boot-name" ref={nameRef}>
          ALFRED JOHN
        </div>
        <div className="boot-sub" ref={subRef}>
          ONLINE &nbsp;—&nbsp; ELECTRICAL &amp; ELECTRONICS ENGINEER
        </div>
      </div>

      <div className="boot-skip" onClick={() => {
        if (rootRef.current) rootRef.current.style.display = 'none'
        onComplete?.()
      }}>
        [ SKIP BOOT ]
      </div>
    </div>
  )
}
