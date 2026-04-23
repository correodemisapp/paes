// Colores de dificultad
export const DIFF_LIGHT = {
  Fácil: { color: "#2d6a4f", bg: "#d8f3dc", border: "#b7e4c7" },
  Intermedio: { color: "#92601a", bg: "#fef3c7", border: "#fcd34d" },
  Difícil: { color: "#991b1b", bg: "#fee2e2", border: "#fca5a5" },
};

// Objeto principal de estilos
export const S = {
  root: { minHeight: "100vh", background: "#FAFAF7", fontFamily: "'DM Sans',sans-serif", color: "#1a1a2e" },
  center: { minHeight: "100vh", background: "#FAFAF7", display: "flex", alignItems: "center", justifyContent: "center" },

  // Login y Accesos
  loginWrap: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, background: "#FAFAF7" },
  loginIconBox: { width: 78, height: 78, background: "#1a1a2e", border: "3px solid #C8A84B", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, overflow: "hidden" },
  eyebrow: { fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C8A84B", marginBottom: 10 },
  bigTitle: { fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 52, lineHeight: 1, textAlign: "center", color: "#1a1a2e", marginBottom: 10 },

  loginInput: {
    width: "100%", maxWidth: 320, background: "#fff",
    border: "2px solid #C8A84B", borderRadius: 14,
    padding: "16px 18px", fontSize: "18px", color: "#1a1a2e",
    textAlign: "center", letterSpacing: "0.3em", outline: "none",
    marginBottom: 12, display: "block",
    boxShadow: "0 4px 12px rgba(200, 168, 75, 0.15)",
    transition: "all 0.2s ease"
  },

  errBanner: { background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 9, padding: "9px 14px", fontSize: 12, color: "#991b1b", textAlign: "center", marginBottom: 12, width: "100%", maxWidth: 320 },

  // Botones
  btnPrimary: { width: "100%", maxWidth: 320, background: "#1a1a2e", color: "#F5F0E8", fontWeight: 700, fontSize: 16, padding: "16px 20px", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(26,26,46,0.2)" },
  btnSecondary: { width: "100%", background: "#fff", border: "1px solid #E8E5DC", color: "#1a1a2e", fontWeight: 600, fontSize: 14, padding: "13px 18px", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  btnGhost: { background: "transparent", border: "1px solid #E8E5DC", color: "#9a8f7e", fontWeight: 500, fontSize: 13, padding: "11px 16px", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  btnDisabled: { width: "100%", maxWidth: 320, background: "#E8E5DC", color: "#bbb5a8", fontWeight: 700, fontSize: 15, padding: "15px 20px", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },

  // Header y Cuerpo
  header: { background: "#1a1a2e", borderBottom: "3px solid #C8A84B", padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "fixed", top: 0, left: 0, right: 0, zIndex: 40, boxShadow: "0 4px 20px rgba(26,26,46,0.25)" },
  headerIcon: { width: 40, height: 40, background: "rgba(200,168,75,0.15)", border: "1px solid rgba(200,168,75,0.4)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  balancePill: { background: "#C8A84B", padding: "7px 16px", borderRadius: 20 },
  body: { maxWidth: "95%", margin: "0 auto", padding: "24px 18px", paddingTop: "100px" },

  // Stats y Progreso
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 },
  statCard: { background: "#fff", border: "1px solid #E8E5DC", borderRadius: 13, padding: "14px 10px", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  progWrap: { height: 5, background: "#E8E5DC", borderRadius: 4, overflow: "hidden", marginBottom: 7 },
  progBar: { height: "100%", background: "linear-gradient(90deg,#C8A84B,#2d6a4f)", borderRadius: 4, transition: "width 0.5s ease" },

  // Test y Contenido
  backBtn: { background: "#fff", border: "1px solid #E8E5DC", borderRadius: 9, padding: "7px 9px", display: "flex", alignItems: "center", color: "#9a8f7e", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },

  // Contenedor que tiene el fondo hueso y las esquinas
  passageWrapper: {
    position: "relative",
    background: "#e5e3d8", // Tono hueso oscuro premium
    border: "1px solid #d1cfc1", // Borde muy delgado y sutil
    borderRadius: "12px",
    marginBottom: 24,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },

  // Área interna donde vive el texto y el scroll
  passageScroll: {
    maxHeight: "380px",
    overflowY: "auto",
    // 35px a la derecha para que el scroll tenga su propio espacio
    padding: "24px 35px 24px 20px",
    fontFamily: "'Inter', sans-serif",
    fontSize: "16px",
    lineHeight: "1.7",
    color: "#1a202c", // Casi negro para máxima legibilidad
    textAlign: "left",
    wordBreak: "break-word",
  },

  lockBox: { width: 60, height: 60, background: "#fffbf0", border: "2px solid #C8A84B", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" },
  closeBtn: { background: "#fff", border: "1px solid #E8E5DC", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#9a8f7e", fontSize: 13, cursor: "pointer" },

  // Modales (Feedback y Admin)
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(26,26,46,0.65)",
    backdropFilter: "blur(8px)",
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  modalCard: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 51,
    width: "calc(100% - 48px)",
    maxWidth: 420,
    background: "#fff",
    border: "2px solid",
    borderRadius: 28,
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 18,
    boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
    maxHeight: "85vh",
    overflowY: "auto",
    scrollBehavior: "smooth"
  },
};