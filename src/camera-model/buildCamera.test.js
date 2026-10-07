import * as THREE from 'three'
import { describe, it, expect } from 'vitest'
import { buildCamera } from './buildCamera.js'

describe('buildCamera', () => {
  it('wires all 12 parts into the group, each with its own parent', () => {
    const { group, parts } = buildCamera()
    expect(group.children.length).toBe(12)
    expect(parts.length).toBe(12)
    parts.forEach((part) => {
      expect(part.parent).toBe(group)
    })
  })

  it('stashes an assembled transform for every part and scatters it away from that target', () => {
    const { parts } = buildCamera()
    parts.forEach((part) => {
      const { assembled } = part.userData
      expect(assembled.position).toBeInstanceOf(THREE.Vector3)
      expect(assembled.rotation).toBeInstanceOf(THREE.Euler)

      const samePosition = part.position.equals(assembled.position)
      const sameRotation = part.rotation.equals(assembled.rotation)
      expect(samePosition && sameRotation).toBe(false)
    })
  })

  it('keeps the shared matteBody material untouched by the barrel part', () => {
    const { materials } = buildCamera()
    expect(materials.matteBody.side).toBe(THREE.FrontSide)
  })
})
