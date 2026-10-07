import * as THREE from 'three'

export function createInnerLenses(materials) {
  const group = new THREE.Group()
  group.name = 'innerLenses'

  const lensZPositions = [-0.65, -0.9, -1.1]
  lensZPositions.forEach((z, index) => {
    const radius = 0.3 - index * 0.02
    const geometry = new THREE.CylinderGeometry(radius, radius, 0.04, 32)
    geometry.rotateX(Math.PI / 2)
    const lens = new THREE.Mesh(geometry, materials.glass)
    lens.position.set(0, 0, z)
    group.add(lens)
  })

  return group
}
