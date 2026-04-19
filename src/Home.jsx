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
      
     <div style={{ 
  display: "flex", 
  alignItems: "center", // Centra verticalmente el icono con el bloque de texto
  gap: 20, 
  textAlign: "left", 
  width: "100%", 
  marginBottom: 32 
}}>
  
  {/* Cuadro del Icono */}
  <div style={{ 
    ...S.lockBox, 
    width: 70, 
    height: 70, 
    flexShrink: 0,
    display: "flex",          // Aseguramos que el cerebro esté centrado en el cuadro
    alignItems: "center",
    justifyContent: "center"
  }}>
    <Brain size={32} color="#C8A84B" />
  </div>

  {/* Bloque de Texto */}
  <div style={{ 
    display: "flex", 
    flexDirection: "column", 
    justifyContent: "center" // Fuerza el centrado interno de las dos líneas
  }}>
    <h1 style={{ 
      ...S.bigTitle, 
      fontSize: 28, 
      margin: 0,              // Eliminamos márgenes que vienen por defecto
      lineHeight: 1.1,        // Ajustamos la altura de línea para que no sea excesiva
      padding: 0
    }}>
      Entrenamiento
    </h1>
    <p style={{ 
      ...S.subtitle, 
      margin: 0,              // Eliminamos márgenes
      padding: 0,
      marginTop: 2            // Un pequeño respiro visual entre título y subtítulo
    }}>
      Gestiona tu progreso y desafíos PAES
    </p>
  </div>

</div>

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
  
  {/* PRIMERA FILA: Botones en paralelo */}
  <div style={{ display: "flex", gap: 12, width: "100%" }}>
    <button 
      className="home-card"
      disabled={available.length === 0} 
      onClick={() => { setIsReview(false); setQIdx(0); setView("test"); }} 
      style={{ 
        ...(available.length === 0 ? S.btnDisabled : S.btnPrimary), 
        flex: 1, // Esto hace que ocupe la mitad del ancho
        maxWidth: "none", 
        height: 65, // Aumentamos un poco el alto para que el texto respire
        fontSize: 14,
        display: "flex",
        flexDirection: "column", // Texto arriba e icono abajo (o viceversa) si es necesario
        justifyContent: "center",
        alignItems: "center",
        padding: "0 8px",
        textAlign: "center"
      }}
    >
      <span style={{ fontWeight: 700 }}>Iniciar</span>
      <span style={{ fontSize: 10, opacity: 0.9 }}>Entrenamiento</span>
    </button>

    <button 
      className="home-card"
      onClick={() => { setIsReview(true); setQIdx(0); setView("test"); }} 
      style={{ 
        ...S.btnSecondary, 
        flex: 1, // Esto hace que ocupe la otra mitad
        maxWidth: "none", 
        height: 65, 
        fontSize: 14,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 8px",
        textAlign: "center"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <History style={{ width: 14, height: 14 }} />
        <span style={{ fontWeight: 700 }}>Repasar</span>
      </div>
      <span style={{ fontSize: 10, opacity: 0.7 }}>Todo</span>
    </button>
  </div>

  {/* SEGUNDA FILA: Botón de configuración */}
  <button 
    className="home-card"
    onClick={() => setView("settings")} 
    style={{ 
      ...S.btnGhost, 
      width: "100%", 
      maxWidth: "none", 
      height: 48, 
      border: "1px solid #E8E5DC", 
      marginTop: 4,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10
    }}
  >
    <SettingsIcon style={{ width: 15, height: 15, color: "#9a8f7e" }} />
    <span style={{ fontSize: 13, fontWeight: 600, color: "#3d3628" }}>Configuración Parental</span>
    <ChevronRight style={{ width: 16, height: 16, marginLeft: "auto", opacity: 0.3 }} />
  </button>

</div>

      <div style={{ marginTop: 40, opacity: 0.3, fontSize: 9, letterSpacing: "0.2em" }}>
        PAES STUDY SYSTEM
      </div>
    </div>
  );
}