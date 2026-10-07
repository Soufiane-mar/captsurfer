import { describe, it, expect } from 'vitest'
import { windowProgress, smoothstep, smootherstep, lerp } from './easing.js'

describe('windowProgress', () => {
  it('is 0 before the window, 1 after, linear inside', () => {
    expect(windowProgress(0.1, 0.2, 0.6)).toBe(0)
    expect(windowProgress(0.4, 0.2, 0.6)).toBeCloseTo(0.5)
    expect(windowProgress(0.9, 0.2, 0.6)).toBe(1)
  })
})

describe('smootherstep', () => {
  it('maps 0 to 0, 1 to 1 and 0.5 to 0.5', () => {
    expect(smootherstep(0)).toBe(0)
    expect(smootherstep(1)).toBe(1)
    expect(smootherstep(0.5)).toBeCloseTo(0.5)
  })

  it('starts and ends with zero velocity', () => {
    const h = 1e-4
    expect(smootherstep(h) / h).toBeLessThan(1e-3)
    expect((1 - smootherstep(1 - h)) / h).toBeLessThan(1e-3)
  })
})

describe('smoothstep and lerp', () => {
  it('clamp and interpolate', () => {
    expect(smoothstep(0, 1, -1)).toBe(0)
    expect(smoothstep(0, 1, 2)).toBe(1)
    expect(lerp(2, 4, 0.25)).toBe(2.5)
  })
})
