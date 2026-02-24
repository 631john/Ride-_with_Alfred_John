/**
 * CanyonEnvironment
 * ─────────────────
 * Sunny desert canyon with cyberpunk accents.
 * - Procedural road surface from CatmullRomCurve3
 * - Canyon wall geometry
 * - Rock formations (instanced)
 * - Warm directional sun + ambient
 * - Distant haze via fog
 */

import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { roadCurve, roadPoints } from '../scenes/roadPath.js'

// Seeded random helper
function sr(seed) {
  const x = Math.sin(seed + 1.7) * 43758.5453
  return x - Math.floor(x)
}

// Road surface geometry from spline
function buildRoadGeometry() {
  const tube = new THREE.TubeGeometry(roadCurve, 400, 4.2, 8, false)
  return tube
}

// Canyon wall: array of tall boxes placed beside road points
function buildCanyonWalls() {
  // We create wall segments every N points
  const wallData = []
  const step = 8
  for (let i = 0; i < roadPoints.length; i += step) {
    const pt = roadPoints[i]
    const normal = new THREE.Vector3()
    // Approximate lateral direction
    const next = roadPoints[Math.min(i + step, roadPoints.length - 1)]
    const tangent = next.clone().sub(pt).normalize()
    normal.crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize()

    const wallDist = 14 + sr(i) * 10
    const wallH = 18 + sr(i * 3) * 22
    const wallW = 6 + sr(i * 7) * 8
    const wallD = step * 0.5 + sr(i * 11) * 4

    // Left wall
    wallData.push({
      pos: pt.clone().addScaledVector(normal, -wallDist),
      h: wallH, w: wallW, d: wallD,
      rot: Math.atan2(tangent.x, tangent.z),
    })
    // Right wall
    wallData.push({
      pos: pt.clone().addScaledVector(normal, wallDist),
      h: wallH, w: wallW, d: wallD,
      rot: Math.atan2(tangent.x, tangent.z),
    })
  }
  return wallData
}

export function CanyonEnvironment() {
  const roadGeo = useMemo(() => buildRoadGeometry(), [])
  const wallData = useMemo(() => buildCanyonWalls(), [])

  // Road material - dark asphalt with subtle orange tint in cracks
  const roadMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1a1410',
    roughness: 0.9,
    metalness: 0.0,
  }), [])

  // Canyon rock material
  const rockMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8b4a2a',
    roughness: 0.95,
    metalness: 0.0,
  }), [])

  const rockMatLight = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#c4713a',
    roughness: 0.9,
    metalness: 0.0,
  }), [])

  // Ground material (sandy canyon floor)
  const groundMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#6b3c1a',
    roughness: 1,
    metalness: 0,
  }), [])

  return (
    <group>
      {/* ── Warm dusk sky fog ── */}
      {/* (fog is attached in Canvas scene) */}

      {/* ── Ground plane ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 230]} receiveShadow>
        <planeGeometry args={[300, 600]} />
        <primitive object={groundMat} />
      </mesh>

      {/* ── Road surface ── */}
      <mesh geometry={roadGeo} receiveShadow>
        <primitive object={roadMat} />
      </mesh>

      {/* ── Road center line ── */}
      <RoadMarkings />

      {/* ── Canyon walls ── */}
      {wallData.map((w, i) => {
        const col = i % 4 === 0 ? rockMatLight : rockMat
        return (
          <mesh
            key={i}
            position={[w.pos.x, w.pos.y + w.h / 2 - 8, w.pos.z]}
            rotation={[0, w.rot, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[w.w, w.h, w.d]} />
            <primitive object={col} />
          </mesh>
        )
      })}

      {/* ── Rock boulders alongside road ── */}
      <RockBoulders rockMat={rockMat} rockMatLight={rockMatLight} />

      {/* ── Holographic roadside markers (cyberpunk detail) ── */}
      <RoadsideMarkers />

      {/* ── Lighting ── */}

      {/* Strong golden sun from behind-right */}
      <directionalLight
        position={[40, 35, -60]}
        color="#ffb347"
        intensity={2.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={500}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
      />

      {/* Sky fill - warm blue-orange gradient */}
      <hemisphereLight
        skyColor="#ff6600"
        groundColor="#1a0800"
        intensity={0.6}
      />

      {/* Secondary cool fill from front */}
      <directionalLight
        position={[-20, 10, 80]}
        color="#c8e8ff"
        intensity={0.3}
      />

      {/* Ambient */}
      <ambientLight color="#3a1a00" intensity={0.4} />
    </group>
  )
}

// Dashed center line on road
function RoadMarkings() {
  const markMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffb347',
    emissive: '#ff6600',
    emissiveIntensity: 0.3,
    roughness: 0.4,
  }), [])

  const marks = useMemo(() => {
    const arr = []
    const total = 80
    for (let i = 0; i < total; i++) {
      const t = i / total
      const pt = roadCurve.getPointAt(t)
      const tangent = roadCurve.getTangentAt(t)
      arr.push({ pos: pt, rot: Math.atan2(tangent.x, tangent.z) })
    }
    return arr
  }, [])

  return (
    <group>
      {marks.map((m, i) => (
        i % 2 === 0 && (
          <mesh key={i} position={[m.pos.x, m.pos.y + 0.08, m.pos.z]} rotation={[0, m.rot, 0]}>
            <boxGeometry args={[0.12, 0.04, 2.5]} />
            <primitive object={markMat} />
          </mesh>
        )
      ))}
    </group>
  )
}

