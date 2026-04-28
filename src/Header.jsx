import React from 'react';
import { Sun, Moon } from "lucide-react";

export default function Header({ 
  appIcon, 
  attemptedIds, 
  allQs, 
  balance, 
  fmt, 
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
            transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" 
          }} />
        </div>
      </div>
      
      {/* 3. DERECHA: Tema y Saldo */}
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>
        <button 
          onClick={toggleTheme} 
          style={{
            background: "var(--bg-app)",
            border: "1px solid var(--border-passage)",
            borderRadius: "8px",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--accent)"
          }}
        >
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        <div style={{...S.balancePill, padding: "6px 12px", minWidth: "auto"}}>
          <span style={{ 
            fontFamily: "'IBM Plex Mono',monospace", 
            fontWeight: 700, 
            fontSize: 12, 
            color: "var(--text-main)" 
          }}>
            {fmt(balance)}
          </span>
        </div>
      </div>
    </div>
  );
}