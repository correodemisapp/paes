import React from 'react';

// Recibimos como "props" todo lo que el Header necesita mostrar
export default function Header({ appIcon, attemptedIds, allQs, balance, fmt, S }) {
  return (
    <div style={S.header}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        <div style={S.headerIcon}>
          {appIcon ? (
            <img src={appIcon} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} alt="" />
          ) : (
            <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 16, color: "#C8A84B" }}>P</span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 14, color: "#F5F0E8", margin: 0, lineHeight: 1.1 }}>
            PAES Premium
          </p>
          
          {/* Contador de preguntas */}
          <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#C8A84B", margin: "2px 0", fontWeight: 600 }}>
            {attemptedIds?.length || 0} de {allQs?.length || 0} completadas
          </p>

          {/* Barra de Progreso */}
          <div style={{ width: "100%", maxWidth: "120px", height: "3px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", marginTop: "4px", overflow: "hidden" }}>
            <div style={{ 
              width: `${allQs?.length > 0 ? (attemptedIds.length / allQs.length) * 100 : 0}%`, 
              height: "100%", 
              background: "#C8A84B", 
              transition: "width 0.4s ease" 
            }} />
          </div>
        </div>
      </div>
      
      <div style={S.balancePill}>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, fontSize: 13, color: "#1a1a2e" }}>
          {fmt(balance)}
        </span>
      </div>
    </div>
  );
} 