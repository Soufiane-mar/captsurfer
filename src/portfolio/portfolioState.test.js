import { describe, it, expect } from 'vitest'
import { lensOpening, focusAt, ringRotation, photoOpacity, thumbEmphasis } from './portfolioState.js'

describe('lensOpening', () => {
  it('is closed at the start and fully open shortly after', () => {
    expect(lensOpening(0)).toBe(0)
    expect(lensOpening(0.07)).toBe(1)
    expect(lensOpening(0.5)).toBe(1)
  })
})

describe('focusAt and ringRotation', () => {
  it('walks from the first to the last photo across the browse range', () => {
    expect(focusAt(0.08, 12)).toBe(0)
    expect(focusAt(0.95, 12)).toBe(11)
    expect(focusAt(1, 12)).toBe(11)
  })

  it('brings photo i to the top of the ring when focused', () => {
    expect(ringRotation(3)).toBe(-90)
  })
})

describe('photoOpacity', () => {
  it('shows exactly one photo when resting on it', () => {
    expect(photoOpacity(4, 4)).toBe(1)
    expect(photoOpacity(4, 5)).toBe(0)
    expect(photoOpacity(4.2, 4)).toBe(1)
  })

  it('crossfades continuously, opacities always summing to 1', () => {
    for (let f = 0; f <= 11; f += 0.01) {
      let total = 0
      for (let i = 0; i < 12; i += 1) total += photoOpacity(f, i)
      expect(total).toBeCloseTo(1, 6)
    }
  })

  it('never jumps between frames', () => {
    let previous = photoOpacity(0, 1)
    for (let f = 0.001; f <= 11; f += 0.001) {
      const current = photoOpacity(f, 1)
      expect(Math.abs(current - previous)).toBeLessThan(0.01)
      previous = current
    }
  })
})

describe('thumbEmphasis', () => {
  it('highlights the focused thumbnail only', () => {
    expect(thumbEmphasis(2, 2)).toBe(1)
    expect(thumbEmphasis(2, 3)).toBe(0)
    expect(thumbEmphasis(2.5, 2)).toBeCloseTo(0.5)
  })
})
