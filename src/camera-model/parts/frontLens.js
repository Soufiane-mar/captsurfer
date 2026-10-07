import * as THREE from 'three'

export function createFrontLens(materials) {
  const geometry = new THREE.SphereGeometry(0.36, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.2)
  const mesh = new THREE.Mesh(geometry, materials.glass)
  mesh.name = 'frontLens'
  mesh.rotation.x = Math.PI
  mesh.position.set(0, 0, -1.35)
  return mesh
}
