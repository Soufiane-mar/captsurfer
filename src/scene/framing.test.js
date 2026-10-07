import { describe, it, expect } from 'vitest'
import { framingScale } from './framing.js'

describe('framingScale', () => {
  it('leaves wide screens untouched', () => {
    expect(framingScale(16 / 9)).toBe(1)
    expect(framingScale(21 / 9)).toBe(1)
  })

  it('pulls back on narrow screens, within a cap', () => {
    expect(framingScale(4 / 3)).toBeGreaterThan(1)
    expect(framingScale(375 / 812)).toBeGreaterThan(framingScale(4 / 3))
    expect(framingScale(0.1)).toBe(2.4)
  })
})
