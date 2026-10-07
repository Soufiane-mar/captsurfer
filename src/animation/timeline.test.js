import { describe, it, expect } from 'vitest'
import { cameraAt, apertureAt, glassVisibility, diveBlend, heroScrollToT, ASSEMBLY_END } from './timeline.js'

describe('heroScrollToT', () => {
  it('spans the whole timeline', () => {
    expect(heroScrollToT(0)).toBe(0)
    expect(heroScrollToT(1)).toBe(1)
  })

  it('always moves forward when scrolling forward', () => {
    let previous = 0
    for (let s = 0.001; s <= 1; s += 0.001) {
      const t = heroScrollToT(s)
      expect(t).toBeGreaterThan(previous)
      previous = t
    }
  })

  it('assembles in the first 2.1 of 4.9 viewports, about twice as fast as the dive', () => {
    expect(heroScrollToT(2.1 / 4.9)).toBeCloseTo(ASSEMBLY_END, 9)
    const assemblyRate = ASSEMBLY_END / (2.1 / 4.9)
    const diveRate = (1 - ASSEMBLY_END) / (1 - 2.1 / 4.9)
    expect(assemblyRate / diveRate).toBeCloseTo(2, 9)
  })

  it('changes pace smoothly: no velocity kink at the end of the assembly', () => {
    const a = 2.1 / 4.9
    const h = 1e-6
    const left = (heroScrollToT(a) - heroScrollToT(a - h)) / h
    const right = (heroScrollToT(a + h) - heroScrollToT(a)) / h
    expect(Math.abs(left - right)).toBeLessThan(1e-3)
  })
})

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
