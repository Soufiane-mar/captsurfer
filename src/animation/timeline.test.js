import { describe, it, expect } from 'vitest'
import { cameraAt, apertureAt, glassVisibility, diveBlend } from './timeline.js'

describe('cameraAt', () => {
  it('moves continuously: no frame-to-frame jump anywhere on the timeline', () => {
    const step = 1e-4
    let previous = cameraAt(0, [])
    let maxJump = 0
    for (let t = step; t <= 1; t += step) {
      const current = cameraAt(t, [])
      const jump = Math.hypot(current[0] - previous[0], current[1] - previous[1], current[2] - previous[2])
      maxJump = Math.max(maxJump, jump)
      previous = current
    }
    // 10 000 samples across ~10 units of travel: anything continuous stays tiny.
    expect(maxJump).toBeLessThan(0.01)
  })

  it('stays exactly on the lens axis while passing through the glass', () => {
    for (let t = 0.86; t <= 1; t += 0.005) {
      const [x, y] = cameraAt(t, [])
      expect(Math.abs(x)).toBeLessThan(1e-9)
      expect(y).toBeCloseTo(-0.04, 9)
    }
  })

  it('ends inside the lens barrel, looking into the body', () => {
    const [, , z, , , targetZ] = cameraAt(1, [])
    expect(z).toBeGreaterThan(0.205)
    expect(z).toBeLessThan(0.205 + 0.3)
    expect(targetZ).toBeLessThan(z)
  })
})

describe('apertureAt', () => {
  it('is open, stops down after assembly, then opens fully for the dive', () => {
    expect(apertureAt(0)).toBe(1)
    expect(apertureAt(0.6)).toBeCloseTo(0.15)
    expect(apertureAt(0.9)).toBe(1)
  })
})

describe('glassVisibility', () => {
  it('is fully visible far ahead and gone by the time the view reaches the glass', () => {
    expect(glassVisibility(1)).toBe(1)
    expect(glassVisibility(0.02)).toBe(0)
    expect(glassVisibility(-0.5)).toBe(0)
  })
})

describe('diveBlend', () => {
  it('ramps from orbit to dive', () => {
    expect(diveBlend(0.5)).toBe(0)
    expect(diveBlend(0.9)).toBe(1)
  })
})
