import { useState, useEffect, useMemo } from "react";
import { Loader2, Sparkles } from "lucide-react";
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
import { STATIC_QUESTIONS, AI_SYSTEM, AI_USER } from "./questions";

const DOC_REF = doc(db, "progreso", "usuario-principal");
const fmt = (v) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(v);

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
          setBalance(Number(d.balance || 0));
          setCompleted(d.completedIds || []);
          setAttempted(d.attemptedIds || []);
          setExtraQs(d.extraQs || []);
          setAppIcon(d.appIcon || null);
          setSuccessImage(d.successImage || null);
          setErrorImage(d.errorImage || null);
          setRates(d.rates || rates);
        }
      } catch (e) { console.error(e); } finally { setReady(true); }
    };
    fetchData();
  }, []);

  useEffect(() => { localStorage.setItem("theme", theme); }, [theme]);
  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light");

  const persist = (patch) => ready && setDoc(DOC_REF, patch, { merge: true }).catch(console.error);

  const allQs = useMemo(() => [...(STATIC_QUESTIONS || []), ...(extraQs || [])], [extraQs]);
  const available = useMemo(() => allQs.filter(q => !attemptedIds.includes(q.id)), [allQs, attemptedIds]);
  const reviewQs = useMemo(() => allQs.filter(q => attemptedIds.includes(q.id)), [allQs, attemptedIds]);
  const accuracy = attemptedIds.length ? Math.round((completedIds.length / attemptedIds.length) * 100) : 0;

  useEffect(() => {
    if (ready && !activeQ) setActiveQ(isReview ? reviewQs[0] : available[0]);
  }, [ready, isReview, available, reviewQs, activeQ]);

  const cleanQuizStates = () => { setSelected(null); setConfirmed(null); setShowExp(false); setCorrect(null); };
  const goHome = () => { setView("home"); cleanQuizStates(); setErr(""); };

  const confirmAnswer = async () => {
    if (!selected || showExp || !activeQ) return;
    const isC = selected === activeQ.correct;
    const rate = rates[activeQ.difficulty] || 100;
    setCorrect(isC); setConfirmed(selected); setShowExp(true);
    if (isReview) return;

    const nAtt = [...new Set([...attemptedIds, activeQ.id])];
    const nComp = isC ? [...new Set([...completedIds, activeQ.id])] : completedIds;
    const nBal = isC ? balance + rate : Math.max(0, balance - (rate * 0.5));

    setAttempted(nAtt); setCompleted(nComp); setBalance(nBal);
    persist({ balance: nBal, completedIds: nComp, attemptedIds: nAtt });
  };

  const nextQ = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    cleanQuizStates();
    if (isReview) {
      const idx = (qIdx + 1) % reviewQs.length;
      setQIdx(idx); setActiveQ(reviewQs[idx]);
    } else {
      if (available.length <= 1) return setView("results");
      setActiveQ(available[1]);
    }
  };

  const generateWithAI = async () => {
    if (generating) return;
    setGenerating(true); setErr("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: AI_SYSTEM, messages: [{ role: "user", content: AI_USER }] })
      });
      const data = await res.json();
      const raw = data.questions || JSON.parse(JSON.stringify(data).match(/\{[\s\S]*\}/)[0]).questions;
      const ts = Date.now();
      const newQs = raw.map((q, i) => ({ ...q, id: `gen_${ts}_${i}`, options: Array.isArray(q.options) ? q.options : Object.entries(q.options).map(([id, text]) => ({ id, text })) }));
      setExtraQs(prev => { const n = [...prev, ...newQs]; persist({ extraQs: n }); return n; });
      setErrType("success"); setErr(`✓ ${newQs.length} preguntas listas.`);
    } catch (e) { setErr(`Error: ${e.message}`); } finally { setGenerating(false); }
  };

  const uploadImg = (e, type) => {
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result;
      const update = type === "icon" ? { set: setAppIcon, key: "appIcon" } : type === "success" ? { set: setSuccessImage, key: "successImage" } : { set: setErrorImage, key: "errorImage" };
      update.set(b64); persist({ [update.key]: b64 });
    };
    e.target.files[0] && reader.readAsDataURL(e.target.files[0]);
  };

  const resetAll = () => window.confirm("¿Limpiar progreso?") && persist({ balance: 0, attemptedIds: [], completedIds: [] }).then(() => { setAttempted([]); setCompleted([]); setBalance(0); setView("home"); });

  if (!ready) return <div style={S.center}><Loader2 className="spin" /><style>{`.spin{animation:rotate 1s linear infinite}@keyframes rotate{to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <div style={{...S.root, backgroundColor: "var(--bg-app)"}} data-theme={theme}>
      <style>{`
        :root{--bg-app:#f8f8f6;--bg-card:#fff;--bg-passage:#e5e3d8;--text-main:#1a202c;--text-title:#1a1a2e;--accent:#C8A84B;--border-passage:#d1cfc1;--prog-fill:#1e3a8a;--prog-bg:rgba(30,58,138,0.1)}
        [data-theme='dark']{--bg-app:#121212;--bg-card:#1e1e1e;--bg-passage:#252525;--text-main:#e2e8f0;--text-title:#60a5fa;--accent:#d4af37;--border-passage:#333;--prog-fill:#60a5fa;--prog-bg:rgba(96,165,250,0.2)}
        body{background:var(--bg-app);transition:0.3s}.passage-wrapper{position:relative;background:var(--bg-passage)!important;border:1px solid var(--border-passage)!important;border-radius:12px;overflow:hidden}
        .passage-wrapper::before,.passage-wrapper::after,.top-right-corner,.bottom-left-corner{content:\"\";position:absolute;width:20px;height:20px;border-color:var(--accent);z-index:10}
        .passage-wrapper::before{top:0;left:0;border-top:2px solid;border-left:2px solid;border-radius:12px 0 0 0}
        .top-right-corner{top:0;right:0;border-top:2px solid;border-right:2px solid;border-radius:0 12px 0 0}
        .passage-wrapper::after{bottom:0;right:0;border-bottom:2px solid;border-right:2px solid;border-radius:0 0 12px 0}
        .bottom-left-corner{bottom:0;left:0;border-bottom:2px solid;border-left:2px solid;border-radius:0 0 0 12px}
        .discarded{opacity:0.3!important;filter:grayscale(1);text-decoration:line-through;pointer-events:none}
      `}</style>
      {view === "login" ? <Login loginPass={loginPass} setLoginPass={setLoginPass} setView={setView} setErr={setErr} err={err} appIcon={appIcon} S={S} /> : (
        <>
          <Header appIcon={appIcon} attemptedIds={attemptedIds} allQs={allQs} balance={balance} fmt={fmt} S={S} theme={theme} toggleTheme={toggleTheme} setFontSize={setFontSize} />
          <div style={S.body}>
            {view === "home" && <Home attemptedIds={attemptedIds} allQs={allQs} completedIds={completedIds} accuracy={accuracy} available={available} setIsReview={setIsReview} setQIdx={setQIdx} setView={setView} S={S} />}
            {view === "test" && (activeQ ? <QuestionView currentQ={activeQ} goHome={goHome} confirmAnswer={confirmAnswer} selected={selected} setSelected={setSelected} showExp={showExp} confirmed={confirmed} correct={correct} nextQ={nextQ} successImage={successImage} errorImage={errorImage} DIFF_LIGHT={DIFF_LIGHT} S={S} fontSize={fontSize} /> : <div style={S.center}><Sparkles /><p>No hay preguntas.</p><button onClick={goHome}>Volver</button></div>)}
            {view === "settings" && <AdminPanel settingsOpen={settingsOpen} setSettingsOpen={setSettingsOpen} settingsPass={settingsPass} setSettingsPass={setSettingsPass} err={err} errType={errType} setErr={setErr} goHome={goHome} generateWithAI={generateWithAI} generating={generating} rates={rates} setRates={setRates} persist={persist} uploadImg={uploadImg} resetAll={resetAll} fmt={fmt} S={S} />}
            {view === "results" && <Results balance={balance} completedIds={completedIds} accuracy={accuracy} fmt={fmt} goHome={goHome} S={S} />}
          </div>
        </>
      )}
    </div>
  );
}