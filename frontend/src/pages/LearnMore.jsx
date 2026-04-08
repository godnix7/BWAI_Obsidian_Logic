import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import Lenis from "@studio-freight/lenis";
import * as THREE from "three";
const { 
  Scene, PerspectiveCamera, WebGLRenderer, IcosahedronGeometry, MeshStandardMaterial, 
  Mesh, AmbientLight, PointLight 
} = THREE;

export default function LearnMore() {
  const navigate = useNavigate();
  const threeRef = useRef(null);

  useEffect(() => {
    /* ── SMOOTH SCROLL ── */
    const lenis = new Lenis({ duration: 1.2 });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);

    /* ── THREE.JS BACKGROUND (Abstract Nodes) ── */
    const scene = new Scene();
    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (threeRef.current) threeRef.current.appendChild(renderer.domElement);

    const geometry = new IcosahedronGeometry(2, 1);
    const material = new MeshStandardMaterial({ 
      color: 0x4A8BDF, wireframe: true, transparent: true, opacity: 0.2 
    });
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    scene.add(new AmbientLight(0xffffff, 0.5));
    const light = new PointLight(0x4A8BDF, 2);
    light.position.set(5, 5, 5);
    scene.add(light);

    camera.position.z = 5;

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      mesh.rotation.y += 0.002;
      mesh.rotation.x += 0.001;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      lenis.destroy();
      cancelAnimationFrame(animId);
      renderer?.dispose();
      geometry?.dispose();
      material?.dispose();
    };
  }, []);

  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh", position: "relative" }}>
      <div ref={threeRef} style={{ position: "fixed", inset: 0, opacity: 0.4, zIndex: 0 }} />
      
      <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", padding: "120px 32px" }}>
        <button 
          onClick={() => navigate("/")}
          style={{ 
            background: "none", border: "none", color: "var(--accent)", 
            cursor: "pointer", fontWeight: 600, marginBottom: 40, display: "flex", alignItems: "center", gap: 8 
          }}
        >
          ← Back to Vault
        </button>

        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 56, fontWeight: 700, color: "var(--text-primary)", marginBottom: 24 }}>
          Security by Design.
        </h1>
        
        <p style={{ fontSize: 20, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 60 }}>
          MediLocker isn't just a database. It's a triple-encrypted healthcare fortress designed to give patients absolute sovereignty over their medical history.
        </p>

        <div style={{ display: "grid", gap: 40 }}>
          {[
            { 
              title: "End-to-End Encryption", 
              desc: "Every document uploaded to MediLocker is encrypted locally before it ever touches our servers. Your data remains your data." 
            },
            { 
              title: "Role-Based Access Control", 
              desc: "Patients grant granular, time-limited permissions to Doctors and Hospitals. Access can be revoked instantly at any time." 
            },
            { 
              title: "Global Interoperability", 
              desc: "Access your prescriptions and scan reports from any clinic in the world, securely and with zero friction." 
            }
          ].map((item, i) => (
            <div key={i} className="glass-card" style={{ padding: 40, borderRadius: 24, border: "1px solid var(--border-default)" }}>
              <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>{item.title}</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 80, textAlign: "center" }}>
          <button className="btn-primary" onClick={() => navigate("/register")} style={{ padding: "16px 40px", fontSize: 18 }}>
            Start Your Secure Vault
          </button>
        </div>
      </div>
    </div>
  );
}
