import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export function createSceneSetup(canvas) {
  const isMobile = window.matchMedia('(max-width: 768px)').matches

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x05050a)

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100,
  )
  camera.position.set(0, 0, 6)

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile })
  renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1

  const pmremGenerator = new THREE.PMREMGenerator(renderer)
  const envScene = new RoomEnvironment()
  scene.environment = pmremGenerator.fromScene(envScene, 0.04).texture
  pmremGenerator.dispose()
  envScene.dispose()

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2)
  keyLight.position.set(3, 4, 5)
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0x6688ff, 0.6)
  fillLight.position.set(-4, 1, 3)
  scene.add(fillLight)

  const rimLight = new THREE.DirectionalLight(0xffffff, 1.4)
  rimLight.position.set(0, 3, -5)
  scene.add(rimLight)

  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  if (!isMobile) {
    // UnrealBloomPass(resolution, strength, radius, threshold)
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5,
      0.4,
      0.85,
    )
    composer.addPass(bloomPass)
  }

  // Tone mapping and color space conversion only apply when rendering to the screen,
  // so they must run as the final pass rather than on the intermediate render targets.
  composer.addPass(new OutputPass())

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    const pixelRatio = isMobile ? 1 : Math.min(window.devicePixelRatio, 2)
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    composer.setSize(window.innerWidth, window.innerHeight)
  })

  return { scene, camera, renderer, composer }
}
