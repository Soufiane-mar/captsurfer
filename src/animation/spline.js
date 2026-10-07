// Time-parameterised cubic Hermite spline (non-uniform Catmull-Rom tangents).
// Position AND velocity are continuous through every key, and velocity is zero at
// the first and last key, so camera moves start and stop softly with no kinks.
export function createKeyframeSpline(keys) {
  const count = keys.length
  const dims = keys[0].value.length
  const tangents = keys.map((key, i) => {
    if (i === 0 || i === count - 1) return new Array(dims).fill(0)
    const prev = keys[i - 1]
    const next = keys[i + 1]
    const span = next.t - prev.t
    return key.value.map((_, d) => (next.value[d] - prev.value[d]) / span)
  })

  return function sample(t, out = new Array(dims)) {
    if (t <= keys[0].t) return copyInto(out, keys[0].value)
    if (t >= keys[count - 1].t) return copyInto(out, keys[count - 1].value)

    let i = 0
    while (t > keys[i + 1].t) i += 1

    const a = keys[i]
    const b = keys[i + 1]
    const h = b.t - a.t
    const s = (t - a.t) / h
    const s2 = s * s
    const s3 = s2 * s
    const h00 = 2 * s3 - 3 * s2 + 1
    const h10 = s3 - 2 * s2 + s
    const h01 = -2 * s3 + 3 * s2
    const h11 = s3 - s2

    for (let d = 0; d < dims; d += 1) {
      out[d] =
        h00 * a.value[d] +
        h10 * h * tangents[i][d] +
        h01 * b.value[d] +
        h11 * h * tangents[i + 1][d]
    }
    return out
  }
}

function copyInto(out, values) {
  for (let d = 0; d < values.length; d += 1) out[d] = values[d]
  return out
}
