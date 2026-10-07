import * as THREE from 'three'

export function createBody(materials) {
  const geometry = new THREE.BoxGeometry(1.6, 1.0, 0.9)
  const mesh = new THREE.Mesh(geometry, materials.matteBody)
  mesh.name = 'body'
  mesh.position.set(0, 0, 0)
  return mesh
}
