import * as THREE from 'three'
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'

// Objects on this layer (the lens glass) are drawn but get no ink line: their outline
// would otherwise stay at full strength while the glass itself fades during the dive.
export const NO_OUTLINE_LAYER = 1

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  #include <packing>
  uniform sampler2D tDiffuse;
  uniform sampler2D tNormal;
  uniform sampler2D tDepth;
  uniform vec2 resolution;
  uniform float cameraNear;
  uniform float cameraFar;
  uniform float thickness;
  uniform vec3 inkColor;
  varying vec2 vUv;

  float viewDepth(vec2 uv) {
    return -perspectiveDepthToViewZ(texture2D(tDepth, uv).x, cameraNear, cameraFar);
  }

  vec3 viewNormal(vec2 uv) {
    return texture2D(tNormal, uv).xyz * 2.0 - 1.0;
  }

  void main() {
    vec4 color = texture2D(tDiffuse, vUv);
    vec2 texel = thickness / resolution;
    vec2 offsets[4];
    offsets[0] = vec2(texel.x, 0.0);
    offsets[1] = vec2(-texel.x, 0.0);
    offsets[2] = vec2(0.0, texel.y);
    offsets[3] = vec2(0.0, -texel.y);

    float depth = viewDepth(vUv);
    vec3 normal = viewNormal(vUv);
    float laplacian = -4.0 * depth;
    float normalDiff = 0.0;
    for (int i = 0; i < 4; i++) {
      laplacian += viewDepth(vUv + offsets[i]);
      normalDiff += 1.0 - dot(normal, viewNormal(vUv + offsets[i]));
    }

    float depthLine = smoothstep(0.015, 0.04, abs(laplacian) / max(depth, 1e-4));
    float normalLine = smoothstep(0.4, 0.9, normalDiff);
    float line = max(depthLine, normalLine);
    gl_FragColor = vec4(mix(color.rgb, inkColor, line), color.a);
  }
`

export class InkOutlinePass extends Pass {
  constructor(scene, camera, { color = 0x1e1a15, thickness = 1 } = {}) {
    super()
    this.scene = scene
    this.camera = camera
    this.normalTarget = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType,
      depthTexture: new THREE.DepthTexture(1, 1),
    })
    this.normalMaterial = new THREE.MeshNormalMaterial()
    this.previousClearColor = new THREE.Color()
    this.quad = new FullScreenQuad(
      new THREE.ShaderMaterial({
        uniforms: {
          tDiffuse: { value: null },
          tNormal: { value: null },
          tDepth: { value: null },
          resolution: { value: new THREE.Vector2(1, 1) },
          cameraNear: { value: camera.near },
          cameraFar: { value: camera.far },
          thickness: { value: thickness },
          inkColor: { value: new THREE.Color(color) },
        },
        vertexShader,
        fragmentShader,
      }),
    )
  }

  setSize(width, height) {
    this.normalTarget.setSize(width, height)
    this.quad.material.uniforms.resolution.value.set(width, height)
  }

  render(renderer, writeBuffer, readBuffer) {
    const { scene, camera } = this
    const layerMask = camera.layers.mask
    const background = scene.background
    const clearAlpha = renderer.getClearAlpha()
    renderer.getClearColor(this.previousClearColor)

    camera.layers.disable(NO_OUTLINE_LAYER)
    scene.overrideMaterial = this.normalMaterial
    scene.background = null
    renderer.setClearColor(0x000000, 0)
    renderer.setRenderTarget(this.normalTarget)
    renderer.clear()
    renderer.render(scene, camera)

    camera.layers.mask = layerMask
    scene.overrideMaterial = null
    scene.background = background
    renderer.setClearColor(this.previousClearColor, clearAlpha)

    const uniforms = this.quad.material.uniforms
    uniforms.tDiffuse.value = readBuffer.texture
    uniforms.tNormal.value = this.normalTarget.texture
    uniforms.tDepth.value = this.normalTarget.depthTexture
    uniforms.cameraNear.value = camera.near
    uniforms.cameraFar.value = camera.far

    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer)
    this.quad.render(renderer)
  }

  dispose() {
    this.normalTarget.dispose()
    this.normalMaterial.dispose()
    this.quad.dispose()
  }
}
