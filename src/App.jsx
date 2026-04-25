import { useState, useEffect, useMemo } from "react";
import { 
  Trophy, Settings, ChevronRight, Brain, Lock, History, Send, 
  Layers, Loader2, Sparkles, Upload, Wand2, ArrowLeft, Zap, 
  XCircle, CheckCircle, Trash2, PlusCircle, Database
} from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

import Header from "./Header";
import Results from "./Results";
import FeedbackModal from "./FeedbackModal";
import AdminPanel from "./AdminPanel";
import Login from "./Login";
import Home from "./Home";
import QuestionView from "./QuestionView";

import { S, DIFF_LIGHT } from "./styles";
import { STATIC_QUESTIONS, DIFF, RATES, AI_SYSTEM, AI_USER } from "./questions";

const DOC_REF = doc(db, "progreso", "usuario-principal");

const fmt = (v) => new Intl.NumberFormat("es-CL", { 
  style: "currency", currency: "CLP", maximumFractionDigits: 0 
}).format(v);

export default function App() {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("login");
  const [balance, setBalance] = useState(0);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [fontSize, setFontSize] = useState(16);
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
  const [activeQ, setActiveQ] = useState(null);
  const [loginPass, setLoginPass] = useState("");
  const [settingsPass, setSettingsPass] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [err, setErr] = useState("");
  const [errType, setErrType] = useState("error");
  const [generating, setGenerating] = useState(false);
  const [rates, setRates] = useState({ Fácil: 50, Intermedio: 150, Difícil: 250 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snap = await getDoc(DOC_REF);
        if (snap.exists()) {
          const d = snap.data();
          if (d.balance !== undefined) setBalance(Number(d.balance));
          setCompleted(d.completedIds || []);
          setAttempted(d.attemptedIds || []);
          setExtraQs(d.extraQs || []);
          setAppIcon(d.appIcon || null);
          setSuccessImage(d.successImage || null);
          setErrorImage(d.errorImage || null);
          if (d.rates) setRates(d.rates);
        }
      } catch (e) { console.error("Error Firebase:", e); }
      finally { setReady(true); }
    };
    fetchData();
  }, []);

  const persist = async (patch) => {
    if (!ready) return;
    try { await setDoc(DOC_REF, patch, { merge: true }); }
    catch (e) { console.error("Error persistencia:", e); }
  };

  // --- FUNCIÓN GENERAR CON IA ---
 const generateWithAI = async () => {
  if (generating) return;
  setGenerating(true);
  setErr("");
  
  try {
    // Enviamos el System Prompt y el User Prompt definidos en questions.js
    const res = await fetch("/api/generate", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system: AI_SYSTEM,
        messages: [{ role: "user", content: AI_USER }]
      })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Fallo en la API");
    }
    
    const data = await res.json();
    const newQs = data.questions || [];
    
    if (newQs.length === 0) throw new Error("La IA no devolvió preguntas válidas");

    const updatedExtra = [...extraQs, ...newQs];
    setExtraQs(updatedExtra);
    await persist({ extraQs: updatedExtra });
    
    setErrType("success");
    setErr(`¡Éxito! Se generaron ${newQs.length} preguntas nuevas.`);
  } catch (e) {
    console.error("Error IA:", e);
    setErrType("error");
    setErr(e.message || "Error de conexión. Revisa los logs de Vercel.");
  } finally {
    setGenerating(false);
  }
};

  const allQs = useMemo(() => [...(STATIC_QUESTIONS || []), ...(extraQs || [])], [extraQs]);
  const available = useMemo(() => allQs.filter(q => !attemptedIds.includes(q.id)), [allQs, attemptedIds]);
  const reviewQs = useMemo(() => allQs.filter(q => attemptedIds.includes(q.id)), [allQs, attemptedIds]);

  useEffect(() => {
    if (ready && !activeQ) setActiveQ(isReview ? reviewQs[0] : available[0]);
  }, [ready, isReview, available, reviewQs, activeQ]);

  const goHome = () => { setView("home"); setSelected(null); setConfirmed(null); setShowExp(false); setCorrect(null); setErr(""); };

  const confirmAnswer = async () => {
    if (!selected || showExp || !activeQ) return;
    const isC = selected === activeQ.correct;
    const rate = rates[activeQ.difficulty] || 100;
    setCorrect(isC); setConfirmed(selected); setShowExp(true);
    if (isReview) return;
    const newAtt = [...new Set([...attemptedIds, activeQ.id])];
    const newComp = isC ? [...new Set([...completedIds, activeQ.id])] : completedIds;
    const newBal = isC ? balance + rate : Math.max(0, balance - (rate * 0.5));
    setAttempted(newAtt); setCompleted(newComp); setBalance(newBal);
    await persist({ balance: newBal, completedIds: newComp, attemptedIds: newAtt });
  };

  const nextQ = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelected(null); setConfirmed(null); setShowExp(false); setCorrect(null);
    if (isReview) {
      const nIdx = (qIdx + 1) % (reviewQs.length || 1);
      setQIdx(nIdx); setActiveQ(reviewQs[nIdx]);
    } else {
      if (available.length <= 1) { setView("results"); return; }
      setActiveQ(available[1]);
    }
  };

  const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light");
  const uploadImg = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
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
    if (window.confirm("¿Limpiar progreso?")) {
      await setDoc(DOC_REF, { balance: 0, attemptedIds: [], completedIds: [] }, { merge: true });
      setAttempted([]); setCompleted([]); setBalance(0); setView("home");
    }
  };

  const accuracy = attemptedIds.length > 0 ? Math.round((completedIds.length / attemptedIds.length) * 100) : 0;

  if (!ready) return <div style={S.center}><Loader2 className="spin" /></div>;

  return (
    <div style={{ ...S.root, backgroundColor: "var(--bg-app)", minHeight: "100vh" }} data-theme={theme}>
      <style>{`
        :root {
          --bg-app: #f8f8f6; --bg-card: #ffffff; --bg-passage: #e5e3d8;
          --text-main: #1a202c; --text-title: #1a1a2e; --text-sec: #718096;
          --accent: #C8A84B; --border-passage: #d1cfc1;
          --border-ghost: #a8a697; --text-ghost: #1a202c;
        }
        [data-theme='dark'] {
          --bg-app: #121212; --bg-card: #1e1e1e; --bg-passage: #252525;
          --text-main: #e2e8f0; --text-title: #60a5fa; --text-sec: #a0aec0;
          --accent: #d4af37; --border-passage: #333333;
          --border-ghost: #333333; --text-ghost: #d4af37;
        }
        .passage-wrapper { position: relative; background: var(--bg-passage) !important; border: 1px solid var(--border-passage) !important; border-radius: 12px; overflow: hidden; }
        .spin { animation: s 1s linear infinite; } @keyframes s { to { transform: rotate(360deg); } }
      `}</style>

      {view === "login" ? (
        <Login loginPass={loginPass} setLoginPass={setLoginPass} setView={setView} setErr={setErr} err={err} appIcon={appIcon} S={S} />
      ) : (
        <>
          <Header appIcon={appIcon} attemptedIds={attemptedIds} allQs={allQs} balance={balance} fmt={fmt} S={S} theme={theme} toggleTheme={toggleTheme} setFontSize={setFontSize} />
          <div style={S.body}>
            {view === "home" && <Home attemptedIds={attemptedIds} allQs={allQs} completedIds={completedIds} accuracy={accuracy} available={available} setIsReview={setIsReview} setQIdx={setQIdx} setView={setView} S={S} />}
            {view === "test" && activeQ && <QuestionView currentQ={activeQ} goHome={goHome} confirmAnswer={confirmAnswer} selected={selected} setSelected={setSelected} showExp={showExp} confirmed={confirmed} correct={correct} nextQ={nextQ} successImage={successImage} errorImage={errorImage} DIFF_LIGHT={DIFF_LIGHT} S={S} fontSize={fontSize} />}
            {view === "settings" && (
              <AdminPanel 
                settingsOpen={settingsOpen} setSettingsOpen={setSettingsOpen} 
                settingsPass={settingsPass} setSettingsPass={setSettingsPass} 
                err={err} errType={errType} setErr={setErr} goHome={goHome} 
                generateWithAI={generateWithAI} generating={generating}
                rates={rates} setRates={setRates} persist={persist} 
                uploadImg={uploadImg} resetAll={resetAll} fmt={fmt} S={S} 
              />
            )}
            {view === "results" && <Results balance={balance} completedIds={completedIds} accuracy={accuracy} fmt={fmt} goHome={goHome} S={S} />}
          </div>
        </>
      )}
    </div>
  );
}