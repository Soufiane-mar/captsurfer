import * as THREE from 'three'
import { roundedSlab, ring, latheSolid, knurledBand, gear, screw } from './geometry.js'

// Camera body, assembled around the origin. The lens axis is +Z (the front of the
// camera faces +Z), Y is up. MOUNT_Y is the height of the lens mount centre.
export const MOUNT_Y = -0.04
export const MOUNT_FRONT_Z = 0.205

function mesh(geometry, material, position = [0, 0, 0], rotation = [0, 0, 0]) {
  const m = new THREE.Mesh(geometry, material)
  m.position.set(...position)
  m.rotation.set(...rotation)
  return m
}

function group(children, position = [0, 0, 0], rotation = [0, 0, 0]) {
  const g = new THREE.Group()
  children.forEach((child) => g.add(child))
  g.position.set(...position)
  g.rotation.set(...rotation)
  return g
}

// Slab lying flat: footprint in X/Z, thickness grows upward along +Y from y = 0.
function flatSlab(options) {
  const geometry = roundedSlab(options)
  geometry.rotateX(-Math.PI / 2)
  return geometry
}

function prismProfile(scale = 1) {
  const s = new THREE.Shape()
  const pts = [
    [-0.15, 0],
    [0.19, 0],
    [0.19, 0.03],
    [0.08, 0.235],
    [-0.07, 0.235],
    [-0.15, 0.09],
  ]
  pts.forEach(([z, y], i) => (i === 0 ? s.moveTo(z * scale, y * scale) : s.lineTo(z * scale, y * scale)))
  s.closePath()
  return s
}

// Pentaprism hump: profile drawn in (z, y), extruded across X, then tapered so the
// roof is narrower than the base.
function prismGeometry(width, scale = 1) {
  const geometry = new THREE.ExtrudeGeometry(prismProfile(scale), {
    depth: width,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 2,
  })
  geometry.rotateY(-Math.PI / 2)
  geometry.translate(width / 2, 0, 0)
  const position = geometry.attributes.position
  const height = 0.235 * scale
  for (let i = 0; i < position.count; i += 1) {
    const taper = 1 - 0.42 * Math.min(1, Math.max(0, position.getY(i) / height))
    position.setX(i, position.getX(i) * taper)
  }
  geometry.computeVertexNormals()
  return geometry
}

function leverArm() {
  const s = new THREE.Shape()
  s.moveTo(0, -0.022)
  s.lineTo(-0.2, 0.135)
  s.lineTo(-0.212, 0.158)
  s.lineTo(-0.19, 0.17)
  s.lineTo(0, 0.022)
  s.closePath()
  const geometry = new THREE.ExtrudeGeometry(s, { depth: 0.01, bevelEnabled: false })
  geometry.rotateX(-Math.PI / 2)
  return geometry
}

// Exploded offsets below are authored at full spread; this tightens the whole layout
// so the exploded view fits the screen like the reference drawing.
const EXPLODE_SCALE = 0.7

