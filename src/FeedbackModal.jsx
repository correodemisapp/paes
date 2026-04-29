import React from 'react';
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";

export default function FeedbackModal({ 
  showExp, correct, successImage, errorImage, explanation, nextQ, S 
}) {
  if (!showExp) return null;

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .feedback-modal-card {
          animation: slideUp 0.38s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
        }
        .feedback-scroll::-webkit-scrollbar { width: 4px; }
        .feedback-scroll::-webkit-scrollbar-track { background: transparent; }
        .feedback-scroll::-webkit-scrollbar-thumb { background: #C8A84B; border-radius: 10px; }
      `}</style>

      <div style={S.modalBackdrop}>
        <div className="feedback-modal-card" style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-passage)",
          width: "100%",
          maxWidth: "480px",
          borderRadius: "28px 28px 0 0",
          padding: "32px 24px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18)"
        }}>
          
          {/* Pill indicador */}
          <div style={{ width: 36, height: 4, background: "var(--border-passage)", borderRadius: 4, marginBottom: 24 }} />

          {/* Icono / Imagen */}
          <div style={{ marginBottom: 16 }}>
            {correct ? (
              successImage ? (
                <img src={successImage} style={{ width: 80, height: 80, borderRadius: 20, objectFit: "cover" }} alt="¡Bien!" />
              ) : (
                <CheckCircle size={60} color="#22c55e" />
              )
            ) : (
              errorImage ? (
                <img src={errorImage} style={{ width: 80, height: 80, borderRadius: 20, objectFit: "cover" }} alt="Error" />
              ) : (
                <XCircle size={60} color="#ef4444" />
              )
            )}
          </div>

          <h2 style={{ 
            fontFamily: "'Playfair Display', serif", fontSize: 24, 
            color: correct ? "#2d6a4f" : "#991b1b", marginBottom: 12 
          }}>
            {correct ? "¡Correcto!" : "Respuesta Incorrecta"}
          </h2>

          {/* Explicación con scroll */}
          <div className="feedback-scroll" style={{ 
            width: "100%", maxHeight: "220px", overflowY: "auto",
            paddingRight: "8px", marginBottom: 24, textAlign: "left"
          }}>
            <p style={{ 
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, 
              color: "var(--text-main)", lineHeight: 1.7,
              whiteSpace: "pre-wrap", margin: 0
            }}>
              {explanation}
            </p>
          </div>

          <button onClick={nextQ} style={{ ...S.btnPrimary, maxWidth: "100%" }}>
            Siguiente Pregunta <ArrowRight size={18} style={{ marginLeft: 8 }} />
          </button>
        </div>
      </div>
    </>
  );
}
