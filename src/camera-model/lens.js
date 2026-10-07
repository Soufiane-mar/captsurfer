import * as THREE from 'three'
import { latheSolid, ring, ringSurfaces, knurledBand, lensElement } from './geometry.js'
import { MOUNT_Y, MOUNT_FRONT_Z } from './body.js'
import { lerp } from '../animation/easing.js'
import { NO_OUTLINE_LAYER } from '../scene/inkOutlinePass.js'

// 50mm lens, built in its own space: optical axis +Z, origin on the mount face.
const BLADE_COUNT = 8
const BLADE_PIVOT_RADIUS = 0.19
// Blade swing (radians around its pivot). Measured clear aperture: radius 0.06 when
// stopped down, 0.165 when wide open, where the blades hide behind the housing ring.
const BLADE_CLOSED = 0.4
const BLADE_OPEN = 1.6
const IRIS_HOUSING_RADIUS = 0.163
// Same colour as the page background, so the end of the dive melts into the page.
const LENS_INTERIOR_COLOR = 0x161921
// Inner elements are fainter than the front one so the stack never hazes over.
const INNER_GLASS_OPACITY = 0.08
// Spacing of the lens parts along the axis in the exploded view.
const STACK_SPREAD = 0.8

function mesh(geometry, material, position = [0, 0, 0]) {
  const m = new THREE.Mesh(geometry, material)
  m.position.set(...position)
  return m
}

function group(children, position = [0, 0, 0]) {
  const g = new THREE.Group()
  children.forEach((child) => g.add(child))
  g.position.set(...position)
  return g
}

// Ring geometry expressed around its own centre so the part pivots on itself.
function centredRing(innerRadius, outerRadius, z0, z1, chamfer) {
  const mid = (z0 + z1) / 2
  return ring(innerRadius, outerRadius, z0 - mid, z1 - mid, { chamfer })
}

function bladeShape() {
  const s = new THREE.Shape()
  s.moveTo(0, -0.022)
  s.quadraticCurveTo(0.13, -0.06, 0.24, 0.035)
  s.lineTo(0.232, 0.072)
  s.quadraticCurveTo(0.12, 0.004, 0, 0.022)
  s.closePath()
  return s
}

function createDiaphragm(materials) {
  const root = new THREE.Group()
  const bladeGeometry = new THREE.ExtrudeGeometry(bladeShape(), { depth: 0.002, bevelEnabled: false, curveSegments: 20 })
  const blades = []
  for (let i = 0; i < BLADE_COUNT; i += 1) {
    const angle = (i / BLADE_COUNT) * Math.PI * 2
    const pivot = new THREE.Group()
    pivot.position.set(Math.cos(angle) * BLADE_PIVOT_RADIUS, Math.sin(angle) * BLADE_PIVOT_RADIUS, i * 0.0009)
    pivot.rotation.z = angle + Math.PI
    const blade = new THREE.Mesh(bladeGeometry, materials.blade)
    pivot.add(blade)
    root.add(pivot)
    blades.push(blade)
  }
  root.add(mesh(ring(IRIS_HOUSING_RADIUS, 0.198, 0.008, 0.012), materials.blackDeep))
  return {
    object: root,
    setOpenness(openness) {
      const swing = lerp(BLADE_CLOSED, BLADE_OPEN, openness)
      blades.forEach((blade) => {
        blade.rotation.z = swing
      })
    },
  }
}

