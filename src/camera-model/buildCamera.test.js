import * as THREE from 'three'
import { describe, it, expect } from 'vitest'
import { buildCamera } from './buildCamera.js'
import { applyPartPose } from '../animation/assembly.js'

function worldPositions(root, parts) {
  root.updateMatrixWorld(true)
  return parts.map((part) => part.object.getWorldPosition(new THREE.Vector3()))
}

// Largest per-step change of any part over the whole timeline at a given resolution.
function largestStep(parts, steps) {
  const previous = parts.map(() => new THREE.Vector3())
  const previousRotation = parts.map(() => new THREE.Quaternion())
  let move = 0
  let turn = 0
  for (let i = 0; i <= steps; i += 1) {
    parts.forEach((part, k) => {
      applyPartPose(part, i / steps, 3)
      if (i > 0) {
        move = Math.max(move, part.object.position.distanceTo(previous[k]))
        turn = Math.max(turn, part.object.quaternion.angleTo(previousRotation[k]))
      }
      previous[k].copy(part.object.position)
      previousRotation[k].copy(part.object.quaternion)
    })
  }
  return { move, turn }
}

describe('buildCamera', () => {
  const { root, parts, glassElements } = buildCamera()

  it('builds a detailed model with every animated part attached', () => {
    expect(parts.length).toBeGreaterThan(30)
    parts.forEach((part) => {
      let node = part.object
      while (node.parent) node = node.parent
      expect(node).toBe(root)
    })
    expect(glassElements.length).toBe(4)
  })

  it('lands every part exactly on its assembled transform at the end of assembly', () => {
    parts.forEach((part) => applyPartPose(part, 0.6, 12.3))
    parts.forEach((part) => {
      expect(part.object.position.distanceTo(part.assembledPosition)).toBeLessThan(1e-9)
      expect(part.object.quaternion.angleTo(part.assembledQuaternion)).toBeLessThan(1e-6)
    })
  })

  it('starts exploded: every part is away from where it ends up', () => {
    parts.forEach((part) => applyPartPose(part, 0.6, 0))
    const assembled = worldPositions(root, parts)
    parts.forEach((part) => applyPartPose(part, 0, 0))
    const exploded = worldPositions(root, parts)
    exploded.forEach((position, i) => {
      expect(position.distanceTo(assembled[i])).toBeGreaterThan(0.1)
    })
  })

  it('moves every part continuously: no jump anywhere on the timeline', () => {
    const coarse = largestStep(parts, 2000)
    const fine = largestStep(parts, 4000)
    // A jump would stay the same size however finely we sample; smooth motion halves.
    expect(fine.move / coarse.move).toBeLessThan(0.6)
    expect(fine.turn / coarse.turn).toBeLessThan(0.6)
  })
})
