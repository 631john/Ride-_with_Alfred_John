/**
 * HUD
 * ───
 * Cyberpunk dashboard overlay.
 * Shows speed (driven by scroll velocity), section name, system metrics.
 * Pure CSS — no Three.js.
 */

import React, { useState, useEffect, useRef } from 'react'
import { SECTIONS } from '../scenes/roadPath.js'

function lerp(a, b, t) { return a + (b - a) * t }

const SECTION_LABELS = {
  about:        'SECTION 01 — ABOUT ME',
  work:         'SECTION 02 — CURRENT WORK',
  projects:     'SECTION 03 — PROJECTS',
  internships:  'SECTION 04 — INTERNSHIPS',
  achievements: 'SECTION 05 — ACHIEVEMENTS',
  contact:      'SECTION 06 — CONTACT',
}

export function HUD({ scrollProgress, scrollVelocity, visible }) {
  const [displaySpeed, setDisplaySpeed] = useState(0)
  const [sysLoad, setSysLoad] = useState(76)
  const [enginePow, setEnginePow] = useState(88)
  const [activeSection, setActiveSection] = useState(null)
  const speedRef = useRef(0)
  const rafRef = useRef(null)
  const sysLoadTarget = useRef(76)

  useEffect(() => {
    const interval = setInterval(() => {
      sysLoadTarget.current = 65 + Math.random() * 25
    }, 2200)

    const tick = () => {
      const targetSpeed = Math.min(320, Math.abs(scrollVelocity) * 18 + scrollProgress * 80)
      speedRef.current = lerp(speedRef.current, targetSpeed, 0.06)
      setDisplaySpeed(Math.round(speedRef.current))

      setSysLoad(prev => {
        const next = lerp(prev, sysLoadTarget.current, 0.03)
        return Math.round(next)
      })
      setEnginePow(Math.round(75 + scrollProgress * 20 + Math.sin(Date.now() * 0.001) * 5))

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      clearInterval(interval)
      cancelAnimationFrame(rafRef.current)
    }
  }, [scrollVelocity, scrollProgress])

  // Detect active section
  useEffect(() => {
    const found = SECTIONS.find(s => scrollProgress >= s.tStart && scrollProgress <= s.tEnd)
    setActiveSection(found ? found.id : null)
  }, [scrollProgress])

  if (!visible) return null

  const journey = Math.round(scrollProgress * 100)
  const barFill = (val, max = 100) => `${Math.round((val / max) * 100)}%`

  return (
    <div id="hud-layer">
      {/* Top left: section label */}
      <div className="hud-corner hud-tl">
        <div style={{ fontSize: '0.55rem', opacity: 0.5, marginBottom: '0.2rem' }}>
          // SYSTEM OVERRIDE
        </div>
        <div style={{ color: activeSection ? 'var(--c-cyan)' : 'var(--c-amber)' }}>
          {activeSection ? SECTION_LABELS[activeSection] : 'ALFRED JOHN — ACTIVE'}
        </div>
        <div style={{ marginTop: '0.3rem', fontSize: '0.52rem', color: 'var(--c-sub)' }}>
          JOURNEY: {journey}% COMPLETE
        </div>
      </div>

      {/* Top right: speed */}
      <div className="hud-corner hud-tr">
        <div className="hud-speed">{displaySpeed}</div>
        <div className="hud-speed-unit">KM/H</div>
      </div>

      {/* Bottom left: metrics bars */}
      <div className="hud-corner hud-bl">
        <div className="hud-bar-row">
          <HudBar label="ENGINE" value={enginePow} max={100} />
          <HudBar label="SYS LOAD" value={sysLoad} max={100} />
          <HudBar label="SIGNAL" value={88 + scrollProgress * 12} max={100} />
          <HudBar label="GRIP" value={Math.max(20, 90 - Math.abs(scrollVelocity) * 0.5)} max={100} />
        </div>
      </div>

      {/* Bottom right: coordinates */}
      <div className="hud-corner hud-br">
        <div style={{ fontSize: '0.52rem', marginBottom: '0.25rem', color: 'var(--c-sub)' }}>GPS TRACK</div>
        <div style={{ color: 'var(--c-amber)', fontFamily: 'var(--f-mono)', fontSize: '0.6rem' }}>
          T: {scrollProgress.toFixed(4)}
        </div>
        <div style={{ color: 'var(--c-sub)', fontFamily: 'var(--f-mono)', fontSize: '0.55rem' }}>
          Δ: {scrollVelocity.toFixed(1)} px/f
        </div>
      </div>

      {/* Section transition flash */}
      {activeSection && <SectionFlash label={SECTION_LABELS[activeSection]} />}
    </div>
  )
}

function HudBar({ label, value, max }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="hud-bar-item">
      <span className="hud-bar-label">{label}</span>
      <div className="hud-bar-track">
        <div className="hud-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="hud-bar-val">{Math.round(value)}%</span>
    </div>
  )
}

function SectionFlash({ label }) {
  return (
    <div className="section-title-overlay visible">
      <div className="section-title-text">{label}</div>
    </div>
  )
}
