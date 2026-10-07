import * as THREE from 'three'

export function createViewfinder(materials) {
  const geometry = new THREE.BoxGeometry(0.4, 0.22, 0.3)
  const mesh = new THREE.Mesh(geometry, materials.matteBody)
  mesh.name = 'viewfinder'
  mesh.position.set(0, 0.68, -0.28)
  return mesh
}
