import React from 'react';
import { Sun, Moon } from "lucide-react";

export default function Header({ 
  appIcon, 
  attemptedIds, 
  allQs, 
  S, 
  theme, 
  toggleTheme
}) {
  const totalQuestions = allQs?.length || 0;
  const realAttemptedCount = (attemptedIds || []).filter(id => 
    allQs.some(q => q.id === id)
  ).length;
  const progress = totalQuestions > 0 ? (realAttemptedCount / totalQuestions) * 100 : 0;
  const isComplete = progress === 100 && totalQuestions > 0;

  return (
    <div style={{
      ...S.header,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "var(--bg-card)",
      transition: "background-color 0.3s ease"
    }}>
      
      {/* IZQUIERDA: Identidad */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={S.headerIcon}>
          {appIcon ? (
            <img src={appIcon} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} alt="App Icon" />
          ) : (
            <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 16, color: "#C8A84B" }}>P</span>
          )}
        </div>
        <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 13, color: "var(--text-main)", margin: 0 }}>
          PAES Premium
        </p>
      </div>

      {/* CENTRO: Progreso */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <p style={{ 
          fontFamily: "'IBM Plex Mono',monospace", fontSize: "13px", 
          color: isComplete ? "#22c55e" : "var(--accent)", margin: 0, fontWeight: 800 
        }}>
          {realAttemptedCount} / {totalQuestions}
        </p>
        <div style={{ width: 100, height: 4, background: "var(--border-passage)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ 
            width: `${progress}%`, height: "100%", borderRadius: 10,
            background: isComplete ? "#22c55e" : "linear-gradient(90deg, #C8A84B, #d4af37)", 
            transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" 
          }} />
        </div>
      </div>

      {/* DERECHA: Tema */}
      <button onClick={toggleTheme} style={{
        background: "var(--bg-app)", border: "1px solid var(--border-passage)",
        borderRadius: "8px", width: "36px", height: "36px",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: "var(--accent)"
      }}>
        {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
      </button>
    </div>
  );
}
