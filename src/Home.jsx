import React from 'react';
import { Layers, Trophy, Zap, ChevronRight, History, Settings as SettingsIcon } from "lucide-react";

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
    <div className="fade">
      {/* Tarjetas de Estadísticas */}
      <div style={S.statsRow}>
        {[
          { icon: <Layers style={{ width: 15, height: 15, color: "#9a8f7e", marginBottom: 6 }} />, val: `${attemptedIds.length}`, sub: `/${allQs.length}`, label: "Respondidas", col: "#1a1a2e" },
          { icon: <Trophy style={{ width: 15, height: 15, color: "#C8A84B", marginBottom: 6 }} />, val: `${completedIds.length}`, label: "Correctas", col: "#92601a" },
          { icon: <Zap style={{ width: 15, height: 15, color: "#2d6a4f", marginBottom: 6 }} />, val: `${accuracy}%`, label: "Precisión", col: "#2d6a4f" },
        ].map((s, i) => (
          <div key={i} style={S.statCard}>
            {s.icon}
            <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, fontSize: 22, color: s.col, lineHeight: 1, marginBottom: 4 }}>
              {s.val}<span style={{ fontSize: 11, color: "#bbb5a8", fontWeight: 400 }}>{s.sub || ""}</span>
            </p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#9a8f7e", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Barra de Progreso Grande */}
      <div style={S.progWrap}>
        <div style={{ ...S.progBar, width: `${allQs.length > 0 ? (attemptedIds.length / allQs.length) * 100 : 0}%` }} />
      </div>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#9a8f7e", textAlign: "right", marginBottom: 28 }}>
        {allQs.length - attemptedIds.length} pendientes
      </p>

      {/* Botones de Acción */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button 
          disabled={available.length === 0} 
          onClick={() => { setIsReview(false); setQIdx(0); setView("test"); }} 
          style={available.length === 0 ? S.btnDisabled : S.btnPrimary}
        >
          Iniciar Entrenamiento <ChevronRight style={{ width: 18, height: 18 }} />
        </button>

        <button 
          onClick={() => { setIsReview(true); setQIdx(0); setView("test"); }} 
          style={S.btnSecondary}
        >
          <History style={{ width: 15, height: 15 }} /> Repasar Todo
        </button>

        <button 
          onClick={() => setView("settings")} 
          style={S.btnGhost}
        >
          <SettingsIcon style={{ width: 13, height: 13 }} /> Configuración Parental
        </button>
      </div>
    </div>
  );
}