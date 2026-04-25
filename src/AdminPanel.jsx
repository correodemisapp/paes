import React from 'react';
import { 
  Sparkles, Loader2, Wand2, Lock, Upload, XCircle, 
  ChevronLeft, Trash2, Settings as SettingsIcon, 
  ChevronRight 
} from "lucide-react";

export default function AdminPanel({ 
  settingsOpen, setSettingsOpen, settingsPass, setSettingsPass,
  err, errType, setErr, goHome, generateWithAI, generating,
  rates, setRates, persist, uploadImg, resetAll, fmt, S = {}
}) {
  
  const containerStyle = {
    maxWidth: "420px", 
    margin: "0 auto", 
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center", 
    textAlign: "center",
    padding: "0 20px"
  };

  // VISTA BLOQUEADA (Acceso Parental)
  if (!settingsOpen) {
    return (
      <div className="fade" style={containerStyle}>
        <div style={{ ...S.lockBox, width: 70, height: 70, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Lock size={30} color="var(--accent)" />
        </div>
        <h2 style={{ color: "var(--accent)", fontSize: 24, marginBottom: 8 }}>Acceso Parental</h2>
        <p style={{ color: "var(--text-sec)", marginBottom: 32 }}>Ingresa la clave para configurar el sistema</p>
        <input 
          type="password" value={settingsPass} onChange={e => setSettingsPass(e.target.value)}
          placeholder="Clave Maestra"
          style={{ ...S.loginInput, background: "var(--bg-card)", color: "var(--text-main)", borderColor: "var(--border-passage)" }}
          onKeyDown={e => e.key === "Enter" && settingsPass === "camboropaes" && setSettingsOpen(true)}
        />
        <button 
          onClick={() => settingsPass === "camboropaes" ? setSettingsOpen(true) : setErr("Clave incorrecta")}
          style={{ ...S.btnPrimary, width: "100%", marginTop: 16 }}
        >
          Desbloquear Panel
        </button>
        <button onClick={goHome} style={{ marginTop: 20, color: "var(--text-sec)", fontSize: 13, display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer" }}>
          <ChevronLeft size={14} /> Volver al Inicio
        </button>
      </div>
    );
  }

  // VISTA PANEL DESBLOQUEADO
  return (
    <div className="fade" style={containerStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32, width: "100%" }}>
        <div style={{ ...S.lockBox, width: 45, height: 45, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SettingsIcon size={20} color="var(--accent)" />
        </div>
        <div style={{ textAlign: "left" }}>
          <h2 style={{ color: "var(--accent)", fontSize: 20, margin: 0 }}>Configuración</h2>
          <p style={{ color: "var(--text-sec)", fontSize: 12, margin: 0 }}>Control de economía y recursos</p>
        </div>
      </div>

      {/* SECCIÓN: IA */}
      <div style={{ width: "100%", background: "var(--bg-card)", padding: 20, borderRadius: 18, border: "1px solid var(--border-passage)", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Wand2 size={16} color="var(--accent)" />
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-main)" }}>Generador de Contenido</span>
        </div>
        <button 
          onClick={generateWithAI} disabled={generating}
          style={{ ...S.btnPrimary, width: "100%", height: 50, opacity: generating ? 0.7 : 1 }}
        >
          {generating ? <Loader2 className="spin" /> : <Sparkles size={18} style={{ marginRight: 8 }} />}
          {generating ? "Generando Preguntas..." : "Generar 3 Preguntas con IA"}
        </button>
        {err && <p style={{ color: errType === "error" ? "#ef4444" : "#22c55e", fontSize: 12, marginTop: 12 }}>{err}</p>}
      </div>

      {/* SECCIÓN: TARIFAS */}
      <div style={{ width: "100%", marginBottom: 32, textAlign: "left" }}>
        <p style={{ color: "var(--text-sec)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, marginLeft: 4 }}>
          Tarifas de Recompensa (CLP)
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {Object.entries(rates).map(([label, val]) => (
            <div key={label} className="admin-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border-passage)", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
              <span style={{ fontSize: 10, color: "var(--text-sec)", display: "block", marginBottom: 4 }}>{label}</span>
              <input 
                type="number" value={val} 
                onChange={e => { const n = { ...rates, [label]: Number(e.target.value) }; setRates(n); persist({ rates: n }); }}
                style={{ width: "100%", background: "transparent", border: "none", textAlign: "center", fontWeight: 700, fontSize: 14, color: "var(--text-main)", outline: "none" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN: IMÁGENES */}
      <div style={{ width: "100%", marginBottom: 32, textAlign: "left" }}>
        <p style={{ color: "var(--text-sec)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, marginLeft: 4 }}>
          Carga de Imágenes Personalizadas
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "Icono de Aplicación", t: "icon" },
            { label: "Imagen de Éxito", t: "success" },
            { label: "Imagen de Error", t: "error" }
          ].map(item => (
            <label key={item.t} className="admin-card" style={{ 
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "var(--bg-card)", border: "1px solid var(--border-passage)", 
              borderRadius: "12px", padding: "12px 16px", cursor: "pointer" 
            }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-main)" }}>{item.label}</span>
              <Upload size={14} color="var(--accent)" />
              <input type="file" style={{ display: "none" }} accept="image/*" onChange={e => uploadImg(e, item.t)} />
            </label>
          ))}
        </div>
      </div>

      {/* SECCIÓN: ACCIONES DE PELIGRO */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
        <button 
          className="home-card" 
          onClick={resetAll} 
          style={{ 
            width: "100%", 
            background: "rgba(255, 245, 245, 0.5)", 
            border: "1px solid #fca5a5", 
            color: "#991b1b", 
            borderRadius: "14px", 
            padding: "14px", 
            fontSize: 13, 
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          }}
        >
          <Trash2 size={14} /> Reiniciar Todo el Progreso
        </button>

        {/* BOTÓN: CERRAR CONFIGURACIÓN (Formato Tarjeta Premium) */}
        <button 
          className="home-card"
          onClick={() => { setSettingsOpen(false); goHome(); }} 
          style={{ 
            ...S.btnGhost, 
            width: "100%", 
            height: 48, 
            background: "var(--bg-card)",
            border: "1px solid var(--border-ghost)", 
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start", 
            gap: 12,
            padding: "0 16px",
            marginBottom: 40
          }}
        >
          <XCircle style={{ width: 16, height: 16, color: "var(--text-ghost)" }} />
          <span style={{ 
            fontSize: 13, 
            fontWeight: 600, 
            color: "var(--text-ghost)" 
          }}>
            Cerrar Sesión Parental
          </span>
          <ChevronRight style={{ 
            width: 16, 
            height: 16, 
            marginLeft: "auto", 
            opacity: 0.3, 
            color: "var(--text-ghost)" 
          }} />
        </button>
      </div>
    </div>
  );
}