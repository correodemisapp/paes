import React from 'react';
import { CheckCircle, XCircle, ChevronRight } from "lucide-react";

export default function FeedbackModal({ showExp, correct, successImage, errorImage, explanation, nextQ, S }) {
  if (!showExp) return null;
  return (
    <>
      <div style={S.modalBackdrop} />
      <div style={{ ...S.modalCard, borderColor: correct ? "#86efac" : "#fca5a5", background: correct ? "#f0faf4" : "#fff5f5" }}>
        {(correct ? successImage : errorImage) ? (
          <img src={correct ? successImage : errorImage} style={{ width: "100%", maxWidth: 180, borderRadius: 12, objectFit: "contain" }} alt="" />
        ) : (
          correct ? <CheckCircle style={{ width: 52, height: 52, color: "#2d6a4f" }} /> : <XCircle style={{ width: 52, height: 52, color: "#991b1b" }} />
        )}
        <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 22, color: correct ? "#2d6a4f" : "#991b1b", textAlign: "center" }}>
          {correct ? "¡Correcto!" : "¡Ánimo, tú puedes!"}
        </p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#5a5040", textAlign: "center", lineHeight: 1.8, maxWidth: 300 }}>
          {explanation}
        </p>
        <button onClick={nextQ} style={{ ...S.btnPrimary, width: "100%", background: correct ? "#2d6a4f" : "#1a1a2e" }}>
          Siguiente pregunta <ChevronRight style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </>
  );
}