import { describe, it, expect } from 'vitest'
import { createKeyframeSpline } from './spline.js'

const keys = [
  { t: 0, value: [0, 0] },
  { t: 0.3, value: [2, 1] },
  { t: 0.5, value: [3, -1] },
  { t: 1, value: [0, 4] },
]

describe('createKeyframeSpline', () => {
  const sample = createKeyframeSpline(keys)

  it('passes exactly through every key', () => {
    keys.forEach((key) => {
      const v = sample(key.t)
      expect(v[0]).toBeCloseTo(key.value[0])
      expect(v[1]).toBeCloseTo(key.value[1])
    })
  })

  it('clamps outside the key range', () => {
    expect(sample(-1)).toEqual([0, 0])
    expect(sample(2)).toEqual([0, 4])
  })

  it('has continuous velocity across interior keys', () => {
    const h = 1e-5
    ;[0.3, 0.5].forEach((t) => {
      const left = (sample(t)[0] - sample(t - h)[0]) / h
      const right = (sample(t + h)[0] - sample(t)[0]) / h
      expect(Math.abs(left - right)).toBeLessThan(1e-2)
    })
  })

  it('starts and ends at rest', () => {
    const h = 1e-5
    expect(Math.abs((sample(h)[0] - sample(0)[0]) / h)).toBeLessThan(1e-3)
    expect(Math.abs((sample(1)[1] - sample(1 - h)[1]) / h)).toBeLessThan(1e-3)
  })
})
