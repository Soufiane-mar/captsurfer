# CaptSurfer Phase 1 — 3D Camera Model & Scroll Assembly — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the CaptSurfer project scaffold and the hero's centerpiece: a Three.js camera model made of 12 separate parts that starts scattered, assembles itself as the user scrolls, then turns to face the viewer, driven by GSAP ScrollTrigger and reversible on scroll-up.

**Architecture:** Vite vanilla-JS project. Pure, deterministic layout/easing math (scatter positions, float-intensity damping, reduced-motion check) lives in small testable modules covered by Vitest. Each camera part is its own module returning a positioned `THREE.Mesh`/`THREE.Group`; `buildCamera.js` assembles them, snapshots their assembled transform, then displaces them to a scattered starting transform. `scrollTimeline.js` wires a pinned, scrubbed GSAP timeline that tweens every part back to its assembled transform, then rotates the whole camera to face the viewer.

**Tech Stack:** Vite, vanilla JavaScript (ES modules), Three.js, GSAP + ScrollTrigger, Vitest (+ jsdom for the one DOM-dependent unit).

**Testing note (deviation from strict TDD):** Visual/3D construction (geometry, materials, lighting, the GSAP timeline itself) cannot be meaningfully asserted by a unit test — correctness is "does it look right in the browser." Those tasks skip the red/green test cycle and are verified visually in Task 24. The three units of actual *logic* (scatter layout math, float-intensity easing, reduced-motion detection) are pure/DOM-mockable and get full TDD treatment.

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `vitest.config.js`
- Create: `.gitignore`
- Create: `index.html`
- Create: `src/main.js` (stub)
- Create: `src/styles/main.css`

- [ ] **Step 1: Create the folder structure**

Run: `mkdir -p src/{scene,camera-model/parts,scroll,ui,styles} docs/superpowers/plans`
Expected: no output, folders created.

- [ ] **Step 2: Initialize package.json**

Run: `npm init -y`
Expected: `package.json` created with default fields.

- [ ] **Step 3: Install dependencies**

Run: `npm install three gsap`
Run: `npm install -D vite vitest jsdom`
Expected: both commands exit 0, `node_modules/` and a lockfile appear, `package.json` now lists `three`/`gsap` under `dependencies` and `vite`/`vitest`/`jsdom` under `devDependencies`.

- [ ] **Step 4: Edit package.json scripts and type**

Edit `package.json` so it contains at least:

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

(Keep the `dependencies`/`devDependencies` npm already wrote.)

- [ ] **Step 5: Write vite.config.js**

```js
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/captsurfer/',
})
```

- [ ] **Step 6: Write vitest.config.js**

```js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
})
```

- [ ] **Step 7: Write .gitignore**

```
node_modules
dist
.DS_Store
```

- [ ] **Step 8: Write index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CaptSurfer</title>
  </head>
  <body>
    <div id="loading-screen">
      <div class="loading-spinner"></div>
    </div>
    <canvas id="scene"></canvas>
    <div class="vignette-overlay"></div>
    <main id="page">
      <section id="hero"></section>
    </main>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 9: Write src/styles/main.css**

```css
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  background: #05050a;
  color: #e8e8ec;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  overflow-x: hidden;
}

#scene {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: block;
  z-index: 0;
}

.vignette-overlay {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: radial-gradient(
    ellipse at center,
    rgba(0, 0, 0, 0) 55%,
    rgba(0, 0, 0, 0.55) 100%
  );
}

#page {
  position: relative;
  z-index: 2;
}

#hero {
  height: 100vh;
}

#loading-screen {
  position: fixed;
  inset: 0;
  z-index: 10;
  background: #05050a;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.6s ease;
}

#loading-screen.loading-screen--hidden {
  opacity: 0;
  pointer-events: none;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(232, 232, 236, 0.2);
  border-top-color: #e8e8ec;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

- [ ] **Step 10: Write a temporary src/main.js stub**

```js
import './styles/main.css'

document.getElementById('loading-screen')?.classList.add('loading-screen--hidden')
```

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite project for CaptSurfer"
```

---

### Task 2: Scatter layout math (TDD)

**Files:**
- Create: `src/camera-model/scatterLayout.js`
- Test: `src/camera-model/scatterLayout.test.js`

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest'
import { getScatteredTransform } from './scatterLayout.js'