// Boulder clusters beside road
function RockBoulders({ rockMat, rockMatLight }) {
  const boulders = useMemo(() => {
    const arr = []
    const count = 120
    for (let i = 0; i < count; i++) {
      const t = sr(i * 5) * 0.98
      const pt = roadCurve.getPointAt(t)
      const tangent = roadCurve.getTangentAt(t)
      const normal = new THREE.Vector3()
      normal.crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize()

      const side = i % 2 === 0 ? 1 : -1
      const dist = 6 + sr(i * 7) * 12
      const s = 0.5 + sr(i * 11) * 2.5
      const mat = i % 3 === 0 ? 'light' : 'dark'

      arr.push({
        pos: pt.clone().addScaledVector(normal, side * dist),
        scale: [s * (0.7 + sr(i) * 0.6), s * (0.5 + sr(i * 2) * 0.5), s * (0.6 + sr(i * 3) * 0.7)],
        rot: sr(i * 13) * Math.PI * 2,
        mat,
      })
    }
    return arr
  }, [])

  return (
    <group>
      {boulders.map((b, i) => (
        <mesh
          key={i}
          position={[b.pos.x, b.pos.y - 1, b.pos.z]}
          scale={b.scale}
          rotation={[sr(i) * 0.5, b.rot, sr(i * 7) * 0.5]}
          castShadow
        >
          <dodecahedronGeometry args={[1, 0]} />
          <primitive object={b.mat === 'light' ? rockMatLight : rockMat} />
        </mesh>
      ))}
    </group>
  )
}

// Holographic energy posts beside road (cyberpunk accent)
function RoadsideMarkers() {
  const markers = useMemo(() => {
    const arr = []
    const count = 30
    for (let i = 0; i < count; i++) {
      const t = 0.05 + (i / count) * 0.9
      const pt = roadCurve.getPointAt(t)
      const tangent = roadCurve.getTangentAt(t)
      const normal = new THREE.Vector3()
      normal.crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize()
      const side = i % 2 === 0 ? 1 : -1

      arr.push({
        pos: pt.clone().addScaledVector(normal, side * 5.5),
        color: i % 3 === 0 ? '#00e5ff' : '#ff8c00',
      })
    }
    return arr
  }, [])

  return (
    <group>
      {markers.map((m, i) => (
        <group key={i} position={[m.pos.x, m.pos.y, m.pos.z]}>
          {/* Post */}
          <mesh>
            <cylinderGeometry args={[0.05, 0.05, 2.2, 6]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.9} />
          </mesh>
          {/* Glow cap */}
          <mesh position={[0, 1.2, 0]}>
            <sphereGeometry args={[0.12, 6, 6]} />
            <meshStandardMaterial
              color={m.color}
              emissive={m.color}
              emissiveIntensity={2}
              roughness={0.1}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
