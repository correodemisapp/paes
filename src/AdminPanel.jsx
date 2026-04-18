import React from 'react';
import { Sparkles, Loader2, Wand2, Lock, Upload, XCircle } from "lucide-react";

export default function Settings({ 
  settingsOpen, setSettingsOpen, settingsPass, setSettingsPass,
  err, errType, setErr, goHome, generateWithAI, generating,
  rates, setRates, persist, uploadImg, resetAll, fmt, S 
}) {
  
  if (!settingsOpen) {
    return (
      <div className="fade" style={{ textAlign: "center", paddingTop: 32 }}>
        <div style={S.lockBox}><Lock style={{ width: 24, height: 24, color: "#C8A84B" }} /></div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 22, color: "#1a1a2e", marginBottom: 6 }}>Acceso Parental</h2>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#9a8f7e", marginBottom: 24 }}>Ingresa la clave de configuración</p>
        
        {err && <p style={S.errBanner}>{err}</p>}
        
        <input 
          type="password" 
          value={settingsPass} 
          placeholder="Contraseña"
          onChange={e => { setSettingsPass(e.target.value); setErr(""); }}
          onKeyDown={e => e.key === "Enter" && (settingsPass === "camboropaes" ? setSettingsOpen(true) : setErr("Clave incorrecta"))}
          style={{ ...S.loginInput, marginBottom: 12 }}
        />
        
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={goHome} style={{ ...S.btnGhost, flex: 1 }}>Volver</button>
          <button 
            onClick={() => settingsPass === "camboropaes" ? setSettingsOpen(true) : setErr("Clave incorrecta")} 
            style={{ ...S.btnPrimary, flex: 2 }}
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 20, color: "#1a1a2e" }}>Configuración</h2>
        <button onClick={() => { setSettingsOpen(false); goHome(); }} style={S.closeBtn}>✕</button>
      </div>

      {/* IA de Generación */}
      <div style={{ background: "#fff", border: "1px solid #E8E5DC", borderLeft: "4px solid #C8A84B", borderRadius: "0 12px 12px 0", padding: 18, marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Sparkles style={{ width: 15, height: 15, color: "#C8A84B" }} />
          <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>Generar Preguntas con IA</p>
        </div>
        
        {err && (
          <p style={{ 
            ...S.errBanner, 
            borderColor: errType === "success" ? "#86efac" : "#fca5a5", 
            background: errType === "success" ? "#f0faf4" : "#fff5f5",
            color: errType === "success" ? "#2d6a4f" : "#991b1b",
            width: "100%", maxWidth: "none"
          }}>{err}</p>
        )}

        <button onClick={generateWithAI} disabled={generating} style={generating ? S.btnDisabled : S.btnPrimary}>
          {generating ? <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> : <Wand2 style={{ width: 14, height: 14 }} />}
          {generating ? "Generando..." : "Generar 3 Preguntas PAES"}
        </button>
      </div>

      {/* Valores CLP */}
      <div style={{ background: "#fff", border: "1px solid #E8E5DC", borderRadius: 12, padding: 16, marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#9a8f7e", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, marginBottom: 14 }}>Valor por dificultad (CLP)</p>
        {["Fácil", "Intermedio", "Difícil"].map(key => (
          <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{key}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => { const u = { ...rates, [key]: Math.max(0, (rates[key] || 0) - 50) }; setRates(u); persist({ rates: u }); }} style={S.btnSmall}>−</button>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, fontSize: 14, minWidth: 60, textAlign: "center" }}>{fmt(rates[key])}</span>
              <button onClick={() => { const u = { ...rates, [key]: (rates[key] || 0) + 50 }; setRates(u); persist({ rates: u }); }} style={S.btnSmall}>+</button>
            </div>
          </div>
        ))}
      </div>

      {/* Multimedia */}
      <div style={{ background: "#fff", border: "1px solid #E8E5DC", borderRadius: 12, padding: 16, marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#9a8f7e", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, marginBottom: 12 }}>Multimedia</p>
        {[{ label: "Imagen de acierto ✓", t: "success" }, { label: "Imagen de error ✗", t: "error" }, { label: "Icono de la app", t: "icon" }].map(item => (
          <label key={item.t} style={{ display: "flex", alignItems: "center", gap: 12, background: "#FAFAF7", border: "1px solid #E8E5DC", borderRadius: 9, padding: "10px 14px", marginBottom: 8, cursor: "pointer" }}>
            <Upload style={{ width: 13, height: 13, color: "#9a8f7e" }} />
            <span style={{ fontSize: 13 }}>{item.label}</span>
            <input type="file" style={{ display: "none" }} accept="image/*" onChange={e => uploadImg(e, item.t)} />
          </label>
        ))}
      </div>

      <button onClick={resetAll} style={{ width: "100%", background: "#fff5f5", border: "1px solid #fca5a5", color: "#991b1b", borderRadius: 11, padding: "13px", fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
        Reiniciar Todo el Progreso
      </button>
      <button onClick={() => { setSettingsOpen(false); goHome(); }} style={{ ...S.btnGhost, width: "100%" }}>Cerrar</button>
    </div>
  );
}