import { useState, useEffect, useMemo } from "react";
import { 
  Trophy, Settings, ChevronRight, Brain, Lock, History, Send, 
  Layers, Loader2, Sparkles, Upload, Wand2, ArrowLeft, Zap, 
  XCircle, CheckCircle, Trash2, PlusCircle, Database
} from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// Importación de Componentes Locales
import Header from "./Header";
import Results from "./Results";
import FeedbackModal from "./FeedbackModal";
import AdminPanel from "./AdminPanel";
import Login from "./Login";
import Home from "./Home";
import QuestionView from "./QuestionView";

// Estilos y Constantes
import { S, DIFF_LIGHT } from "./styles";
import { STATIC_QUESTIONS, DIFF, RATES, AI_SYSTEM, AI_USER } from "./questions";

const DOC_REF = doc(db, "progreso", "usuario-principal");

const fmt = (v) => new Intl.NumberFormat("es-CL", { 
  style: "currency", 
  currency: "CLP", 
  maximumFractionDigits: 0 
}).format(v);

export default function App() {
  // --- 1. ESTADOS DE INFRAESTRUCTURA ---
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("login");
  const [balance, setBalance] = useState(0);
  
  // --- 2. ESTADOS DE TEMA Y UX ---
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light");
  
  // --- 3. ESTADOS DE DATOS ---
  const [completedIds, setCompleted] = useState([]);
  const [attemptedIds, setAttempted] = useState([]);
  const [extraQs, setExtraQs] = useState([]);
  const [appIcon, setAppIcon] = useState(null);
  const [successImage, setSuccessImage] = useState(null);
  const [errorImage, setErrorImage] = useState(null);
  
  // --- 4. ESTADOS DE NAVEGACIÓN ---
  const [isReview, setIsReview] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(null);
  const [showExp, setShowExp] = useState(false);
  const [correct, setCorrect] = useState(null);
  const [activeQ, setActiveQ] = useState(null);
  
  // --- 5. ESTADOS DE ADMIN ---
  const [loginPass, setLoginPass] = useState("");
  const [settingsPass, setSettingsPass] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [err, setErr] = useState("");
  const [errType, setErrType] = useState("error");
  const [generating, setGenerating] = useState(false);
  const [rates, setRates] = useState({ Fácil: 50, Intermedio: 150, Difícil: 250 });

  // --- 6. CARGA INICIAL ---
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

  // --- 7. LÓGICA DE FILTRADO ---
  const allQs = useMemo(() => [...(STATIC_QUESTIONS || []), ...(extraQs || [])], [extraQs]);
  const available = useMemo(() => allQs.filter(q => !attemptedIds.includes(q.id)), [allQs, attemptedIds]);
  const reviewQs = useMemo(() => allQs.filter(q => attemptedIds.includes(q.id)), [allQs, attemptedIds]);

  useEffect(() => {
    if (ready && !activeQ) {
      setActiveQ(isReview ? reviewQs[0] : available[0]);
    }
  }, [ready, isReview, available, reviewQs, activeQ]);

  const goHome = () => { setView("home"); setSelected(null); setConfirmed(null); setShowExp(false); setCorrect(null); setErr(""); };

  const confirmAnswer = async () => {
    if (!selected || showExp || !activeQ) return;
    const isC = selected === activeQ.correct;
    const rate = rates[activeQ.difficulty] || 100;
    const newBal = isC ? balance + rate : Math.max(0, balance - (rate * 0.5));
    
    setCorrect(isC); setConfirmed(selected); setShowExp(true);
    setBalance(newBal); // Actualización optimista del balance
    
    if (isReview) return;

    const newAtt = [...new Set([...attemptedIds, activeQ.id])];
    const newComp = isC ? [...new Set([...completedIds, activeQ.id])] : completedIds;

    setAttempted(newAtt); setCompleted(newComp); 
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

  if (!ready) return <div style={S.center}><Loader2 className="spin" /><style>{`.spin{animation:s 1s linear infinite}@keyframes s{to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <div style={{ ...S.root, backgroundColor: "var(--bg-app)", minHeight: "100vh" }} data-theme={theme}>
      
      {/* BLOQUE DE ESTILOS MAESTRO (CON TODOS LOS FIXES) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

        /* --- 1. VARIABLES DE TEMA --- */
        :root {
          --bg-app: #f8f8f6; --bg-card: #ffffff; --bg-passage: #e5e3d8;
          --text-main: #1a202c; --text-title: #1a1a2e; --text-sec: #718096;
          --accent: #C8A84B; --border-passage: #d1cfc1;
          --prog-fill: #1e3a8a; --prog-bg: rgba(30, 58, 138, 0.1);
          
          /* Configuración Parental (Modo Claro) */
          --border-ghost: #a8a697; --text-ghost: #1a202c;
          
          /* Dificultades (Modo Claro) */
          --diff-f-bg: #f0faf4; --diff-f-tx: #2d6a4f; --diff-f-bd: #86efac;
          --diff-i-bg: #fffbf0; --diff-i-tx: #92601a; --diff-i-bd: #fef3c7;
          --diff-d-bg: #fff5f5; --diff-d-tx: #991b1b; --diff-d-bd: #fca5a5;
        }

        [data-theme='dark'] {
          --bg-app: #121212; --bg-card: #1e1e1e; --bg-passage: #252525;
          --text-main: #e2e8f0; --text-title: #60a5fa; --text-sec: #a0aec0;
          --accent: #d4af37; --border-passage: #333333;
          --prog-fill: #60a5fa; --prog-bg: rgba(96, 165, 250, 0.2);
          
          /* Configuración Parental (Modo Oscuro) */
          --border-ghost: #333333; --text-ghost: #d4af37;

          /* Dificultades (Modo Oscuro - Neón) */
          --diff-f-bg: rgba(74, 222, 128, 0.15); --diff-f-tx: #4ade80; --diff-f-bd: #2d6a4f;
          --diff-i-bg: rgba(251, 191, 36, 0.15); --diff-i-tx: #fbbf24; --diff-i-bd: #92601a;
          --diff-d-bg: rgba(248, 113, 113, 0.15); --diff-d-tx: #fca5a5; --diff-d-bd: #991b1b;
        }

        /* --- 2. REGLAS GLOBALES --- */
        body { background: var(--bg-app); transition: 0.3s; }
        [data-theme] h1, [data-theme] h2 { color: var(--accent) !important; }
        [data-theme] h3 { color: var(--text-title) !important; }
        
        /* Protección de texto: No volvemos blanco el texto de los badges ni de botones de feedback */
        [data-theme='dark'] p:not(button p):not(.diff-badge p):not(.admin-panel-container p), 
        [data-theme='dark'] span:not(button span):not(.diff-badge):not(.admin-panel-container span) { 
          color: var(--text-main) !important; 
        }

        /* --- 3. BADGES DE DIFICULTAD --- */
        .diff-badge { 
          padding: 4px 12px; border-radius: 6px; font-size: 10px; font-weight: 700; 
          text-transform: uppercase; border: 1px solid transparent; display: inline-block; 
        }
        .diff-badge.Fácil { background: var(--diff-f-bg) !important; color: var(--diff-f-tx) !important; border-color: var(--diff-f-bd) !important; }
        .diff-badge.Intermedio { background: var(--diff-i-bg) !important; color: var(--diff-i-tx) !important; border-color: var(--diff-i-bd) !important; }
        .diff-badge.Difícil { background: var(--diff-d-bg) !important; color: var(--diff-d-tx) !important; border-color: var(--diff-d-bd) !important; }

        /* --- 4. EXCEPCIÓN: BOTONES FEEDBACK --- */
        [data-theme='dark'] button[style*="background: #f0faf4"], 
        [data-theme='dark'] button[style*="background: #fff5f5"],
        [data-theme='dark'] button[style*="background: white"] { color: #1a1a2e !important; }

        /* --- 5. AISLAMIENTO PANEL ADMIN --- */
        .admin-panel-container h2 { color: var(--accent) !important; }
        .admin-panel-container p, .admin-panel-container span:not(.diff-badge) { color: var(--text-main) !important; }
        .admin-panel-container input { 
          background-color: var(--bg-card) !important; 
          color: var(--text-main) !important; 
          border: 1px solid var(--border-passage) !important; 
        }

        /* --- 6. CÁPSULA Y OTROS --- */
        .passage-wrapper { position: relative; background: var(--bg-passage) !important; border: 1px solid var(--border-passage) !important; border-radius: 12px; overflow: hidden; }
        
        .option-container:hover .discard-btn { opacity: 1 !important; }
        .discarded { opacity: 0.3 !important; filter: grayscale(1); text-decoration: line-through; pointer-events: none; }
      `}</style>

      {view === "login" ? (
        <Login loginPass={loginPass} setLoginPass={setLoginPass} setView={setView} setErr={setErr} err={err} appIcon={appIcon} S={S} />
      ) : (
        <>
          <Header appIcon={appIcon} attemptedIds={attemptedIds} allQs={allQs} balance={balance} fmt={fmt} S={S} theme={theme} toggleTheme={toggleTheme} setFontSize={setFontSize} />
          <div style={S.body}>
            {view === "home" && <Home attemptedIds={attemptedIds} allQs={allQs} completedIds={completedIds} accuracy={accuracy} available={available} setIsReview={setIsReview} setQIdx={setQIdx} setView={setView} S={S} />}
            {view === "test" && (
              activeQ ? (
                <QuestionView currentQ={activeQ} goHome={goHome} confirmAnswer={confirmAnswer} selected={selected} setSelected={setSelected} showExp={showExp} confirmed={confirmed} correct={correct} nextQ={nextQ} successImage={successImage} errorImage={errorImage} DIFF_LIGHT={DIFF_LIGHT} S={S} fontSize={fontSize} />
              ) : <div style={S.center}><Sparkles size={48} /><p>No hay preguntas.</p><button onClick={goHome}>Volver</button></div>
            )}
            {view === "settings" && <AdminPanel settingsOpen={settingsOpen} setSettingsOpen={setSettingsOpen} settingsPass={settingsPass} setSettingsPass={setSettingsPass} err={err} errType={errType} setErr={setErr} goHome={goHome} rates={rates} setRates={setRates} persist={persist} uploadImg={uploadImg} resetAll={resetAll} fmt={fmt} S={S} />}
            {view === "results" && <Results balance={balance} completedIds={completedIds} accuracy={accuracy} fmt={fmt} goHome={goHome} S={S} />}
          </div>
          <div style={{ textAlign: "center", padding: "24px 0", fontSize: 10, color: "var(--text-sec)", marginTop: 40, borderTop: "1px solid var(--border-passage)" }}>
            PAES Study Premium · Edición 2026
          </div>
        </>
      )}
    </div>
  );
}