describe('getScatteredTransform', () => {
  it('places the first index directly above the origin at the given radius', () => {
    const result = getScatteredTransform(0, 12, 4)
    expect(result.position[0]).toBeCloseTo(0)
    expect(result.position[1]).toBeCloseTo(4)
    expect(result.position[2]).toBeCloseTo(0)
    expect(result.rotation).toEqual([0, 0, 0])
  })

  it('spreads different indices to different positions', () => {
    const a = getScatteredTransform(1, 12, 4)
    const b = getScatteredTransform(2, 12, 4)
    expect(a.position).not.toEqual(b.position)
  })

  it('keeps every position within the given radius', () => {
    for (let i = 0; i < 12; i += 1) {
      const { position } = getScatteredTransform(i, 12, 4)
      const length = Math.sqrt(position[0] ** 2 + position[1] ** 2 + position[2] ** 2)
      expect(length).toBeLessThanOrEqual(4.001)
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- scatterLayout`
Expected: FAIL — `Cannot find module './scatterLayout.js'` (or similar import error).

- [ ] **Step 3: Write the implementation**

```js
export function getScatteredTransform(index, total, radius = 4) {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  const theta = index * goldenAngle
  const y = total > 1 ? 1 - (index / (total - 1)) * 2 : 1
  const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y))

  const position = [
    Math.cos(theta) * radiusAtY * radius,
    y * radius,
    Math.sin(theta) * radiusAtY * radius,
  ]

  const rotation = [
    (index * 0.37) % (Math.PI * 2),
    (index * 0.53) % (Math.PI * 2),
    (index * 0.71) % (Math.PI * 2),
  ]

  return { position, rotation }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- scatterLayout`
Expected: PASS, 3 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/camera-model/scatterLayout.js src/camera-model/scatterLayout.test.js
git commit -m "feat: add deterministic scatter layout math"
```

---

### Task 3: Float intensity easing (TDD)

**Files:**
- Create: `src/scroll/floatIntensity.js`
- Test: `src/scroll/floatIntensity.test.js`

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest'
import { getFloatIntensity } from './floatIntensity.js'

describe('getFloatIntensity', () => {
  it('is fully floating before scroll starts', () => {
    expect(getFloatIntensity(0)).toBe(1)
    expect(getFloatIntensity(-0.5)).toBe(1)
  })

  it('fades out linearly during assembly', () => {
    expect(getFloatIntensity(0.3)).toBeCloseTo(0.5)
  })

  it('is fully settled once assembly finishes', () => {
    expect(getFloatIntensity(0.6)).toBe(0)
    expect(getFloatIntensity(1)).toBe(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- floatIntensity`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```js
const ASSEMBLY_END = 0.6

export function getFloatIntensity(progress) {
  if (progress <= 0) return 1
  if (progress >= ASSEMBLY_END) return 0
  return 1 - progress / ASSEMBLY_END
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- floatIntensity`
Expected: PASS, 3 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/scroll/floatIntensity.js src/scroll/floatIntensity.test.js
git commit -m "feat: add float-intensity easing for idle motion"
```

---

### Task 4: Reduced-motion detection (TDD)

**Files:**
- Create: `src/scroll/reducedMotion.js`
- Test: `src/scroll/reducedMotion.test.js`

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, afterEach, vi } from 'vitest'
import { prefersReducedMotion } from './reducedMotion.js'

describe('prefersReducedMotion', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns true when the media query matches', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true })
    expect(prefersReducedMotion()).toBe(true)
  })

  it('returns false when the media query does not match', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false })
    expect(prefersReducedMotion()).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- reducedMotion`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```js
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- reducedMotion`
Expected: PASS, 2 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/scroll/reducedMotion.js src/scroll/reducedMotion.test.js
git commit -m "feat: add prefers-reduced-motion detection"
```

---

### Task 5: Shared materials

**Files:**
- Create: `src/camera-model/materials.js`

- [ ] **Step 1: Write the module**

```js
import * as THREE from 'three'

export function createMaterials() {
  return {
    brushedMetal: new THREE.MeshStandardMaterial({
      color: 0x8a8d90,
      metalness: 1,
      roughness: 0.35,
    }),
    matteBody: new THREE.MeshStandardMaterial({
      color: 0x111214,
      metalness: 0.1,
      roughness: 0.85,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0x335577,
      metalness: 0,
      roughness: 0.05,
      transmission: 1,
      thickness: 0.3,
      ior: 1.5,
      transparent: true,
      opacity: 0.9,
    }),
    accent: new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.6,
      roughness: 0.4,
    }),
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/camera-model/materials.js
git commit -m "feat: add shared PBR materials for the camera model"
```

---

### Task 6: Scene setup (renderer, camera, lights, env map, post-processing, mobile toggle)

**Files:**
- Create: `src/scene/sceneSetup.js`

- [ ] **Step 1: Write the module**

```js
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
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
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture

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
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5,
      0.4,
      0.85,
    )
    composer.addPass(bloomPass)
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    composer.setSize(window.innerWidth, window.innerHeight)
  })

  return { scene, camera, renderer, composer }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/scene/sceneSetup.js
git commit -m "feat: add Three.js scene setup with cinematic lighting and bloom"
```

---

### Task 7: Render loop

**Files:**
- Create: `src/scene/loop.js`

- [ ] **Step 1: Write the module**

The scattered starting state needs a slow drift/rotation ("flottement") per the spec. Rather than animate each part's position/rotation directly (which GSAP also tweens, and would fight it), this applies a gentle bob + spin to the whole camera group, faded out via `floatState.floatIntensity` so it settles naturally as assembly proceeds — and both are zero by the time GSAP's own "face the viewer" rotation of the same group takes over at progress 0.6.

```js
import * as THREE from 'three'

const BOB_AMPLITUDE = 0.08
const BOB_SPEED = 0.5
const SPIN_SPEED = 0.15

export function startRenderLoop({ renderer, composer, cameraGroup = null, floatState = null }) {
  const clock = new THREE.Clock()

  renderer.setAnimationLoop(() => {
    const elapsed = clock.getElapsedTime()
    const intensity = floatState ? floatState.floatIntensity : 0

    if (cameraGroup && intensity > 0) {
      cameraGroup.position.y = Math.sin(elapsed * BOB_SPEED) * BOB_AMPLITUDE * intensity
      cameraGroup.rotation.y += SPIN_SPEED * intensity * 0.01
    }

    composer.render()
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/scene/loop.js
git commit -m "feat: add render loop with idle float/spin while parts are scattered"
```

---

### Task 8: Body part

**Files:**
- Create: `src/camera-model/parts/body.js`

- [ ] **Step 1: Write the module**

```js
import * as THREE from 'three'

export function createBody(materials) {
  const geometry = new THREE.BoxGeometry(1.6, 1.0, 0.9)
  const mesh = new THREE.Mesh(geometry, materials.matteBody)
  mesh.name = 'body'
  mesh.position.set(0, 0, 0)
  return mesh
}
```

- [ ] **Step 2: Commit**

```bash
git add src/camera-model/parts/body.js
git commit -m "feat: add camera body part"
```

---

### Task 9: Top plate part

**Files:**
- Create: `src/camera-model/parts/topPlate.js`

- [ ] **Step 1: Write the module**

```js
import * as THREE from 'three'

export function createTopPlate(materials) {
  const geometry = new THREE.BoxGeometry(1.6, 0.12, 0.9)
  const mesh = new THREE.Mesh(geometry, materials.brushedMetal)
  mesh.name = 'topPlate'
  mesh.position.set(0, 0.56, 0)
  return mesh
}
```

- [ ] **Step 2: Commit**

```bash
git add src/camera-model/parts/topPlate.js
git commit -m "feat: add camera top plate part"
```

---

### Task 10: Grip part

**Files:**
- Create: `src/camera-model/parts/grip.js`

- [ ] **Step 1: Write the module**

```js
import * as THREE from 'three'

export function createGrip(materials) {
  const geometry = new THREE.BoxGeometry(0.35, 0.95, 0.85)
  const mesh = new THREE.Mesh(geometry, materials.matteBody)
  mesh.name = 'grip'
  mesh.position.set(0.85, -0.05, 0.05)
  mesh.rotation.set(0, 0, 0.08)
  return mesh
}
```

- [ ] **Step 2: Commit**

```bash
git add src/camera-model/parts/grip.js
git commit -m "feat: add camera grip part"
```

---

### Task 11: Shutter button part

**Files:**
- Create: `src/camera-model/parts/shutterButton.js`

- [ ] **Step 1: Write the module**

```js
import * as THREE from 'three'

export function createShutterButton(materials) {
  const geometry = new THREE.CylinderGeometry(0.07, 0.07, 0.06, 24)
  const mesh = new THREE.Mesh(geometry, materials.brushedMetal)
  mesh.name = 'shutterButton'
  mesh.position.set(0.75, 0.64, 0.25)
  return mesh
}
```

- [ ] **Step 2: Commit**

```bash
git add src/camera-model/parts/shutterButton.js
git commit -m "feat: add shutter button part"
```

---

### Task 12: Dial part

**Files:**
- Create: `src/camera-model/parts/dial.js`

- [ ] **Step 1: Write the module**

```js
import * as THREE from 'three'

export function createDial(materials) {
  const geometry = new THREE.CylinderGeometry(0.14, 0.14, 0.05, 32)
  const mesh = new THREE.Mesh(geometry, materials.accent)
  mesh.name = 'dial'
  mesh.position.set(0.35, 0.63, 0.2)
  return mesh
}
```

- [ ] **Step 2: Commit**

```bash
git add src/camera-model/parts/dial.js
git commit -m "feat: add mode dial part"
```

---

### Task 13: Viewfinder part

**Files:**
- Create: `src/camera-model/parts/viewfinder.js`

- [ ] **Step 1: Write the module**

```js
import * as THREE from 'three'

export function createViewfinder(materials) {
  const geometry = new THREE.BoxGeometry(0.4, 0.22, 0.3)
  const mesh = new THREE.Mesh(geometry, materials.matteBody)
  mesh.name = 'viewfinder'
  mesh.position.set(-0.1, 0.68, -0.28)
  return mesh
}
```

- [ ] **Step 2: Commit**

```bash
git add src/camera-model/parts/viewfinder.js
git commit -m "feat: add viewfinder part"
```

---

### Task 14: Lens mount part

**Files:**
- Create: `src/camera-model/parts/lensMount.js`

- [ ] **Step 1: Write the module**

```js
import * as THREE from 'three'

export function createLensMount(materials) {
  const geometry = new THREE.TorusGeometry(0.42, 0.06, 16, 32)
  const mesh = new THREE.Mesh(geometry, materials.accent)
  mesh.name = 'lensMount'
  mesh.position.set(0, 0, -0.46)
  return mesh
}
```

- [ ] **Step 2: Commit**

```bash
git add src/camera-model/parts/lensMount.js
git commit -m "feat: add lens mount part"
```

---

### Task 15: Lens barrel part

**Files:**
- Create: `src/camera-model/parts/lensBarrel.js`

- [ ] **Step 1: Write the module**

```js
import * as THREE from 'three'

export function createLensBarrel(materials) {
  const geometry = new THREE.CylinderGeometry(0.38, 0.4, 0.75, 32, 1, true)
  geometry.rotateX(Math.PI / 2)
  const mesh = new THREE.Mesh(geometry, materials.matteBody)
  mesh.name = 'lensBarrel'
  mesh.position.set(0, 0, -0.85)
  return mesh
}
```

- [ ] **Step 2: Commit**

```bash
git add src/camera-model/parts/lensBarrel.js
git commit -m "feat: add lens barrel part"
```

---

### Task 16: Lens rings part

**Files:**
- Create: `src/camera-model/parts/lensRings.js`

- [ ] **Step 1: Write the module**

```js
import * as THREE from 'three'

export function createLensRings(materials) {
  const group = new THREE.Group()
  group.name = 'lensRings'

  const ringZPositions = [-0.65, -0.95, -1.15]
  ringZPositions.forEach((z) => {
    const geometry = new THREE.CylinderGeometry(0.41, 0.41, 0.08, 32, 1, true)
    geometry.rotateX(Math.PI / 2)
    const ring = new THREE.Mesh(geometry, materials.brushedMetal)
    ring.position.set(0, 0, z)
    group.add(ring)
  })

  return group
}
```

- [ ] **Step 2: Commit**

```bash
git add src/camera-model/parts/lensRings.js
git commit -m "feat: add lens focus/zoom rings"
```

---

### Task 17: Front lens part

**Files:**
- Create: `src/camera-model/parts/frontLens.js`

- [ ] **Step 1: Write the module**

```js
import * as THREE from 'three'

export function createFrontLens(materials) {
  const geometry = new THREE.SphereGeometry(0.36, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.2)
  const mesh = new THREE.Mesh(geometry, materials.glass)
  mesh.name = 'frontLens'
  mesh.rotation.x = Math.PI
  mesh.position.set(0, 0, -1.35)
  return mesh
}
```

- [ ] **Step 2: Commit**

```bash
git add src/camera-model/parts/frontLens.js
git commit -m "feat: add front lens element"
```

---

### Task 18: Inner lenses part

**Files:**
- Create: `src/camera-model/parts/innerLenses.js`

- [ ] **Step 1: Write the module**

```js
import * as THREE from 'three'

export function createInnerLenses(materials) {
  const group = new THREE.Group()
  group.name = 'innerLenses'

  const lensZPositions = [-0.65, -0.9, -1.1]
  lensZPositions.forEach((z, index) => {
    const radius = 0.3 - index * 0.02
    const geometry = new THREE.CylinderGeometry(radius, radius, 0.04, 32)
    geometry.rotateX(Math.PI / 2)
    const lens = new THREE.Mesh(geometry, materials.glass)
    lens.position.set(0, 0, z)
    group.add(lens)
  })

  return group
}
```

- [ ] **Step 2: Commit**

```bash
git add src/camera-model/parts/innerLenses.js
git commit -m "feat: add inner lens elements"
```

---

### Task 19: Diaphragm blades part

**Files:**
- Create: `src/camera-model/parts/diaphragmBlades.js`

- [ ] **Step 1: Write the module**

```js
import * as THREE from 'three'

export function createDiaphragmBlades(materials) {
  const group = new THREE.Group()
  group.name = 'diaphragmBlades'

  const bladeCount = 6
  const radius = 0.22
  for (let i = 0; i < bladeCount; i += 1) {
    const geometry = new THREE.PlaneGeometry(0.26, 0.26)
    const blade = new THREE.Mesh(geometry, materials.accent)
    const angle = (i / bladeCount) * Math.PI * 2
    blade.position.set(
      Math.cos(angle) * radius * 0.4,
      Math.sin(angle) * radius * 0.4,
      -1.05,
    )
    blade.rotation.z = angle
    group.add(blade)
  }

  return group
}
```

- [ ] **Step 2: Commit**

```bash
git add src/camera-model/parts/diaphragmBlades.js
git commit -m "feat: add diaphragm blades"
```

---

### Task 20: Assemble the camera

**Files:**
- Create: `src/camera-model/buildCamera.js`

- [ ] **Step 1: Write the module**

```js
import * as THREE from 'three'
import { createMaterials } from './materials.js'
import { createBody } from './parts/body.js'
import { createTopPlate } from './parts/topPlate.js'
import { createGrip } from './parts/grip.js'
import { createShutterButton } from './parts/shutterButton.js'
import { createDial } from './parts/dial.js'
import { createViewfinder } from './parts/viewfinder.js'
import { createLensMount } from './parts/lensMount.js'
import { createLensBarrel } from './parts/lensBarrel.js'
import { createLensRings } from './parts/lensRings.js'
import { createFrontLens } from './parts/frontLens.js'
import { createInnerLenses } from './parts/innerLenses.js'
import { createDiaphragmBlades } from './parts/diaphragmBlades.js'
import { getScatteredTransform } from './scatterLayout.js'

const PART_FACTORIES = [
  createBody,
  createTopPlate,
  createGrip,
  createShutterButton,
  createDial,
  createViewfinder,
  createLensMount,
  createLensBarrel,
  createLensRings,
  createFrontLens,
  createInnerLenses,
  createDiaphragmBlades,
]

export function buildCamera() {
  const materials = createMaterials()
  const group = new THREE.Group()
  const parts = PART_FACTORIES.map((factory) => factory(materials))
  const total = parts.length

  parts.forEach((part, index) => {
    part.userData.assembled = {
      position: part.position.clone(),
      rotation: part.rotation.clone(),
    }

    const scattered = getScatteredTransform(index, total)
    part.position.set(...scattered.position)
    part.rotation.set(...scattered.rotation)

    group.add(part)
  })

  return { group, parts, materials }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/camera-model/buildCamera.js
git commit -m "feat: assemble camera parts with scattered starting transforms"
```

---

### Task 21: Scroll-driven assembly timeline

**Files:**
- Create: `src/scroll/scrollTimeline.js`

- [ ] **Step 1: Write the module**

```js
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getFloatIntensity } from './floatIntensity.js'

gsap.registerPlugin(ScrollTrigger)

const ASSEMBLE_DURATION = 0.6
const FACE_DURATION = 0.2
const ZOOM_START_DURATION = 0.2

export function createScrollTimeline({ heroElement, cameraGroup, parts, camera }) {
  const state = { floatIntensity: 1 }

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: heroElement,
      start: 'top top',
      end: '+=300%',
      scrub: 1,
      pin: true,
      onUpdate: (self) => {
        state.floatIntensity = getFloatIntensity(self.progress)
      },
    },
  })

  parts.forEach((part) => {
    const { position, rotation } = part.userData.assembled
    timeline.to(
      part.position,
      { x: position.x, y: position.y, z: position.z, duration: ASSEMBLE_DURATION, ease: 'power2.inOut' },
      0,
    )
    timeline.to(
      part.rotation,
      { x: rotation.x, y: rotation.y, z: rotation.z, duration: ASSEMBLE_DURATION, ease: 'power2.inOut' },
      0,
    )
  })

  timeline.to(
    cameraGroup.rotation,
    { y: Math.PI * 2, duration: FACE_DURATION, ease: 'power2.inOut' },
    ASSEMBLE_DURATION,
  )

  timeline.to(
    camera.position,
    { z: 3, duration: ZOOM_START_DURATION, ease: 'power2.inOut' },
    ASSEMBLE_DURATION + FACE_DURATION,
  )

  return { timeline, state }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/scroll/scrollTimeline.js
git commit -m "feat: add pinned scroll-scrubbed assembly timeline"
```

---

### Task 22: Loading screen helper

**Files:**
- Create: `src/ui/loadingScreen.js`

- [ ] **Step 1: Write the module**

```js
export function hideLoadingScreen() {
  const el = document.getElementById('loading-screen')
  if (!el) return
  el.classList.add('loading-screen--hidden')
  el.addEventListener('transitionend', () => el.remove(), { once: true })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/ui/loadingScreen.js
git commit -m "feat: add loading screen dismissal helper"
```

---

### Task 23: Wire everything in main.js

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: Replace the stub with the full wiring**

```js
import './styles/main.css'
import { createSceneSetup } from './scene/sceneSetup.js'
import { startRenderLoop } from './scene/loop.js'
import { buildCamera } from './camera-model/buildCamera.js'
import { createScrollTimeline } from './scroll/scrollTimeline.js'
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
} else {
  const { state } = createScrollTimeline({ heroElement, cameraGroup: group, parts, camera })
  floatState = state
}

startRenderLoop({ renderer, composer, cameraGroup: group, floatState })
hideLoadingScreen()
```

- [ ] **Step 2: Run the unit test suite to confirm nothing broke**

Run: `npm run test`
Expected: PASS, all 8 tests (scatterLayout: 3, floatIntensity: 3, reducedMotion: 2) green.

- [ ] **Step 3: Commit**

```bash
git add src/main.js
git commit -m "feat: wire scene, camera model, and scroll timeline together"
```

---

### Task 24: Local verification

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Use the `preview_start` tool with `{"name": "captsurfer-dev"}` after adding this entry to `.claude/launch.json`:

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "captsurfer-dev",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 5173
    }
  ]
}
```

- [ ] **Step 2: Check for console/network errors**

Use `read_console_messages` (expect no errors) and `preview_logs` (expect no Vite/Rollup errors).

- [ ] **Step 3: Verify the assembly animation visually**

Use `read_page` then `computer` scroll actions to scroll down through the pinned hero in several increments, taking a `screenshot` after each: confirm the 12 parts visibly move from scattered to assembled, then the whole camera rotates to face the viewer. Scroll back up and confirm the animation reverses.

- [ ] **Step 4: Verify mobile layout**

Use `resize_window` with `preset: "mobile"`, reload, repeat the scroll check, confirm no console errors and that bloom is disabled (visual check: slightly less glow, acceptable since `isMobile` skips `UnrealBloomPass`). Reset with `resize_window preset: "desktop"` afterward.

- [ ] **Step 5: Report back to the user**

Summarize what was verified (desktop + mobile, console clean, scroll reversible) and share a screenshot before moving to Phase 2.
