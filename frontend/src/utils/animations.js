import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

export const pageEnter = (sel = '.animate-page') => {
  if (document.querySelector(sel)) {
    gsap.from(sel, { opacity: 0, y: 48, duration: 0.85, ease: 'power3.out', clearProps: 'opacity,transform' })
  }
}

export const cardStagger = (sel = '.card') => {
  if (document.querySelector(sel)) {
    gsap.from(sel, { opacity: 0, y: 32, scale: 0.97, duration: 0.6, stagger: 0.1, ease: 'power3.out', clearProps: 'opacity,transform' })
  }
}

export const heroReveal = () => {
  const tl = gsap.timeline()
  if (document.querySelector('.hero-title')) {
    tl.from('.hero-title', { y: 80, opacity: 0, duration: 1.1, ease: 'power4.out' })
      .from('.hero-para', { y: 40, opacity: 0, duration: 0.9 }, '-=0.6')
      .from('.hero-cta', { y: 20, opacity: 0, ease: 'back.out(1.5)' }, '-=0.5')
      .from('.hero-img', { scale: 0.88, opacity: 0, duration: 1.0 }, '-=0.8')
  }
  return tl
}

export const scrollReveal = (el, opts = {}) => {
  if (!el) return
  gsap.fromTo(el, { opacity: 0, y: 50 }, {
    opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play none none reverse', ...opts }
  })
}

export const modalOpen = (panel, backdrop) => {
  if (backdrop) {
    gsap.set(backdrop, { display: 'flex', opacity: 0 })
    gsap.to(backdrop, { opacity: 1, duration: 0.3 })
  }
  if (panel) {
    gsap.fromTo(panel, 
      { opacity: 0, scale: 0.94, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)', clearProps: 'all' }
    )
  }
}

export const glowPulse = (el) => {
  if (!el) return
  gsap.to(el, {
    boxShadow: '0 0 40px rgba(0,229,200,0.45), 0 0 80px rgba(0,229,200,0.15)',
    duration: 1.8, ease: 'power1.inOut', yoyo: true, repeat: -1
  })
}

export const float = (el) => {
  if (!el) return
  gsap.to(el, { y: -12, duration: 2.8, ease: 'power1.inOut', yoyo: true, repeat: -1 })
}

export const sidebarHover = (el) => {
  if (!el) return
  gsap.to(el, { x: 4, duration: 0.2, ease: 'power2.out' })
}

export const sidebarHoverOut = (el) => {
  if (!el) return
  gsap.to(el, { x: 0, duration: 0.2, ease: 'power2.in' })
}
