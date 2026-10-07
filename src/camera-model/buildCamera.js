import * as THREE from 'three'
import { createTextures } from './textures.js'
import { createMaterials } from './materials.js'
import { createBodyParts } from './body.js'
import { createLens } from './lens.js'
import { preparePart } from '../animation/assembly.js'

export function buildCamera() {
  const materials = createMaterials(createTextures())
  const root = new THREE.Group()

  const body = createBodyParts(materials)
  root.add(body.anchor)
  body.parts.forEach(({ object }) => root.add(object))

  const lens = createLens(materials)
  root.add(lens.group)

  // Lens internals are listed before the lens itself so they settle inside it first.
  const specs = [...body.parts, ...lens.parts, lens.lensSpec]
  const parts = specs.map((spec, index) => preparePart(spec, index))

  return {
    root,
    parts,
    glassElements: lens.glassElements,
    diaphragm: lens.diaphragm,
    materials,
  }
}
