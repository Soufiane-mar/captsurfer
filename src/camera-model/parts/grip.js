import * as THREE from 'three'

export function createGrip(materials) {
  const geometry = new THREE.BoxGeometry(0.35, 0.95, 0.85)
  const mesh = new THREE.Mesh(geometry, materials.matteBody)
  mesh.name = 'grip'
  mesh.position.set(0.85, -0.01, -0.06)
  mesh.rotation.set(0, 0, 0.08)
  return mesh
}
