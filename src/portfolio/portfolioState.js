import { smoothstep, smootherstep, windowProgress } from '../animation/easing.js'

// Portfolio scroll range (0..1):
//   0.00-0.07 the lens view opens like an iris out of the dark end of the dive
//   0.08-0.95 the ring turns and each photo comes into focus in turn
const OPEN_END = 0.07
const BROWSE_START = 0.08
const BROWSE_END = 0.95
const DEGREES_PER_PHOTO = 360 / 12

export function lensOpening(p) {
  return smootherstep(windowProgress(p, 0, OPEN_END))
}

// Continuous focus position: 0 = first photo, count - 1 = last photo.
export function focusAt(p, count) {
  return windowProgress(p, BROWSE_START, BROWSE_END) * (count - 1)
}

export function ringRotation(focus) {
  return -focus * DEGREES_PER_PHOTO
}

// Opacity of photo `index` in the centre view. Each photo holds fully visible for
// most of its step and only crossfades in the middle, so it can actually be seen.
export function photoOpacity(focus, index) {
  const base = Math.floor(focus)
  const blend = smoothstep(0.35, 0.65, focus - base)
  if (index === base) return 1 - blend
  if (index === base + 1) return blend
  return 0
}

// 1 for the thumbnail passing the top of the ring, fading to 0 one step away.
export function thumbEmphasis(focus, index) {
  return 1 - smoothstep(0, 1, Math.abs(focus - index))
}
