import React, { useState } from 'react';
import { ArrowLeft, Send, X } from "lucide-react";
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
  S,
  fontSize = 15 // Recibe el tamaño de fuente del estado global o default
}) {
  
  // --- ESTADO LOCAL PARA OPCIONES DESCARTADAS ---
  const [discardedIds, setDiscardedIds] = useState([]);

  // Función para tachar/destachar una opción
  const toggleDiscard = (id, e) => {
    e.stopPropagation(); // Evita que al tachar también se seleccione la opción
    if (showExp) return; // No permitir tachar si ya se mostró la explicación
    setDiscardedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // 1. Guardia de seguridad: Si no hay datos, mostramos carga
  if (!currentQ || !currentQ.options) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#9a8f7e' }}>
        <p>Cargando pregunta...</p>
      </div>
    );
  }

  // Configuración de colores según dificultad (Badge superior)
  const d = DIFF_LIGHT[currentQ.difficulty] || DIFF_LIGHT.Fácil;

  // 2. Normalización de opciones (Convierte objeto {A: "..."} a arreglo si es necesario)
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
          <span style={{fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"var(--text-sec)", fontWeight:500}}>
            {currentQ.category}
          </span>
        </div>
      </div>

      {/* --- ÁREA DE TEXTO (CÁPSULA CON ESQUINAS DORADAS) --- */}
      <div style={S.passageWrapper} className="passage-wrapper">
        <div className="top-right-corner"></div>
        <div className="bottom-left-corner"></div>
        
        <div style={S.passageScroll} className="scroll-area">
          {currentQ.text?.split("\n\n").map((p, i, arr) => (
            <p key={i} style={{
              fontSize: fontSize,      // Tamaño dinámico (UX)
              color: "var(--text-main)", // Adaptable al tema
              lineHeight: 1.7, 
              marginBottom: i < arr.length - 1 ? 14 : 0,
              fontStyle: "normal",
              fontWeight: 450,
              fontFamily: "'Inter', sans-serif",
              transition: "font-size 0.2s ease"
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
        color:"var(--text-title)", // Variable para leerse bien en azul/celeste
        lineHeight:1.4, 
        marginTop: 20,
        marginBottom:16,
        transition: "color 0.3s ease"
      }}>
        {currentQ.question}
      </h3>

      {/* --- GRILLA DE OPCIONES --- */}
      <div style={{display:"flex", flexDirection:"column", gap:9, marginBottom:18}}>
        {optionsArray.map(opt => {
          const isConf = confirmed === opt.id;
          const isRight = showExp && opt.id === currentQ.correct;
          const isSelected = selected === opt.id;
          const isDiscarded = discardedIds.includes(opt.id);
          
          // Lógica de colores dinámica
          let bg = "var(--bg-card)";
          let border = "1px solid var(--border-passage)";
          let lBg = "var(--bg-passage)";
          let lCol = "var(--accent)";
          
          if (!showExp && isSelected) { 
            bg="rgba(200, 168, 75, 0.05)"; border="1.5px solid var(--accent)"; lBg="var(--text-title)"; lCol="var(--accent)"; 
          }
          if (isConf && correct) { 
            bg="#f0faf4"; border="1.5px solid #86efac"; lBg="#2d6a4f"; lCol="#fff"; 
          }
          if (isConf && !correct) { 
            bg="#fff5f5"; border="1px solid #fca5a5"; lBg="#991b1b"; lCol="#fff"; 
          }
          if (isRight && !isConf) { 
            bg="#f0faf4"; border="1.5px solid #86efac"; lBg="#2d6a4f"; lCol="#fff"; 
          }
          
          return (
            <div key={opt.id} style={{ position: "relative" }} className="option-container">
              <button 
                disabled={!!showExp || isDiscarded} 
                onClick={() => setSelected(opt.id)}
                className={isDiscarded ? "discarded" : ""}
                style={{
                  width: "100%",
                  background:bg, 
                  border, 
                  borderRadius:11, 
                  padding:"12px 14px", 
                  display:"flex", 
                  alignItems:"flex-start", 
                  gap:12, 
                  textAlign:"left", 
                  transition:"all 0.15s",
                  cursor: (!!showExp || isDiscarded) ? "default" : "pointer"
                }}
              >
                <span style={{
                  width:30, height:30, borderRadius:7, 
                  display:"flex", alignItems:"center", justifyContent:"center", 
                  background:lBg, color:lCol, fontWeight:600, fontSize:12, flexShrink: 0
                }}>
                  {opt.id}
                </span>
                <span style={{
                  fontSize:13, 
                  color: isDiscarded ? "var(--text-sec)" : "var(--text-main)", 
                  fontWeight: 500, 
                  lineHeight: 1.55 
                }}>
                  {opt.text}
                </span>
              </button>

              {/* BOTÓN PARA TACHAR (Solo visible antes de confirmar) */}
              {!showExp && (
                <button 
                  onClick={(e) => toggleDiscard(opt.id, e)}
                  title="Descartar opción"
                  className="discard-btn"
                >
                  <X size={14} />
                </button>
              )}
            </div>
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