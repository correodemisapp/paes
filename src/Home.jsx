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
      
      {/* Icono Principal Estilo Login */}
      <div style={{ ...S.lockBox, width: 70, height: 70, marginBottom: 20 }}>
        <Brain size={32} color="#C8A84B" />
      </div>

      <h1 style={{ ...S.bigTitle, fontSize: 28, marginBottom: 8 }}>Entrenamiento</h1>
      <p style={{ ...S.subtitle, marginBottom: 32 }}>Gestiona tu progreso y desafíos PAES</p>

      {/* Tarjetas de Estadísticas - Ahora con clase home-card */}
      <div style={{ ...S.statsRow, width: "100%", gap: 10, marginBottom: 20 }}>
        {[
          { icon: <Layers size={15} color="#9a8f7e" />, val: `${attemptedIds.length}`, sub: `/${allQs.length}`, label: "Hechas", col: "#1a1a2e" },
          { icon: <Trophy size={15} color="#C8A84B" />, val: `${completedIds.length}`, label: "Correctas", col: "#92601a" },
          { icon: <Zap size={15} color="#2d6a4f" />, val: `${accuracy}%`, label: "Logro", col: "#2d6a4f" },
        ].map((s, i) => (
          <div key={i} className="home-card" style={{ ...S.statCard, flex: 1 }}>
            <div style={{ marginBottom: 6 }}>{s.icon}</div>
            <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, fontSize: 20, color: s.col, lineHeight: 1, marginBottom: 4 }}>
              {s.val}<span style={{ fontSize: 10, color: "#bbb5a8", fontWeight: 400 }}>{s.sub || ""}</span>
            </p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, color: "#9a8f7e", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Barra de Progreso y Pendientes */}
      <div style={{ width: "100%", marginBottom: 32 }}>
        <div style={S.progWrap}>
          <div style={{ ...S.progBar, width: `${allQs.length > 0 ? (attemptedIds.length / allQs.length) * 100 : 0}%`, transition: 'width 0.8s ease' }} />
        </div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#9a8f7e", textAlign: "right", marginTop: 8 }}>
          {allQs.length - attemptedIds.length} pendientes
        </p>
      </div>

      {/* Botones de Acción - Estilo Login y Centrados */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
        <button 
          className="home-card"
          disabled={available.length === 0} 
          onClick={() => { setIsReview(false); setQIdx(0); setView("test"); }} 
          style={{ 
            ...(available.length === 0 ? S.btnDisabled : S.btnPrimary), 
            maxWidth: "none", 
            height: 58,
            fontSize: 16 
          }}
        >
          Iniciar Entrenamiento <ChevronRight style={{ width: 18, height: 18, marginLeft: "auto" }} />
        </button>

        <button 
          className="home-card"
          onClick={() => { setIsReview(true); setQIdx(0); setView("test"); }} 
          style={{ ...S.btnSecondary, maxWidth: "none", height: 50 }}
        >
          <History style={{ width: 15, height: 15 }} /> Repasar Todo
          <ChevronRight style={{ width: 16, height: 16, marginLeft: "auto", opacity: 0.5 }} />
        </button>

        <button 
          className="home-card"
          onClick={() => setView("settings")} 
          style={{ ...S.btnGhost, maxWidth: "none", height: 45, border: "1px solid #E8E5DC", marginTop: 8 }}
        >
          <SettingsIcon style={{ width: 13, height: 13 }} /> Configuración Parental
        </button>
      </div>

      <div style={{ marginTop: 40, opacity: 0.3, fontSize: 9, letterSpacing: "0.2em" }}>
        PAES STUDY SYSTEM
      </div>
    </div>
  );
}