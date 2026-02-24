/**
 * NameExplosion
 * ─────────────
 * The cinematic intro: "ALFRED JOHN" as floating metallic fragments,
 * shattered by the car. Built from instanced box geometry for performance.
 *
 * Phases:
 *  - Phase 0 (progress < 0.04): Fragments hover in formation, glowing
 *  - Phase 1 (0.04 - 0.10): Explosion — fragments scatter outward
 *  - Phase 2 (> 0.10): Fragments off-screen, invisible
 */

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Letter patterns: 5x7 pixel grid, 1 = filled
const LETTERS = {
  A: [
    [0,1,1,0],
    [1,0,0,1],
    [1,1,1,1],
    [1,0,0,1],
    [1,0,0,1],
  ],
  L: [
    [1,0,0,0],
    [1,0,0,0],
    [1,0,0,0],
    [1,0,0,0],
    [1,1,1,1],
  ],
  F: [
    [1,1,1,1],
    [1,0,0,0],
    [1,1,1,0],
    [1,0,0,0],
    [1,0,0,0],
  ],
  R: [
    [1,1,1,0],
    [1,0,0,1],
    [1,1,1,0],
    [1,0,1,0],
    [1,0,0,1],
  ],
  E: [
    [1,1,1,1],
    [1,0,0,0],
    [1,1,1,0],
    [1,0,0,0],
    [1,1,1,1],
  ],
  D: [
    [1,1,1,0],
    [1,0,0,1],
    [1,0,0,1],
    [1,0,0,1],
    [1,1,1,0],
  ],
  J: [
    [0,1,1,1],
    [0,0,0,1],
    [0,0,0,1],
    [1,0,0,1],
    [0,1,1,0],
  ],
  O: [
    [0,1,1,0],
    [1,0,0,1],
    [1,0,0,1],
    [1,0,0,1],
    [0,1,1,0],
  ],
  H: [
    [1,0,0,1],
    [1,0,0,1],
    [1,1,1,1],
    [1,0,0,1],
    [1,0,0,1],
  ],
  N: [
    [1,0,0,1],
    [1,1,0,1],
    [1,0,1,1],
    [1,0,0,1],
    [1,0,0,1],
  ],
}

// Generate fragment positions from letter patterns
function buildFragments() {
  const CELL = 0.55   // size of each block
  const GAP  = 0.1    // gap between blocks
  const STEP = CELL + GAP
  const COL_W = 4 * STEP  // width of one letter (4 cols)
  const LETTER_GAP = STEP * 1.4

  const line1 = ['A','L','F','R','E','D']
  const line2 = ['J','O','H','N']

  const fragments = []

  const processLine = (letters, lineY) => {
    const totalW = letters.length * COL_W + (letters.length - 1) * LETTER_GAP
    let startX = -totalW / 2

    letters.forEach((char, li) => {
      const pattern = LETTERS[char] || []
      const offsetX = startX + li * (COL_W + LETTER_GAP)

      pattern.forEach((row, ri) => {
        row.forEach((val, ci) => {
          if (val) {
            fragments.push({
              originX: offsetX + ci * STEP,
              originY: lineY - ri * STEP,
              originZ: 0,
              // Each fragment gets random explosion velocity
              vx: (Math.random() - 0.5) * 22,
              vy: (Math.random() - 0.5) * 18 + 3,
              vz: (Math.random() - 0.5) * 14 + 6,
              rx: (Math.random() - 0.5) * 8,
              ry: (Math.random() - 0.5) * 8,
              rz: (Math.random() - 0.5) * 8,
            })
          }
        })
      })
    })
  }

  processLine(line1, 2.4)
  processLine(line2, -0.2)

  return fragments
}

export function NameExplosion({ scrollProgress }) {
  const meshRef = useRef()
  const fragments = useMemo(() => buildFragments(), [])
  const count = fragments.length

  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Explosion time tracking
  const explodedRef = useRef(false)
  const explodeTimeRef = useRef(0)

  useFrame(({ clock }) => {
    if (!meshRef.current) return

    const EXPLODE_AT = 0.04
    const FADE_AT    = 0.12

    // Trigger explosion
    if (scrollProgress >= EXPLODE_AT && !explodedRef.current) {
      explodedRef.current = true
      explodeTimeRef.current = clock.elapsedTime
    }

    const elapsed = explodedRef.current
      ? clock.elapsedTime - explodeTimeRef.current
      : 0

    // Scale whole group to zero if past fade threshold
    const globalScale = scrollProgress > FADE_AT
      ? Math.max(0, 1 - (scrollProgress - FADE_AT) * 20)
      : 1

    meshRef.current.parent.scale.setScalar(globalScale)

    fragments.forEach((frag, i) => {
      if (!explodedRef.current) {
        // Hovering formation — gentle float
        const t = clock.elapsedTime
        dummy.position.set(
          frag.originX,
          frag.originY + Math.sin(t * 1.2 + i * 0.15) * 0.06,
          frag.originZ,
        )
        dummy.rotation.set(
          Math.sin(t * 0.8 + i) * 0.04,
          Math.sin(t * 0.6 + i * 0.3) * 0.04,
          0,
        )
        dummy.scale.setScalar(1)
      } else {
        // Explosion physics
        const dt = elapsed
        const drag = Math.max(0, 1 - dt * 0.6)

        dummy.position.set(
          frag.originX + frag.vx * dt * drag,
          frag.originY + frag.vy * dt * drag - 4.9 * dt * dt,
          frag.originZ + frag.vz * dt * drag,
        )
        dummy.rotation.set(
          frag.rx * dt,
          frag.ry * dt,
          frag.rz * dt,
        )
        dummy.scale.setScalar(Math.max(0, 1 - dt * 0.5))
      }

      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    // Position in front of car's start point at eye level
    <group position={[0, 2, 12]}>
      <instancedMesh ref={meshRef} args={[null, null, count]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.12]} />
        <meshStandardMaterial
          color="#1a0a00"
          roughness={0.15}
          metalness={0.95}
          emissive="#ff8c00"
          emissiveIntensity={0.5}
        />
      </instancedMesh>

      {/* Central glow point */}
      <pointLight color="#ff8c00" intensity={scrollProgress < 0.04 ? 4 : 0} distance={15} decay={2} />
    </group>
  )
}
