import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const LATHE_SEGMENTS = 96

// Revolves profile surfaces ([[r, z], ...]) around the Z axis (or Y with axis: 'y').
// Each surface is revolved on its own then merged: normals stay smooth along a
// surface but break cleanly at the corners between surfaces, like machined metal.
// Trace surfaces counter-clockwise in the (r, z) plane so normals face outward.
export function latheSolid(surfaces, { axis = 'z', segments = LATHE_SEGMENTS } = {}) {
  const geometry = mergeGeometries(
    surfaces.map(
      (points) => new THREE.LatheGeometry(points.map(([r, z]) => new THREE.Vector2(r, z)), segments),
    ),
  )
  if (axis === 'z') geometry.rotateX(Math.PI / 2)
  return geometry
}

// Closed ring profile between two radii and two depths, with optional chamfers.
export function ringSurfaces(innerRadius, outerRadius, z0, z1, chamfer = 0) {
  const c = chamfer
  if (c === 0) {
    return [
      [[innerRadius, z0], [outerRadius, z0]],
      [[outerRadius, z0], [outerRadius, z1]],
      [[outerRadius, z1], [innerRadius, z1]],
      [[innerRadius, z1], [innerRadius, z0]],
    ]
  }
  return [
    [[innerRadius + c, z0], [outerRadius - c, z0]],
    [[outerRadius - c, z0], [outerRadius, z0 + c]],
    [[outerRadius, z0 + c], [outerRadius, z1 - c]],
    [[outerRadius, z1 - c], [outerRadius - c, z1]],
    [[outerRadius - c, z1], [innerRadius + c, z1]],
    [[innerRadius + c, z1], [innerRadius, z1 - c]],
    [[innerRadius, z1 - c], [innerRadius, z0 + c]],
    [[innerRadius, z0 + c], [innerRadius + c, z0]],
  ]
}

export function ring(innerRadius, outerRadius, z0, z1, { chamfer = 0, axis = 'z' } = {}) {
  return latheSolid(ringSurfaces(innerRadius, outerRadius, z0, z1, chamfer), { axis })
}

// Ridged (knurled) band around the Z axis, with flat-faceted grooves and end caps.
export function knurledBand({ radius, depth, z0, z1, ridges, innerRadius }) {
  const steps = ridges * 4
  const outline = []
  for (let i = 0; i < steps; i += 1) {
    const angle = (i / steps) * Math.PI * 2
    const r = i % 4 < 2 ? radius : radius - depth
    outline.push(new THREE.Vector2(Math.cos(angle) * r, Math.sin(angle) * r))
  }

  const positions = []
  const uvs = []
  for (let i = 0; i < steps; i += 1) {
    const a = outline[i]
    const b = outline[(i + 1) % steps]
    const u0 = i / steps
    const u1 = (i + 1) / steps
    positions.push(a.x, a.y, z0, b.x, b.y, z0, b.x, b.y, z1)
    positions.push(a.x, a.y, z0, b.x, b.y, z1, a.x, a.y, z1)
    uvs.push(u0, 0, u1, 0, u1, 1, u0, 0, u1, 1, u0, 1)
  }
  const wall = new THREE.BufferGeometry()
  wall.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  wall.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  wall.computeVertexNormals()

  const capShape = new THREE.Shape(outline)
  const hole = new THREE.Path()
  hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true)
  capShape.holes.push(hole)

  const front = new THREE.ShapeGeometry(capShape, 96).toNonIndexed()
  front.translate(0, 0, z1)
  const back = flip(new THREE.ShapeGeometry(capShape, 96).toNonIndexed())
  back.translate(0, 0, z0)

  return mergeGeometries([wall, front, back])
}

function flip(geometry) {
  const position = geometry.attributes.position
  const uv = geometry.attributes.uv
  for (let i = 0; i < position.count; i += 3) {
    for (const attribute of [position, uv]) {
      const size = attribute.itemSize
      for (let k = 0; k < size; k += 1) {
        const first = attribute.array[i * size + k]
        attribute.array[i * size + k] = attribute.array[(i + 2) * size + k]
        attribute.array[(i + 2) * size + k] = first
      }
    }
  }
  geometry.computeVertexNormals()
  return geometry
}

