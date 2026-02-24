/**
 * roadPath.js
 * ───────────
 * Single source of truth for the winding canyon road.
 * All components that need to know about the path import from here.
 * CatmullRomCurve3 with control points mapped to portfolio sections.
 *
 * Section mapping (approximate t values):
 *  0.00 - 0.08  → Intro / launch sequence
 *  0.10 - 0.22  → About Me
 *  0.24 - 0.38  → Current Work
 *  0.40 - 0.54  → Projects
 *  0.56 - 0.68  → Internships
 *  0.70 - 0.82  → Achievements
 *  0.86 - 1.00  → Contact
 */

import * as THREE from 'three'

// Control points for the winding canyon road
// X = lateral, Y = elevation change, Z = forward
const CONTROL_POINTS = [
  new THREE.Vector3(0,    0,    0),     // Start / Launch
  new THREE.Vector3(0,   -0.5,  30),   // Descend toward canyon
  new THREE.Vector3(-18,  -2,   65),   // TURN LEFT  → About Me
  new THREE.Vector3(-22,  -3,   100),  // Straight
  new THREE.Vector3(0,   -4,    135),  // TURN RIGHT → Current Work
  new THREE.Vector3(20,  -4.5,  170),  // Drift right
  new THREE.Vector3(18,  -5,    200),  // TURN → Projects
  new THREE.Vector3(0,   -5.5,  235),  // Straight
  new THREE.Vector3(-15,  -6,   270),  // TURN LEFT → Internships
  new THREE.Vector3(-14,  -6.5, 305),  // Straight
  new THREE.Vector3(10,  -6,    340),  // TURN RIGHT → Achievements
  new THREE.Vector3(16,  -5,    375),  // Straight
  new THREE.Vector3(0,   -3,    415),  // Final straight → Contact
  new THREE.Vector3(0,    0,    460),  // Finish line / viewpoint
]

export const roadCurve = new THREE.CatmullRomCurve3(CONTROL_POINTS, false, 'catmullrom', 0.5)

// Pre-computed points for performance
export const ROAD_POINTS_COUNT = 400
export const roadPoints = roadCurve.getPoints(ROAD_POINTS_COUNT)
export const roadTangents = roadCurve.getTangents ? undefined : undefined

// Section definitions: at what scroll progress each section is "active"
export const SECTIONS = [
  { id: 'about',        tStart: 0.10, tEnd: 0.22, side: 'right' },
  { id: 'work',         tStart: 0.26, tEnd: 0.38, side: 'left'  },
  { id: 'projects',     tStart: 0.41, tEnd: 0.54, side: 'right' },
  { id: 'internships',  tStart: 0.57, tEnd: 0.68, side: 'left'  },
  { id: 'achievements', tStart: 0.71, tEnd: 0.82, side: 'right' },
  { id: 'contact',      tStart: 0.87, tEnd: 1.00, side: 'left'  },
]
