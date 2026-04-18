import React from 'react';

export default function Header({ appIcon, attemptedIds, allQs, balance, fmt, S }) {
  
  // --- LÓGICA ROBUSTA ---
  // Obtenemos el total real de preguntas cargadas
  const totalQuestions = allQs?.length || 0;

  // Filtramos los IDs intentados para contar SOLO los que existen en la lista actual
  // Esto evita que IDs de preguntas borradas o de sesiones viejas sumen al contador
  const realAttemptedCount = (attemptedIds || []).filter(id => 
    allQs.some(q => q.id === id)
  ).length;

  // Calculamos el porcentaje basado en datos reales filtrados
  const progress = totalQuestions > 0 ? (realAttemptedCount / totalQuestions) * 100 : 0;
  const isComplete = progress === 100 && totalQuestions > 0;

  return (
    <div style={{...S.header, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px"}}>
      
      {/* IZQUIERDA: Identidad */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
        <div style={S.headerIcon}>
          {appIcon ? (
            <img src={appIcon} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} alt="" />
          ) : (
            <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 16, color: "#C8A84B" }}>P</span>
          )}
        </div>
        <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 13, color: "#F5F0E8", margin: 0 }}>
          PAES Premium
        </p>
      </div>

      {/* CENTRO: Estadística Robusta */}
      <div style={{ flex: 1.5, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <p style={{ 
          fontFamily: "'IBM Plex Mono',monospace", 
          fontSize: "14px", 
          color: isComplete ? "#4ade80" : "#C8A84B", // Verde si terminó todo
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

        {/* Barra de Progreso */}
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
            background: isComplete ? "#2d6a4f" : "#C8A84B", 
            boxShadow: isComplete ? "0 0 10px #2d6a4f" : "0 0 8px rgba(200, 168, 75, 0.4)",
            transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" 
          }} />
        </div>
      </div>
      
      {/* DERECHA: Economía */}
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