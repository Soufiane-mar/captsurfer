import { describe, it, expect } from 'vitest'
import { getScatteredTransform } from './scatterLayout.js'

describe('getScatteredTransform', () => {
  it('places the first index directly above the origin at the given radius', () => {
    const result = getScatteredTransform(0, 12, 4)
    expect(result.position[0]).toBeCloseTo(0)
    expect(result.position[1]).toBeCloseTo(4)
    expect(result.position[2]).toBeCloseTo(0)
    expect(result.rotation).toEqual([0, 0, 0])
  })

  it('spreads different indices to different positions', () => {
    const a = getScatteredTransform(1, 12, 4)
    const b = getScatteredTransform(2, 12, 4)
    expect(a.position).not.toEqual(b.position)
  })

  it('keeps every position within the given radius', () => {
    for (let i = 0; i < 12; i += 1) {
      const { position } = getScatteredTransform(i, 12, 4)
      const length = Math.sqrt(position[0] ** 2 + position[1] ** 2 + position[2] ** 2)
      expect(length).toBeLessThanOrEqual(4.001)
    }
  })

  it('does not divide by zero when there is only one part', () => {
    const result = getScatteredTransform(0, 1, 4)
    expect(Number.isNaN(result.position[0])).toBe(false)
    expect(Number.isNaN(result.position[1])).toBe(false)
    expect(Number.isNaN(result.position[2])).toBe(false)
  })
})
