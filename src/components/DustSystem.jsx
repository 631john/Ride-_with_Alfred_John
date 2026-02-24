/**
 * DustSystem - Fixed
 * Accepts positionRef (a React ref to a THREE.Vector3) and reads it
 * every frame in useFrame, so updates are always current.
 */

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 280

export function DustSystem({ positionRef, scrollVelocity = 0 }) {
  const pointsRef = useRef()
  const nextIdx = useRef(0)

  // Per-particle state (typed arrays for speed)
  const state = useMemo(() => ({
    pos: new Float32Array(PARTICLE_COUNT * 3),   // world positions
    vel: new Float32Array(PARTICLE_COUNT * 3),   // velocities
    life: new Float32Array(PARTICLE_COUNT),      // remaining life (0 = dead)
    maxLife: new Float32Array(PARTICLE_COUNT).fill(0).map(() => 0.6 + Math.random() * 1.2),
  }), [])

  const bufferPos = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3)
    // Park all particles below ground initially
    for (let i = 0; i < PARTICLE_COUNT; i++) arr[i * 3 + 1] = -1000
    return arr
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(bufferPos, 3))
    return geo
  }, [bufferPos])

  const material = useMemo(() => new THREE.PointsMaterial({
    color: '#b86030',
    size: 0.28,
    transparent: true,
    opacity: 0.3,
    blending: THREE.NormalBlending,
    depthWrite: false,
    sizeAttenuation: true,
  }), [])

  useFrame((_, delta) => {
    const speed = Math.abs(scrollVelocity)
    const attr = geometry.attributes.position

    // Get current car position
    const carX = positionRef?.current?.x ?? 0
    const carY = positionRef?.current?.y ?? 0
    const carZ = positionRef?.current?.z ?? 0

    // Spawn particles proportional to speed
    const spawnRate = Math.floor(speed * 0.12 + 0.5)
    for (let s = 0; s < spawnRate; s++) {
      const idx = nextIdx.current % PARTICLE_COUNT
      nextIdx.current++

      const side = s % 2 === 0 ? -0.75 : 0.75
      state.pos[idx * 3 + 0] = carX + side + (Math.random() - 0.5) * 0.4
      state.pos[idx * 3 + 1] = carY + 0.1
      state.pos[idx * 3 + 2] = carZ - 1.1 + (Math.random() - 0.5) * 0.3

      state.vel[idx * 3 + 0] = (Math.random() - 0.5) * 1.2
      state.vel[idx * 3 + 1] = 0.4 + Math.random() * 0.6
      state.vel[idx * 3 + 2] = -0.6 - Math.random() * 2.0

      state.life[idx] = state.maxLife[idx]
    }

    // Update all particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      if (state.life[i] <= 0) {
        attr.array[i * 3 + 1] = -1000
        continue
      }
      state.life[i] -= delta

      state.pos[i * 3 + 0] += state.vel[i * 3 + 0] * delta
      state.pos[i * 3 + 1] += state.vel[i * 3 + 1] * delta
      state.pos[i * 3 + 2] += state.vel[i * 3 + 2] * delta

      // Physics
      state.vel[i * 3 + 1] -= 3.5 * delta  // gravity
      state.vel[i * 3 + 0] *= 0.97          // drag

      attr.array[i * 3 + 0] = state.pos[i * 3 + 0]
      attr.array[i * 3 + 1] = state.pos[i * 3 + 1]
      attr.array[i * 3 + 2] = state.pos[i * 3 + 2]
    }

    attr.needsUpdate = true
    material.opacity = Math.min(0.45, 0.08 + speed * 0.006)
  })

  return <points ref={pointsRef} geometry={geometry} material={material} />
}
