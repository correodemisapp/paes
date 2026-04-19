import React from 'react';
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";

export default function FeedbackModal({ 
  showExp, correct, successImage, errorImage, explanation, nextQ, S 
}) {
  if (!showExp) return null;

  return (
    <div style={S.modalBackdrop}>
      <div className="fade" style={{
        background: "#fff",
        width: "100%",
        maxWidth: "400px",
        borderRadius: "24px",
        padding: "32px 24px",
        position: "relative",
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center"
      }}>
        
        {/* Icono o Imagen de Feedback */}
        <div style={{ marginBottom: 20 }}>
          {correct ? (
            successImage ? (
              <img src={successImage} style={{ width: 80, height: 80, borderRadius: 20, objectFit: "cover" }} alt="¡Bien!" />
            ) : (
              <CheckCircle size={60} color="#2d6a4f" />
            )
          ) : (
            errorImage ? (
              <img src={errorImage} style={{ width: 80, height: 80, borderRadius: 20, objectFit: "cover" }} alt="Error" />
            ) : (
              <XCircle size={60} color="#991b1b" />
            )
          )}
        </div>

        <h2 style={{ 
          fontFamily: "'Playfair Display', serif", 
          fontSize: 24, 
          color: correct ? "#2d6a4f" : "#991b1b", 
          marginBottom: 12 
        }}>
          {correct ? "¡Correcto!" : "Respuesta Incorrecta"}
        </h2>

        {/* --- CONTENEDOR CON SCROLL --- */}
        <div style={{ 
          width: "100%",
          maxHeight: "250px", // Altura máxima antes de activar el scroll
          overflowY: "auto",   // Activa el scroll vertical
          paddingRight: "8px", // Espacio para que el scroll no tape el texto
          marginBottom: 24,
          textAlign: "left"
        }}>
          <p style={{ 
            fontFamily: "'DM Sans', sans-serif", 
            fontSize: 14, 
            color: "#3d3628", 
            lineHeight: 1.6,
            whiteSpace: "pre-wrap" // Respeta los saltos de línea de la IA
          }}>
            {explanation}
          </p>
        </div>

        <button onClick={nextQ} style={{ ...S.btnPrimary, width: "100%" }}>
          Siguiente Pregunta <ArrowRight size={18} style={{ marginLeft: 8 }} />
        </button>
      </div>

      {/* Estilo para personalizar la barra de scroll dentro del modal */}
      <style>{`
        div::-webkit-scrollbar {
          width: 4px;
        }
        div::-webkit-scrollbar-track {
          background: #f0ede4;
        }
        div::-webkit-scrollbar-thumb {
          background: #C8A84B;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}