export function traceRoundedRect(path, width, height, radius, cx = 0, cy = 0) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2))
  const x0 = cx - width / 2
  const x1 = cx + width / 2
  const y0 = cy - height / 2
  const y1 = cy + height / 2
  path.moveTo(x0 + r, y0)
  path.lineTo(x1 - r, y0)
  path.absarc(x1 - r, y0 + r, r, -Math.PI / 2, 0, false)
  path.lineTo(x1, y1 - r)
  path.absarc(x1 - r, y1 - r, r, 0, Math.PI / 2, false)
  path.lineTo(x0 + r, y1)
  path.absarc(x0 + r, y1 - r, r, Math.PI / 2, Math.PI, false)
  path.lineTo(x0, y0 + r)
  path.absarc(x0 + r, y0 + r, r, Math.PI, Math.PI * 1.5, false)
  return path
}

// Rounded, bevelled slab spanning exactly x ±width/2, y ±height/2, z 0..depth.
// Holes: { x, y, radius } for circles or { x, y, width, height, radius } for rects.
export function roundedSlab({ width, height, radius, depth, bevel = 0.008, holes = [] }) {
  const b = Math.min(bevel, depth * 0.4)
  const shape = traceRoundedRect(new THREE.Shape(), width - 2 * b, height - 2 * b, radius - b)
  holes.forEach((hole) => {
    const path = new THREE.Path()
    if (hole.width === undefined) {
      path.absarc(hole.x, hole.y, hole.radius + b, 0, Math.PI * 2, true)
    } else {
      traceRoundedRect(path, hole.width + 2 * b, hole.height + 2 * b, hole.radius + b, hole.x, hole.y)
    }
    shape.holes.push(path)
  })
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: depth - 2 * b,
    bevelEnabled: b > 0,
    bevelThickness: b,
    bevelSize: b,
    bevelSegments: 3,
    curveSegments: 24,
  })
  geometry.translate(0, 0, b)
  return geometry
}

// Biconvex lens element centred on z = 0 along the Z axis.
export function lensElement({ radius, edge, front, back, samples = 24 }) {
  const backSurface = []
  const frontSurface = []
  for (let k = 0; k <= samples; k += 1) {
    const r = (radius * k) / samples
    const falloff = 1 - (r / radius) ** 2
    backSurface.push([r, -edge / 2 - back * falloff])
    frontSurface.unshift([r, edge / 2 + front * falloff])
  }
  return latheSolid([
    backSurface,
    [[radius, -edge / 2], [radius, edge / 2]],
    frontSurface,
  ])
}

export function gear({ teeth, outerRadius, rootRadius, thickness, holeRadius }) {
  const steps = teeth * 4
  const points = []
  for (let i = 0; i < steps; i += 1) {
    const angle = (i / steps) * Math.PI * 2
    const r = i % 4 === 1 || i % 4 === 2 ? outerRadius : rootRadius
    points.push(new THREE.Vector2(Math.cos(angle) * r, Math.sin(angle) * r))
  }
  const shape = new THREE.Shape(points)
  const hole = new THREE.Path()
  hole.absarc(0, 0, holeRadius, 0, Math.PI * 2, true)
  shape.holes.push(hole)
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.002,
    bevelSize: 0.002,
    bevelSegments: 1,
    curveSegments: 16,
  })
  geometry.rotateX(-Math.PI / 2)
  return geometry
}

// Slotted machine screw along +Y, head on top, origin at the underside of the head.
export function screw(materials) {
  const group = new THREE.Group()
  const head = latheSolid(
    [
      [[0, 0], [0.017, 0]],
      [[0.017, 0], [0.017, 0.004]],
      [[0.017, 0.004], [0.012, 0.009], [0, 0.0105]],
    ],
    { axis: 'y', segments: 32 },
  )
  group.add(new THREE.Mesh(head, materials.silver))
  const shaft = new THREE.CylinderGeometry(0.007, 0.007, 0.04, 16)
  shaft.translate(0, -0.02, 0)
  group.add(new THREE.Mesh(shaft, materials.silver))
  const slot = new THREE.BoxGeometry(0.03, 0.004, 0.004)
  slot.translate(0, 0.009, 0)
  group.add(new THREE.Mesh(slot, materials.blackDeep))
  return group
}
