import React, { useEffect, useState } from 'react';
import { Trophy, ChevronRight, Target, Zap } from "lucide-react";

function AnimatedNumber({ target, duration = 1200, prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const steps = 40;
    const increment = target / steps;
    const interval = duration / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setDisplay(target); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, interval);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <>{prefix}{display.toLocaleString("es-CL")}{suffix}</>;
}

export default function Results({ balance, completedIds, accuracy, fmt, goHome, S }) {
  return (
    <div className="fade" style={{ textAlign: "center", paddingTop: 16, maxWidth: 420, margin: "0 auto" }}>
      <div style={{ 
        width: 88, height: 88, 
        background: "linear-gradient(135deg, #fffbf0, #fff8e1)", 
        border: "2px solid #C8A84B", borderRadius: 24, 
        display: "flex", alignItems: "center", justifyContent: "center", 
        margin: "0 auto 20px",
        boxShadow: "0 8px 24px rgba(200,168,75,0.2)"
      }}>
        <Trophy style={{ width: 44, height: 44, color: "#C8A84B" }} />
      </div>

      <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 28, color: "var(--text-title)", lineHeight: 1.2, marginBottom: 8 }}>
        ¡Entrenamiento<br/>Completo!
      </h2>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "var(--text-sec)", marginBottom: 28 }}>
        Has respondido todas las preguntas disponibles.
      </p>

      {/* SALDO ANIMADO */}
      <div style={{ 
        background: "linear-gradient(135deg, #1a1a2e 0%, #2d2d4e 100%)",
        borderRadius: 20, padding: "24px 20px", marginBottom: 16,
        boxShadow: "0 8px 24px rgba(26,26,46,0.2)"
      }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "rgba(200,168,75,0.6)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>
          Dinero Acumulado
        </p>
        <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 40, color: "#C8A84B", margin: 0, lineHeight: 1 }}>
          <AnimatedNumber target={balance} duration={1400} prefix="$" />
        </p>
      </div>

      {/* DOS TARJETAS SEPARADAS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-passage)", borderRadius: 16, padding: "20px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f0faf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
            <Target size={18} color="#22c55e" />
          </div>
          <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 28, color: "var(--text-main)", margin: 0, lineHeight: 1 }}>
            <AnimatedNumber target={completedIds.length} duration={1000} />
          </p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "var(--text-sec)", marginTop: 6, marginBottom: 0 }}>Correctas</p>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-passage)", borderRadius: 16, padding: "20px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fffbf0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
            <Zap size={18} color="#C8A84B" />
          </div>
          <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 28, color: "var(--text-main)", margin: 0, lineHeight: 1 }}>
            <AnimatedNumber target={accuracy} duration={1000} suffix="%" />
          </p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "var(--text-sec)", marginTop: 6, marginBottom: 0 }}>Precisión</p>
        </div>
      </div>

      <button onClick={goHome} style={{ ...S.btnPrimary, maxWidth: "100%" }}>
        Volver al Inicio <ChevronRight style={{ width: 18, height: 18 }} />
      </button>
    </div>
  );
}
