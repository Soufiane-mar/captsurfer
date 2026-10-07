const DESIGN_ASPECT = 16 / 9
const MAX_SCALE = 2.4

// How much further back the viewpoint sits on screens narrower than the design
// aspect, so the exploded camera still fits the width on tablets and phones.
export function framingScale(aspect) {
  if (aspect >= DESIGN_ASPECT) return 1
  return Math.min(MAX_SCALE, (DESIGN_ASPECT / aspect) ** 0.6)
}
