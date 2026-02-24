/**
 * Car
 * ───
 * Procedural cyberpunk off-road vehicle.
 * Built entirely from Three.js geometry — no GLTF needed.
 * Features: neon undercarriage, glowing headlights, animated wheels,
 * suspension bounce, body roll on curves.
 */

import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Materials defined once outside component (performance)
const matBody = new THREE.MeshStandardMaterial({
  color: '#0a0a0a',
  roughness: 0.2,
  metalness: 0.9,
})

const matAccent = new THREE.MeshStandardMaterial({
  color: '#ff8c00',
  roughness: 0.3,
  metalness: 0.8,
  emissive: '#ff6600',
  emissiveIntensity: 0.4,
})

const matCyan = new THREE.MeshStandardMaterial({
  color: '#00e5ff',
  roughness: 0.1,
  metalness: 0.5,
  emissive: '#00e5ff',
  emissiveIntensity: 0.8,
})

const matWheel = new THREE.MeshStandardMaterial({
  color: '#111111',
  roughness: 0.9,
  metalness: 0.1,
})

const matRim = new THREE.MeshStandardMaterial({
  color: '#333333',
  roughness: 0.3,
  metalness: 0.95,
})

const matGlass = new THREE.MeshStandardMaterial({
  color: '#001a22',
  roughness: 0,
  metalness: 0,
  transparent: true,
  opacity: 0.7,
})

const matUnderglow = new THREE.MeshStandardMaterial({
  color: '#00e5ff',
  emissive: '#00e5ff',
  emissiveIntensity: 1.5,
  roughness: 0.1,
})

