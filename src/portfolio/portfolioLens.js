import { photos } from '../data/photos.js'
import { createCredit } from './photoCredit.js'
import { lensOpening, focusAt, ringRotation, photoOpacity, thumbEmphasis } from './portfolioState.js'

const RING_STEP = 360 / photos.length
// Everything in the lens stays painted at this near-invisible opacity, so the browser
// has already rasterised it before it shows: no stall the frame the lens opens.
const PRE_PAINTED = 0.002
const CENTRE_IMAGE = { widths: [480, 720, 1000], sizes: 'min(49vmin, 500px)' }
const THUMB_IMAGE = { widths: [160, 240], sizes: 'min(14vmin, 145px)' }
const GRID_IMAGE = { widths: [480, 720], sizes: '(max-width: 600px) 90vw, 360px' }

function imageUrl(photo, size) {
  return `${photo.url}?w=${size}&h=${size}&fit=crop&auto=format&q=75`
}

function createImage(photo, { widths, sizes }) {
  const img = document.createElement('img')
  img.src = imageUrl(photo, widths[0])
  img.srcset = widths.map((w) => `${imageUrl(photo, w)} ${w}w`).join(', ')
  img.sizes = sizes
  img.alt = photo.alt
  img.loading = 'lazy'
  img.decoding = 'async'
  img.width = widths[0]
  img.height = widths[0]
  // Decode off the main thread before showing it, so the lens opening never stalls
  // on 24 images being decoded in the same frame.
  const reveal = () =>
    img
      .decode()
      .catch(() => {})
      .then(() => img.classList.add('is-loaded'))
  if (img.complete) reveal()
  else img.addEventListener('load', reveal, { once: true })
  return img
}

function element(tag, className, children = []) {
  const node = document.createElement(tag)
  node.className = className
  node.append(...children)
  return node
}

export function createPortfolioLens(section) {
  const figures = photos.map((photo) =>
    element('figure', 'lens__photo', [createImage(photo, CENTRE_IMAGE), createCredit(photo)]),
  )
  const thumbs = photos.map((photo) => element('div', 'lens__thumb', [createImage(photo, THUMB_IMAGE)]))
  const slots = thumbs.map((thumb, i) => {
    const slot = element('div', 'lens__slot', [thumb])
    slot.style.transform = `rotate(${i * RING_STEP}deg) translateY(calc(var(--d) * -0.405))`
    return slot
  })
  const ring = element('div', 'lens__ring', slots)
  ring.setAttribute('aria-hidden', 'true')
  const view = element('div', 'lens__view', [...figures, ring, element('div', 'lens__glass')])
  const iris = element('div', 'lens__iris')
  const lens = element('div', 'lens', [view, iris])
  const stage = element('div', 'lens-stage', [lens])
  section.append(stage)

  let lastProgress = -1

  return {
    update(p) {
      if (Math.abs(p - lastProgress) < 1e-5) return
      lastProgress = p

      const open = lensOpening(p)
      stage.classList.toggle('is-open', open > 0.99)
      lens.style.opacity = Math.max(PRE_PAINTED, open)
      lens.style.transform = `scale(${0.82 + 0.18 * open})`
      // Iris: a sand overlay whose clear centre widens, instead of re-clipping photos.
      const hole = open * 72
      const mask = `radial-gradient(circle, transparent ${hole}%, #000 ${hole + 0.5}%)`
      iris.style.visibility = open >= 1 ? 'hidden' : 'visible'
      iris.style.maskImage = mask
      iris.style.webkitMaskImage = mask

      const focus = focusAt(p, photos.length)
      const turn = ringRotation(focus)
      ring.style.transform = `rotate(${turn}deg)`

      figures.forEach((figure, i) => {
        const opacity = photoOpacity(focus, i)
        figure.style.opacity = Math.max(PRE_PAINTED, opacity)
        figure.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none'
        figure.style.transform = `scale(${1.04 - 0.04 * opacity})`
      })

      thumbs.forEach((thumb, i) => {
        const emphasis = thumbEmphasis(focus, i)
        const uprightTurn = -(i * RING_STEP + turn)
        thumb.style.transform = `rotate(${uprightTurn}deg) scale(${1 + 0.3 * emphasis})`
        thumb.style.opacity = 0.5 + 0.5 * emphasis
      })
    },
  }
}

// Reduced motion: the same photos and credits, laid out as a still grid.
export function createStaticPortfolio(section) {
  section.classList.add('portfolio--static')
  const grid = element(
    'div',
    'portfolio-grid',
    photos.map((photo) => element('figure', 'portfolio-grid__item', [createImage(photo, GRID_IMAGE), createCredit(photo)])),
  )
  section.append(grid)
}
