import React, { useState } from "react";
import { Lock, ArrowLeft, ShieldCheck } from "lucide-react";

export default function ParentalLock({ onSuccess, onCancel, S }) {
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Usamos la clave que definiste previamente
    if (pass === "camboropaes") {
      onSuccess();
    } else {
      setError(true);
      setPass("");
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fade" style={S.loginWrap}>
      <div style={S.lockBox}>
        <Lock size={32} color="#C8A84B" />
      </div>
      
      <h2 style={S.bigTitle}>Área Protegida</h2>
      <p style={S.subtitle}>Ingresa la clave maestra para gestionar la aplicación</p>

      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 320 }}>
        <input
          type="password"
          placeholder="••••••••"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          style={{
            ...S.loginInput,
            borderColor: error ? "#991b1b" : "#C8A84B",
            boxShadow: error ? "0 0 0 4px rgba(153, 27, 27, 0.1)" : S.loginInput.boxShadow
          }}
          autoFocus
        />
        
        {error && (
          <div style={S.errBanner}>Clave incorrecta. Intenta de nuevo.</div>
        )}

        <button type="submit" style={S.btnPrimary}>
          <ShieldCheck size={20} />
          Desbloquear Panel
        </button>

        <button 
          type="button" 
          onClick={onCancel} 
          style={{ ...S.btnGhost, marginTop: 16, width: "100%" }}
        >
          <ArrowLeft size={18} />
          Volver al Inicio
        </button>
      </form>
    </div>
  );
}