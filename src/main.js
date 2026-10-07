import './styles/main.css'
import * as THREE from 'three'
import gsap from 'gsap'
import { createSceneSetup } from './scene/sceneSetup.js'
import { framingScale } from './scene/framing.js'
import { buildCamera } from './camera-model/buildCamera.js'
import { applyPartPose } from './animation/assembly.js'
import { cameraAt, apertureAt, glassVisibility, diveBlend, HERO_T } from './animation/timeline.js'
import { lerp } from './animation/easing.js'
import { createScrollDriver } from './scroll/scrollDriver.js'
import { prefersReducedMotion } from './scroll/reducedMotion.js'
import { hideLoadingScreen } from './ui/loadingScreen.js'

const canvas = document.getElementById('scene')
const heroElement = document.getElementById('hero')

const { scene, camera, renderer, composer, resize } = createSceneSetup(canvas)
const { root, parts, glassElements, diaphragm } = buildCamera()
scene.add(root)

// Each glass element fades as a whole, including the glint drawn on the front one.
const glassMaterials = glassElements.map((element) => {
  const materials = []
  element.traverse((node) => {
    if (node.material) materials.push({ material: node.material, opacity: node.material.opacity })
  })
  return materials
})
const cameraState = new Array(7)
const lookTarget = new THREE.Vector3()
const elementPosition = new THREE.Vector3()
let framing = framingScale(camera.aspect)

function poseScene(t, time) {
  parts.forEach((part) => applyPartPose(part, t, time))
  diaphragm.setOpenness(apertureAt(t))

  cameraAt(t, cameraState)
  const scale = lerp(framing, 1, diveBlend(t))
  lookTarget.set(cameraState[3], cameraState[4], cameraState[5])
  camera.position.set(cameraState[0], cameraState[1], cameraState[2]).sub(lookTarget).multiplyScalar(scale).add(lookTarget)
  camera.lookAt(lookTarget)
  if (camera.fov !== cameraState[6]) {
    camera.fov = cameraState[6]
    camera.updateProjectionMatrix()
  }

  root.updateMatrixWorld()
  glassElements.forEach((element, i) => {
    element.getWorldPosition(elementPosition)
    const visibility = glassVisibility(camera.position.z - elementPosition.z)
    glassMaterials[i].forEach(({ material, opacity }) => {
      material.opacity = opacity * visibility
    })
    element.visible = visibility > 0
  })
}

function onResize() {
  resize()
  framing = framingScale(camera.aspect)
}

if (prefersReducedMotion()) {
  const renderStill = () => {
    poseScene(HERO_T, 0)
    composer.render()
  }
  window.addEventListener('resize', () => {
    onResize()
    renderStill()
  })
  renderStill()
  hideLoadingScreen()
} else {
  const driver = createScrollDriver(heroElement)
  window.addEventListener('resize', onResize)
  poseScene(driver.advance(0), 0)
  renderer.compileAsync(scene, camera).then(() => {
    // The first render allocates the post-processing targets (~100ms): do it while
    // the loading screen is still up so the animation never starts with a hitch.
    composer.render()
    gsap.ticker.add((time, deltaMs) => {
      poseScene(driver.advance(deltaMs / 1000), time)
      composer.render()
    })
    hideLoadingScreen()
  })
}

if (import.meta.env.DEV) {
  window.__captsurfer = {
    THREE,
    scene,
    camera,
    renderStill(t, time = 0) {
      poseScene(t, time)
      composer.render()
    },
  }
}
