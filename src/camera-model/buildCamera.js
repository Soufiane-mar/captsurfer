import * as THREE from 'three'
import { createMaterials } from './materials.js'
import { createBody } from './parts/body.js'
import { createTopPlate } from './parts/topPlate.js'
import { createGrip } from './parts/grip.js'
import { createShutterButton } from './parts/shutterButton.js'
import { createDial } from './parts/dial.js'
import { createViewfinder } from './parts/viewfinder.js'
import { createLensMount } from './parts/lensMount.js'
import { createLensBarrel } from './parts/lensBarrel.js'
import { createLensRings } from './parts/lensRings.js'
import { createFrontLens } from './parts/frontLens.js'
import { createInnerLenses } from './parts/innerLenses.js'
import { createDiaphragmBlades } from './parts/diaphragmBlades.js'
import { getScatteredTransform } from './scatterLayout.js'

const PART_FACTORIES = [
  createBody,
  createTopPlate,
  createGrip,
  createShutterButton,
  createDial,
  createViewfinder,
  createLensMount,
  createLensBarrel,
  createLensRings,
  createFrontLens,
  createInnerLenses,
  createDiaphragmBlades,
]

export function buildCamera() {
  const materials = createMaterials()
  const group = new THREE.Group()
  const parts = PART_FACTORIES.map((factory) => factory(materials))
  const total = parts.length

  parts.forEach((part, index) => {
    part.userData.assembled = {
      position: part.position.clone(),
      rotation: part.rotation.clone(),
    }

    const scattered = getScatteredTransform(index, total)
    part.position.set(...scattered.position)
    part.rotation.set(...scattered.rotation)

    group.add(part)
  })

  return { group, parts, materials }
}
