import * as THREE from 'three'

export function createLensBarrel(materials) {
  const geometry = new THREE.CylinderGeometry(0.38, 0.4, 0.75, 32, 1, true)
  geometry.rotateX(Math.PI / 2)
  const barrelMaterial = materials.matteBody.clone()
  barrelMaterial.side = THREE.DoubleSide
  const mesh = new THREE.Mesh(geometry, barrelMaterial)
  mesh.name = 'lensBarrel'
  mesh.position.set(0, 0, -0.85)
  return mesh
}
