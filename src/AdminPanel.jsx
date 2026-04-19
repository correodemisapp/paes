import React from 'react';
import { Sparkles, Loader2, Wand2, Lock, Upload, XCircle, ChevronLeft, Trash2, Coins, Settings as SettingsIcon, Image as ImageIcon } from "lucide-react";

export default function Settings({ 
  settingsOpen, setSettingsOpen, settingsPass, setSettingsPass,
  err, errType, setErr, goHome, generateWithAI, generating,
  rates, setRates, persist, uploadImg, resetAll, fmt, S ={}
}) {
  
  // Contenedor base para mantener la consecuencia visual
  const containerStyle = {
    maxWidth: "420px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center"
  };

  // VISTA BLOQUEADA (Acceso Parental)
  if (!settingsOpen) {
    return (
      <div className="fade" style={containerStyle}>
        <div style={{ ...(S?.lockBox || {}), width: 70, height: 70, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Lock size={30} color="#C8A84B" />
        </div>
        
        <h2 style={{ ...S?.bigTitle || {} , fontSize: 24, marginBottom: 8 }}>Acceso Parental</h2>
        <p style={{ ...S?.subtitle || {}, marginBottom: 32 }}>Ingresa la clave para configurar el sistema</p>
        
        {err && (
          <div style={{ ...S.errBanner, width: "100%", marginBottom: 16, backgroundColor: "#ffebee", color: "#c62828" }}>
            {err}
          </div>
        )}
        
        <input 
          type="password" 
          className="home-card"
          value={settingsPass} 
          placeholder="••••••••"
          onChange={e => { setSettingsPass(e.target.value); setErr(""); }}
          onKeyDown={e => e.key === "Enter" && (settingsPass === "camboropaes" ? setSettingsOpen(true) : setErr("Clave incorrecta"))}
          style={{ ...S.loginInput, textAlign: "center", fontSize: 20, letterSpacing: "0.2em", marginBottom: 20 }}
        />
        
        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          <button onClick={goHome} style={{ ...S.btnGhost, flex: 1, height: 50 }}>Volver</button>
          <button 
            className="home-card"
            onClick={() => settingsPass === "camboropaes" ? setSettingsOpen(true) : setErr("Clave incorrecta")} 
            style={{ ...S.btnPrimary, flex: 2, height: 50 }}
          >
            Desbloquear
          </button>
        </div>
      </div>
    );
  }

  // VISTA DESBLOQUEADA (Panel administrativo)
  return (
    <div className="fade" style={{ ...containerStyle, textAlign: "left", alignItems: "stretch" }}>
      
      {/* CABECERA UNIFICADA: ICONO + TEXTO + BOTÓN CERRAR */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: 32,
        width: "100%" 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          
          {/* Cuadro del Icono (Engranaje) */}
          <div style={{ 
            ...(S?.lockBox || {}), 
            width: 55, 
            height: 55, 
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(200, 168, 75, 0.08)" // Color sutil distintivo
          }}>
            <SettingsIcon size={26} color="#C8A84B" />
          </div>

          {/* Bloque de Títulos alineado matemáticamente */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h2 style={{ 
              ...S.bigTitle, 
              fontSize: 22, 
              margin: 0, 
              lineHeight: 1.1,
              padding: 0
            }}>
              Configuración
            </h2>
            <p style={{ 
              ...S.subtitle, 
              margin: 0, 
              padding: 0,
              marginTop: 2 
            }}>
              Panel de control administrativo
            </p>
          </div>
        </div>

        {/* Botón de Cierre (X) */}
        <button 
          onClick={() => { setSettingsOpen(false); goHome(); }} 
          style={{ 
            ...S.btnGhost, 
            width: 40, 
            height: 40, 
            padding: 0, 
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #E8E5DC",
            color: "#9a8f7e"
          }}
        >
          ✕
        </button>
      </div>

      {/* IA de Generación - Tarjeta Destacada */}
      <div className="home-card" style={{ 
        background: "white", 
        border: "1px solid #E8E5DC", 
        borderLeft: "4px solid #C8A84B", 
        borderRadius: "16px", 
        padding: 20, 
        marginBottom: 20,
        boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Sparkles size={18} color="#C8A84B" />
          <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 16, color: "#1a1a2e" }}>Generador de Preguntas</p>
        </div>
        
        {err && (
          <div style={{ 
            padding: "10px", 
            borderRadius: "8px", 
            fontSize: 12, 
            marginBottom: 16,
            backgroundColor: errType === "success" ? "#e8f5e9" : "#fff5f5",
            color: errType === "success" ? "#2d6a4f" : "#991b1b",
            border: `1px solid ${errType === "success" ? "#c8e6c9" : "#fca5a5"}`
          }}>{err}</div>
        )}

        <button 
          onClick={generateWithAI} 
          disabled={generating} 
          style={{ ...(generating ? S.btnDisabled : S.btnPrimary), width: "100%", height: 48 }}
        >
          {generating ? <Loader2 className="spin" size={18} /> : <Wand2 size={18} />}
          {generating ? "Procesando..." : "Generar 3 Preguntas PAES"}
        </button>
      </div>

      {/* Valores CLP */}
      <div className="home-card" style={{ background: "#fff", border: "1px solid #E8E5DC", borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <Coins size={16} color="#9a8f7e" />
          <p style={{ ...S.subtitle, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 0 }}>Recompensas CLP</p>
        </div>
        {["Fácil", "Intermedio", "Difícil"].map(key => (
          <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>{key}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => { const u = { ...rates, [key]: Math.max(0, (rates[key] || 0) - 50) }; setRates(u); persist({ rates: u }); }} style={{ ...S.btnSmall, width: 32, height: 32 }}>−</button>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, fontSize: 15, minWidth: 70, textAlign: "center" }}>{fmt(rates[key])}</span>
              <button onClick={() => { const u = { ...rates, [key]: (rates[key] || 0) + 50 }; setRates(u); persist({ rates: u }); }} style={{ ...S.btnSmall, width: 32, height: 32 }}>+</button>
            </div>
          </div>
        ))}
      </div>

      {/* Multimedia */}
      <div className="home-card" style={{ background: "#fff", border: "1px solid #E8E5DC", borderRadius: 16, padding: 20, marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <ImageIcon size={16} color="#9a8f7e" />
          <p style={{ ...S.subtitle, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 0 }}>Personalización Visual</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
          {[{ label: "Imagen de Acierto", t: "success" }, { label: "Imagen de Error", t: "error" }, { label: "Icono App", t: "icon" }].map(item => (
            <label key={item.t} className="home-card" style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between",
              background: "#FAFAF7", 
              border: "1px solid #E8E5DC", 
              borderRadius: "12px", 
              padding: "12px 16px", 
              cursor: "pointer" 
            }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1a2e" }}>{item.label}</span>
              <Upload size={14} color="#C8A84B" />
              <input type="file" style={{ display: "none" }} accept="image/*" onChange={e => uploadImg(e, item.t)} />
            </label>
          ))}
        </div>
      </div>

      {/* Botones de Acción Final */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button 
          className="home-card"
          onClick={resetAll} 
          style={{ width: "100%", background: "#fff5f5", border: "1px solid #fca5a5", color: "#991b1b", borderRadius: "14px", padding: "14px", fontSize: 13, fontWeight: 600 }}
        >
          <Trash2 size={14} style={{ marginRight: 8 }} /> Reiniciar Todo el Progreso
        </button>
        
        <button 
          className="home-card"
          onClick={() => { setSettingsOpen(false); goHome(); }} 
          style={{ ...S.btnGhost, width: "100%", height: 50 }}
        >
          <ChevronLeft size={16} /> Volver al Inicio
        </button>
      </div>

      <div style={{ marginTop: 40, textAlign: "center", opacity: 0.3, fontSize: 9, letterSpacing: "0.2em" }}>
        PAES STUDY SYSTEM v2.5
      </div>
    </div>
  );
}