import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

// Seconds for the displayed progress to close ~63% of the gap to the scroll position.
// Smooths out scrollbar drags and keyboard jumps that Lenis does not interpolate.
const FOLLOW_TIME = 0.12

export function createScrollDriver(heroElement) {
  const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  const trigger = ScrollTrigger.create({
    trigger: heroElement,
    start: 'top top',
    end: '+=700%',
    pin: true,
  })

  let progress = trigger.progress
  return {
    // Frame-rate independent exponential follow, so motion stays continuous even
    // when the scroll position itself jumps.
    advance(deltaSeconds) {
      const k = 1 - Math.exp(-deltaSeconds / FOLLOW_TIME)
      progress += (trigger.progress - progress) * k
      return progress
    },
  }
}
