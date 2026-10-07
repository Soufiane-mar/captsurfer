import * as THREE from 'three'

export function createTopPlate(materials) {
  const geometry = new THREE.BoxGeometry(1.6, 0.12, 0.9)
  const mesh = new THREE.Mesh(geometry, materials.brushedMetal)
  mesh.name = 'topPlate'
  mesh.position.set(0, 0.56, 0)
  return mesh
}
