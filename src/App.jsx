/**
 * App
 * ───
 * Root orchestrator. Connects:
 * 1. Boot screen (one-time)
 * 2. RacingScene (3D canvas, always fixed)
 * 3. Scroll driver (invisible, drives scroll engine)
 * 4. HUD overlay (speed, metrics)
 * 5. Content sections (portfolio panels)
 * 6. Progress bar
 *
 * Scroll architecture:
 * #scroll-driver is a fixed full-screen overflow-y:scroll div.
 * #scroll-inner inside it is 800vh tall.
 * useScrollEngine reads scroll position and converts to [0,1] progress.
 * This avoids all GSAP ScrollTrigger dependency issues.
 */

import React, { useState, useCallback, useRef } from 'react'
import { RacingScene } from './scenes/RacingScene.jsx'
import { BootScreen } from './ui/BootScreen.jsx'
import { HUD } from './ui/HUD.jsx'
import { ContentSections } from './ui/ContentSections.jsx'
import { useScrollEngine } from './hooks/useScrollEngine.js'
import './styles/globals.css'

export default function App() {
  const [booted, setBooted]     = useState(false)
  const [progress, setProgress] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const [hudOn, setHudOn]       = useState(false)

  const handleProgress = useCallback((p, v) => {
    setProgress(p)
    setVelocity(v)
    if (p > 0.01 && !hudOn) setHudOn(true)
  }, [hudOn])

  // Scroll engine only runs after boot completes
  useScrollEngine(booted ? handleProgress : null)

  return (
    <>
      {/* Progress bar */}
      <div id="progress-bar" style={{ width: `${progress * 100}%` }} />

      {/* Boot screen */}
      <BootScreen onComplete={() => setBooted(true)} />

      {/* Fixed 3D canvas — always rendering */}
      <div
        id="canvas-root"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          width: '100vw',
          height: '100vh',
        }}
      >
        <RacingScene
          scrollProgress={progress}
          scrollVelocity={velocity}
        />
      </div>

      {/* Invisible scroll driver — provides actual scroll events */}
      <div id="scroll-driver">
        <div id="scroll-inner" />
      </div>

      {/* HUD overlay */}
      {booted && (
        <HUD
          scrollProgress={progress}
          scrollVelocity={velocity}
          visible={true}
        />
      )}

      {/* Portfolio content panels */}
      {booted && (
        <ContentSections scrollProgress={progress} />
      )}

      {/* Scroll hint */}
      {booted && progress < 0.02 && (
        <div className="scroll-hint">
          <div className="scroll-hint-arrow" />
          SCROLL TO DRIVE
        </div>
      )}
    </>
  )
}
