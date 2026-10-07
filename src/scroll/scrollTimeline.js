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

  // The model is assembled with its lens facing -Z, while the scene camera sits on +Z.
  // A half turn brings the lens around to face the viewer.
  timeline.to(
    cameraGroup.rotation,
    { y: Math.PI, duration: FACE_DURATION, ease: 'power2.inOut' },
    ASSEMBLE_DURATION,
  )

  timeline.to(
    camera.position,
    { z: 3, duration: ZOOM_START_DURATION, ease: 'power2.inOut' },
    ASSEMBLE_DURATION + FACE_DURATION,
  )

  return { timeline, state }
}
