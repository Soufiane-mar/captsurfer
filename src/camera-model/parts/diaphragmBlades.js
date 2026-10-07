import * as THREE from 'three'

export function createDiaphragmBlades(materials) {
  const group = new THREE.Group()
  group.name = 'diaphragmBlades'

  const bladeCount = 6
  const radius = 0.22
  for (let i = 0; i < bladeCount; i += 1) {
    const geometry = new THREE.PlaneGeometry(0.26, 0.26)
    const blade = new THREE.Mesh(geometry, materials.accent)
    const angle = (i / bladeCount) * Math.PI * 2
    blade.position.set(
      Math.cos(angle) * radius * 0.4,
      Math.sin(angle) * radius * 0.4,
      -1.05,
    )
    blade.rotation.z = angle
    group.add(blade)
  }

  return group
}
