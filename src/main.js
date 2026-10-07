import './styles/main.css'
import { createSceneSetup } from './scene/sceneSetup.js'
import { startRenderLoop } from './scene/loop.js'
import { buildCamera } from './camera-model/buildCamera.js'
import { createScrollTimeline, FACING_ROTATION_Y } from './scroll/scrollTimeline.js'
import { prefersReducedMotion } from './scroll/reducedMotion.js'
import { hideLoadingScreen } from './ui/loadingScreen.js'

const canvas = document.getElementById('scene')
const heroElement = document.getElementById('hero')

const { scene, camera, renderer, composer } = createSceneSetup(canvas)
const { group, parts } = buildCamera()
scene.add(group)

let floatState = null

if (prefersReducedMotion()) {
  parts.forEach((part) => {
    const { position, rotation } = part.userData.assembled
    part.position.copy(position)
    part.rotation.copy(rotation)
  })
  group.rotation.y = FACING_ROTATION_Y
  // Camera intentionally stays at its initial z=6 framing (not the scroll path's
  // zoom-start z=3) so the full assembled camera stays in frame as a resting shot.
} else {
  const { state } = createScrollTimeline({ heroElement, cameraGroup: group, parts, camera })
  floatState = state
}

startRenderLoop({ renderer, composer, cameraGroup: group, floatState })
hideLoadingScreen()
