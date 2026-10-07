import { describe, it, expect } from 'vitest'
import { getFloatIntensity } from './floatIntensity.js'

describe('getFloatIntensity', () => {
  it('is fully floating before scroll starts', () => {
    expect(getFloatIntensity(0)).toBe(1)
    expect(getFloatIntensity(-0.5)).toBe(1)
  })

  it('fades out linearly during assembly', () => {
    expect(getFloatIntensity(0.3)).toBeCloseTo(0.5)
  })

  it('is fully settled once assembly finishes', () => {
    expect(getFloatIntensity(0.6)).toBe(0)
    expect(getFloatIntensity(1)).toBe(0)
  })
})
