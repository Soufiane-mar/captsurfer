import * as THREE from 'three'

export function createLensRings(materials) {
  const group = new THREE.Group()
  group.name = 'lensRings'
  group.position.set(0, 0, -0.9)

  const ringZOffsets = [0.25, -0.05, -0.25]
  ringZOffsets.forEach((z) => {
    const geometry = new THREE.TorusGeometry(0.4, 0.035, 16, 48)
    const ring = new THREE.Mesh(geometry, materials.brushedMetal)
    ring.position.set(0, 0, z)
    group.add(ring)
  })

  return group
}
