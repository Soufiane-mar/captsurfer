import * as THREE from 'three'

const BOB_AMPLITUDE = 0.08
const BOB_SPEED = 0.5
const SPIN_SPEED = 0.15

export function startRenderLoop({ renderer, composer, cameraGroup = null, floatState = null }) {
  // THREE.Clock is deprecated since r183 (logs a warning); Timer is its replacement.
  const timer = new THREE.Timer()

  renderer.setAnimationLoop(() => {
    timer.update()
    const elapsed = timer.getElapsed()
    const intensity = floatState ? floatState.floatIntensity : 0

    if (cameraGroup && intensity > 0) {
      cameraGroup.position.y = Math.sin(elapsed * BOB_SPEED) * BOB_AMPLITUDE * intensity
      cameraGroup.rotation.y += SPIN_SPEED * intensity * 0.01
    }

    composer.render()
  })
}
