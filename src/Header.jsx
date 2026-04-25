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
      padding: "10px 20px",
      backgroundColor: "var(--bg-card)",
      borderBottom: "1px solid var(--border-passage)",
      transition: "background-color 0.3s ease"
    }}>
      
      {/* 1. IZQUIERDA: Identidad */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
        <div style={S.headerIcon}>
          {appIcon ? (
            <img src={appIcon} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} alt="App Icon" />
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

      {/* 2. CENTRO: Estadística y Barra */}
      <div style={{ flex: 1.5, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <p style={{ 
          fontFamily: "'IBM Plex Mono',monospace", 
          fontSize: "14px", 
          color: isComplete ? "#4ade80" : "var(--prog-fill)", 
          margin: 0, 
          fontWeight: 800
        }}>
          {realAttemptedCount} / {totalQuestions}
        </p>
        
        {/* ETIQUETA CORREGIDA: Ahora usa var(--text-sec) */}
        <span style={{ 
          fontSize: "8px", 
          color: "var(--text-sec)", // <--- ANTES: #9a8f7e (invisible)
          textTransform: "uppercase", 
          letterSpacing: "0.12em",
          marginBottom: "4px",
          fontWeight: 600
        }}>
          {isComplete ? "¡Misión Completa!" : "Progreso Actual"}
        </span>

        <div style={{ 
          width: "100%", 
          maxWidth: "120px", 
          height: "4px", 
          background: "var(--prog-bg)", 
          borderRadius: "10px", 
          overflow: "hidden",
          marginTop: 4
        }}>
          <div style={{ 
            width: `${progress}%`, 
            height: "100%", 
            background: isComplete ? "#2d6a4f" : "var(--prog-fill)", 
            boxShadow: isComplete ? "0 0 10px #2d6a4f" : "0 0 8px var(--prog-bg)",
            transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" 
          }} />
        </div>
      </div>
      
      {/* 3. DERECHA: Controles y Saldo */}
      <div style={{ flex: 1.2, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
        
        <div style={{ 
          display: "flex", 
          background: "var(--bg-app)", 
          borderRadius: "8px", 
          padding: "2px",
          border: "1px solid var(--border-passage)" 
        }}>
          <button 
            onClick={() => setFontSize(prev => Math.max(13, prev - 1))}
            style={{ background: "none", border: "none", padding: "4px", cursor: "pointer", color: "var(--accent)" }}
          >
            <Minus size={14} />
          </button>
          <button 
            onClick={() => setFontSize(prev => Math.min(22, prev + 1))}
            style={{ background: "none", border: "none", padding: "4px", cursor: "pointer", color: "var(--accent)" }}
          >
            <Plus size={14} />
          </button>
        </div>

        <button 
          onClick={toggleTheme} 
          style={{
            background: "var(--bg-app)",
            border: "1px solid var(--border-passage)",
            borderRadius: "8px",
            width: "30px",
            height: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--accent)"
          }}
        >
          {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
        </button>

        {/* SALDO CORREGIDO: Ahora usa var(--text-main) */}
        <div style={{...S.balancePill, padding: "4px 10px", minWidth: "auto"}}>
          <span style={{ 
            fontFamily: "'IBM Plex Mono',monospace", 
            fontWeight: 700, 
            fontSize: 12, 
            color: "var(--text-main)" // <--- ANTES: #1a1a2e (invisible)
          }}>
            {fmt(balance)}
          </span>
        </div>
      </div>

    </div>
  );
}