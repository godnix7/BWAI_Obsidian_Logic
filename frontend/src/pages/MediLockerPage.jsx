import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import * as THREE from "three";
import { heroReveal, float, scrollReveal } from "../utils/animations";

gsap.registerPlugin(ScrollTrigger);

export default function MediLockerPage() {
  const lineRef = useRef(null);
  const spiralRef = useRef(null);
  const threeRef = useRef(null);
  const cursorRef = useRef(null);
  const heroImgRef = useRef(null);

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

    /* ── CURSOR GLOW ───────────────────────────────────── */
    const handleMouseMove = (e) => {
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          x: e.clientX - 100,
          y: e.clientY - 100,
          duration: 0.3,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    /* ── HERO REVEAL ───────────────────────────────────── */
    heroReveal();

    /* ── FLOAT hero image ──────────────────────────────── */
    if (heroImgRef.current) {
      float(heroImgRef.current);
    }

    /* ── SCROLL LINE ───────────────────────────────────── */
    if (lineRef.current) {
      gsap.fromTo(
        lineRef.current,
        { height: 0 },
        {
          height: "100%",
          scrollTrigger: {
            trigger: "#cards-section",
            start: "top 60%",
            end: "bottom 80%",
            scrub: true,
          },
        }
      );
    }

    /* ── HOW IT WORKS REVEAL ────────────────────────── */
    scrollReveal(".how-it-works-title", {
      from: { y: 50 },
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: "#how-it-works", start: "top 80%" }
    });

    gsap.fromTo(
      ".step-card",
      { y: 150, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".step-card",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      }
    );

    /* ── SPIRAL ANIMATION ──────────────────────────────── */
    if (spiralRef.current) {
      gsap.to(spiralRef.current, {
        backgroundPosition: "0px 1200px",
        duration: 6,
        repeat: -1,
        ease: "linear",
      });
    }

    /* ── ABOUT CARD — scroll reveal (dramatic from top) ──────── */
    scrollReveal(".about-card", {
      from: { y: -300 },
      scrollTrigger: { trigger: ".about-card", start: "top 90%" }
    });

    /* ── SERVICES CARD — scroll reveal (dramatic from bottom) ─ */
    scrollReveal(".services-card", {
      from: { y: 300 },
      scrollTrigger: { trigger: ".services-card", start: "top 90%" }
    });

    /* ── THREE.JS BACKGROUND ───────────────────────────── */
    let animId;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    if (threeRef.current) {
      threeRef.current.appendChild(renderer.domElement);
    }

    // Hero sphere — Amber
    const geometry = new THREE.SphereGeometry(5, 64, 64);
    const material = new THREE.MeshStandardMaterial({
      color: 0xF59E0B,
      roughness: 0.25,
      metalness: 0.85,
      emissive: 0x4A3000,
      emissiveIntensity: 0.5,
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Secondary torus — Rose
    const torusGeo = new THREE.TorusGeometry(3, 0.6, 32, 100);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0xF43F5E,
      roughness: 0.15,
      metalness: 1.0,
      emissive: 0x3D0015,
      emissiveIntensity: 0.5,
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.position.set(6, -3, -4);
    scene.add(torus);

    // Amber point light
    const light1 = new THREE.PointLight("#F59E0B", 4, 50);
    light1.position.set(5, 8, 5);
    scene.add(light1);

    // Rose rim light
    const light2 = new THREE.PointLight("#F43F5E", 3, 40);
    light2.position.set(-8, -5, -5);
    scene.add(light2);

    // White front fill
    const light3 = new THREE.PointLight("#ffffff", 2, 30);
    light3.position.set(0, 0, 12);
    scene.add(light3);

    // Ambient
    const ambient = new THREE.AmbientLight("#ffffff", 0.4);
    scene.add(ambient);

    camera.position.z = 15;

    function animate() {
      animId = requestAnimationFrame(animate);
      sphere.rotation.y += 0.007;
      sphere.rotation.x += 0.003;
      torus.rotation.y += 0.005;
      torus.rotation.x += 0.002;
      torus.rotation.z += 0.001;
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
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      torusGeo.dispose();
      torusMat.dispose();
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
          background: "var(--accent-primary-glow)",
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
            background: "var(--accent-primary-soft)",
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
            background: "var(--accent-secondary-soft)",
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
          opacity: 0.35,
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
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            background: "var(--bg-elevated)",
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
              padding: "14px 32px",
            }}
          >
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: "0.04em",
                background: "var(--gradient-accent)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                margin: 0,
              }}
            >
              MEDILOCKER
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
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
                    (e.target.style.color = "var(--accent-primary)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.color = "var(--text-secondary)")
                  }
                >
                  {item.label}
                </a>
              ))}
              <button className="btn-secondary">Login</button>
              <button className="btn-primary">Register</button>
            </div>
          </div>
        </nav>

        {/* ── HERO ───────────────────────────────────── */}
        <section
          id="home"
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "140px 48px 120px",
            maxWidth: 1280,
            margin: "0 auto",
            gap: 48,
          }}
        >
          <div style={{ flex: 1 }}>
            <div className="hero-title-wrap">
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 72,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.05,
                  margin: 0,
                  background: "var(--gradient-accent)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                MEDILOCKER
              </h2>
            </div>

            <p
              className="hero-para"
              style={{
                color: "var(--text-secondary)",
                fontSize: 17,
                lineHeight: 1.75,
                marginTop: 20,
                maxWidth: 520,
              }}
            >
              A secure, intelligent digital health vault — empowering patients,
              doctors, and hospitals to manage medical data with clarity, trust,
              and elegance.
            </p>

            <div
              className="hero-cta"
              style={{ display: "flex", gap: 16, marginTop: 36 }}
            >
              <button className="btn-primary" style={{ fontSize: 15 }}>
                Get Started →
              </button>
              <button className="btn-secondary" style={{ fontSize: 15 }}>
                Learn More
              </button>
            </div>
          </div>

          {/* Hero visual card */}
          <div
            ref={heroImgRef}
            className="hero-img"
            style={{
              width: 380,
              height: 380,
              borderRadius: 24,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--glass-light)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid var(--glass-border-accent)",
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
                background: "var(--gradient-glow)",
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
              <rect x="35" y="10" width="30" height="80" rx="4" fill="var(--accent-primary)" />
              <rect x="10" y="35" width="80" height="30" rx="4" fill="var(--accent-primary)" />
            </svg>

            {/* Lock + Shield icon — centered, semi-transparent */}
            <svg
              viewBox="0 0 80 100"
              style={{
                width: 90,
                height: 110,
                position: "relative",
                zIndex: 2,
                filter: "drop-shadow(0 0 20px var(--accent-primary-glow))",
              }}
            >
              {/* Shield shape */}
              <path
                d="M40 5 L72 20 L72 50 C72 72 58 88 40 95 C22 88 8 72 8 50 L8 20 Z"
                fill="none"
                stroke="var(--border-accent)"
                strokeWidth="2"
              />
              <path
                d="M40 10 L68 23 L68 50 C68 69 55 84 40 90 C25 84 12 69 12 50 L12 23 Z"
                fill="var(--accent-primary-soft)"
              />

              {/* Lock body */}
              <rect
                x="24"
                y="45"
                width="32"
                height="26"
                rx="4"
                fill="var(--accent-primary-glow)"
                stroke="var(--border-accent)"
                strokeWidth="1.5"
              />

              {/* Lock shackle */}
              <path
                d="M30 45 L30 36 C30 28 35 24 40 24 C45 24 50 28 50 36 L50 45"
                fill="none"
                stroke="var(--border-accent)"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Keyhole */}
              <circle cx="40" cy="55" r="3.5" fill="var(--accent-primary)" />
              <rect
                x="38.5"
                y="55"
                width="3"
                height="7"
                rx="1.5"
                fill="var(--accent-primary)"
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
              <rect x="15" y="4" width="10" height="32" rx="3" fill="var(--accent-primary)" />
              <rect x="4" y="15" width="32" height="10" rx="3" fill="var(--accent-primary)" />
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
              <rect x="15" y="4" width="10" height="32" rx="3" fill="var(--accent-secondary)" />
              <rect x="4" y="15" width="32" height="10" rx="3" fill="var(--accent-secondary)" />
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
                stroke="var(--accent-primary)"
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
              gridTemplateColumns: "repeat(3, 1fr)",
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
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-primary)", letterSpacing: "0.1em", marginBottom: 20 }}>
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
          id="cards-section"
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
              transform: "translateX(-50%)",
              zIndex: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              ref={lineRef}
              style={{
                width: 4,
                borderRadius: 4,
                background: "var(--gradient-line)",
                boxShadow:
                  "0 0 20px var(--accent-primary-glow), 0 0 60px var(--accent-primary-soft)",
                height: 0, /* animated by GSAP */
              }}
            />
            <div
              ref={spiralRef}
              style={{
                position: "absolute",
                top: 0,
                width: 20,
                height: "100%",
                opacity: 0.6,
                backgroundImage:
                  "repeating-linear-gradient(120deg, var(--accent-primary) 0px, var(--accent-primary) 2px, transparent 2px, transparent 10px)",
                backgroundSize: "20px 200px",
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
            padding: "48px 48px 32px",
            background: "var(--glass-light)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderTop: "none",
            marginTop: 0,
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 32,
            }}
          >
            {[
              { title: "Terms", items: ["Privacy Policy", "Usage Rules"] },
              { title: "Privacy", items: ["Data Protection", "Security Practices"] },
              { title: "Contact", items: ["hello@medilocker.com", "+1 (800) MEDI-LOK"] },
            ].map((col) => (
              <div key={col.title}>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: 14,
                    marginTop: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {col.title}
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {col.items.map((item) => (
                    <li
                      key={item}
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: 14,
                        marginBottom: 8,
                        cursor: "pointer",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.color = "var(--accent-primary)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.color = "var(--text-secondary)")
                      }
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Copyright bar — clearly separated */}
          <div
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, transparent, var(--border-default), transparent)",
              margin: "40px 0 24px",
            }}
          />

          <p
            style={{
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: 13,
              fontFamily: "var(--font-mono)",
              margin: 0,
            }}
          >
            © 2026 MediLocker — All Rights Reserved
          </p>
        </footer>
      </div>
    </>
  );
}