import './styles/main.css'
import './styles/portfolio.css'
import './styles/site.css'
import * as THREE from 'three'
import gsap from 'gsap'
import { createSceneSetup } from './scene/sceneSetup.js'
import { framingScale } from './scene/framing.js'
import { buildCamera } from './camera-model/buildCamera.js'
import { applyPartPose } from './animation/assembly.js'
import {
  cameraAt,
  apertureAt,
  glassVisibility,
  diveBlend,
  heroScrollToT,
  HERO_T,
  ASSEMBLY_END,
  HERO_SCROLL_VIEWPORTS,
} from './animation/timeline.js'
import { lerp } from './animation/easing.js'
import { createSmoothScroll } from './scroll/scrollDriver.js'
import { prefersReducedMotion } from './scroll/reducedMotion.js'
import { createPortfolioLens, createStaticPortfolio } from './portfolio/portfolioLens.js'
import { FIRST_PHOTO_PROGRESS } from './portfolio/portfolioState.js'
import { hideLoadingScreen } from './ui/loadingScreen.js'
import { setupNav } from './ui/nav.js'
import { setupContactForm } from './ui/contactForm.js'
import { renderSocialLinks } from './ui/footer.js'

const canvas = document.getElementById('scene')
const heroElement = document.getElementById('hero')
const portfolioElement = document.getElementById('portfolio')
const contactElement = document.getElementById('contact')

setupContactForm(contactElement.querySelector('form'))
renderSocialLinks(document.querySelector('.site-footer__social'))

const pageTop = (element) => element.getBoundingClientRect().top + window.scrollY

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

let needsRender = true

function onResize() {
  resize()
  framing = framingScale(camera.aspect)
  needsRender = true
}

if (prefersReducedMotion()) {
  createStaticPortfolio(portfolioElement)
  setupNav({
    resolveTarget: (name) => (name === 'home' ? 0 : pageTop(name === 'portfolio' ? portfolioElement : contactElement)),
    scrollTo: (y) => window.scrollTo(0, y),
  })
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
  const smoothScroll = createSmoothScroll()
  const hero = smoothScroll.track({ trigger: heroElement, start: 'top top', end: `+=${HERO_SCROLL_VIEWPORTS * 100}%`, pin: true })
  const portfolioScroll = smoothScroll.track({ trigger: portfolioElement, start: 'top top', end: 'bottom bottom' })
  const portfolio = createPortfolioLens(portfolioElement)
  window.addEventListener('resize', onResize)

  setupNav({
    resolveTarget(name) {
      if (name === 'home') return 0
      if (name === 'contact') return pageTop(contactElement)
      const { start, end } = portfolioScroll.trigger
      return start + FIRST_PHOTO_PROGRESS * (end - start)
    },
    scrollTo: (y) => smoothScroll.scrollTo(y),
  })

  let lastT = -1
  poseScene(heroScrollToT(hero.advance(0)), 0)
  renderer.compileAsync(scene, camera).then(() => {
    // The first render allocates the post-processing targets (~100ms): do it while
    // the loading screen is still up so the animation never starts with a hitch.
    composer.render()
    gsap.ticker.add((time, deltaMs) => {
      const dt = deltaMs / 1000
      const t = heroScrollToT(hero.advance(dt))
      // Parts float while exploded; once assembled the 3D only changes with scroll.
      if (needsRender || t < ASSEMBLY_END || Math.abs(t - lastT) > 1e-6) {
        poseScene(t, time)
        composer.render()
        lastT = t
        needsRender = false
      }
      portfolio.update(portfolioScroll.advance(dt))
    })
    hideLoadingScreen()
  })
}

if (import.meta.env.DEV) {
  window.__captsurfer = {
    THREE,
    scene,
    camera,
    parts,
    renderStill(t, time = 0) {
      poseScene(t, time)
      composer.render()
    },
  }
}
