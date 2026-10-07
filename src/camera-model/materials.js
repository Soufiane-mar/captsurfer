import * as THREE from 'three'

export function createMaterials() {
  return {
    brushedMetal: new THREE.MeshStandardMaterial({
      color: 0x8a8d90,
      metalness: 1,
      roughness: 0.35,
    }),
    matteBody: new THREE.MeshStandardMaterial({
      color: 0x111214,
      metalness: 0.1,
      roughness: 0.85,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0x335577,
      metalness: 0,
      roughness: 0.05,
      transmission: 1,
      thickness: 0.3,
      ior: 1.5,
      transparent: true,
      opacity: 0.9,
    }),
    accent: new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.6,
      roughness: 0.4,
    }),
  }
}
