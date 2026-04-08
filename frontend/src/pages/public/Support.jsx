import React from "react";
import { MoveLeft, HelpCircle, Mail, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Support() {
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

      <div className="glass-card" style={{ padding: "48px 40px", textAlign: "center" }}>
        <HelpCircle size={48} style={{ color: "var(--accent)", margin: "0 auto 24px" }} />
        <h1 style={{ fontSize: 36, marginBottom: 16, color: "var(--text-primary)" }}>
          How can we assist you?
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 40, fontSize: 16 }}>
          Whether you're a patient needing help accessing your records or a hospital administrator setting up an API bridge, our team is here to help.
        </p>

        <div style={{ display: "flex", justifyContent: "center", textAlign: "left" }}>
          <div style={{ width: "100%", maxWidth: 400, padding: 24, border: "1px solid var(--border-default)", borderRadius: 16, background: "var(--bg-surface)" }}>
            <Mail size={24} style={{ color: "var(--accent)", marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>Email Support</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 16 }}>
              Drop us an email. We typically respond within 12 hours.
            </p>
            <strong style={{ color: "var(--text-primary)" }}>support@medilocker.com</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
