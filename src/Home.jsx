import React from 'react';
import { Trophy, Zap, ChevronRight, History, Settings as SettingsIcon, Brain } from "lucide-react";

export default function Home({ 
  attemptedIds, 
  allQs, 
  completedIds, 
  accuracy, 
  available, 
  reviewQs,
  setIsReview, 
  setQIdx, 
  setView, 
  balance,
  fmt,
  S 
}) {
  return (
    <div className="fade" style={{ 
      maxWidth: "420px", margin: "0 auto",
      display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" 
    }}>
      
      {/* ENCABEZADO */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, textAlign: "left", width: "100%", marginBottom: 24 }}>
        <div style={{ ...S.lockBox, width: 64, height: 64, flexShrink: 0, margin: 0 }}>
          <Brain size={28} color="var(--accent)" />
        </div>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 26, margin: 0, lineHeight: 1.1, color: "var(--accent)" }}>
            Entrenamiento
          </h1>
          <p style={{ margin: 0, marginTop: 4, fontSize: 12, color: "var(--text-sec)", fontFamily: "'DM Sans',sans-serif" }}>
            Gestiona tu progreso y desafíos PAES
          </p>
        </div>
      </div>

      {/* SALDO DESTACADO */}
      <div style={{
        width: "100%", marginBottom: 16,
        background: "linear-gradient(135deg, #1a1a2e 0%, #2d2d4e 100%)",
        borderRadius: 20, padding: "20px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        boxShadow: "0 8px 24px rgba(26,26,46,0.2)"
      }}>
        <div style={{ textAlign: "left" }}>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "rgba(200,168,75,0.7)", textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 6px 0" }}>
            Saldo Acumulado
          </p>
          <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 32, color: "#C8A84B", margin: 0, lineHeight: 1 }}>
            {fmt(balance)}
          </p>
        </div>
        <div style={{ width: 52, height: 52, background: "rgba(200,168,75,0.15)", border: "1px solid rgba(200,168,75,0.3)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Trophy size={24} color="#C8A84B" />
        </div>
      </div>

      {/* 2 ESTADÍSTICAS GRANDES */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%", marginBottom: 20 }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-passage)", borderRadius: 16, padding: "18px 16px", textAlign: "left", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f0faf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Trophy size={14} color="#22c55e" />
            </div>
            <span style={{ fontSize: 11, color: "var(--text-sec)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Correctas</span>
          </div>
          <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 34, color: "var(--text-main)", margin: 0, lineHeight: 1 }}>
            {completedIds.length}
          </p>
          <p style={{ fontSize: 11, color: "var(--text-sec)", margin: "4px 0 0 0" }}>de {allQs.length} preguntas</p>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-passage)", borderRadius: 16, padding: "18px 16px", textAlign: "left", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#fffbf0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={14} color="#C8A84B" />
            </div>
            <span style={{ fontSize: 11, color: "var(--text-sec)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Precisión</span>
          </div>
          <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 34, color: "var(--text-main)", margin: 0, lineHeight: 1 }}>
            {accuracy}%
          </p>
          <p style={{ fontSize: 11, color: "var(--text-sec)", margin: "4px 0 0 0" }}>{attemptedIds.length} intentadas</p>
        </div>
      </div>

      {/* BARRA DE PROGRESO */}
      <div style={{ width: "100%", marginBottom: 28 }}>
        <div style={{ height: 6, background: "var(--border-passage)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ 
            width: `${allQs.length > 0 ? (attemptedIds.length / allQs.length) * 100 : 0}%`, 
            height: "100%",
            background: "linear-gradient(90deg, #C8A84B, #2d6a4f)",
            borderRadius: 4,
            transition: "width 0.6s ease"
          }} />
        </div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "var(--text-sec)", textAlign: "right", marginTop: 6 }}>
          {allQs.length - attemptedIds.length} pendientes
        </p>
      </div>

      {/* BOTONES */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          <button 
            disabled={available.length === 0} 
            onClick={() => { setIsReview(false); setQIdx(0); setView("test"); }} 
            style={{ 
              ...(available.length === 0 ? S.btnDisabled : S.btnPrimary), 
              flex: 1, height: 68, fontSize: 14, maxWidth: "none",
              display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 2
            }}
          >
            <span style={{ fontWeight: 800, fontSize: 15 }}>Iniciar</span>
            <span style={{ fontSize: 10, opacity: 0.75 }}>{available.length} disponibles</span>
          </button>

          <button 
            onClick={() => { setIsReview(true); setQIdx(0); setView("test"); }} 
            style={{ 
              ...S.btnSecondary, 
              background: "var(--bg-card)", border: "1px solid var(--border-passage)",
              flex: 1, height: 68, fontSize: 14,
              display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 2
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <History size={14} color="var(--accent)" />
              <span style={{ fontWeight: 700, color: "var(--text-main)", fontSize: 15 }}>Repasar</span>
            </div>
            <span style={{ fontSize: 10, color: "var(--text-sec)" }}>{(reviewQs || attemptedIds).length} preguntas</span>
          </button>
        </div>

        <button 
          onClick={() => setView("settings")} 
          style={{ 
            ...S.btnGhost, width: "100%", height: 48,
            background: "var(--bg-card)", border: "1px solid var(--border-ghost)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10
          }}
        >
          <SettingsIcon size={15} color="var(--text-ghost)" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-ghost)" }}>Configuración Parental</span>
          <ChevronRight size={16} style={{ marginLeft: "auto", opacity: 0.3, color: "var(--text-ghost)" }} />
        </button>
      </div>

      <div style={{ marginTop: 36, opacity: 0.25, fontSize: 9, letterSpacing: "0.2em", color: "var(--text-sec)" }}>
        PAES STUDY SYSTEM
      </div>
    </div>
  );
}
