import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { InkOutlinePass, NO_OUTLINE_LAYER } from './inkOutlinePass.js'
import { SAND } from '../theme.js'

export function createSceneSetup(canvas) {
  const isMobile = window.matchMedia('(max-width: 768px)').matches
  const pixelRatio = () => Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(SAND)

  const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.01, 60)
  camera.layers.enable(NO_OUTLINE_LAYER)

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(pixelRatio())
  renderer.setSize(window.innerWidth, window.innerHeight)

  const key = new THREE.DirectionalLight(0xffffff, 2.6)
  key.position.set(-3, 5, 4)
  scene.add(key)
  scene.add(new THREE.HemisphereLight(0xe4e9ff, 0x2a2a34, 1.1))

  const target = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.HalfFloatType,
    samples: isMobile ? 0 : 4,
  })
  const composer = new EffectComposer(renderer, target)
  composer.setPixelRatio(pixelRatio())
  composer.setSize(window.innerWidth, window.innerHeight)
  composer.addPass(new RenderPass(scene, camera))
  composer.addPass(new InkOutlinePass(scene, camera, { thickness: Math.max(1.2, pixelRatio()) }))
  composer.addPass(new OutputPass())

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(pixelRatio())
    renderer.setSize(window.innerWidth, window.innerHeight)
    composer.setPixelRatio(pixelRatio())
    composer.setSize(window.innerWidth, window.innerHeight)
  }

  return { scene, camera, renderer, composer, resize }
}
