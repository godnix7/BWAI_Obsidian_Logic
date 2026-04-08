import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// --- PAGE ENTER --- (call on every route mount)
export const pageEnter = (selector = '.animate-page') => {
  gsap.from(selector, {
    opacity: 0,
    y: 48,
    duration: 0.85,
    ease: 'power3.out',
    clearProps: 'all',
  });
};

// --- STAGGER CARDS ---
export const cardStagger = (selector = '.card') => {
  gsap.from(selector, {
    opacity: 0,
    y: 32,
    scale: 0.97,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power3.out',
    clearProps: 'all',
  });
};

// --- HERO REVEAL (landing page) ---
export const heroReveal = () => {
  const tl = gsap.timeline();
  tl.from('.hero-title-wrap', { y: 80, opacity: 0, duration: 1.1, ease: 'power4.out' })
    .from('.hero-para',  { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out' }, '-=0.6')
    .from('.hero-cta',   { y: 20, opacity: 0, duration: 0.7, ease: 'back.out(1.5)' }, '-=0.5')
    .from('.hero-img',   { scale: 0.88, opacity: 0, duration: 1.0, ease: 'power3.out' }, '-=0.8');
  return tl;
};

// --- SCROLL REVEAL (reusable for any element) ---
export const scrollReveal = (element, options = {}) => {
  gsap.fromTo(element,
    { opacity: 0, y: 300, ...options.from },
    {
      opacity: 1, y: 0,
      duration: options.duration || 1.5,
      ease: options.ease || 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 90%',
        end: 'top 55%',
        scrub: options.scrub || false,
        toggleActions: 'play none none reverse',
        ...options.scrollTrigger,
      },
    }
  );
};

// --- FLOAT (idle animation for 3D/hero elements) ---
export const float = (element) => {
  gsap.to(element, {
    y: -12,
    duration: 2.8,
    ease: 'power1.inOut',
    yoyo: true,
    repeat: -1,
  });
};

// --- GLOW PULSE (accent elements) ---
export const glowPulse = (element) => {
  gsap.to(element, {
    boxShadow: '0 0 40px rgba(245, 158, 11, 0.40), 0 0 80px rgba(245, 158, 11, 0.12)',
    duration: 1.8,
    ease: 'power1.inOut',
    yoyo: true,
    repeat: -1,
  });
};

// --- MODAL OPEN ---
export const modalOpen = (panel, backdrop) => {
  gsap.from(backdrop, { opacity: 0, duration: 0.3 });
  gsap.from(panel, {
    opacity: 0,
    scale: 0.94,
    y: 20,
    duration: 0.4,
    ease: 'back.out(1.4)',
  });
};

// --- SIDEBAR LINK HOVER (micro-interaction) ---
export const sidebarHover = (element) => {
  gsap.to(element, { x: 4, duration: 0.2, ease: 'power2.out' });
};
export const sidebarHoverOut = (element) => {
  gsap.to(element, { x: 0, duration: 0.2, ease: 'power2.in' });
};
