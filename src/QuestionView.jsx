import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Send, X, BookOpen, Book, Plus, Minus 
} from "lucide-react";
import FeedbackModal from "./FeedbackModal";

const DIFF_ICONS = { Fácil: "🟢", Intermedio: "🟡", Difícil: "🔴" };

export default function QuestionView({ 
  currentQ, goHome, confirmAnswer, selected, setSelected, 
  showExp, confirmed, correct, nextQ, successImage, errorImage, S,
  fontSize, setFontSize
}) {
  const [discardedIds, setDiscardedIds] = useState([]);
  const [textExpanded, setTextExpanded] = useState(true);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState("auto");

  useEffect(() => {
    setDiscardedIds([]);
    setTextExpanded(true);
  }, [currentQ]);

  // Calcula altura del contenido para animación de acordeón
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(textExpanded ? `${contentRef.current.scrollHeight}px` : "0px");
    }
  }, [textExpanded, currentQ, fontSize]);

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
    <div style={{ animation: "fadeIn 0.35s ease" }}>

      {/* CABECERA */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={goHome} style={S.backBtn}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{
            backgroundColor: currentDiff.bg, color: currentDiff.txt,
            padding: "4px 10px", borderRadius: "20px", fontSize: "11px",
            fontWeight: "bold", textTransform: "uppercase",
            border: `1px solid ${currentDiff.txt}22`,
            display: "flex", alignItems: "center", gap: 4
          }}>
            {DIFF_ICONS[currentQ.difficulty]} {currentQ.difficulty}
          </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "var(--text-sec)", fontWeight: 500 }}>
            {currentQ.category}
          </span>
        </div>
      </div>

      {/* CÁPSULA DE TEXTO CON ACORDEÓN */}
      <div style={{ 
        border: "1px solid var(--border-passage)", borderRadius: "16px", 
        overflow: "hidden", marginBottom: 24,
        backgroundColor: "var(--bg-card)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
      }}>
        {/* Header del acordeón */}
        <button 
          onClick={() => setTextExpanded(!textExpanded)}
          style={{ 
            width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 16px", backgroundColor: "var(--bg-passage)",
            borderBottom: textExpanded ? "1px solid var(--border-passage)" : "none",
            background: "none", border: "none", borderBottom: textExpanded ? "1px solid var(--border-passage)" : "none",
            color: "var(--text-main)", cursor: "pointer",
            transition: "border-color 0.3s ease"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ transition: "transform 0.3s ease", transform: textExpanded ? "rotate(0deg)" : "rotate(-90deg)" }}>
              {textExpanded ? <BookOpen size={18} color="var(--accent)" /> : <Book size={18} color="var(--accent)" />}
            </div>
            <span style={{ fontWeight: 700, fontSize: "14px" }}>
              {textExpanded ? "Ocultar Lectura" : "Mostrar Lectura"}
            </span>
          </div>

          {textExpanded && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.04)", padding: "4px 8px", borderRadius: "8px" }}>
              <button onClick={(e) => { e.stopPropagation(); setFontSize(Math.max(12, fontSize - 1)); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", padding: 4 }}>
                <Minus size={14} strokeWidth={3} />
              </button>
              <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-main)", minWidth: "22px", textAlign: "center", fontFamily: "monospace" }}>{fontSize}</span>
              <button onClick={(e) => { e.stopPropagation(); setFontSize(Math.min(24, fontSize + 1)); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", padding: 4 }}>
                <Plus size={14} strokeWidth={3} />
              </button>
            </div>
          )}
        </button>

        {/* Contenido con animación de acordeón */}
        <div style={{
          height: contentHeight,
          overflow: "hidden",
          transition: "height 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
        }}>
          <div ref={contentRef} style={{ padding: "24px", maxHeight: "40vh", overflowY: "auto", backgroundColor: "var(--bg-card)" }}>
            {currentQ.text?.split("\n\n").map((p, i) => (
              <p key={i} style={{
                fontSize: `${fontSize}px`, color: "var(--text-main)",
                lineHeight: 1.8, fontFamily: "'Inter', sans-serif",
                margin: i === 0 ? 0 : "16px 0 0 0"
              }}>{p}</p>
            ))}
          </div>
        </div>
      </div>

      {/* PREGUNTA */}
      <h3 style={{
        fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "19px",
        color: "var(--text-title)", lineHeight: 1.4, marginBottom: 20, marginTop: 0
      }}>
        {currentQ.question}
      </h3>

      {/* OPCIONES */}
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
                  width: "100%", background: bg, border, borderRadius: "14px",
                  padding: "14px 50px 14px 14px", textAlign: "left",
                  cursor: (!!showExp || isDiscarded) ? "default" : "pointer",
                  display: "flex", gap: 12, alignItems: "center",
                  transition: "all 0.2s ease", opacity: isDiscarded ? 0.35 : 1
                }}
              >
                {/* Indicador CIRCULAR */}
                <span style={{ 
                  width: "34px", height: "34px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  backgroundColor: indicatorBg, color: indicatorCol,
                  fontWeight: "bold", fontSize: "13px", flexShrink: 0,
                  transition: "all 0.2s ease"
                }}>{opt.id}</span>

                <span style={{ 
                  fontSize: "15px", color: "var(--text-main)", fontWeight: 500, lineHeight: 1.5,
                  textDecoration: isDiscarded ? "line-through" : "none",
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
        style={!selected ? S.btnDisabled : { ...S.btnPrimary, maxWidth: "100%", height: "56px", fontSize: "16px", fontWeight: "bold" }}
      >
        <Send size={20} /> <span style={{ marginLeft: 10 }}>Confirmar Respuesta</span>
      </button>

      <FeedbackModal 
        showExp={showExp} correct={correct} successImage={successImage} 
        errorImage={errorImage} explanation={currentQ.explanation} nextQ={nextQ} S={S} 
      />
    </div>
  );
}
