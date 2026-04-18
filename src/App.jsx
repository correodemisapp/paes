import { useState, useEffect, useMemo } from "react";
import { Trophy, Settings, ChevronRight, Lock, History, Send, Layers, Loader2, Sparkles, Wand2, ArrowLeft, Zap, XCircle, CheckCircle } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { STATIC_QUESTIONS, RATES, AI_SYSTEM, AI_USER } from "./questions";

const DOC_REF = doc(db, "progreso", "usuario-principal");
const fmt = (v) => new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(v);

const DIFF_LIGHT = {
  Fácil:      { color:"#2d6a4f", bg:"#d8f3dc", border:"#b7e4c7" },
  Intermedio: { color:"#92601a", bg:"#fef3c7", border:"#fcd34d" },
  Difícil:    { color:"#991b1b", bg:"#fee2e2", border:"#fca5a5" },
};

export default function App() {
  const [ready, setReady]               = useState(false);
  const [view, setView]                 = useState("login");
  const [balance, setBalance]           = useState(0);
  const [completedIds, setCompleted]    = useState([]);
  const [attemptedIds, setAttempted]    = useState([]);
  const [extraQs, setExtraQs]           = useState([]);
  const [appIcon, setAppIcon]           = useState(null);
  const [successImage, setSuccessImage] = useState(null);
  const [errorImage, setErrorImage]     = useState(null);
  const [isReview, setIsReview]         = useState(false);
  const [qIdx, setQIdx]                 = useState(0);
  const [selected, setSelected]         = useState(null);
  const [confirmed, setConfirmed]       = useState(null);
  const [showExp, setShowExp]           = useState(false);
  const [correct, setCorrect]           = useState(null);
  const [loginPass, setLoginPass]       = useState("");
  const [settingsPass, setSettingsPass] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [err, setErr]                   = useState("");
  const [errType, setErrType]           = useState("error");
  const [generating, setGenerating]     = useState(false);
  const [rates, setRates]               = useState({ Fácil:100, Intermedio:300, Difícil:500 });

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(DOC_REF);
        if (snap.exists()) {
          const d = snap.data();
          if (d.balance !== undefined) setBalance(d.balance);
          if (d.completedIds)  setCompleted(d.completedIds);
          if (d.attemptedIds)  setAttempted(d.attemptedIds);
          if (d.appIcon)       setAppIcon(d.appIcon);
          if (d.successImage)  setSuccessImage(d.successImage);
          if (d.errorImage)    setErrorImage(d.errorImage);
          if (d.rates)         setRates(d.rates);
        }
        const res = await fetch('/api/questions');
        const data = await res.json();
        if (data.questions) setExtraQs(data.questions);
      } catch (e) { console.error("Error cargando datos:", e); }
      setReady(true);
    })();
  }, []);

  const persist = async (patch) => {
    const state = { balance, completedIds, attemptedIds, appIcon, successImage, errorImage, rates, ...patch };
    try { await setDoc(DOC_REF, state); } catch (e) { console.error(e); }
  };

  const allQs = useMemo(() => [...(STATIC_QUESTIONS || []), ...(extraQs || [])], [extraQs]);
  const available = useMemo(() => isReview ? allQs : allQs.filter(q => q && q.id && !attemptedIds.includes(q.id)), [allQs, attemptedIds, isReview]);
  const currentQ = available[qIdx] || null;

  const goHome = () => { setView("home"); setSelected(null); setConfirmed(null); setShowExp(false); setCorrect(null); setErr(""); };

  const confirmAnswer = async () => {
    if (!selected || showExp || !currentQ) return;
    const isC = selected === currentQ.correct;
    const rate = rates[currentQ.difficulty] || 100;
    setCorrect(isC); setConfirmed(selected); setShowExp(true);
    const nAtt = attemptedIds.includes(currentQ.id) ? attemptedIds : [...attemptedIds, currentQ.id];
    const nComp = (isC && !completedIds.includes(currentQ.id)) ? [...completedIds, currentQ.id] : completedIds;
    const nBal = isC && !completedIds.includes(currentQ.id) ? balance + rate : !isC && !completedIds.includes(currentQ.id) ? Math.max(0, balance - rate * 0.5) : balance;
    setAttempted(nAtt); setCompleted(nComp); setBalance(nBal);
    await persist({ balance: nBal, completedIds: nComp, attemptedIds: nAtt });
  };

  const nextQ = () => {
    if (available.length <= 1 && !isReview) { setView("results"); return; }
    setQIdx(isReview ? (p => (p + 1) % available.length) : 0);
    setSelected(null); setConfirmed(null); setShowExp(false); setCorrect(null);
  };

  const generateWithAI = async () => {
    if (generating) return;
    setGenerating(true); setErr("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: AI_SYSTEM, messages: [{ role: "user", content: AI_USER }] })
      });
      if (!res.ok) throw new Error("Error servidor");
      const updatedRes = await fetch('/api/questions');
      const updatedData = await updatedRes.json();
      setExtraQs(updatedData.questions || []);
      setErrType("success"); setErr("✓ ¡Preguntas generadas!");
    } catch (e) { setErrType("error"); setErr("Error al generar"); }
    finally { setGenerating(false); }
  };

  const accuracy = attemptedIds.length > 0 ? Math.round((completedIds.length / attemptedIds.length) * 100) : 0;

  if (!ready) return <div style={S.center}><Loader2 style={{ width:32, color:"#C8A84B", animation:"spin 1s linear infinite" }} /></div>;

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        button{cursor:pointer;border:none;transition: all 0.2s ease;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .fade{animation: fadeUp 0.4s ease-out;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {view === "login" && (
        <div style={S.loginWrap} className="fade">
          <div style={S.loginIconBox}>
             {appIcon ? <img src={appIcon} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:16}} /> : <span style={{fontFamily:"'Playfair Display',serif",fontWeight:800,fontSize:26,color:"#C8A84B"}}>P</span>}
          </div>
          <h1 style={S.bigTitle}>PAES<br/>Premium</h1>
          <input type="password" value={loginPass} placeholder="Contraseña" onChange={e => setLoginPass(e.target.value)} onKeyDown={e => e.key === "Enter" && (loginPass === "ElaEdionda" ? setView("home") : setErr("Error"))} style={S.loginInput} />
          <button onClick={() => loginPass === "ElaEdionda" ? setView("home") : setErr("Error")} style={S.btnPrimary}>Ingresar</button>
        </div>
      )}

      {view !== "login" && (
        <>
          <div style={S.header}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
              <div style={S.headerIcon}>
                {appIcon ? <img src={appIcon} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} /> : <span style={{ color: "#C8A84B", fontWeight: 800 }}>P</span>}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 14, color: "#F5F0E8", margin: 0 }}>PAES Premium</p>
                <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#C8A84B", margin: "2px 0" }}>{attemptedIds.length} de {allQs.length} completadas</p>
                <div style={{ width: "100%", maxWidth: "120px", height: "3px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ width: `${allQs.length > 0 ? (attemptedIds.length / allQs.length) * 100 : 0}%`, height: "100%", background: "#C8A84B", transition: "width 0.4s ease" }} />
                </div>
              </div>
            </div>
            <div style={S.balancePill}><span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, fontSize: 13, color: "#1a1a2e" }}>{fmt(balance)}</span></div>
          </div>

          <div style={S.body}>
            {view === "home" && (
              <div className="fade">
                <div style={S.statsRow}>
                  <div style={S.statCard}><Layers size={16} color="#9a8f7e"/><p style={{fontSize:22, fontWeight:600}}>{attemptedIds.length}</p><p style={{fontSize:9, textTransform:"uppercase"}}>Hechas</p></div>
                  <div style={S.statCard}><Trophy size={16} color="#C8A84B"/><p style={{fontSize:22, fontWeight:600}}>{completedIds.length}</p><p style={{fontSize:9, textTransform:"uppercase"}}>Éxito</p></div>
                  <div style={S.statCard}><Zap size={16} color="#2d6a4f"/><p style={{fontSize:22, fontWeight:600}}>{accuracy}%</p><p style={{fontSize:9, textTransform:"uppercase"}}>Puntería</p></div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <button disabled={available.length === 0} onClick={() => { setIsReview(false); setQIdx(0); setView("test"); }} style={available.length === 0 ? S.btnDisabled : S.btnPrimary}>Entrenamiento</button>
                  <button onClick={() => { setIsReview(true); setQIdx(0); setView("test"); }} style={S.btnSecondary}>Repasar Todo</button>
                  <button onClick={() => setView("settings")} style={S.btnGhost}>Configuración</button>
                </div>
              </div>
            )}

            {view === "test" && (
              <div className="fade">
                {!currentQ ? (
                  <div style={{textAlign:"center", padding:"40px 20px"}}>
                    <XCircle size={48} color="#991b1b" style={{marginBottom:16}} />
                    <h2 style={{fontFamily:"'Playfair Display',serif", marginBottom:8}}>¡Sin preguntas nuevas!</h2>
                    <p style={{fontSize:14, color:"#9a8f7e", marginBottom:24}}>Has completado todos los desafíos.</p>
                    <button onClick={() => setView("settings")} style={S.btnPrimary}><Sparkles size={16}/> Generar con IA</button>
                    <button onClick={goHome} style={{...S.btnGhost, marginTop:12, width:"100%"}}>Volver al inicio</button>
                  </div>
                ) : (() => {
                  const d = DIFF_LIGHT[currentQ.difficulty] || DIFF_LIGHT.Fácil;
                  return (
                    <>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
                        <button onClick={goHome} style={S.backBtn}><ArrowLeft size={16}/></button>
                        <span style={{color:d.color,background:d.bg,border:`1px solid ${d.border}`,padding:"4px 12px",borderRadius:8,fontSize:10,fontWeight:700}}>{currentQ.difficulty}</span>
                      </div>
                      <div style={S.passage}>{currentQ.text}</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif", fontSize:18, marginBottom:20, lineHeight:1.4}}>{currentQ.question}</h3>
                      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
                        {currentQ.options.map(opt => (
                          <button key={opt.id} disabled={!!showExp} onClick={() => setSelected(opt.id)} style={{
                            background: selected===opt.id ? "#fffbf0" : "#fff",
                            border: selected===opt.id ? "2px solid #C8A84B" : "1px solid #E8E5DC",
                            padding:16, borderRadius:14, textAlign:"left", display:"flex", gap:12, boxShadow:"0 2px 4px rgba(0,0,0,0.02)"
                          }}>
                            <span style={{fontWeight:800, color:selected===opt.id?"#1a1a2e":"#9a8f7e"}}>{opt.id}</span>
                            <span style={{fontSize:14, fontWeight:500}}>{opt.text}</span>
                          </button>
                        ))}
                      </div>
                      <button disabled={!selected} onClick={confirmAnswer} style={!selected ? S.btnDisabled : S.btnPrimary}>Confirmar</button>
                      {showExp && (
                        <>
                          <div style={S.modalBackdrop} />
                          <div style={{...S.modalCard, borderColor:correct?"#86efac":"#fca5a5", background:correct?"#f0faf4":"#fff5f5"}}>
                            {correct ? <CheckCircle size={48} color="#2d6a4f"/> : <XCircle size={48} color="#991b1b"/>}
                            <h2 style={{fontFamily:"'Playfair Display',serif"}}>{correct?"¡Excelente!":"Casi casi..."}</h2>
                            <p style={{fontSize:14, textAlign:"center", lineHeight:1.6}}>{currentQ.explanation}</p>
                            <button onClick={nextQ} style={S.btnPrimary}>Siguiente</button>
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {view === "settings" && (
              <div className="fade">
                {!settingsOpen ? (
                  <div style={{textAlign:"center", padding:20}}>
                    <Lock size={40} color="#C8A84B" style={{marginBottom:16}}/>
                    <h2 style={{fontFamily:"'Playfair Display',serif", marginBottom:20}}>Acceso Parental</h2>
                    <input type="password" value={settingsPass} onChange={e=>setSettingsPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(settingsPass==="camboropaes"?setSettingsOpen(true):setErr("!"))} style={S.loginInput}/>
                    <button onClick={()=>settingsPass==="camboropaes"?setSettingsOpen(true):setErr("!")} style={S.btnPrimary}>Entrar</button>
                  </div>
                ) : (
                  <div style={{display:"flex", flexDirection:"column", gap:16}}>
                    <div style={{background:"#fff", border:"1px solid #E8E5DC", borderRadius:16, padding:20, borderLeft:"5px solid #C8A84B"}}>
                       <h3 style={{fontFamily:"'Playfair Display',serif", marginBottom:8}}>IA de Generación</h3>
                       <p style={{fontSize:12, color:"#9a8f7e", marginBottom:16}}>Crea 3 preguntas nuevas basadas en el currículum PAES.</p>
                       {err && <p style={{color:errType==="success"?"#2d6a4f":"#991b1b", fontSize:12, marginBottom:10}}>{err}</p>}
                       <button onClick={generateWithAI} disabled={generating} style={generating?S.btnDisabled:S.btnPrimary}>
                        {generating ? <Loader2 className="spin" size={16}/> : <Wand2 size={16}/>} {generating?"Guardando...":"Generar Preguntas"}
                       </button>
                    </div>
                    <button onClick={resetAll} style={{color:"#991b1b", background:"#fff", border:"1px solid #fca5a5", padding:12, borderRadius:12}}>Reiniciar Todo el Progreso</button>
                    <button onClick={goHome} style={S.btnGhost}>Cerrar</button>
                  </div>
                )}
              </div>
            )}
            
            {view === "results" && (
              <div className="fade" style={{textAlign:"center"}}>
                <Trophy size={60} color="#C8A84B" style={{marginBottom:20}}/>
                <h2 style={{fontFamily:"'Playfair Display',serif", fontSize:28}}>¡Entrenamiento Completado!</h2>
                <div style={{background:"#fff", padding:30, borderRadius:20, margin:"24px 0", border:"1px solid #E8E5DC"}}>
                  <p style={{fontSize:12, color:"#9a8f7e", textTransform:"uppercase"}}>Dinero Acumulado</p>
                  <p style={{fontSize:36, fontWeight:800, color:"#1a1a2e"}}>{fmt(balance)}</p>
                </div>
                <button onClick={goHome} style={S.btnPrimary}>Volver al Inicio</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const S = {
  root: { minHeight: "100vh", background: "#fcfaf7", fontFamily: "'DM Sans', sans-serif", color: "#1a1a2e" },
  center: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loginWrap: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28 },
  loginIconBox: { width: 80, height: 80, background: "#1a1a2e", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, border: "3px solid #C8A84B" },
  bigTitle: { fontFamily: "'Playfair Display', serif", fontSize: 48, textAlign: "center", lineHeight: 1, marginBottom: 24 },
  loginInput: { width: "100%", maxWidth: 320, background: "#fff", border: "2px solid #E8E5DC", borderRadius: 14, padding: 14, fontSize: 16, textAlign: "center", marginBottom: 12, outline: "none" },
  btnPrimary: { width: "100%", maxWidth: 320, background: "#1a1a2e", color: "#F5F0E8", fontWeight: 700, padding: 16, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  btnSecondary: { width: "100%", background: "#fff", border: "1px solid #E8E5DC", color: "#1a1a2e", fontWeight: 600, padding: 14, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  btnGhost: { background: "transparent", color: "#9a8f7e", padding: 10, fontWeight: 500, fontSize: 13 },
  btnDisabled: { width: "100%", maxWidth: 320, background: "#E8E5DC", color: "#bbb5a8", padding: 16, borderRadius: 14 },
  header: { background: "rgba(26, 26, 46, 0.98)", backdropFilter: "blur(10px)", borderBottom: "3px solid #C8A84B", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "fixed", top: 0, left: 0, right: 0, zIndex: 40, height: "75px" },
  headerIcon: { width: 40, height: 40, background: "rgba(200,168,75,0.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(200,168,75,0.2)" },
  balancePill: { background: "#C8A84B", padding: "6px 14px", borderRadius: 20 },
  body: { maxWidth: "500px", margin: "0 auto", padding: "20px", paddingTop: "95px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 },
  statCard: { background: "#fff", border: "1px solid #E8E5DC", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" },
  passage: { background: "#fdfcf9", borderLeft: "5px solid #C8A84B", borderTop: "1px solid #e8e2d0", borderRight: "1px solid #e8e2d0", borderBottom: "1px solid #e8e2d0", borderRadius: "0 14px 14px 0", padding: 20, marginBottom: 20, fontSize: "14px", lineHeight: "1.8", color: "#3d3628", fontStyle: "italic", maxHeight: "250px", overflowY: "auto" },
  backBtn: { background: "#fff", border: "1px solid #E8E5DC", borderRadius: 10, padding: 8, display: "flex", alignItems: "center", color: "#9a8f7e" },
  modalBackdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 50 },
  modalCard: { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 51, width: "90%", maxWidth: 380, border: "2px solid", borderRadius: 24, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" },
};