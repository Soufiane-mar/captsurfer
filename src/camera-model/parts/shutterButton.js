import * as THREE from 'three'

export function createShutterButton(materials) {
  const geometry = new THREE.CylinderGeometry(0.07, 0.07, 0.06, 24)
  const mesh = new THREE.Mesh(geometry, materials.brushedMetal)
  mesh.name = 'shutterButton'
  mesh.position.set(0.7, 0.64, 0.25)
  return mesh
}
