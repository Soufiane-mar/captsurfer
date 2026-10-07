import { describe, it, expect, afterEach, vi } from 'vitest'
import { prefersReducedMotion } from './reducedMotion.js'

describe('prefersReducedMotion', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns true when the media query matches', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true })
    expect(prefersReducedMotion()).toBe(true)
  })

  it('returns false when the media query does not match', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false })
    expect(prefersReducedMotion()).toBe(false)
  })
})
