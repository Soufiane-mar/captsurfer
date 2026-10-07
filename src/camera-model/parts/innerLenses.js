import * as THREE from 'three'

export function createInnerLenses(materials) {
  const group = new THREE.Group()
  group.name = 'innerLenses'
  group.position.set(0, 0, -0.875)

  const lensZOffsets = [0.225, -0.025, -0.225]
  lensZOffsets.forEach((z, index) => {
    const radius = 0.3 - index * 0.02
    const geometry = new THREE.CylinderGeometry(radius, radius, 0.04, 32)
    geometry.rotateX(Math.PI / 2)
    const lens = new THREE.Mesh(geometry, materials.glass)
    lens.position.set(0, 0, z)
    group.add(lens)
  })

  return group
}
