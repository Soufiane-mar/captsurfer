import * as THREE from 'three'

export function createFrontLens(materials) {
  const geometry = new THREE.SphereGeometry(0.6, 32, 16, 0, Math.PI * 2, 0, 0.63)
  geometry.rotateX(-Math.PI / 2)
  geometry.center()
  const mesh = new THREE.Mesh(geometry, materials.glass)
  mesh.name = 'frontLens'
  mesh.position.set(0, 0, -1.2325)
  return mesh
}
