export function getScatteredTransform(index, total, radius = 4) {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  const theta = index * goldenAngle
  const y = total > 1 ? 1 - (index / (total - 1)) * 2 : 1
  const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y))

  const position = [
    Math.cos(theta) * radiusAtY * radius,
    y * radius,
    Math.sin(theta) * radiusAtY * radius,
  ]

  // Arbitrary, mutually distinct multipliers so each axis de-syncs from the others.
  const rotation = [
    (index * 0.37) % (Math.PI * 2),
    (index * 0.53) % (Math.PI * 2),
    (index * 0.71) % (Math.PI * 2),
  ]

  return { position, rotation }
}
