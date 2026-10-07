import * as THREE from 'three'

export function createLensRings(materials) {
  const group = new THREE.Group()
  group.name = 'lensRings'

  const ringZPositions = [-0.65, -0.95, -1.15]
  ringZPositions.forEach((z) => {
    const geometry = new THREE.CylinderGeometry(0.41, 0.41, 0.08, 32, 1, true)
    geometry.rotateX(Math.PI / 2)
    const ring = new THREE.Mesh(geometry, materials.brushedMetal)
    ring.position.set(0, 0, z)
    group.add(ring)
  })

  return group
}
