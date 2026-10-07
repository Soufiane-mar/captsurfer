import * as THREE from 'three'
import { windowProgress, smootherstep } from './easing.js'

const FLOAT_AMPLITUDE = 0.018
const FLOAT_WOBBLE = 0.07

const _spin = new THREE.Quaternion()
const _wobble = new THREE.Quaternion()
const _euler = new THREE.Euler()

// Captures a part's current (assembled) transform and its exploded offsets.
export function preparePart(spec, index) {
  const { object } = spec
  const assembledQuaternion = object.quaternion.clone()
  const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(...(spec.tilt ?? [0, 0, 0])))
  return {
    object,
    assembledPosition: object.position.clone(),
    assembledQuaternion,
    explodedQuaternion: assembledQuaternion.clone().multiply(tilt),
    explode: new THREE.Vector3(...spec.explode),
    arc: new THREE.Vector3(...(spec.arc ?? [0, 0, 0])),
    window: spec.window,
    rotationRange: spec.rotationRange ?? [0, 1],
    spinAxis: spec.spin ? new THREE.Vector3(...spec.spin.axis).normalize() : null,
    spinAngle: spec.spin ? spec.spin.turns * Math.PI * 2 : 0,
    seed: index * 1.618,
  }
}

// Pure pose of a part at timeline position t (0..1) and clock time (seconds).
// Every term is continuous in t and time, so scrubbing can never make a part jump.
export function applyPartPose(part, t, time) {
  const linear = windowProgress(t, part.window[0], part.window[1])
  const eased = smootherstep(linear)
  const remaining = 1 - eased
  const { object } = part

  object.position.copy(part.assembledPosition).addScaledVector(part.explode, remaining)
  object.position.addScaledVector(part.arc, Math.sin(Math.PI * eased))

  const turn = smootherstep(windowProgress(linear, part.rotationRange[0], part.rotationRange[1]))
  object.quaternion.slerpQuaternions(part.explodedQuaternion, part.assembledQuaternion, turn)

  if (part.spinAxis) {
    _spin.setFromAxisAngle(part.spinAxis, part.spinAngle * remaining)
    object.quaternion.multiply(_spin)
  }

  if (remaining > 0) {
    const s = part.seed
    object.position.x += Math.sin(time * 0.7 + s) * FLOAT_AMPLITUDE * remaining
    object.position.y += Math.sin(time * 0.9 + s * 1.7) * FLOAT_AMPLITUDE * remaining
    _euler.set(
      Math.sin(time * 0.5 + s) * FLOAT_WOBBLE * remaining,
      Math.sin(time * 0.6 + s * 0.7) * FLOAT_WOBBLE * remaining,
      0,
    )
    _wobble.setFromEuler(_euler)
    object.quaternion.multiply(_wobble)
  }
}
