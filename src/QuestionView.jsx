import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Send, X, ChevronDown, ChevronUp, 
  BookOpen, Book, Plus, Minus 
} from "lucide-react";
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
  S,
  fontSize, 
  setFontSize 
}) {
  
  const [discardedIds, setDiscardedIds] = useState([]);
  const [textExpanded, setTextExpanded] = useState(true);

  useEffect(() => {
    setDiscardedIds([]);
    setTextExpanded(true); 
  }, [currentQ]);

  if (!currentQ || !currentQ.options) return null;

  const optionsArray = Array.isArray(currentQ.options) 
    ? currentQ.options 
    : Object.entries(currentQ.options).map(([id, text]) => ({ id, text }));

  const diffColors = {
    Fácil: { bg: "#ecfdf5", txt: "#059669" },
    Intermedio: { bg: "#fffbeb", txt: "#d97706" },
    Difícil: { bg: "#fef2f2", txt: "#dc2626" }
  };
  const currentDiff = diffColors[currentQ.difficulty] || diffColors.Fácil;

  const toggleDiscard = (id, e) => {
    e.stopPropagation(); 
    if (showExp) return; 
    setDiscardedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      
      {/* 1. CABECERA */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={goHome} style={{ ...S.backBtn, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft size={16} />
        </button>
        
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{
            backgroundColor: currentDiff.bg,
            color: currentDiff.txt,
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: "bold",
            textTransform: "uppercase",
            border: `1px solid ${currentDiff.txt}22`
          }}>
            {currentQ.difficulty}
          </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "var(--text-sec)", fontWeight: 500 }}>
            {currentQ.category}
          </span>
        </div>
      </div>

      {/* 2. CÁPSULA DE TEXTO */}
      <div style={{ 
        border: "1px solid var(--border-passage)", 
        borderRadius: "16px", 
        overflow: "hidden", 
        marginBottom: 24,
        backgroundColor: "var(--bg-card)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
      }}>
        <div style={{
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          padding: "12px 16px", 
          backgroundColor: "var(--bg-passage)",
          borderBottom: textExpanded ? "1px solid var(--border-passage)" : "none"
        }}>
          <button 
            onClick={() => setTextExpanded(!textExpanded)}
            style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", color: "var(--text-main)", cursor: "pointer", padding: 0 }}
          >
            {textExpanded ? <BookOpen size={18} color="var(--accent)" /> : <Book size={18} color="var(--accent)" />}
            <span style={{ fontWeight: 700, fontSize: "14px" }}>
              {textExpanded ? "Ocultar Lectura" : "Mostrar Lectura"}
            </span>
          </button>

          {textExpanded && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.03)", padding: "4px 8px", borderRadius: "8px" }}>
              <button onClick={() => setFontSize(Math.max(12, fontSize - 1))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", padding: 4 }}><Minus size={14} strokeWidth={3} /></button>
              <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-main)", minWidth: "22px", textAlign: "center", fontFamily: "monospace" }}>{fontSize}</span>
              <button onClick={() => setFontSize(Math.min(24, fontSize + 1))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", padding: 4 }}><Plus size={14} strokeWidth={3} /></button>
            </div>
          )}
        </div>
        
        {textExpanded && (
          <div style={{ padding: "24px", maxHeight: "380px", overflowY: "auto", backgroundColor: "var(--bg-card)" }}>
            {currentQ.text?.split("\n\n").map((p, i) => (
              <p key={i} style={{
                fontSize: `${fontSize}px`, 
                color: "var(--text-main)", 
                lineHeight: 1.8, 
                marginBottom: 16,
                fontFamily: "'Inter', sans-serif",
                margin: 0
              }}>{p}</p>
            ))}
          </div>
        )}
      </div>

      {/* 3. PREGUNTA */}
      <h3 style={{
        fontFamily: "'Playfair Display', serif", 
        fontWeight: 800, 
        fontSize: "19px", 
        color: "var(--text-title)", 
        lineHeight: 1.4, 
        marginBottom: 20,
        marginTop: 0
      }}>
        {currentQ.question}
      </h3>

      {/* 4. OPCIONES (Con efecto TACHADO) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {optionsArray.map(opt => {
          const isSelected = selected === opt.id;
          const isDiscarded = discardedIds.includes(opt.id);
          const isRight = showExp && opt.id === currentQ.correct;
          const isConf = confirmed === opt.id;

          let bg = "var(--bg-card)";
          let border = "1px solid var(--border-passage)";
          let indicatorBg = "var(--bg-passage)";
          let indicatorCol = "var(--accent)";

          if (isSelected) { bg = "rgba(200, 168, 75, 0.08)"; border = "2px solid var(--accent)"; indicatorBg = "var(--accent)"; indicatorCol = "white"; }
          if (showExp && isRight) { bg = "#f0faf4"; border = "2px solid #22c55e"; indicatorBg = "#22c55e"; indicatorCol = "white"; }
          if (showExp && isConf && !correct) { bg = "#fef2f2"; border = "2px solid #ef4444"; indicatorBg = "#ef4444"; indicatorCol = "white"; }

          return (
            <div key={opt.id} style={{ position: "relative" }}>
              <button 
                disabled={!!showExp || isDiscarded}
                onClick={() => setSelected(opt.id)}
                style={{ 
                  width: "100%", background: bg, border, borderRadius: "14px", padding: "16px 50px 16px 16px", 
                  textAlign: "left", cursor: (!!showExp || isDiscarded) ? "default" : "pointer",
                  display: "flex", gap: 14, alignItems: "flex-start", transition: "all 0.2s ease",
                  opacity: isDiscarded ? 0.35 : 1
                }}
              >
                <span style={{ 
                  width: "32px", height: "32px", borderRadius: "8px", display: "flex", 
                  alignItems: "center", justifyContent: "center", backgroundColor: indicatorBg, 
                  color: indicatorCol, fontWeight: "bold", fontSize: "14px", flexShrink: 0 
                }}>{opt.id}</span>
                
                {/* TEXTO DE LA OPCIÓN CON TACHADO SI ESTÁ DESCARTADA */}
                <span style={{ 
                  fontSize: "15px", 
                  color: "var(--text-main)", 
                  fontWeight: 500, 
                  lineHeight: 1.5,
                  textDecoration: isDiscarded ? "line-through" : "none", // <--- RESTAURADO
                  fontStyle: isDiscarded ? "italic" : "normal"
                }}>
                  {opt.text}
                </span>
              </button>

              {!showExp && (
                <button 
                  onClick={(e) => toggleDiscard(opt.id, e)} 
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: isDiscarded ? "var(--accent)" : "var(--text-sec)", cursor: "pointer", padding: 8 }}
                >
                  <X size={18} strokeWidth={isDiscarded ? 3 : 2} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <button 
        disabled={!selected || showExp} 
        onClick={confirmAnswer} 
        style={!selected ? S.btnDisabled : { ...S.btnPrimary, height: "56px", fontSize: "16px", fontWeight: "bold" }}
      >
        <Send size={20} /> <span style={{ marginLeft: 10 }}>Confirmar Respuesta</span>
      </button>

      <FeedbackModal showExp={showExp} correct={correct} successImage={successImage} errorImage={errorImage} explanation={currentQ.explanation} nextQ={nextQ} S={S} />
    </div>
  );
}