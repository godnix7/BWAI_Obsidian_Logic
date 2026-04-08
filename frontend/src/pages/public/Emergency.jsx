import React from "react";
import { MoveLeft, AlertTriangle, Phone, FileDigit } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Emergency() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", padding: "60px 24px", maxWidth: 800, margin: "0 auto", position: "relative" }}>
      {/* Glaring red background accent */}
      <div style={{
        position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
        width: 400, height: 400, background: "var(--error)", filter: "blur(120px)", opacity: 0.1, zIndex: -1, borderRadius: "50%"
      }} />

      <button 
        onClick={() => navigate("/")} 
        className="btn-secondary" 
        style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 40 }}
      >
        <MoveLeft size={18} /> Back to Home
      </button>

      <div className="glass-card" style={{ padding: "48px 40px", border: "1px solid rgba(220, 38, 38, 0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ background: "rgba(220, 38, 38, 0.1)", padding: 16, borderRadius: "50%" }}>
            <AlertTriangle size={32} style={{ color: "var(--error)" }} />
          </div>
          <h1 style={{ fontSize: 36, color: "var(--error)", margin: 0 }}>
            Emergency Access
          </h1>
        </div>
        
        <p style={{ color: "var(--text-primary)", marginBottom: 40, fontSize: 16, lineHeight: 1.7 }}>
          If this is a life-threatening medical emergency, immediately contact your local emergency services (e.g., 911). 
          This portal is strictly for authorized first responders and medical staff to access critical patient records.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", padding: 24, borderRadius: 16, display: "flex", gap: 16, alignItems: "center" }}>
            <Phone size={32} style={{ color: "var(--accent)" }} />
            <div>
              <h3 style={{ fontSize: 18, marginBottom: 4 }}>First Responder Hotline</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Instant support for medical professionals requesting override.</p>
            </div>
            <button className="btn-secondary" style={{ marginLeft: "auto" }}>Call +1-800-MEDI-EMG</button>
          </div>
        </div>
      </div>
    </div>
  );
}
