import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, X, ChevronDown, ChevronUp, BookOpen, Book } from "lucide-react";
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
  fontSize = 15 
}) {
  
  const [discardedIds, setDiscardedIds] = useState([]);
  const [textExpanded, setTextExpanded] = useState(true);

  // Limpieza al cambiar de pregunta
  useEffect(() => {
    setDiscardedIds([]);
    setTextExpanded(true); 
  }, [currentQ]);

  const toggleDiscard = (id, e) => {
    e.stopPropagation(); 
    if (showExp) return; 
    setDiscardedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  if (!currentQ || !currentQ.options) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-sec)' }}>
        <p>Cargando pregunta...</p>
      </div>
    );
  }

  const optionsArray = Array.isArray(currentQ.options) 
    ? currentQ.options 
    : Object.entries(currentQ.options).map(([id, text]) => ({ id, text }));

  const d = DIFF_LIGHT[currentQ.difficulty] || DIFF_LIGHT.Fácil;

  return (
    <div className="fade">
      {/* --- CABECERA --- */}
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18}}>
        <button onClick={goHome} style={S.backBtn}>
          <ArrowLeft style={{width:14, height:14}} />
        </button>
        
        <div style={{display: "flex", gap: 8, alignItems: "center"}}>
          <span className={`diff-badge ${currentQ.difficulty}`}>
            {currentQ.difficulty}
          </span>
          <span style={{fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"var(--text-sec)", fontWeight:500}}>
            {currentQ.category}
          </span>
        </div>
      </div>

      {/* --- CÁPSULA INTEGRADORA (Botón + Texto unidos, sin esquinas) --- */}
      <div 
        style={{ ...S.passageWrapper, marginBottom: 24, transition: "all 0.3s ease" }} 
        className="passage-wrapper fade"
      >
        {/* CABECERA DEL TEXTO (Botón Colapsable pegado al cuadro) */}
        <button 
          onClick={() => setTextExpanded(!textExpanded)}
          style={{
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            width: "100%", 
            padding: "14px 16px", 
            background: "transparent", 
            border: "none",
            borderBottom: textExpanded ? "1px solid var(--border-passage)" : "none", 
            color: "var(--text-main)",
            cursor: "pointer",
            position: "relative",
            zIndex: 5
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {textExpanded ? <BookOpen size={16} color="var(--accent)" /> : <Book size={16} color="var(--accent)" />}
            <span style={{ fontWeight: 600, fontSize: 13 }}>
              {textExpanded ? "Ocultar Texto" : "Ver Texto de Lectura"}
            </span>
          </div>
          {textExpanded ? <ChevronUp size={16} color="var(--text-sec)" /> : <ChevronDown size={16} color="var(--accent)" />}
        </button>
        
        {/* ÁREA DE TEXTO (Scroll) */}
        {textExpanded && (
          <div style={S.passageScroll} className="scroll-area">
            {currentQ.text?.split("\n\n").map((p, i, arr) => (
              <p key={i} style={{
                fontSize: fontSize, 
                color: "var(--text-main)", 
                lineHeight: 1.7, 
                marginBottom: i < arr.length - 1 ? 14 : 0,
                fontWeight: 450,
                fontFamily: "'Inter', sans-serif",
                transition: "font-size 0.2s ease"
              }}>
                {p}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* --- ENUNCIADO --- */}
      <h3 style={{
        fontFamily:"'Playfair Display', serif", 
        fontWeight:700, 
        fontSize:17, 
        color:"var(--text-title)", 
        lineHeight:1.4, 
        marginTop: 0, 
        marginBottom:16,
        transition: "color 0.3s ease"
      }}>
        {currentQ.question}
      </h3>

      {/* --- LISTA DE OPCIONES --- */}
      <div style={{display:"flex", flexDirection:"column", gap:9, marginBottom:18}}>
        {optionsArray.map(opt => {
          const isConf = confirmed === opt.id;
          const isRight = showExp && opt.id === currentQ.correct;
          const isSelected = selected === opt.id;
          const isDiscarded = discardedIds.includes(opt.id);
          
          let bg = "var(--bg-card)";
          let border = "1px solid var(--border-passage)";
          let lBg = "var(--bg-passage)";
          let lCol = "var(--accent)";
          let textColor = "var(--text-main)";

          // Selección
          if (!showExp && isSelected) { 
            bg="rgba(200, 168, 75, 0.05)"; border="1.5px solid var(--accent)"; lBg="var(--text-title)"; lCol="var(--accent)"; 
          }

          // Feedback 
          if (isConf && correct) { 
            bg="#f0faf4"; border="1.5px solid #86efac"; lBg="#2d6a4f"; lCol="#fff"; textColor="#1a1a2e"; 
          }
          if (isConf && !correct) { 
            bg="#fff5f5"; border="1px solid #fca5a5"; lBg="#991b1b"; lCol="#fff"; textColor="#1a1a2e";
          }
          if (isRight && !isConf) { 
            bg="#f0faf4"; border="1.5px solid #86efac"; lBg="#2d6a4f"; lCol="#fff"; textColor="#1a1a2e";
          }
          
          return (
            <div key={opt.id} className="option-container" style={{ position: "relative", width: "100%" }}>
              <button 
                disabled={!!showExp || isDiscarded} 
                onClick={() => setSelected(opt.id)}
                className={isDiscarded ? "discarded" : ""}
                style={{
                  width: "100%", background: bg, border, borderRadius: 11, 
                  padding: "12px 45px 12px 14px", display: "flex", alignItems: "flex-start", 
                  gap: 12, textAlign: "left", transition: "all 0.15s",
                  cursor: (!!showExp || isDiscarded) ? "default" : "pointer"
                }}
              >
                <span style={{
                  width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", 
                  background: lBg, color: lCol, fontWeight: 600, fontSize: 12, flexShrink: 0
                }}>
                  {opt.id}
                </span>

                <span style={{ fontSize: 13, color: isDiscarded ? "var(--text-sec)" : textColor, fontWeight: 500, lineHeight: 1.55 }}>
                  {opt.text}
                </span>
              </button>

              {/* BOTÓN X (DESCARTE) */}
              {!showExp && (
                <button 
                  onClick={(e) => toggleDiscard(opt.id, e)}
                  title="Descartar opción"
                  className="discard-btn"
                  style={{
                    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: "var(--text-sec)", cursor: "pointer",
                    padding: "5px", zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: isDiscarded ? 1 : undefined 
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* --- BOTÓN DE CONFIRMACIÓN --- */}
      <button 
        disabled={!selected || showExp} 
        onClick={confirmAnswer} 
        style={!selected ? S.btnDisabled : S.btnPrimary}
      >
        <Send style={{width:16, height:16}} /> 
        <span>Confirmar Respuesta</span>
      </button>

      {/* --- MODAL DE EXPLICACIÓN --- */}
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