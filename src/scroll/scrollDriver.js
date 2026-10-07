import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

// Seconds for a tracked progress to close ~63% of the gap to the scroll position.
// Smooths out scrollbar drags and keyboard jumps that Lenis does not interpolate.
const FOLLOW_TIME = 0.12

export function createSmoothScroll() {
  const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  return {
    // Progress (0..1) of a ScrollTrigger range, eased toward the real scroll position
    // with a frame-rate independent exponential follow so motion never jumps.
    track(triggerVars) {
      const trigger = ScrollTrigger.create(triggerVars)
      let progress = trigger.progress
      return {
        trigger,
        advance(deltaSeconds) {
          const k = 1 - Math.exp(-deltaSeconds / FOLLOW_TIME)
          progress += (trigger.progress - progress) * k
          return progress
        },
      }
    },
  }
}