export function createLens(materials) {
  const lensGroup = new THREE.Group()
  const parts = []
  const glassElements = []

  // Light baffle tube: the lens' fixed core that every other part assembles around.
  // Its inner ridges give the flight through the lens visible depth.
  lensGroup.add(mesh(ring(0.198, 0.206, 0.02, 0.3), materials.blackDeep))
  lensGroup.add(mesh(new THREE.CircleGeometry(0.199, 64), new THREE.MeshBasicMaterial({ color: LENS_INTERIOR_COLOR }), [0, 0, 0.022]))
  ;[0.035, 0.1, 0.135, 0.24].forEach((z) => {
    lensGroup.add(mesh(ring(0.186, 0.199, z - 0.003, z + 0.003), materials.blackDeep))
  })

  const add = (object, spec) => {
    lensGroup.add(object)
    parts.push({ object, ...spec, explode: spec.explode.map((v) => v * STACK_SPREAD) })
  }

  const addGlass = (radius, edge, front, back, z, spec, opacity = INNER_GLASS_OPACITY) => {
    const material = materials.glass.clone()
    material.opacity = opacity
    const element = mesh(lensElement({ radius, edge, front, back }), material, [0, 0, z])
    element.layers.set(NO_OUTLINE_LAYER)
    add(element, spec)
    glassElements.push(element)
    return element
  }

  add(
    mesh(
      latheSolid([
        [[0.214, -0.013], [0.262, -0.013]],
        [[0.262, -0.013], [0.262, 0.003]],
        [[0.262, 0.003], [0.272, 0.003]],
        [[0.272, 0.003], [0.272, 0.013]],
        [[0.272, 0.013], [0.214, 0.013]],
        [[0.214, 0.013], [0.214, -0.013]],
      ]),
      materials.silver,
      [0, 0, 0.013],
    ),
    { explode: [0, 0, -0.5], window: [0.22, 0.37] },
  )
  add(mesh(centredRing(0.206, 0.27, 0.022, 0.095, 0.006), materials.black, [0, 0, 0.0585]), {
    explode: [0, 0, -0.4],
    window: [0.2, 0.35],
  })
  addGlass(0.16, 0.02, 0.012, 0.016, 0.06, { explode: [0, 0, -0.3], tilt: [0.25, 0, 0], window: [0.1, 0.25] })

  const apertureRing = group(
    [
      mesh(centredRing(0.206, 0.272, -0.0285, 0.0285, 0.004), materials.black),
      mesh(knurledBand({ radius: 0.286, depth: 0.008, z0: -0.025, z1: -0.002, ridges: 48, innerRadius: 0.27 }), materials.black),
      mesh(latheSolid([[[0.281, 0.0], [0.281, 0.026]]]), materials.ringTicks),
    ],
    [0, 0, 0.1235],
  )
  add(apertureRing, { explode: [0, 0, -0.18], spin: { axis: [0, 0, 1], turns: 0.25 }, window: [0.19, 0.34] })

  const diaphragm = createDiaphragm(materials)
  diaphragm.object.position.set(0, 0, 0.158)
  add(diaphragm.object, { explode: [0, 0, -0.06], window: [0.16, 0.31] })

  addGlass(0.18, 0.022, 0.018, 0.008, 0.205, { explode: [0, 0, 0.08], tilt: [-0.25, 0, 0], window: [0.12, 0.27] })

  const focusRing = group(
    [
      mesh(centredRing(0.206, 0.296, -0.074, 0.067), materials.black),
      mesh(latheSolid([[[0.292, -0.074], [0.292, -0.062]]]), materials.ringTicks),
      mesh(knurledBand({ radius: 0.312, depth: 0.014, z0: -0.058, z1: 0.06, ridges: 60, innerRadius: 0.296 }), materials.rubber),
    ],
    [0, 0, 0.233],
  )
  add(focusRing, { explode: [0, 0, 0.22], spin: { axis: [0, 0, 1], turns: 0.5 }, window: [0.24, 0.39] })

  addGlass(0.19, 0.022, 0.016, 0.01, 0.275, { explode: [0, 0, 0.36], tilt: [0.25, 0, 0], window: [0.14, 0.29] })

  const frontBarrel = group(
    [
      mesh(
        latheSolid([
          [[0.23, -0.0425], [0.297, -0.0425]],
          [[0.297, -0.0425], [0.297, -0.0325]],
          [[0.297, -0.0325], [0.29, 0.0425]],
          [[0.29, 0.0425], [0.23, 0.0425]],
          [[0.23, 0.0425], [0.23, -0.0425]],
        ]),
        materials.black,
      ),
      mesh(latheSolid(ringSurfaces(0.258, 0.291, 0.0405, 0.0675, 0.004)), materials.silver),
    ],
    [0, 0, 0.3425],
  )
  add(frontBarrel, { explode: [0, 0, 0.5], spin: { axis: [0, 0, 1], turns: 0.75 }, window: [0.27, 0.41] })

  const frontElement = addGlass(
    0.229,
    0.03,
    0.032,
    0.008,
    0.36,
    { explode: [0, 0, 0.66], tilt: [-0.2, 0, 0], window: [0.3, 0.44] },
    materials.glass.opacity,
  )
  // Cartoon glint: a white arc and dot sitting on the front glass.
  const glintMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, depthWrite: false })
  const glint = mesh(new THREE.RingGeometry(0.15, 0.172, 40, 1, 1.95, 0.95), glintMaterial, [0, 0, 0.036])
  const dot = mesh(new THREE.CircleGeometry(0.014, 20), glintMaterial, [-0.115, 0.12, 0.033])
  ;[glint, dot].forEach((piece) => {
    piece.layers.set(NO_OUTLINE_LAYER)
    frontElement.add(piece)
  })

  add(mesh(centredRing(0.229, 0.258, 0.384, 0.4), materials.black, [0, 0, 0.392]), {
    explode: [0, 0, 0.8],
    spin: { axis: [0, 0, 1], turns: 1 },
    window: [0.33, 0.46],
  })

  // The whole lens travels to the body last and locks with a bayonet twist.
  lensGroup.position.set(0, MOUNT_Y, MOUNT_FRONT_Z)
  const lensSpec = {
    object: lensGroup,
    explode: [0, 0.08, 1.3],
    tilt: [0, 0, 0.9],
    rotationRange: [0.62, 1],
    window: [0.46, 0.6],
  }

  return { group: lensGroup, parts, lensSpec, glassElements, diaphragm }
}