export function createBodyParts(materials) {
  const parts = []
  const add = (object, spec) =>
    parts.push({ object, ...spec, explode: spec.explode.map((v) => v * EXPLODE_SCALE) })

  // Core shell with the rectangular mirror box running front to back.
  const shell = mesh(
    roundedSlab({
      width: 1.4,
      height: 0.62,
      radius: 0.07,
      depth: 0.34,
      bevel: 0.012,
      holes: [{ x: 0, y: MOUNT_Y + 0.05, width: 0.44, height: 0.4, radius: 0.03 }],
    }),
    materials.black,
    [0, -0.05, -0.17],
  )

  // Inside first: shutter, mirror, focusing screen, circuit board, gears, prism glass.
  add(mesh(roundedSlab({ width: 0.48, height: 0.44, radius: 0.02, depth: 0.025, bevel: 0.004 }), materials.stripes, [0, MOUNT_Y, -0.165]), {
    explode: [0, 0, -1.05],
    window: [0.03, 0.17],
  })
  add(mesh(roundedSlab({ width: 0.4, height: 0.3, radius: 0.015, depth: 0.008, bevel: 0.002 }), materials.mirror, [0, MOUNT_Y - 0.02, 0], [-Math.PI / 4, 0, 0]), {
    explode: [0, 0.25, -1.35],
    tilt: [0.6, 0, 0],
    arc: [0, 0.12, 0],
    window: [0.05, 0.2],
  })
  add(mesh(flatSlab({ width: 0.4, height: 0.3, radius: 0.01, depth: 0.006, bevel: 0.002 }), materials.frosted, [0, MOUNT_Y + 0.185, 0]), {
    explode: [0, 0.55, -1.45],
    tilt: [-0.4, 0, 0],
    arc: [0, 0.1, 0],
    window: [0.07, 0.22],
  })
  add(mesh(flatSlab({ width: 0.8, height: 0.26, radius: 0.02, depth: 0.008, bevel: 0.002 }), materials.circuit, [0.1, 0.261, 0]), {
    explode: [0.25, 0.95, -0.35],
    tilt: [0.3, 0, 0.2],
    window: [0.06, 0.21],
  })
  ;[
    { teeth: 18, outerRadius: 0.06, position: [-0.42, 0.268, -0.02], window: [0.08, 0.22] },
    { teeth: 12, outerRadius: 0.036, position: [-0.31, 0.268, 0.06], window: [0.09, 0.23] },
    { teeth: 14, outerRadius: 0.045, position: [-0.55, 0.272, 0.07], window: [0.1, 0.24] },
  ].forEach(({ teeth, outerRadius, position, window }, i) => {
    const geometry = gear({ teeth, outerRadius, rootRadius: outerRadius * 0.86, thickness: 0.01, holeRadius: 0.008 })
    add(mesh(geometry, materials.brass, position), {
      explode: [-0.25 - i * 0.12, 0.85 + i * 0.1, 0.15 + i * 0.05],
      spin: { axis: [0, 1, 0], turns: 1 },
      window,
    })
  })
  add(mesh(prismGeometry(0.34, 0.82), materials.glass, [0, 0.405, 0.01]), {
    explode: [0, 1.35, -0.15],
    tilt: [0.3, 0.4, 0],
    window: [0.1, 0.26],
  })

  // Covers.
  add(mesh(flatSlab({ width: 1.4, height: 0.36, radius: 0.07, depth: 0.14, bevel: 0.016 }), materials.silver, [0, 0.26, 0]), {
    explode: [0, 0.9, 0],
    tilt: [0.1, 0, 0],
    window: [0.15, 0.31],
  })
  const bottomPlate = group(
    [
      mesh(flatSlab({ width: 1.4, height: 0.34, radius: 0.07, depth: 0.03, bevel: 0.01 }), materials.silver),
      mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 32), materials.blackDeep, [0, -0.002, 0]),
      mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.008, 24), materials.silver, [0.32, -0.003, -0.05]),
    ],
    [0, -0.39, 0],
  )
  add(bottomPlate, { explode: [0, -0.85, 0], tilt: [-0.1, 0, 0], window: [0.15, 0.31] })

  const prismHousing = group([
    mesh(prismGeometry(0.44), materials.silver),
    mesh(roundedSlab({ width: 0.17, height: 0.085, radius: 0.015, depth: 0.03, bevel: 0.006 }), materials.black, [0, 0.045, -0.18]),
  ], [0, 0.4, 0])
  add(prismHousing, { explode: [0, 1.6, 0.05], tilt: [0.25, 0, 0], window: [0.2, 0.36] })

  const backDoor = group(
    [
      mesh(roundedSlab({ width: 1.38, height: 0.6, radius: 0.06, depth: 0.035, bevel: 0.01 }), materials.black),
      mesh(roundedSlab({ width: 1.2, height: 0.44, radius: 0.03, depth: 0.004, bevel: 0.001 }), materials.leatherette, [0, 0, -0.004]),
      mesh(roundedSlab({ width: 0.5, height: 0.24, radius: 0.01, depth: 0.006, bevel: 0.002 }), materials.silver, [0, 0.02, 0.035]),
    ],
    [0, -0.05, -0.205],
  )
  add(backDoor, { explode: [0, 0.05, -1.25], tilt: [0, 0.5, 0], arc: [0.25, 0, 0], window: [0.22, 0.38] })

  add(
    mesh(
      roundedSlab({ width: 1.34, height: 0.46, radius: 0.04, depth: 0.006, bevel: 0.002, holes: [{ x: 0, y: MOUNT_Y + 0.08, radius: 0.302 }] }),
      materials.leatherette,
      [0, -0.08, 0.17],
    ),
    { explode: [0, -0.25, 0.75], tilt: [0.25, 0, 0], window: [0.24, 0.4] },
  )
  add(mesh(roundedSlab({ width: 0.15, height: 0.44, radius: 0.06, depth: 0.08, bevel: 0.025 }), materials.rubber, [-0.555, -0.09, 0.176]), {
    explode: [-0.8, -0.1, 0.55],
    tilt: [0, -0.6, 0],
    window: [0.27, 0.42],
  })

  // Lens mount on the front of the body.
  const mountProfile = [
    [[0.236, 0.17], [0.3, 0.17]],
    [[0.3, 0.17], [0.3, 0.192]],
    [[0.3, 0.192], [0.29, 0.205]],
    [[0.29, 0.205], [0.246, 0.205]],
    [[0.246, 0.205], [0.236, 0.195]],
    [[0.236, 0.195], [0.236, 0.17]],
  ]
  add(mesh(latheSolid(mountProfile), materials.silver, [0, MOUNT_Y, 0]), {
    explode: [0, 0.12, 0.32],
    arc: [0, 0.15, 0],
    window: [0.3, 0.44],
  })

  // Top controls.
  const shutterDial = group(
    [
      mesh(ring(0.03, 0.1, 0.012, 0.022, { axis: 'y' }), materials.silver),
      mesh(knurledBand({ radius: 0.11, depth: 0.008, z0: 0.024, z1: 0.074, ridges: 40, innerRadius: 0.02 }), materials.black, [0, 0, 0], [-Math.PI / 2, 0, 0]),
      mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.006, 64), [materials.black, materials.dialTicks, materials.black], [0, 0.077, 0]),
    ],
    [-0.42, 0.4, -0.01],
  )
  add(shutterDial, { explode: [-0.15, 1.45, -0.05], spin: { axis: [0, 1, 0], turns: 1 }, window: [0.31, 0.46] })

  const advanceLever = group(
    [
      mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.01, 40), materials.silver, [0, 0.005, 0]),
      mesh(leverArm(), materials.silver),
      mesh(new THREE.BoxGeometry(0.05, 0.022, 0.028), materials.black, [-0.2, 0.01, -0.155], [0, 0.6, 0]),
    ],
    [-0.42, 0.4, -0.01],
  )
  add(advanceLever, { explode: [-0.5, 1.05, -0.45], tilt: [0, 1.2, 0], window: [0.3, 0.45] })

  const shutterButton = group(
    [
      mesh(ring(0.022, 0.04, 0, 0.012, { axis: 'y', chamfer: 0.003 }), materials.silver),
      mesh(
        latheSolid(
          [
            [[0, 0.004], [0.02, 0.004]],
            [[0.02, 0.004], [0.02, 0.036]],
            [[0.02, 0.036], [0.016, 0.04], [0, 0.038]],
          ],
          { axis: 'y', segments: 48 },
        ),
        materials.silver,
      ),
    ],
    [-0.585, 0.4, 0.085],
  )
  add(shutterButton, { explode: [-0.35, 1.75, 0.35], window: [0.34, 0.48] })

  const filmCounter = group(
    [
      mesh(ring(0.026, 0.036, 0, 0.01, { axis: 'y' }), materials.silver),
      mesh(new THREE.SphereGeometry(0.028, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), materials.glass, [0, 0.004, 0]),
    ],
    [-0.27, 0.4, -0.11],
  )
  add(filmCounter, { explode: [-0.15, 1.2, -0.55], window: [0.33, 0.47] })

  const rewindKnob = group(
    [
      mesh(ring(0.03, 0.09, 0, 0.01, { axis: 'y' }), materials.silver),
      mesh(knurledBand({ radius: 0.085, depth: 0.006, z0: 0.01, z1: 0.06, ridges: 36, innerRadius: 0.02 }), materials.silver, [0, 0, 0], [-Math.PI / 2, 0, 0]),
      mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.006, 48), materials.silver, [0, 0.063, 0]),
      mesh(new THREE.BoxGeometry(0.075, 0.008, 0.016), materials.black, [0.036, 0.07, 0]),
      mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 16), materials.black, [0.07, 0.082, 0]),
    ],
    [0.43, 0.4, -0.01],
  )
  add(rewindKnob, { explode: [0.3, 1.45, -0.05], spin: { axis: [0, 1, 0], turns: 1.5 }, window: [0.32, 0.47] })

  const hotShoe = group(
    [
      mesh(flatSlab({ width: 0.15, height: 0.12, radius: 0.01, depth: 0.01, bevel: 0.002 }), materials.silver),
      mesh(new THREE.BoxGeometry(0.012, 0.02, 0.12), materials.silver, [-0.075, 0.016, 0]),
      mesh(new THREE.BoxGeometry(0.012, 0.02, 0.12), materials.silver, [0.075, 0.016, 0]),
    ],
    [0, 0.635, 0.005],
  )
  add(hotShoe, { explode: [0, 2.0, 0.1], window: [0.36, 0.5] })

  const selfTimer = group(
    [
      mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.012, 32), materials.silver, [0, 0, 0.006], [Math.PI / 2, 0, 0]),
      mesh(new THREE.BoxGeometry(0.022, 0.1, 0.01), materials.black, [-0.02, -0.045, 0.012], [0, 0, -0.4]),
    ],
    [-0.36, 0.05, 0.176],
  )
  add(selfTimer, { explode: [-0.75, 0.15, 0.75], tilt: [0, 0, 1.5], window: [0.36, 0.5] })

  ;[-1, 1].forEach((side) => {
    const lug = group(
      [
        mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.012, 24), materials.silver, [0, 0, 0], [0, 0, Math.PI / 2]),
        mesh(new THREE.TorusGeometry(0.022, 0.006, 12, 32), materials.silver, [side * 0.02, -0.012, 0], [0, Math.PI / 2, 0]),
      ],
      [side * 0.705, 0.18, 0],
    )
    add(lug, { explode: [side * 0.6, 0.1, 0], window: [0.38, 0.5] })
  })

  // Screws spin home: top cover, bottom plate, then the four around the mount.
  const screwAt = (position, rotation, explode, window, axis) => {
    const s = screw(materials)
    s.position.set(...position)
    s.rotation.set(...rotation)
    add(s, { explode, window, spin: { axis, turns: 2 } })
  }
  ;[-1, 1].forEach((side, i) => screwAt([side * 0.61, 0.4, 0.12], [0, 0, 0], [0, 0.45, 0], [0.4 + i * 0.01, 0.52 + i * 0.01], [0, 1, 0]))
  ;[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz], i) =>
    screwAt([sx * 0.61, -0.39, sz * 0.115], [Math.PI, 0, 0], [0, -0.45, 0], [0.39 + i * 0.012, 0.51 + i * 0.012], [0, 1, 0]),
  )
  ;[0, 1, 2, 3].forEach((k) => {
    const a = Math.PI / 4 + (k * Math.PI) / 2
    screwAt(
      [Math.cos(a) * 0.268, MOUNT_Y + Math.sin(a) * 0.268, MOUNT_FRONT_Z],
      [Math.PI / 2, 0, 0],
      [0, 0, 0.35],
      [0.44 + k * 0.012, 0.54 + k * 0.012],
      [0, 1, 0],
    )
  })

  return { anchor: shell, parts }
}
