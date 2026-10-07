import * as THREE from 'three'

export function createLensMount(materials) {
  const geometry = new THREE.TorusGeometry(0.42, 0.06, 16, 32)
  const mesh = new THREE.Mesh(geometry, materials.accent)
  mesh.name = 'lensMount'
  mesh.position.set(0, 0, -0.46)
  return mesh
}
