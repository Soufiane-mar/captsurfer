import * as THREE from 'three'

export function createDiaphragmBlades(materials) {
  const group = new THREE.Group()
  group.name = 'diaphragmBlades'
  group.position.set(0, 0, -1.05)

  const bladeCount = 6
  const radius = 0.2
  const bladeSize = 0.19
  for (let i = 0; i < bladeCount; i += 1) {
    const geometry = new THREE.PlaneGeometry(bladeSize, bladeSize)
    geometry.rotateY(Math.PI)
    const blade = new THREE.Mesh(geometry, materials.accent)
    const angle = (i / bladeCount) * Math.PI * 2
    blade.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0)
    blade.rotation.z = angle
    group.add(blade)
  }

  return group
}
