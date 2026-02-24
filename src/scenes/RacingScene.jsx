/**
 * RacingScene — Clean, zero-error version
 * Only imports: @react-three/fiber, three, local components
 */

import React, { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import { Car } from '../components/Car.jsx'
import { CanyonEnvironment } from '../components/CanyonEnvironment.jsx'
import { DustSystem } from '../components/DustSystem.jsx'
import { NameExplosion } from '../components/NameExplosion.jsx'
import { roadCurve } from './roadPath.js'

const CAM_BACK  = 7.5
const CAM_UP    = 3.0
const CAM_LERP  = 0.055
const LOOK_LERP = 0.08

export function RacingScene({ scrollProgress = 0, scrollVelocity = 0 }) {
  return (
    <Canvas
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
        powerPreference: 'high-performance',
      }}
      shadows="soft"
      dpr={[1, 1.5]}
      camera={{ fov: 62, near: 0.2, far: 600, position: [0, 4, -10] }}
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      {/* Canyon atmosphere */}
      <fog attach="fog" args={['#c85a00', 55, 260]} />
      <color attach="background" args={['#200a00']} />

      <SceneContent
        scrollProgress={scrollProgress}
        scrollVelocity={scrollVelocity}
      />
    </Canvas>
  )
}

function SceneContent({ scrollProgress, scrollVelocity }) {
  const { camera } = useThree()
  const carGroupRef  = useRef()
  const carWorldPos  = useRef(new THREE.Vector3())   // shared ref for dust
  const camPos       = useRef(new THREE.Vector3(0, 4, -10))
  const camLook      = useRef(new THREE.Vector3(0, 1, 4))
  const mouseX       = useRef(0)

  React.useEffect(() => {
    const fn = (e) => { mouseX.current = (e.clientX / window.innerWidth) * 2 - 1 }
    window.addEventListener('mousemove', fn)
    return () => window.removeEventListener('mousemove', fn)
  }, [])

  useFrame((_, delta) => {
    if (!carGroupRef.current) return

    const t = Math.min(0.9999, Math.max(0.0001, scrollProgress))

    // Car position on spline
    const carPos  = roadCurve.getPointAt(t)
    const tangent = roadCurve.getTangentAt(t)

    // Update car transform
    carGroupRef.current.position.copy(carPos)
    const targetY = Math.atan2(tangent.x, tangent.z)
    const curY    = carGroupRef.current.rotation.y
    const diff    = ((targetY - curY + Math.PI) % (Math.PI * 2)) - Math.PI
    carGroupRef.current.rotation.y += diff * 0.1

    // Store world position for dust system
    carWorldPos.current.copy(carPos)

    // Camera
    const speed = Math.abs(scrollVelocity)
    const back   = new THREE.Vector3(-tangent.x, 0, -tangent.z)
    const idealP = new THREE.Vector3(
      carPos.x + back.x * CAM_BACK + mouseX.current * 0.7,
      carPos.y + CAM_UP + Math.min(speed * 0.004, 0.6),
      carPos.z + back.z * CAM_BACK,
    )

    camPos.current.lerp(idealP, CAM_LERP)
    camera.position.copy(camPos.current)

    // Look ahead
    const tLook  = Math.min(0.9999, t + 0.018)
    const ahead  = roadCurve.getPointAt(tLook)
    const idealL = new THREE.Vector3(
      ahead.x + mouseX.current * 0.25,
      ahead.y + 0.9,
      ahead.z,
    )
    camLook.current.lerp(idealL, LOOK_LERP)
    camera.lookAt(camLook.current)

    // Cinematic turn tilt
    const curv = Math.abs(tangent.x)
    if (curv > 0.2) {
      camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, -tangent.x * 0.04, 0.06)
    } else {
      camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, 0, 0.04)
    }
  })

  return (
    <>
      <group ref={carGroupRef}>
        <Car scrollVelocity={scrollVelocity} />
      </group>

      {/* Dust: pass the ref so DustSystem reads position every frame */}
      <DustSystem positionRef={carWorldPos} scrollVelocity={scrollVelocity} />

      <NameExplosion scrollProgress={scrollProgress} />

      <CanyonEnvironment />
    </>
  )
}
