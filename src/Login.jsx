import React from 'react';
import { ChevronRight } from "lucide-react";

export default function Login({ 
  loginPass, 
  setLoginPass, 
  setView, 
  setErr, 
  err, 
  appIcon, 
  S 
}) {
  
  const handleLogin = () => {
    // Aquí puedes cambiar la clave maestra si lo deseas
    if (loginPass === "ElaEdionda") {
      setView("home");
    } else {
      setErr("Clave incorrecta");
    }
  };

  return (
    <div style={S.loginWrap} className="fade">
      <div style={S.loginIconBox}>
        {appIcon ? (
          <img 
            src={appIcon} 
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 16 }} 
            alt="App Icon" 
          />
        ) : (
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 26, color: "#C8A84B" }}>
            P
          </span>
        )}
      </div>

      <p style={S.eyebrow}>Competencia Lectora · Chile</p>
      <h1 style={S.bigTitle}>PAES<br/>Premium</h1>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#9a8f7e", marginBottom: 32, textAlign: "center" }}>
        Tu entrenador personal de lectura
      </p>

      {err && (
        <p style={{ ...S.errBanner, width: "100%", maxWidth: 320 }}>
          {err}
        </p>
      )}

      <input 
        type="password" 
        value={loginPass} 
        placeholder="Contraseña" 
        onChange={e => { setLoginPass(e.target.value); setErr(""); }}
        onKeyDown={e => e.key === "Enter" && handleLogin()}
        style={S.loginInput} 
      />

      <button onClick={handleLogin} style={S.btnPrimary}>
        Ingresar <ChevronRight size={18} />
      </button>

      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#ccc4b5", marginTop: 24, letterSpacing: "0.08em" }}>
        — uso exclusivo —
      </p>
    </div>
  );
}