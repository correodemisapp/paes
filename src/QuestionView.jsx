import React from 'react';
import { ArrowLeft, Send } from "lucide-react";
import FeedbackModal from "./FeedbackModal";

export default function QuestionView({ 
  currentQ, 
  goHome, 
  confirmAnswer, 
  selected, 
  setSelected, 
  showExp, 
  confirmed, 
  correct, 
  nextQ, 
  successImage, 
  errorImage, 
  DIFF_LIGHT, 
  S 
}) {
  
  // 1. Guardia de seguridad: Si no hay datos, mostramos carga
  if (!currentQ || !currentQ.options) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#9a8f7e' }}>
        <p>Cargando pregunta...</p>
      </div>
    );
  }

  // Configuración de colores según dificultad
  const d = DIFF_LIGHT[currentQ.difficulty] || DIFF_LIGHT.Fácil;

  // 2. Normalización de opciones (Convierte objeto {A: "..."} a arreglo)
  const optionsArray = Array.isArray(currentQ.options) 
    ? currentQ.options 
    : Object.entries(currentQ.options).map(([id, text]) => ({ id, text }));

  return (
    <div className="fade">
      {/* --- CABECERA DE LA PREGUNTA --- */}
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18}}>
        <button onClick={goHome} style={S.backBtn}>
          <ArrowLeft style={{width:14, height:14}} />
        </button>
        
        <div style={{display: "flex", gap: 8, alignItems: "center"}}>
          <span style={{
            fontSize:10, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", 
            padding:"4px 12px", borderRadius:6, color:d.color, background:d.bg, border:`1px solid ${d.border}`
          }}>
            {currentQ.difficulty}
          </span>
          <span style={{fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#9a8f7e", fontWeight:500}}>
            {currentQ.category}
          </span>
        </div>
      </div>

      {/* --- ÁREA DE TEXTO (CÁPSULA CON ESQUINAS DORADAS) --- */}
      <div style={S.passageWrapper} className="passage-wrapper">
        {/* Esquinas manuales fijas (las otras 2 las genera el CSS ::before/::after) */}
        <div className="top-right-corner"></div>
        <div className="bottom-left-corner"></div>
        
        {/* Contenedor scrolleable */}
        <div style={S.passageScroll} className="scroll-area">
          {currentQ.text?.split("\n\n").map((p, i, arr) => (
            <p key={i} style={{
              fontSize: 15,          // Tamaño optimizado para móvil
              color: "#1a202c",      // Gris carbón (mejor legibilidad)
              lineHeight: 1.7, 
              marginBottom: i < arr.length - 1 ? 14 : 0,
              fontStyle: "normal",   // Sin cursivas
              fontWeight: 450,       // Peso nítido
              fontFamily: "'Inter', sans-serif"
            }}>
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* --- ENUNCIADO DE LA PREGUNTA --- */}
      <h3 style={{
        fontFamily:"'Playfair Display', serif", 
        fontWeight:700, 
        fontSize:17, 
        color:"#1a1a2e", 
        lineHeight:1.4, 
        marginTop: 20,
        marginBottom:16
      }}>
        {currentQ.question}
      </h3>

      {/* --- GRILLA DE OPCIONES --- */}
      <div style={{display:"flex", flexDirection:"column", gap:9, marginBottom:18}}>
        {optionsArray.map(opt => {
          const isConf = confirmed === opt.id;
          const isRight = showExp && opt.id === currentQ.correct;
          
          // Lógica de colores de los botones
          let bg="#fff", border="1px solid #E8E5DC", lBg="#f0ede4", lCol="#9a8f7e";
          
          if (!showExp && selected === opt.id) { 
            bg="#fffbf0"; border="1px solid #C8A84B"; lBg="#1a1a2e"; lCol="#C8A84B"; 
          }
          if (isConf && correct) { 
            bg="#f0faf4"; border="1px solid #86efac"; lBg="#2d6a4f"; lCol="#fff"; 
          }
          if (isConf && !correct) { 
            bg="#fff5f5"; border="1px solid #fca5a5"; lBg="#991b1b"; lCol="#fff"; 
          }
          if (isRight && !isConf) { 
            bg="#f0faf4"; border="1px solid #86efac"; lBg="#2d6a4f"; lCol="#fff"; 
          }
          
          return (
            <button 
              key={opt.id} 
              disabled={!!showExp} 
              onClick={() => setSelected(opt.id)}
              style={{
                background:bg, 
                border, 
                borderRadius:11, 
                padding:"12px 14px", 
                display:"flex", 
                alignItems:"flex-start", 
                gap:12, 
                textAlign:"left", 
                transition:"all 0.15s",
                cursor: !!showExp ? "default" : "pointer"
              }}
            >
              <span style={{
                width:30, height:30, borderRadius:7, 
                display:"flex", alignItems:"center", justifyContent:"center", 
                background:lBg, color:lCol, fontWeight:600, fontSize:12, flexShrink: 0
              }}>
                {opt.id}
              </span>
              <span style={{fontSize:13, color:"#3d3628", fontWeight:500, lineHeight:1.55}}>
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* --- BOTÓN DE ACCIÓN --- */}
      <button 
        disabled={!selected || showExp} 
        onClick={confirmAnswer} 
        style={!selected ? S.btnDisabled : S.btnPrimary}
      >
        <Send style={{width:16, height:16}} /> 
        <span>Confirmar Respuesta</span>
      </button>

      {/* --- MODAL DE FEEDBACK (RESULTADOS) --- */}
      <FeedbackModal 
        showExp={showExp} 
        correct={correct} 
        successImage={successImage} 
        errorImage={errorImage} 
        explanation={currentQ.explanation} 
        nextQ={nextQ} 
        S={S} 
      />
    </div>
  );
}