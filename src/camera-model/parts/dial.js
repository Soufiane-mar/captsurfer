import * as THREE from 'three'

export function createDial(materials) {
  const geometry = new THREE.CylinderGeometry(0.14, 0.14, 0.05, 32)
  const mesh = new THREE.Mesh(geometry, materials.accent)
  mesh.name = 'dial'
  mesh.position.set(0.35, 0.63, 0.2)
  return mesh
}
