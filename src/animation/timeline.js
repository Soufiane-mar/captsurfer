import { createKeyframeSpline } from './spline.js'
import { smoothstep, smootherstep, windowProgress } from './easing.js'

// Whole hero sequence on one 0..1 timeline:
//   0.00-0.60 parts assemble while the view sweeps around the camera
//   0.60-0.70 assembled hero shot
//   0.70-1.00 the view lines up with the lens axis and travels through the glass
export const HERO_T = 0.66
// Last part (the lens) is seated here; nothing in the model moves on its own after.
export const ASSEMBLY_END = 0.6

// Pinned hero length, in viewport heights. The assembly gets 2.1 of them and the
// rest (hero shot + dive) 2.8, so assembling runs twice as fast per scroll as the dive.
export const HERO_SCROLL_VIEWPORTS = 4.9
const ASSEMBLY_SCROLL_SHARE = 2.1 / HERO_SCROLL_VIEWPORTS

function hermite(s, s0, s1, v0, v1, m0, m1) {
  const h = s1 - s0
  const u = (s - s0) / h
  const u2 = u * u
  const u3 = u2 * u
  return (
    (2 * u3 - 3 * u2 + 1) * v0 +
    (u3 - 2 * u2 + u) * h * m0 +
    (-2 * u3 + 3 * u2) * v1 +
    (u3 - u2) * h * m1
  )
}

// Maps hero scroll progress (0..1) to timeline position t. Speeds are matched at the
// junction so the change of pace after the assembly is gradual, never a kink.
export function heroScrollToT(s) {
  const a = ASSEMBLY_SCROLL_SHARE
  const fast = ASSEMBLY_END / a
  const slow = (1 - ASSEMBLY_END) / (1 - a)
  const junction = 1
  if (s <= 0) return 0
  if (s >= 1) return 1
  return s < a
    ? hermite(s, 0, a, 0, ASSEMBLY_END, fast, junction)
    : hermite(s, a, 1, ASSEMBLY_END, 1, junction, slow)
}

const AXIS_Y = -0.04

// [position x, y, z, target x, y, z, vertical fov]
const cameraSpline = createKeyframeSpline([
  { t: 0, value: [-2.8, 1.78, 4.44, 0, 0.5, 0.7, 34] },
  { t: 0.22, value: [-2.21, 1.42, 4.34, 0, 0.42, 0.6, 34] },
  { t: 0.45, value: [-0.7, 1.04, 4.1, 0, 0.25, 0.45, 33] },
  { t: 0.6, value: [1.8, 0.7, 3.3, 0, 0.06, 0.25, 32] },
  { t: 0.68, value: [1.15, 0.32, 2.6, 0, 0, 0.2, 32] },
  { t: 0.77, value: [0, AXIS_Y, 1.9, 0, AXIS_Y, 0.1, 34] },
  { t: 0.86, value: [0, AXIS_Y, 1.0, 0, AXIS_Y, -0.2, 42] },
  { t: 0.94, value: [0, AXIS_Y, 0.55, 0, AXIS_Y, -0.6, 52] },
  { t: 1, value: [0, AXIS_Y, 0.31, 0, AXIS_Y, -1, 56] },
])

export function cameraAt(t, out) {
  return cameraSpline(t, out)
}

// 1 = iris wide open. It stops down once assembled, then opens again for the dive.
export function apertureAt(t) {
  const stopDown = smootherstep(windowProgress(t, 0.32, 0.44))
  const reopen = smootherstep(windowProgress(t, 0.8, 0.88))
  return 1 - 0.85 * (stopDown - reopen)
}

// Glass fades out just before the viewpoint reaches it, so passing through an
// element never pops. distanceAhead = viewpoint z minus element z.
export function glassVisibility(distanceAhead) {
  return smoothstep(0.02, 0.16, distanceAhead)
}

// 0 while orbiting, 1 once the view is on the lens axis (narrow-screen framing off).
export function diveBlend(t) {
  return smoothstep(0.7, 0.8, t)
}
