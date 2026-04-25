import React from 'react';
import { Sun, Moon, Plus, Minus } from "lucide-react";

export default function Header({ 
  appIcon, 
  attemptedIds, 
  allQs, 
  balance, 
  fmt, 
  S, 
  theme, 
  toggleTheme, 
  setFontSize 
}) {
  
  // --- TU LÓGICA ROBUSTA ORIGINAL ---
  const totalQuestions = allQs?.length || 0;

  // Filtramos los IDs intentados para contar SOLO los que existen en la lista actual
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
      padding: "10px 20px",
      backgroundColor: "var(--bg-card)",
      borderBottom: "1px solid var(--border-passage)",
      transition: "background-color 0.3s ease"
    }}>
      
      {/* IZQUIERDA: Identidad */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
        <div style={S.headerIcon}>
          {appIcon ? (
            <img src={appIcon} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} alt="Icon" />
          ) : (
            <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 16, color: "#C8A84B" }}>P</span>
          )}
        </div>
        <p style={{ 
          fontFamily: "'Playfair Display',serif", 
          fontWeight: 700, 
          fontSize: 13, 
          color: "var(--text-main)", 
          margin: 0 
        }}>
          PAES Premium
        </p>
      </div>

      {/* CENTRO: Estadística Robusta y Barra Dinámica */}
      <div style={{ flex: 1.5, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <p style={{ 
          fontFamily: "'IBM Plex Mono',monospace", 
          fontSize: "14px", 
          color: isComplete ? "#4ade80" : "var(--prog-fill)", 
          margin: 0, 
          fontWeight: 800,
          transition: "color 0.3s ease"
        }}>
          {realAttemptedCount} / {totalQuestions}
        </p>
        
        <span style={{ 
          fontSize: "8px", 
          color: "#9a8f7e", 
          textTransform: "uppercase", 
          letterSpacing: "0.12em",
          marginBottom: "4px",
          fontWeight: 600
        }}>
          {isComplete ? "¡Misión Completa!" : "Progreso Actual"}
        </span>

        {/* Barra de Progreso con variables de azul dinámico */}
        <div style={{ 
          width: "100%", 
          maxWidth: "140px", 
          height: "4px", 
          background: "var(--prog-bg)", 
          borderRadius: "10px", 
          overflow: "hidden" 
        }}>
          <div 
            className="progress-fill-bar"
            style={{ 
              width: `${progress}%`, 
              height: "100%", 
              background: isComplete ? "#2d6a4f" : "var(--prog-fill)", 
              boxShadow: isComplete ? "0 0 10px #2d6a4f" : "0 0 8px var(--prog-bg)",
              transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" 
          }} />
        </div>
      </div>
      
      {/* DERECHA: Controles (Fuente, Tema) y Economía */}
      <div style={{ flex: 1.2, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10 }}>
        
        {/* Controles de Tamaño de Fuente (UX) */}
        <div style={{ display: "flex", background: "var(--bg-passage)", borderRadius: 8, padding: "2px" }}>
          <button 
            onClick={() => setFontSize(prev => Math.max(13, prev - 1))}
            style={{ background: "none", border: "none", padding: "4px", cursor: "pointer", color: "var(--accent)" }}
          >
            <Minus size={14} strokeWidth={3} />
          </button>
          <button 
            onClick={() => setFontSize(prev => Math.min(22, prev + 1))}
            style={{ background: "none", border: "none", padding: "4px", cursor: "pointer", color: "var(--accent)" }}
          >
            <Plus size={14} strokeWidth={3} />
          </button>
        </div>

        {/* Botón Tema */}
        <button 
          onClick={toggleTheme} 
          style={{
            background: "transparent",
            border: "1px solid var(--border-passage)",
            borderRadius: "8px",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--accent)",
            transition: "0.2s"
          }}
        >
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Economía */}
        <div style={S.balancePill}>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 13, color: "#1a1a2e" }}>
            {fmt(balance)}
          </span>
        </div>
      </div>

    </div>
  );
}