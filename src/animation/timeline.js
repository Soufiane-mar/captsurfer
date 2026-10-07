import { createKeyframeSpline } from './spline.js'
import { smoothstep, smootherstep, windowProgress } from './easing.js'

// Whole hero sequence on one 0..1 timeline:
//   0.00-0.60 parts assemble while the view sweeps around the camera
//   0.60-0.70 assembled hero shot
//   0.70-1.00 the view lines up with the lens axis and travels through the glass
export const HERO_T = 0.66

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
