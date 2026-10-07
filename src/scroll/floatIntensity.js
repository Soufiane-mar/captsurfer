const ASSEMBLY_END = 0.6

export function getFloatIntensity(progress) {
  if (progress <= 0) return 1
  if (progress >= ASSEMBLY_END) return 0
  return 1 - progress / ASSEMBLY_END
}
