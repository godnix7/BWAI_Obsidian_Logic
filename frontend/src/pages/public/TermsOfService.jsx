import React from "react";
import { MoveLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TermsOfService() {
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
          Terms of Service
        </h1>
        
        <h2 style={{ fontSize: 24, marginTop: 40, marginBottom: 16 }}>1. User Responsibilities</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: 16, lineHeight: 1.7 }}>
          By establishing a MediLocker vault, you consent to upload only accurate and authentic medical records. 
          Patients are responsible for managing access links and revoking consent when it is no longer required.
        </p>

        <h2 style={{ fontSize: 24, marginTop: 40, marginBottom: 16 }}>2. Medical Disclaimer</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: 16, lineHeight: 1.7 }}>
          MediLocker operates as a digital vault and data exchange network. We do not provide medical diagnoses, 
          treatment advice, or emergency medical services. Always consult certified healthcare professionals for health concerns.
        </p>

        <h2 style={{ fontSize: 24, marginTop: 40, marginBottom: 16 }}>3. Account Termination</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: 16, lineHeight: 1.7 }}>
          You may permanently delete your vault and all associated records at any time. Upon termination, 
          data is hard-wiped from our decentralized storage clusters in accordance with data "right to be forgotten" laws.
        </p>
      </div>
    </div>
  );
}
