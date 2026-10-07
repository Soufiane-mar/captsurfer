export function clamp01(x) {
  return Math.min(1, Math.max(0, x))
}

export function lerp(a, b, t) {
  return a + (b - a) * t
}

export function windowProgress(t, start, end) {
  return clamp01((t - start) / (end - start))
}

export function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

// Quintic smootherstep: zero velocity AND zero acceleration at both ends, so parts
// ease in and settle without any visible jolt.
export function smootherstep(x) {
  const t = clamp01(x)
  return t * t * t * (t * (t * 6 - 15) + 10)
}
