import * as THREE from 'three'

const BOB_AMPLITUDE = 0.08
const BOB_SPEED = 0.5
const SWAY_AMPLITUDE = 0.06
const SWAY_SPEED = 0.35

export function startRenderLoop({ renderer, composer, cameraGroup = null, floatState = null }) {
  // THREE.Clock is deprecated since r183 (logs a warning); Timer is its replacement.
  const timer = new THREE.Timer()

  renderer.setAnimationLoop(() => {
    timer.update()
    const elapsed = timer.getElapsed()
    const intensity = floatState ? floatState.floatIntensity : 0

    // Bounded, time-based idle motion: resolves to the exact rest pose at intensity 0.
    // Sways on rotation.z so it never writes rotation.y, which the scroll timeline owns.
    if (cameraGroup) {
      cameraGroup.position.y = Math.sin(elapsed * BOB_SPEED) * BOB_AMPLITUDE * intensity
      cameraGroup.rotation.z = Math.sin(elapsed * SWAY_SPEED) * SWAY_AMPLITUDE * intensity
    }

    composer.render()
  })
}
