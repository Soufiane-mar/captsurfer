import * as THREE from 'three'

// Three flat light bands (shadow, mid, lit): the classic cel-shaded cartoon look.
function createToonRamp() {
  const tones = new Uint8Array([90, 175, 255])
  const ramp = new THREE.DataTexture(tones, tones.length, 1, THREE.RedFormat)
  ramp.minFilter = THREE.NearestFilter
  ramp.magFilter = THREE.NearestFilter
  ramp.generateMipmaps = false
  ramp.needsUpdate = true
  return ramp
}

export function createMaterials(textures) {
  const gradientMap = createToonRamp()
  const toon = (params) => new THREE.MeshToonMaterial({ gradientMap, ...params })

  return {
    silver: toon({ color: 0xa4a9b2 }),
    black: toon({ color: 0x34343b }),
    // Lens/mirror-box interior: dark, but light enough for ink lines to read inside.
    blackDeep: toon({ color: 0x2a2e38, side: THREE.DoubleSide }),
    leatherette: toon({ color: 0x26262c }),
    rubber: toon({ color: 0x222227 }),
    brass: toon({ color: 0xc9a253 }),
    // Flat, unlit tint: lit glass would exceed 1.0 in the HDR buffer and haze the
    // dark lens interior even when nearly transparent.
    glass: new THREE.MeshBasicMaterial({
      color: 0xb6dcf5,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    }),
    mirror: toon({ color: 0xdce6ef }),
    frosted: toon({ color: 0xd8dde2, transparent: true, opacity: 0.6 }),
    circuit: toon({ color: 0xffffff, map: textures.circuit }),
    stripes: toon({ color: 0xffffff, map: textures.stripes }),
    ringTicks: toon({ color: 0xffffff, map: textures.ringTicks }),
    dialTicks: toon({ color: 0xffffff, map: textures.dialTicks }),
    blade: toon({ color: 0x2c2c33, side: THREE.DoubleSide }),
  }
}
