import React from 'react';

export default function Header({ appIcon, attemptedIds, allQs, balance, fmt, S }) {
  const progress = allQs?.length > 0 ? (attemptedIds.length / allQs.length) * 100 : 0;

  return (
    <div style={{...S.header, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px"}}>
      
      {/* SECCIÓN IZQUIERDA: Logo y Título */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
        <div style={S.headerIcon}>
          {appIcon ? (
            <img src={appIcon} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} alt="" />
          ) : (
            <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 16, color: "#C8A84B" }}>P</span>
          )}
        </div>
        <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 13, color: "#F5F0E8", margin: 0, whiteSpace: "nowrap" }}>
          PAES Premium
        </p>
      </div>

      {/* SECCIÓN CENTRAL: Contador y Barra (Más grande y centrado) */}
      <div style={{ flex: 1.5, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <p style={{ 
          fontFamily: "'IBM Plex Mono',monospace", 
          fontSize: 12, // Un poco más grande
          color: "#C8A84B", 
          margin: "0 0 4px 0", 
          fontWeight: 700,
          letterSpacing: "0.05em" 
        }}>
          {attemptedIds?.length || 0} / {allQs?.length || 0} completadas
        </p>
        
        {/* Barra de Progreso centrada */}
        <div style={{ 
          width: "100%", 
          maxWidth: "140px", 
          height: "4px", 
          background: "rgba(255,255,255,0.1)", 
          borderRadius: "10px", 
          overflow: "hidden" 
        }}>
          <div style={{ 
            width: `${progress}%`, 
            height: "100%", 
            background: "#C8A84B", 
            boxShadow: "0 0 8px rgba(200, 168, 75, 0.4)",
            transition: "width 0.5s ease-out" 
          }} />
        </div>
      </div>
      
      {/* SECCIÓN DERECHA: Balance */}
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
        <div style={S.balancePill}>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 13, color: "#1a1a2e" }}>
            {fmt(balance)}
          </span>
        </div>
      </div>

    </div>
  );
}