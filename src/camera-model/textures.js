import * as THREE from 'three'

function canvasTexture(width, height, draw, { color = true, repeat = [1, 1] } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  // jsdom (unit tests) has no 2D canvas; materials simply render without maps there.
  if (!ctx) return null
  draw(ctx, width, height)
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(repeat[0], repeat[1])
  texture.anisotropy = 8
  if (color) texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function ringTicks(ctx, w, h) {
  ctx.fillStyle = '#2a2a30'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#e8e4da'
  const count = 64
  for (let i = 0; i < count; i += 1) {
    const x = (i / count) * w
    const long = i % 4 === 0
    ctx.fillRect(x, long ? h * 0.15 : h * 0.45, 3, long ? h * 0.7 : h * 0.4)
  }
}

function dialTicks(ctx, w, h) {
  ctx.fillStyle = '#2a2a30'
  ctx.fillRect(0, 0, w, h)
  const cx = w / 2
  const cy = h / 2
  ctx.strokeStyle = '#e8e4da'
  ctx.lineWidth = 5
  const count = 12
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * Math.PI * 2
    const inner = w * (i % 3 === 0 ? 0.26 : 0.33)
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner)
    ctx.lineTo(cx + Math.cos(a) * w * 0.44, cy + Math.sin(a) * w * 0.44)
    ctx.stroke()
  }
  ctx.fillStyle = '#c9ccd2'
  ctx.beginPath()
  ctx.arc(cx, cy, w * 0.12, 0, Math.PI * 2)
  ctx.fill()
}

function circuit(ctx, w, h) {
  ctx.fillStyle = '#2f5a3e'
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = '#d29a52'
  ctx.lineWidth = 4
  for (let i = 0; i < 40; i += 1) {
    let x = Math.random() * w
    let y = Math.random() * h
    ctx.beginPath()
    ctx.moveTo(x, y)
    for (let k = 0; k < 4; k += 1) {
      if (k % 2 === 0) x += (Math.random() - 0.5) * 180
      else y += (Math.random() - 0.5) * 180
      ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.fillStyle = '#e0b070'
    ctx.fillRect(x - 6, y - 6, 12, 12)
  }
  ctx.fillStyle = '#26262b'
  for (let i = 0; i < 5; i += 1) {
    ctx.fillRect(Math.random() * (w - 90), Math.random() * (h - 60), 70 + Math.random() * 40, 36 + Math.random() * 20)
  }
}

function shutterStripes(ctx, w, h) {
  for (let y = 0; y < h; y += 1) {
    ctx.fillStyle = Math.floor(y / 16) % 2 === 0 ? '#c9ccd2' : '#9a9ea6'
    ctx.fillRect(0, y, w, 1)
  }
}

export function createTextures() {
  return {
    ringTicks: canvasTexture(1024, 64, ringTicks),
    dialTicks: canvasTexture(256, 256, dialTicks),
    circuit: canvasTexture(512, 512, circuit),
    stripes: canvasTexture(256, 256, shutterStripes, { repeat: [1, 3] }),
  }
}
