import React from 'react';
import { Trophy, ChevronRight } from "lucide-react";

export default function Results({ balance, completedIds, accuracy, fmt, goHome, S }) {
  return (
    <div className="fade" style={{ textAlign: "center", paddingTop: 16 }}>
      <div style={{ width: 88, height: 88, background: "#fffbf0", border: "2px solid #C8A84B", borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <Trophy style={{ width: 44, height: 44, color: "#C8A84B" }} />
      </div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 28, color: "#1a1a2e", lineHeight: 1.2, marginBottom: 8 }}>
        ¡Entrenamiento<br/>Completo!
      </h2>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#9a8f7e", marginBottom: 24 }}>
        Has respondido todas las preguntas disponibles.
      </p>
      <div style={{ background: "#fff", border: "1px solid #E8E5DC", borderRadius: 18, padding: "24px 20px", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#9a8f7e", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>Dinero Acumulado</p>
        <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, fontSize: 40, color: "#C8A84B" }}>{fmt(balance)}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 16 }}>
          <div>
            <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, fontSize: 20, color: "#1a1a2e" }}>{completedIds.length}</p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#9a8f7e" }}>Correctas</p>
          </div>
          <div style={{ width: 1, background: "#E8E5DC" }} />
          <div>
            <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, fontSize: 20, color: "#2d6a4f" }}>{accuracy}%</p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#9a8f7e" }}>Precisión</p>
          </div>
        </div>
      </div>
      <button onClick={goHome} style={S.btnPrimary}>
        Volver al Inicio <ChevronRight style={{ width: 18, height: 18 }} />
      </button>
    </div>
  );
}