export function Car({ scrollVelocity = 0 }) {
  const bodyRef = useRef()
  const wheelsRef = useRef([])
  const rollRef = useRef(0)
  const bounceRef = useRef(0)

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    const speed = Math.abs(scrollVelocity)

    // Body roll based on scroll velocity (simulates turning)
    const targetRoll = -scrollVelocity * 0.003
    rollRef.current += (targetRoll - rollRef.current) * 0.08
    if (bodyRef.current) {
      bodyRef.current.rotation.z = rollRef.current
    }

    // Suspension bounce — subtle at rest, more on high speed
    const bounceAmt = 0.015 + speed * 0.0003
    const bounce = Math.sin(t * 8 + speed * 0.1) * bounceAmt
    if (bodyRef.current) {
      bodyRef.current.position.y = 0.55 + bounce
    }

    // Wheel spin
    const spinSpeed = 0.5 + speed * 0.08
    wheelsRef.current.forEach((w) => {
      if (w) w.rotation.x -= spinSpeed * delta
    })
  })

  const wheelPositions = [
    [-0.88,  0,  0.88], // FL
    [ 0.88,  0,  0.88], // FR
    [-0.88,  0, -0.88], // RL
    [ 0.88,  0, -0.88], // RR
  ]

  return (
    <group>
      {/* ── Body group (rolls with turns) ── */}
      <group ref={bodyRef} position={[0, 0.55, 0]}>

        {/* Main body shell */}
        <mesh castShadow position={[0, 0, 0]}>
          <boxGeometry args={[1.6, 0.38, 2.6]} />
          <primitive object={matBody} />
        </mesh>

        {/* Cabin / roof */}
        <mesh castShadow position={[0, 0.35, -0.1]}>
          <boxGeometry args={[1.3, 0.38, 1.4]} />
          <primitive object={matBody} />
        </mesh>

        {/* Windshield */}
        <mesh position={[0, 0.34, 0.55]}>
          <boxGeometry args={[1.25, 0.36, 0.05]} />
          <primitive object={matGlass} />
        </mesh>

        {/* Rear window */}
        <mesh position={[0, 0.28, -0.79]}>
          <boxGeometry args={[1.2, 0.28, 0.05]} />
          <primitive object={matGlass} />
        </mesh>

        {/* Side windows L */}
        <mesh position={[-0.66, 0.32, -0.1]}>
          <boxGeometry args={[0.04, 0.28, 0.9]} />
          <primitive object={matGlass} />
        </mesh>

        {/* Side windows R */}
        <mesh position={[0.66, 0.32, -0.1]}>
          <boxGeometry args={[0.04, 0.28, 0.9]} />
          <primitive object={matGlass} />
        </mesh>

        {/* Hood / bonnet */}
        <mesh castShadow position={[0, 0.05, 0.95]}>
          <boxGeometry args={[1.55, 0.1, 0.65]} />
          <primitive object={matBody} />
        </mesh>

        {/* Rear trunk */}
        <mesh castShadow position={[0, 0.05, -1.0]}>
          <boxGeometry args={[1.55, 0.12, 0.55]} />
          <primitive object={matBody} />
        </mesh>

        {/* Roof rack (off-road look) */}
        {[-0.5, 0, 0.5].map((x, i) => (
          <mesh key={i} position={[x, 0.56, -0.1]}>
            <boxGeometry args={[0.06, 0.04, 1.1]} />
            <primitive object={matAccent} />
          </mesh>
        ))}

        {/* Front bull bar */}
        <mesh position={[0, -0.1, 1.36]}>
          <boxGeometry args={[1.5, 0.06, 0.06]} />
          <primitive object={matAccent} />
        </mesh>
        <mesh position={[-0.65, -0.03, 1.3]}>
          <boxGeometry args={[0.06, 0.22, 0.18]} />
          <primitive object={matAccent} />
        </mesh>
        <mesh position={[0.65, -0.03, 1.3]}>
          <boxGeometry args={[0.06, 0.22, 0.18]} />
          <primitive object={matAccent} />
        </mesh>

        {/* Side armor strips */}
        {[-0.82, 0.82].map((x, i) => (
          <React.Fragment key={i}>
            <mesh position={[x, -0.06, 0]}>
              <boxGeometry args={[0.08, 0.1, 2.2]} />
              <primitive object={matAccent} />
            </mesh>
            {/* Cyan accent line */}
            <mesh position={[x, -0.01, 0]}>
              <boxGeometry args={[0.06, 0.03, 2.0]} />
              <primitive object={matCyan} />
            </mesh>
          </React.Fragment>
        ))}

        {/* Headlights - twin LEDs */}
        {[-0.45, 0.45].map((x, i) => (
          <mesh key={i} position={[x, 0.05, 1.31]}>
            <boxGeometry args={[0.28, 0.1, 0.04]} />
            <primitive object={matCyan} />
          </mesh>
        ))}

        {/* Tail lights */}
        {[-0.5, 0.5].map((x, i) => (
          <mesh key={i} position={[x, 0.05, -1.3]}>
            <boxGeometry args={[0.22, 0.08, 0.04]} />
            <meshStandardMaterial color="#ff2244" emissive="#ff2244" emissiveIntensity={1.5} />
          </mesh>
        ))}

        {/* Underglow strip */}
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[1.55, 0.02, 2.4]} />
          <primitive object={matUnderglow} />
        </mesh>

        {/* Exhaust */}
        <mesh position={[0.5, -0.16, -1.35]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.055, 0.07, 0.18, 8]} />
          <meshStandardMaterial color="#222" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* Snorkel (off-road aesthetic) */}
        <mesh position={[0.81, 0.55, 0.3]}>
          <cylinderGeometry args={[0.04, 0.04, 0.7, 6]} />
          <primitive object={matBody} />
        </mesh>
        <mesh position={[0.81, 0.92, 0.1]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.2, 6]} />
          <primitive object={matBody} />
        </mesh>

        {/* Lights (point lights from headlights) */}
        <pointLight position={[0, 0, 1.5]} color="#00e5ff" intensity={3} distance={12} decay={2} />
        <pointLight position={[0, -0.3, 0]} color="#00e5ff" intensity={1.5} distance={4} decay={2} />
        <pointLight position={[0, 0, -1.5]} color="#ff2244" intensity={1.5} distance={5} decay={2} />
      </group>

      {/* ── Wheels (outside body group so they don't roll with body) ── */}
      {wheelPositions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Tire */}
          <mesh
            ref={el => wheelsRef.current[i] = el}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.36, 0.36, 0.3, 16]} />
            <primitive object={matWheel} />
          </mesh>
          {/* Rim */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.22, 0.32, 8]} />
            <primitive object={matRim} />
          </mesh>
          {/* Rim spokes */}
          {[0, 1, 2, 3].map((s) => (
            <mesh key={s} rotation={[s * Math.PI / 4, 0, Math.PI / 2]}>
              <boxGeometry args={[0.32, 0.04, 0.06]} />
              <primitive object={matRim} />
            </mesh>
          ))}
          {/* Lug nut accent */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.07, 0.34, 6]} />
            <meshStandardMaterial color="#ff8c00" emissive="#ff8c00" emissiveIntensity={0.6} metalness={0.9} />
          </mesh>
          {/* Mud flap */}
          <mesh position={[0, -0.3, i < 2 ? -0.1 : 0.1]}>
            <boxGeometry args={[0.32, 0.2, 0.04]} />
            <primitive object={matBody} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
