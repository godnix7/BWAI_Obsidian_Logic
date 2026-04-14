import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import * as THREE from "three";
const { 
  Vector3, CatmullRomCurve3, TubeGeometry, PerspectiveCamera, OrthographicCamera, Scene, WebGLRenderer, 
  Group, MeshStandardMaterial, Mesh, SphereGeometry, CylinderGeometry, AmbientLight, 
  PointLight, ACESFilmicToneMapping 
} = THREE;

import { TestTube, CreditCard, LogOut, Menu, X } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function MediLockerPage() {
  const navigate = useNavigate();
  const lineRef = useRef(null);
  const spiralRef = useRef(null);
  const threeRef = useRef(null);
  const cursorRef = useRef(null);
  const heroImgRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    /* ── SMOOTH SCROLL (Lenis) ─────────────────────────── */
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      mouseMultiplier: 1.0,
      smoothTouch: false,
      touchMultiplier: 2.0,
    });

    const rafLoop = (time) => {
      lenis.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(rafLoop);
    };
    requestAnimationFrame(rafLoop);

    /* ── CURSOR GLOW (Desktop Only) ────────────────────── */
    const handleMouseMove = (e) => {
      if (cursorRef.current && window.matchMedia("(hover: hover)").matches) {
        gsap.to(cursorRef.current, {
          x: e.clientX - 100,
          y: e.clientY - 100,
          duration: 0.3,
        });
      }
    };
    if (window.matchMedia("(hover: hover)").matches) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    /* ── HERO REVEAL ───────────────────────────────────── */
    const heroTl = gsap.timeline({ delay: 0.2 });
    heroTl
      .fromTo(
        ".hero-title-wrap",
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, ease: "power4.out" }
      )
      .fromTo(
        ".hero-para",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" },
        "-=0.6"
      )
      .fromTo(
        ".hero-cta",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "back.out(1.5)" },
        "-=0.5"
      )
      .fromTo(
        ".hero-img",
        { scale: 0.88, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.0, ease: "power3.out" },
        "-=0.8"
      );

    /* ── FLOAT hero image ──────────────────────────────── */
    if (heroImgRef.current) {
      gsap.to(heroImgRef.current, {
        y: -12,
        duration: 2.8,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1,
      });
    }

    /* ── SCROLL LINE ANIMATION (Restored) ──────────────── */
    const lineCanvas = document.createElement('canvas');
    const lineRenderer = new WebGLRenderer({ canvas: lineCanvas, alpha: true, antialias: window.innerWidth > 768 });
    const isMobile = window.innerWidth <= 768;
    lineRenderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
    
    const lineScene = new Scene();
    const lineGroup = new Group();
    
    // The main vertical beam - CYBER NEON MAGENTA
    const beamGeo = new CylinderGeometry(0.06, 0.06, 60, 8);
    const beamMat = new MeshStandardMaterial({ 
      color: 0xFF00FF, emissive: 0xFF00FF, emissiveIntensity: 3, transparent: true, opacity: 0.8 
    });
    const mainBeam = new Mesh(beamGeo, beamMat);
    lineGroup.add(mainBeam);

    // Floating data particles around the line
    const pCount = 40;
    const pGeo = new SphereGeometry(0.08, 8, 8);
    for(let i=0; i<pCount; i++) {
        const p = new Mesh(pGeo, beamMat);
        p.position.set((Math.random()-0.5)*2, (Math.random()-0.5)*60, (Math.random()-0.5)*2);
        lineGroup.add(p);
    }

    lineScene.add(lineGroup);
    lineScene.add(new AmbientLight(0xffffff, 0.8));
    const lLight = new PointLight(0xFF00FF, 5); // Brighter magenta glow
    lLight.position.set(2, 5, 5);
    lineScene.add(lLight);

    let lineCamera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    let updateLineSize = () => {};

    if (lineRef.current) {
      lineRef.current.appendChild(lineRenderer.domElement);
      
      const rect = lineRef.current.getBoundingClientRect();
      const frustumSize = 25; 
      const aspect = rect.width / rect.height;
      lineCamera = new OrthographicCamera(
        frustumSize * aspect / -2, frustumSize * aspect / 2, 
        frustumSize / 2, frustumSize / -2, 
        0.1, 1000
      );
      lineCamera.position.z = 20;

      updateLineSize = () => {
        if (!lineRef.current) return;
        const nRect = lineRef.current.getBoundingClientRect();
        lineRenderer.setSize(nRect.width, nRect.height);
        const nAspect = nRect.width / nRect.height;
        lineCamera.left = frustumSize * nAspect / -2;
        lineCamera.right = frustumSize * nAspect / 2;
        lineCamera.top = frustumSize / 2;
        lineCamera.bottom = frustumSize / -2;
        lineCamera.updateProjectionMatrix();
      };
      updateLineSize();
      window.addEventListener('resize', updateLineSize);

      gsap.to(lineGroup.rotation, {
        y: Math.PI * 4,
        scrollTrigger: {
          trigger: ".about-card",
          start: "top 95%",
          end: "bottom 10%",
          scrub: 1.5
        }
      });
      
      gsap.to(lineGroup.position, {
        y: -10,
        scrollTrigger: {
          trigger: ".about-card",
          start: "top 95%",
          end: "bottom 10%",
          scrub: 1
        }
      });
    }

    // ── CONTINUOUS GLOW & COLOR CYCLE ──────────────────
    gsap.to(beamMat, {
      emissiveIntensity: 5,
      duration: 1.2,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

    // Subtly cycle color between Magenta and Cyan
    gsap.to(beamMat.color, {
      r: 0, g: 0.8, b: 1, // Cyanish
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut"
    });

    let hAnimId;
    const animateLine = () => {
      hAnimId = requestAnimationFrame(animateLine);
      lineGroup.children.forEach((child, i) => {
          if(i > 0) child.position.y += 0.05; // Particles float up
          if(child.position.y > 30) child.position.y = -30;
      });
      lineRenderer.render(lineScene, lineCamera);
    };
    animateLine();

    /* ── ABOUT CARD — premium reveal (fade + scale) ────────── */
    gsap.fromTo(
      ".about-card",
      { y: 60, scale: 0.96, opacity: 0 },
      {
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: {
          trigger: ".about-card",
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      }
    );

    /* ── SERVICES CARD — premium reveal (fade + scale) ─────── */
    gsap.fromTo(
      ".services-card",
      { y: 60, scale: 0.96, opacity: 0 },
      {
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: {
          trigger: ".services-card",
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      }
    );

    /* ── THREE.JS BACKGROUND ───────────────────────────── */
    let animId;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: window.innerWidth > 768 });
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    if (threeRef.current) {
      threeRef.current.appendChild(renderer.domElement);
    }

    camera.position.z = 18;

    function animate() {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    ScrollTrigger.refresh();

    /* ── CLEANUP ───────────────────────────────────────── */
    return () => {
      lenis.destroy();
      cancelAnimationFrame(animId);
      cancelAnimationFrame(hAnimId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("resize", updateLineSize);
      
      renderer?.dispose();
      lineRenderer?.dispose();
      beamMat?.dispose();
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  /* ═══════════════════════════════════════════════════════
   *  RENDER
   * ═══════════════════════════════════════════════════════ */
  return (
    <>
      {/* ━━ LAYER 0: FIXED BACKGROUNDS ━━━━━━━━━━━━━━━━━━ */}

      {/* Cursor glow — topmost */}
      <div
        ref={cursorRef}
        style={{
          position: "fixed",
          width: 200,
          height: 200,
          background: "var(--accent-glow)",
          filter: "blur(80px)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />

      {/* Ambient glow orbs */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -2,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            top: -200,
            left: -200,
            background: "var(--accent-soft)",
            filter: "blur(180px)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            bottom: -200,
            right: -200,
            background: "rgba(160, 0, 109, 0.08)",
            filter: "blur(160px)",
            borderRadius: "50%",
          }}
        />
      </div>

      {/* Three.js canvas */}
      <div
        ref={threeRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0.15,
          zIndex: -1,
          pointerEvents: "none",
        }}
      />

      {/* ━━ LAYER 1: ALL PAGE CONTENT ━━━━━━━━━━━━━━━━━━━ */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          color: "var(--text-primary)",
          fontFamily: "var(--font-body)",
        }}
      >
        {/* ── NAVBAR ─────────────────────────────────── */}
        <nav
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            backdropFilter: window.innerWidth > 768 ? "blur(20px)" : "none",
            WebkitBackdropFilter: window.innerWidth > 768 ? "blur(20px)" : "none",
            background: "rgba(239, 250, 253, 0.70)",
            borderBottom: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: window.innerWidth > 768 ? "14px 32px" : "12px 24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: window.innerWidth > 768 ? 26 : 22,
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  color: "var(--eggplant)",
                  margin: 0,
                }}
              >
                MediLocker
              </h1>
            </div>

            <div className="hidden-desktop">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer" }}
              >
                {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>

            <div className="hidden-mobile" style={{ display: "flex", alignItems: "center", gap: 28 }}>
              {[
                { label: "HOME", href: "#home" },
                { label: "ABOUT US", href: "#about" },
                { label: "SERVICES", href: "#services" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: 13,
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.color = "var(--accent)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.color = "var(--text-secondary)")
                  }
                >
                  {item.label}
                </a>
              ))}
              <button className="btn-secondary" onClick={() => navigate("/login")}>Login</button>
              <button className="btn-primary" onClick={() => navigate("/register")}>Register</button>
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div 
              style={{ 
                position: "fixed", top: 60, left: 0, right: 0, bottom: 0, 
                background: "var(--bg-base)", zIndex: 99, 
                display: "flex", flexDirection: "column", padding: 32, gap: 24,
                animation: "fadeIn 0.3s ease"
              }}
            >
              {[
                { label: "HOME", href: "#home" },
                { label: "ABOUT US", href: "#about" },
                { label: "SERVICES", href: "#services" },
              ].map((item) => (
                <a 
                  key={item.label} 
                  href={item.href} 
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", textDecoration: "none" }}
                >
                  {item.label}
                </a>
              ))}
              <hr style={{ border: "none", borderTop: "1px solid var(--border-subtle)" }} />
              <button className="btn-primary" onClick={() => navigate("/register")}>Register Now</button>
              <button className="btn-secondary" onClick={() => navigate("/login")}>Sign In</button>
            </div>
          )}
        </nav>

        {/* ── HERO ───────────────────────────────────── */}
        <section
          id="home"
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: window.innerWidth > 1024 ? "row" : "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: window.innerWidth > 768 ? "140px 48px 120px" : "100px 24px 60px",
            maxWidth: 1280,
            margin: "0 auto",
            gap: window.innerWidth > 1024 ? 48 : 40,
            textAlign: window.innerWidth > 1024 ? "left" : "center"
          }}
        >
          <div style={{ flex: 1, width: "100%" }}>
            <div className="hero-title-wrap">
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: window.innerWidth > 768 ? 84 : 48,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.1,
                  margin: 0,
                  background: "var(--gradient-accent)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Your Health.<br/>Your Vault.
              </h2>
            </div>

            <p
              className="hero-para"
              style={{
                color: "var(--text-secondary)",
                fontSize: window.innerWidth > 768 ? 17 : 15,
                lineHeight: 1.75,
                marginTop: 20,
                maxWidth: 520,
                margin: window.innerWidth > 1024 ? "20px 0 0" : "20px auto 0"
              }}
            >
              A secure, intelligent digital health vault — empowering patients,
              doctors, and hospitals to manage medical data with clarity, trust,
              and elegance.
            </p>

            <div
              className="hero-cta"
              style={{ 
                display: "flex", 
                flexDirection: window.innerWidth > 480 ? "row" : "column",
                gap: 16, 
                marginTop: 36, 
                position: "relative", 
                zIndex: 110,
                justifyContent: window.innerWidth > 1024 ? "flex-start" : "center"
              }}
            >
              <button className="btn-primary" style={{ fontSize: 16, pointerEvents: "auto" }} onClick={() => navigate("/register")}>
                Get Started →
              </button>
              <button className="btn-secondary" style={{ fontSize: 16, pointerEvents: "auto" }} onClick={() => navigate("/learn-more")}>
                Learn More
              </button>
            </div>
          </div>

          {/* Hero visual card */}
          <div
            ref={heroImgRef}
            className="hero-img"
            style={{
              width: window.innerWidth > 768 ? 380 : 300,
              height: window.innerWidth > 768 ? 380 : 300,
              borderRadius: 24,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--glass-light)",
              backdropFilter: window.innerWidth > 768 ? "blur(16px)" : "none",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-card)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background glow */}
            <div
              style={{
                position: "absolute",
                width: 250,
                height: 250,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
                filter: "blur(30px)",
              }}
            />

            {/* Hospital Cross — large, transparent background */}
            <svg
              viewBox="0 0 100 100"
              style={{
                position: "absolute",
                width: 200,
                height: 200,
                opacity: 0.06,
              }}
            >
              <rect x="35" y="10" width="30" height="80" rx="4" fill="var(--accent)" />
              <rect x="10" y="35" width="80" height="30" rx="4" fill="var(--accent)" />
            </svg>

            {/* Lock + Shield icon — centered, semi-transparent */}
            <svg
              viewBox="0 0 80 100"
              style={{
                width: 90,
                height: 110,
                position: "relative",
                zIndex: 2,
                filter: "drop-shadow(0 0 20px var(--accent-glow))",
              }}
            >
              {/* Shield shape */}
              <path
                d="M40 5 L72 20 L72 50 C72 72 58 88 40 95 C22 88 8 72 8 50 L8 20 Z"
                fill="none"
                stroke="var(--accent-glow)"
                strokeWidth="2"
              />
              <path
                d="M40 10 L68 23 L68 50 C68 69 55 84 40 90 C25 84 12 69 12 50 L12 23 Z"
                fill="var(--accent-soft)"
              />

              {/* Lock body */}
              <rect
                x="24"
                y="45"
                width="32"
                height="26"
                rx="4"
                fill="var(--accent-glow)"
                stroke="var(--border-accent)"
                strokeWidth="1.5"
              />

              {/* Lock shackle */}
              <path
                d="M30 45 L30 36 C30 28 35 24 40 24 C45 24 50 28 50 36 L50 45"
                fill="var(--accent)"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Keyhole */}
              <circle cx="40" cy="55" r="3.5" fill="var(--accent)" />
              <rect
                x="38.5"
                y="55"
                width="3"
                height="7"
                rx="1.5"
                fill="var(--accent)"
              />
            </svg>

            {/* Small medical cross accent — top right */}
            <svg
              viewBox="0 0 40 40"
              style={{
                position: "absolute",
                top: 28,
                right: 28,
                width: 36,
                height: 36,
                opacity: 0.15,
              }}
            >
              <rect x="15" y="4" width="10" height="32" rx="3" fill="var(--accent)" />
              <rect x="4" y="15" width="32" height="10" rx="3" fill="var(--accent)" />
            </svg>

            {/* Small medical cross accent — bottom left */}
            <svg
              viewBox="0 0 40 40"
              style={{
                position: "absolute",
                bottom: 24,
                left: 24,
                width: 28,
                height: 28,
                opacity: 0.1,
              }}
            >
              <rect x="15" y="4" width="10" height="32" rx="3" fill="var(--eggplant)" />
              <rect x="4" y="15" width="32" height="10" rx="3" fill="var(--eggplant)" />
            </svg>

            {/* Subtle heartbeat line */}
            <svg
              viewBox="0 0 200 40"
              style={{
                position: "absolute",
                bottom: 60,
                width: 260,
                height: 30,
                opacity: 0.08,
              }}
            >
              <polyline
                points="0,20 40,20 50,20 60,5 70,35 80,15 90,25 100,20 200,20"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </section>

        {/* ── HOW IT WORKS ───────────────────────────── */}
        <section
          id="how-it-works"
          style={{
            padding: "160px 48px",
            maxWidth: 1280,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div className="how-it-works-title" style={{ marginBottom: 80 }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 48,
                fontWeight: 800,
                background: "var(--gradient-accent)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                margin: 0,
              }}
            >
              Let's understand how it works
            </h2>
            <p style={{ color: "var(--text-secondary)", marginTop: 16, fontSize: 18 }}>
              Simplified medical data management in three steps.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: window.innerWidth > 992 ? "repeat(3, 1fr)" : "1fr",
              gap: 32,
              position: "relative",
            }}
          >
            {[
              {
                step: "01",
                title: "Secure Vault",
                desc: "Upload and encrypt your medical records in our triple-layered digital vault.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 40, height: 40, color: "var(--accent-primary)" }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    <rect x="9" y="11" width="6" height="5" rx="1" />
                    <path d="M12 11v-1" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Smart Retrieval",
                desc: "Access your documents instantly from any device with advanced AI-powered search.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 40, height: 40, color: "var(--accent-secondary)" }}>
                    <path d="M17.5 19L11 12.5" />
                    <circle cx="9" cy="9" r="6" />
                    <path d="M12 9h.01" />
                    <path d="M9 12h.01" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Trusted Sharing",
                desc: "Share specific records with doctors or hospitals via secure, time-limited links.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 40, height: 40, color: "var(--accent-success)" }}>
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                ),
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="step-card"
                style={{
                  background: "var(--glass-light)",
                  padding: 40,
                  borderRadius: 24,
                  border: "1px solid var(--glass-border)",
                  textAlign: "left",
                  position: "relative",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 20 }}>
                  STEP {step.step}
                </div>
                <div style={{ marginBottom: 24 }}>{step.icon}</div>
                <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>{step.title}</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CARDS SECTION (flow layout — no overlap) ──── */}
        <section
          style={{
            position: "relative",
            maxWidth: 1280,
            margin: "0 auto",
            padding: "120px 32px 140px",
          }}
        >
          {/* Scroll line — runs through the center */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              bottom: 0,
              width: 120,
              transform: "translateX(-50%)",
              zIndex: 0,
              overflow: "hidden"
            }}
          >
            <div
              ref={lineRef}
              style={{
                width: "100%",
                height: "100%",
                opacity: 0.8
              }}
            />
          </div>

          {/* ── ROW 1: ABOUT (left-aligned) ──────────── */}
          <div
            id="about"
            style={{
              display: "flex",
              justifyContent: "flex-start",
              marginBottom: 80,
              position: "relative",
              zIndex: 10,
            }}
          >
            <div
              className="about-card"
              style={{
                width: 400,
                padding: 32,
                borderRadius: 16,
                background: "var(--glass-light)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid var(--glass-border)",
                boxShadow: "var(--shadow-card)",
                transition: "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = "var(--border-accent)";
                e.currentTarget.style.boxShadow = "var(--shadow-card), var(--shadow-glow)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "var(--glass-border)";
                e.currentTarget.style.boxShadow = "var(--shadow-card)";
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 24,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: 14,
                  marginTop: 0,
                }}
              >
                About Us
              </h2>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 15,
                  lineHeight: 1.7,
                  marginBottom: 24,
                }}
              >
                A secure, intelligent digital health vault — your medical
                records, prescriptions, and reports, all in one place, protected
                and accessible.
              </p>
              <button className="btn-primary">Learn More →</button>
            </div>
          </div>

          {/* ── ROW 2: SERVICES (right-aligned) ──────── */}
          <div
            id="services"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              position: "relative",
              zIndex: 10,
            }}
          >
            <div
              className="services-card"
              style={{
                width: 400,
                padding: 32,
                borderRadius: 16,
                background: "var(--glass-light)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid var(--glass-border)",
                boxShadow: "var(--shadow-card)",
                transition: "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = "var(--border-accent)";
                e.currentTarget.style.boxShadow = "var(--shadow-card), var(--shadow-glow)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "var(--glass-border)";
                e.currentTarget.style.boxShadow = "var(--shadow-card)";
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 24,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: 14,
                  marginTop: 0,
                }}
              >
                Services
              </h2>
              <ul
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 15,
                  lineHeight: 2.4,
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 24px 0",
                }}
              >
                {[
                  { color: "var(--accent-primary)", label: "Secure Record Storage" },
                  { color: "var(--accent-secondary)", label: "Instant Access Anywhere" },
                  { color: "var(--accent-success)", label: "Trusted Doctor Sharing" },
                ].map((s) => (
                  <li
                    key={s.label}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span style={{ color: s.color, fontSize: 10 }}>●</span>
                    {s.label}
                  </li>
                ))}
              </ul>
              <button className="btn-primary">Explore →</button>
            </div>
          </div>
        </section>

        {/* ── DIVIDER (clear separation) ──────────────── */}
        <div
          style={{
            height: 1,
            background:
              "linear-gradient(90deg, transparent, var(--border-accent), transparent)",
            margin: "0 48px",
          }}
        />

        {/* ── FOOTER ──────────────────────────────────── */}
        <footer
          style={{
            padding: "80px 48px 40px",
            background: "rgba(239, 250, 253, 0.85)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            borderTop: "1px solid var(--border-subtle)",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
              gap: 60,
            }}
          >
            <div>
              <h2 style={{ 
                fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, 
                color: "var(--eggplant)", marginBottom: 20 
              }}>
                MediLocker
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.6, maxWidth: 300 }}>
                Revolutionizing healthcare with secure, decentralized medical data sovereignty. Your health vault, anywhere in the world.
              </p>
            </div>
            {[
              { title: "Platform", items: [
                { label: "Home", path: "/" },
                { label: "Learn More", path: "/learn-more" },
                { label: "Global Presence", path: "#" }
              ]},
              { title: "Legal", items: [
                { label: "Privacy Policy", path: "#" },
                { label: "Data Security", path: "#" },
                { label: "Terms of Service", path: "#" }
              ]},
              { title: "Contact", items: [
                { label: "Support", path: "#" },
                { label: "Partnership", path: "#" },
                { label: "Emergency", path: "#" }
              ]}
            ].map((col) => (
              <div key={col.title}>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 20,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {col.title}
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {col.items.map((item) => (
                    <li
                      key={item.label}
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: 14,
                        marginBottom: 12,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.path.startsWith("/")) {
                          navigate(item.path);
                          window.scrollTo(0, 0);
                        }
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = "var(--accent)";
                        e.target.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = "var(--text-secondary)";
                        e.target.style.transform = "translateX(0)";
                      }}
                    >
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            style={{
              height: 1,
              background: "linear-gradient(90deg, transparent, var(--border-default), transparent)",
              margin: "60px 0 30px",
            }}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: 13, fontFamily: "var(--font-mono)" }}>
              © 2026 MediLocker — Empowering Patient Sovereignty
            </p>
            <div style={{ display: "flex", gap: 20 }}>
              {/* Optional Social Icons */}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}