import React from 'react';
import { Layers, Trophy, Zap, ChevronRight, History, Settings as SettingsIcon, Brain } from "lucide-react";

export default function Home({ 
  attemptedIds, 
  allQs, 
  completedIds, 
  accuracy, 
  available, 
  setIsReview, 
  setQIdx, 
  setView, 
  S 
}) {
  return (
    <div className="fade" style={{ 
      maxWidth: "420px", 
      margin: "0 auto", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      textAlign: "center" 
    }}>
      
      {/* SECCIÓN ENCABEZADO */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 20, 
        textAlign: "left", 
        width: "100%", 
        marginBottom: 32 
      }}>
        <div style={{ 
          ...S.lockBox, 
          width: 70, 
          height: 70, 
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Brain size={32} color="var(--accent)" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h1 style={{ 
            ...S.bigTitle, 
            fontSize: 28, 
            margin: 0, 
            lineHeight: 1.1, 
            padding: 0,
            color: "var(--accent)" // Título siempre dorado/brillante
          }}>
            Entrenamiento
          </h1>
          <p style={{ 
            ...S.subtitle, 
            margin: 0, 
            padding: 0,
            marginTop: 2,
            color: "var(--text-sec)" // Gris adaptable
          }}>
            Gestiona tu progreso y desafíos PAES
          </p>
        </div>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div style={{ ...S.statsRow, width: "100%", gap: 10, marginBottom: 20 }}>
        {[
          { icon: <Layers size={15} color="var(--text-sec)" />, val: `${attemptedIds.length}`, sub: `/${allQs.length}`, label: "Hechas" },
          { icon: <Trophy size={15} color="var(--accent)" />, val: `${completedIds.length}`, label: "Correctas" },
          { icon: <Zap size={15} color="#2d6a4f" />, val: `${accuracy}%`, label: "Logro" },
        ].map((s, i) => (
          <div key={i} className="home-card" style={{ ...S.statCard, flex: 1, background: "var(--bg-card)", border: "1px solid var(--border-passage)" }}>
            <div style={{ marginBottom: 6 }}>{s.icon}</div>
            <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, fontSize: 20, color: "var(--text-main)", lineHeight: 1, marginBottom: 4 }}>
              {s.val}<span style={{ fontSize: 10, color: "var(--text-sec)", fontWeight: 400 }}>{s.sub || ""}</span>
            </p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, color: "var(--text-sec)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* BARRA DE PROGRESO */}
      <div style={{ width: "100%", marginBottom: 32 }}>
        <div style={{ ...S.progWrap, background: "var(--prog-bg)" }}>
          <div className="progress-fill-bar" style={{ width: `${allQs.length > 0 ? (attemptedIds.length / allQs.length) * 100 : 0}%`, height: '100%' }} />
        </div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "var(--text-sec)", textAlign: "right", marginTop: 8 }}>
          {allQs.length - attemptedIds.length} pendientes
        </p>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          <button 
            className="home-card"
            disabled={available.length === 0} 
            onClick={() => { setIsReview(false); setQIdx(0); setView("test"); }} 
            style={{ 
              ...(available.length === 0 ? S.btnDisabled : S.btnPrimary), 
              flex: 1, height: 65, fontSize: 14, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"
            }}
          >
            <span style={{ fontWeight: 700 }}>Iniciar</span>
            <span style={{ fontSize: 10, opacity: 0.9 }}>Entrenamiento</span>
          </button>

          <button 
            className="home-card"
            onClick={() => { setIsReview(true); setQIdx(0); setView("test"); }} 
            style={{ 
              ...S.btnSecondary, 
              background: "var(--bg-card)", border: "1px solid var(--border-passage)",
              flex: 1, height: 65, fontSize: 14, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <History style={{ width: 14, height: 14, color: "var(--accent)" }} />
              <span style={{ fontWeight: 700, color: "var(--text-main)" }}>Repasar</span>
            </div>
            <span style={{ fontSize: 10, color: "var(--text-sec)" }}>Todo</span>
          </button>
        </div>

        {/* BOTÓN CONFIGURACIÓN PARENTAL (CON REGLAS ESPECÍFICAS) */}
        <button 
          className="home-card"
          onClick={() => setView("settings")} 
          style={{ 
            ...S.btnGhost, 
            width: "100%", height: 48, 
            background: "var(--bg-card)",
            border: "1px solid var(--border-ghost)", // Variable que definimos: Oscura en light, sutil en dark
            marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 10
          }}
        >
          <SettingsIcon style={{ width: 15, height: 15, color: "var(--text-ghost)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-ghost)" }}>
            Configuración Parental
          </span>
          <ChevronRight style={{ width: 16, height: 16, marginLeft: "auto", opacity: 0.3, color: "var(--text-ghost)" }} />
        </button>
      </div>

      <div style={{ marginTop: 40, opacity: 0.3, fontSize: 9, letterSpacing: "0.2em", color: "var(--text-sec)" }}>
        PAES STUDY SYSTEM
      </div>
    </div>
  );
}