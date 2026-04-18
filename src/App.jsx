import { useState, useEffect, useMemo } from "react";
import { Trophy, Settings, ChevronRight, Brain, Lock, History, Send, Layers, Loader2, Sparkles, Upload, Wand2, ArrowLeft, Zap, XCircle, CheckCircle } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import Header from "./Header";
import Results from "./Results";
import FeedbackModal from "./FeedbackModal";
import AdminPanel from "./AdminPanel";
import Login from "./Login";
import Home from "./Home";
import QuestionView from "./QuestionView";

import { STATIC_QUESTIONS, DIFF, RATES, AI_SYSTEM, AI_USER } from "./questions";
/* 17/04*/
const DOC_REF = doc(db, "progreso", "usuario-principal");
const fmt = (v) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(v);

const DIFF_LIGHT = {
  Fácil: { color: "#2d6a4f", bg: "#d8f3dc", border: "#b7e4c7" },
  Intermedio: { color: "#92601a", bg: "#fef3c7", border: "#fcd34d" },
  Difícil: { color: "#991b1b", bg: "#fee2e2", border: "#fca5a5" },
};

export default function App() {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("login");
  const [balance, setBalance] = useState(0);
  const [completedIds, setCompleted] = useState([]);
  const [attemptedIds, setAttempted] = useState([]);
  const [extraQs, setExtraQs] = useState([]);
  const [appIcon, setAppIcon] = useState(null);
  const [successImage, setSuccessImage] = useState(null);
  const [errorImage, setErrorImage] = useState(null);
  const [isReview, setIsReview] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(null);
  const [showExp, setShowExp] = useState(false);
  const [correct, setCorrect] = useState(null);
  const [loginPass, setLoginPass] = useState("");
  const [settingsPass, setSettingsPass] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [err, setErr] = useState("");
  const [errType, setErrType] = useState("error");
  const [generating, setGenerating] = useState(false);
  const [rates, setRates] = useState({ Fácil: 100, Intermedio: 300, Difícil: 500 });

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(DOC_REF);
        if (snap.exists()) {
          const d = snap.data();
          if (d.balance !== undefined) setBalance(d.balance);
          if (d.completedIds) setCompleted(d.completedIds);
          if (d.attemptedIds) setAttempted(d.attemptedIds);
          if (d.extraQs) setExtraQs(d.extraQs);
          if (d.appIcon) setAppIcon(d.appIcon);
          if (d.successImage) setSuccessImage(d.successImage);
          if (d.errorImage) setErrorImage(d.errorImage);
          if (d.rates) setRates(d.rates);
        }
      } catch (e) { console.error("Error cargando datos:", e); }
      setReady(true);
    })();
  }, []);

  const persist = async (patch) => {
    const state = { balance, completedIds, attemptedIds, extraQs, appIcon, successImage, errorImage, rates, ...patch };
    try { await setDoc(DOC_REF, state); }
    catch (e) { console.error("Error guardando datos:", e); }
  };

  const allQs = useMemo(() => [...STATIC_QUESTIONS, ...extraQs], [extraQs]);
  const available = useMemo(() =>
    isReview ? allQs : allQs.filter(q => !attemptedIds.includes(q.id)),
    [allQs, attemptedIds, isReview]);
  const currentQ = available[qIdx] || null;

  const goHome = () => {
    setView("home"); setSelected(null); setConfirmed(null);
    setShowExp(false); setCorrect(null); setErr("");
  };

  const confirmAnswer = async () => {
    if (!selected || showExp || !currentQ) return;
    const isC = selected === currentQ.correct;
    const rate = rates[currentQ.difficulty] || 100;
    setCorrect(isC); setConfirmed(selected); setShowExp(true);
    const newAttempted = attemptedIds.includes(currentQ.id) ? attemptedIds : [...attemptedIds, currentQ.id];
    const newCompleted = (isC && !completedIds.includes(currentQ.id)) ? [...completedIds, currentQ.id] : completedIds;
    const newBalance = isC && !completedIds.includes(currentQ.id) ? balance + rate
      : !isC && !completedIds.includes(currentQ.id) ? Math.max(0, balance - rate * 0.5)
        : balance;
    setAttempted(newAttempted); setCompleted(newCompleted); setBalance(newBalance);
    await persist({ balance: newBalance, completedIds: newCompleted, attemptedIds: newAttempted });
  };

  const nextQ = () => {
    if (available.length === 0) { setView("results"); return; }
    setQIdx(isReview ? (p => (p + 1) % available.length) : 0);
    setSelected(null); setConfirmed(null); setShowExp(false); setCorrect(null);
  };

 const generateWithAI = async () => {
    if (generating) return;
    setGenerating(true); setErr(""); setErrType("error");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: AI_SYSTEM,
          messages: [{ role: "user", content: AI_USER }]
        })
      });

      if (!res.ok) throw new Error(`Error servidor: ${res.status}`);

      const data = await res.json();
      
      // --- Lógica de extracción inteligente ---
      let parsed;
      if (data.questions) {
        // Caso 1: La API ya devolvió el JSON limpio
        parsed = data;
      } else {
        // Caso 2: La respuesta viene con texto extra (Claude/OpenAI raw)
        const text = data.content?.map(b => b.text).join("") || data.text || JSON.stringify(data);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("La IA no envió un formato válido");
        parsed = JSON.parse(jsonMatch[0]);
      }

      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error("Formato de preguntas incorrecto");
      }

      const ts = Date.now();
      const newQs = parsed.questions.map((q, i) => ({ ...q, id: `gen_${ts}_${i}` }));
      const updated = [...extraQs, ...newQs];
      
      setExtraQs(updated);
      await persist({ extraQs: updated });
      
      setErrType("success");
      setErr(`✓ ${newQs.length} preguntas añadidas correctamente`);
    } catch (e) {
      console.error("Error IA:", e);
      setErrType("error");
      setErr(`Error: ${e.message}`);
    } finally { setGenerating(false); }
  };

  const uploadImg = (e, type) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const b64 = reader.result;
      if (type === "icon") { setAppIcon(b64); await persist({ appIcon: b64 }); }
      if (type === "success") { setSuccessImage(b64); await persist({ successImage: b64 }); }
      if (type === "error") { setErrorImage(b64); await persist({ errorImage: b64 }); }
    };
    reader.readAsDataURL(file);
  };

  const resetAll = async () => {
    if (!confirm("¿Reiniciar todo el progreso?")) return;
    setBalance(0); setCompleted([]); setAttempted([]);
    await persist({ balance: 0, completedIds: [], attemptedIds: [] });
    goHome();
  };

  const accuracy = attemptedIds.length > 0 ? Math.round((completedIds.length / attemptedIds.length) * 100) : 0;

  if (!ready) return (
    <div style={S.center}>
      <Loader2 style={{ width: 32, height: 32, color: "#C8A84B", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        button{cursor:pointer;border:none;font-family:'DM Sans',sans-serif}
        input{font-family:'DM Sans',sans-serif;color:#1a1a2e}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes modalIn{from{opacity:0;transform:translate(-50%,-48%) scale(0.95)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
        .fade{animation:fadeUp 0.3s ease}
        button:disabled{cursor:not-allowed}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#f0ede4}
        ::-webkit-scrollbar-thumb{background:#C8A84B55;border-radius:4px}
        input::placeholder{color:#bbb5a8}
      `}</style>

      {view === "login" && (
        <Login
          loginPass={loginPass}
          setLoginPass={setLoginPass}
          setView={setView}
          setErr={setErr}
          err={err}
          appIcon={appIcon}
          S={S}
        />
      )}

      {view !== "login" && (
        <>
          <Header
            appIcon={appIcon}
            attemptedIds={attemptedIds}
            allQs={allQs}
            balance={balance}
            fmt={fmt}
            S={S}
          />

          <div style={S.body}>

            {view === "home" && (
              <Home
                attemptedIds={attemptedIds}
                allQs={allQs}
                completedIds={completedIds}
                accuracy={accuracy}
                available={available}
                setIsReview={setIsReview}
                setQIdx={setQIdx}
                setView={setView}
                S={S}
              />
            )}

            {view === "test" && currentQ && (
              <QuestionView
                currentQ={currentQ}
                goHome={goHome}
                confirmAnswer={confirmAnswer}
                selected={selected}
                setSelected={setSelected}
                showExp={showExp}
                confirmed={confirmed}
                correct={correct}
                nextQ={nextQ}
                successImage={successImage}
                errorImage={errorImage}
                DIFF_LIGHT={DIFF_LIGHT}
                S={S}
              />
            )}

            {view === "settings" && (
              <AdminPanel
                settingsOpen={settingsOpen}
                setSettingsOpen={setSettingsOpen}
                settingsPass={settingsPass}
                setSettingsPass={setSettingsPass}
                err={err}
                errType={errType}
                setErr={setErr}
                goHome={goHome}
                generateWithAI={generateWithAI}
                generating={generating}
                rates={rates}
                setRates={setRates}
                persist={persist}
                uploadImg={uploadImg}
                resetAll={resetAll}
                fmt={fmt}
                S={S}
              />
            )}

            {view === "results" && (
              <Results
                balance={balance}
                completedIds={completedIds}
                accuracy={accuracy}
                fmt={fmt}
                goHome={goHome}
                S={S}
              />
            )}

          </div>

          <div style={{ textAlign: "center", padding: "18px", fontSize: 10, color: "#ccc4b5", letterSpacing: "0.12em", textTransform: "uppercase", borderTop: "1px solid #E8E5DC", fontFamily: "'DM Sans',sans-serif" }}>
            PAES Study · 2025
          </div>
        </>
      )}
    </div>
  );
}

const S = {
  root: { minHeight: "100vh", background: "#FAFAF7", fontFamily: "'DM Sans',sans-serif", color: "#1a1a2e" },
  center: { minHeight: "100vh", background: "#FAFAF7", display: "flex", alignItems: "center", justifyContent: "center" },
  loginWrap: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, background: "#FAFAF7" },
  loginIconBox: { width: 78, height: 78, background: "#1a1a2e", border: "3px solid #C8A84B", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, overflow: "hidden" },
  eyebrow: { fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C8A84B", marginBottom: 10 },
  bigTitle: { fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 52, lineHeight: 1, textAlign: "center", color: "#1a1a2e", marginBottom: 10 },
  subtitle: { fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#9a8f7e", marginBottom: 32, textAlign: "center" },
  loginInput: { width: "100%", maxWidth: 320, background: "#fff", border: "1px solid #E8E5DC", borderRadius: 11, padding: "14px 18px", fontSize: 15, color: "#1a1a2e", textAlign: "center", letterSpacing: "0.3em", outline: "none", marginBottom: 12, display: "block", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  errBanner: { background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 9, padding: "9px 14px", fontSize: 12, color: "#991b1b", textAlign: "center", marginBottom: 12, width: "100%", maxWidth: 320, fontFamily: "'DM Sans',sans-serif" },
  btnPrimary: { width: "100%", maxWidth: 320, background: "#1a1a2e", color: "#F5F0E8", fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 15, padding: "15px 20px", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 2px 8px rgba(26,26,46,0.18)" },
  btnSecondary: { width: "100%", background: "#fff", border: "1px solid #E8E5DC", color: "#1a1a2e", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 14, padding: "13px 18px", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  btnGhost: { background: "transparent", border: "1px solid #E8E5DC", color: "#9a8f7e", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: 13, padding: "11px 16px", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  btnDisabled: { width: "100%", maxWidth: 320, background: "#E8E5DC", color: "#bbb5a8", fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 15, padding: "15px 20px", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  header: { background: "#1a1a2e", borderBottom: "3px solid #C8A84B", padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "fixed", top: 0, left: 0, right: 0, zIndex: 40, boxShadow: "0 4px 20px rgba(26,26,46,0.25)" },
  headerIcon: { width: 40, height: 40, background: "rgba(200,168,75,0.15)", border: "1px solid rgba(200,168,75,0.4)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  balancePill: { background: "#C8A84B", padding: "7px 16px", borderRadius: 20 },
  body: { maxWidth: "95%", margin: "0 auto", padding: "24px 18px", paddingTop: "100px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 },
  statCard: { background: "#fff", border: "1px solid #E8E5DC", borderRadius: 13, padding: "14px 10px", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  progWrap: { height: 5, background: "#E8E5DC", borderRadius: 4, overflow: "hidden", marginBottom: 7 },
  progBar: { height: "100%", background: "linear-gradient(90deg,#C8A84B,#2d6a4f)", borderRadius: 4, transition: "width 0.5s ease" },
  backBtn: { background: "#fff", border: "1px solid #E8E5DC", borderRadius: 9, padding: "7px 9px", display: "flex", alignItems: "center", color: "#9a8f7e", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  passage: { background: "#fff", borderLeft: "4px solid #C8A84B", borderTop: "1px solid #E8E5DC", borderRight: "1px solid #E8E5DC", borderBottom: "1px solid #E8E5DC", borderRadius: "0 12px 12px 0", padding: "16px 18px", marginBottom: 18, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" },
  lockBox: { width: 60, height: 60, background: "#fffbf0", border: "2px solid #C8A84B", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" },
  closeBtn: { background: "#fff", border: "1px solid #E8E5DC", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#9a8f7e", fontSize: 13, cursor: "pointer" },
  modalBackdrop: { position: "fixed", inset: 0, background: "rgba(26,26,46,0.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", zIndex: 50 },
  modalCard: { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 51, width: "calc(100% - 48px)", maxWidth: 380, border: "2px solid", borderRadius: 24, padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, animation: "modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards", boxShadow: "0 24px 60px rgba(0,0,0,0.15)" },
};
