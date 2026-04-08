import React from "react";
import { MoveLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", padding: "60px 24px", maxWidth: 800, margin: "0 auto" }}>
      <button 
        onClick={() => navigate("/")} 
        className="btn-secondary" 
        style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 40 }}
      >
        <MoveLeft size={18} /> Back to Home
      </button>

      <div className="glass-card" style={{ padding: "48px 40px" }}>
        <h1 style={{ fontSize: 36, marginBottom: 24, background: "var(--gradient-accent)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Privacy Policy
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: 15, lineHeight: 1.8 }}>
          Last updated: April 8, 2026
        </p>
        
        <h2 style={{ fontSize: 24, marginTop: 40, marginBottom: 16 }}>1. Data Collection</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: 16, lineHeight: 1.7 }}>
          MediLocker collects and securely encrypts your medical records, laboratory results, and personal identification
          for the sole purpose of providing decentralized healthcare access. Data is encrypted using AES-256 standards.
        </p>

        <h2 style={{ fontSize: 24, marginTop: 40, marginBottom: 16 }}>2. Data Sovereignty & Sharing</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: 16, lineHeight: 1.7 }}>
          You retain absolute ownership of your medical records. We share your data exclusively with healthcare
          professionals and medical institutions only when you explicitly grant a time-limited consent link.
        </p>

        <h2 style={{ fontSize: 24, marginTop: 40, marginBottom: 16 }}>3. Compliance</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: 16, lineHeight: 1.7 }}>
          MediLocker strictly complies with HIPAA, GDPR, and international medical data protection regulations. 
          Your data is localized according to the legal frameworks of your jurisdiction.
        </p>
      </div>
    </div>
  );
}
