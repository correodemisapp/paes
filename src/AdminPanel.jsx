import React from 'react';
import { 
  Sparkles, Loader2, Wand2, Lock, Upload, XCircle, 
  ChevronLeft, Trash2, Settings as SettingsIcon, 
  ChevronRight 
} from "lucide-react";

export default function AdminPanel({ 
  settingsOpen, setSettingsOpen, settingsPass, setSettingsPass,
  err, errType, setErr, goHome, generateWithAI, generating,
  rates, setRates, persist, uploadImg, resetAll, fmt, S = {},
  showResetConfirm, setShowResetConfirm
}) {
  
  const containerStyle = {
    maxWidth: "420px", margin: "0 auto", display: "flex", 
    flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 20px"
  };

  if (!settingsOpen) {
    return (
      <div className="fade" style={containerStyle}>
        <div style={{ ...S.lockBox, width: 70, height: 70, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Lock size={30} color="var(--accent)" />
        </div>
        <h2 style={{ color: "var(--accent)", fontSize: 24, marginBottom: 8 }}>Acceso Parental</h2>
        <input 
          type="password" value={settingsPass} onChange={e => setSettingsPass(e.target.value)}
          placeholder="Clave Maestra"
          style={{ ...S.loginInput, background: "var(--bg-card)", color: "var(--text-main)" }}
          onKeyDown={e => e.key === "Enter" && settingsPass === "camboropaes" && setSettingsOpen(true)}
        />
        <button 
          onClick={() => settingsPass === "camboropaes" ? setSettingsOpen(true) : setErr("Clave incorrecta")}
          style={{ ...S.btnPrimary, width: "100%", marginTop: 16 }}
        >
          Desbloquear Panel
        </button>
      </div>
    );
  }

  return (
    <div className="fade" style={containerStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32, width: "100%" }}>
        <SettingsIcon size={20} color="var(--accent)" />
        <h2 style={{ color: "var(--accent)", fontSize: 20, margin: 0 }}>Configuración</h2>
      </div>

      {/* GENERADOR IA */}
      <div style={{ width: "100%", background: "var(--bg-card)", padding: 20, borderRadius: 18, border: "1px solid var(--border-passage)", marginBottom: 20 }}>
        <button 
          onClick={generateWithAI} disabled={generating}
          style={{ ...S.btnPrimary, width: "100%", height: 50, opacity: generating ? 0.7 : 1 }}
        >
          {generating ? <Loader2 className="spin" size={18} /> : <Sparkles size={18} style={{ marginRight: 8 }} />}
          {generating ? "Generando..." : "Generar 3 Preguntas con IA"}
        </button>
        {err && <p style={{ color: errType === "error" ? "#ef4444" : "#22c55e", fontSize: 12, marginTop: 12 }}>{err}</p>}
      </div>

      {/* TARIFAS */}
      <div style={{ width: "100%", marginBottom: 32 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {Object.entries(rates).map(([label, val]) => (
            <div key={label} style={{ background: "var(--bg-card)", border: "1px solid var(--border-passage)", borderRadius: 12, padding: 10 }}>
              <span style={{ fontSize: 10, color: "var(--text-sec)" }}>{label}</span>
              <input 
                type="number" value={val} 
                onChange={e => { const n = { ...rates, [label]: Number(e.target.value) }; setRates(n); persist({ rates: n }); }}
                style={{ width: "100%", background: "transparent", border: "none", textAlign: "center", color: "var(--text-main)", fontWeight: 700 }}
              />
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => setShowResetConfirm(true)} style={{ width: "100%", color: "#991b1b", padding: 14, borderRadius: 14, border: "1px solid #fca5a5", fontSize: 13, background: "none", cursor: "pointer" }}>
        Reiniciar Progreso
      </button>

      <button onClick={() => { setSettingsOpen(false); goHome(); }} style={{ ...S.btnGhost, width: "100%", marginTop: 20 }}>
        Cerrar Sesión Parental
      </button>

      {/* MODAL DE CONFIRMACIÓN */}
      {showResetConfirm && (
        <div style={S.modalBackdrop} onClick={() => setShowResetConfirm(false)}>
          <div 
            className="fade"
            onClick={e => e.stopPropagation()}
            style={{
              background: "var(--bg-card)",
              border: "2px solid #fca5a5",
              borderRadius: 24,
              padding: "32px 24px",
              width: "calc(100% - 48px)",
              maxWidth: 340,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              textAlign: "center",
              boxShadow: "0 24px 60px rgba(0,0,0,0.2)"
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "#fff5f5", border: "2px solid #fca5a5",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Trash2 size={24} color="#991b1b" />
            </div>

            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#991b1b", margin: 0 }}>
              ¿Reiniciar progreso?
            </h3>

            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--text-sec)", lineHeight: 1.5, margin: 0 }}>
              Se eliminarán todas las preguntas respondidas, el saldo acumulado y el historial. Esta acción no se puede deshacer.
            </p>

            <div style={{ display: "flex", gap: 10, width: "100%", marginTop: 8 }}>
              <button
                onClick={() => setShowResetConfirm(false)}
                style={{ ...S.btnSecondary, flex: 1, background: "var(--bg-app)", border: "2px solid var(--border-ghost)", color: "var(--text-main)" }}
              >
                Cancelar
              </button>
              <button
                onClick={resetAll}
                style={{ flex: 1, background: "#991b1b", color: "#fff", fontWeight: 700, fontSize: 14, padding: "13px 18px", borderRadius: 11, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <Trash2 size={15} /> Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}