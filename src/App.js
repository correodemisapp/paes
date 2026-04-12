import { useState, useEffect, useMemo } from "react";
import { Trophy, Settings, ChevronRight, Brain, Lock, History, Send, Layers, Loader2, Sparkles, Upload, Wand2, ArrowLeft, Zap, XCircle, CheckCircle } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { STATIC_QUESTIONS, DIFF, RATES, AI_SYSTEM, AI_USER } from "./questions";

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
          if (d.extraQs)       setExtraQs(d.extraQs);
          if (d.appIcon)       setAppIcon(d.appIcon);
          if (d.successImage)  setSuccessImage(d.successImage);
          if (d.errorImage)    setErrorImage(d.errorImage);
          if (d.rates)         setRates(d.rates);
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

  const allQs     = useMemo(() => [...STATIC_QUESTIONS, ...extraQs], [extraQs]);
  const available = useMemo(() =>
    isReview ? allQs : allQs.filter(q => !attemptedIds.includes(q.id)),
  [allQs, attemptedIds, isReview]);
  const currentQ  = available[qIdx] || null;

  const goHome = () => {
    setView("home"); setSelected(null); setConfirmed(null);
    setShowExp(false); setCorrect(null); setErr("");
  };

  const confirmAnswer = async () => {
    if (!selected || showExp || !currentQ) return;
    const isC  = selected === currentQ.correct;
    const rate = rates[currentQ.difficulty] || 100;
    setCorrect(isC); setConfirmed(selected); setShowExp(true);
    const newAttempted = attemptedIds.includes(currentQ.id) ? attemptedIds : [...attemptedIds, currentQ.id];
    const newCompleted = (isC && !completedIds.includes(currentQ.id)) ? [...completedIds, currentQ.id] : completedIds;
    const newBalance   =  isC && !completedIds.includes(currentQ.id) ? balance + rate
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
      // ── Llamada al proxy local en vez de Anthropic directamente ──
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: AI_SYSTEM,
          messages: [{ role: "user", content: AI_USER }]
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || `HTTP ${res.status}`);
      }
      const data      = await res.json();
      const rawText   = data.content?.map(b => b.text || "").join("") || "";
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Respuesta sin JSON válido");
      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.questions || !Array.isArray(parsed.questions)) throw new Error("Estructura JSON incorrecta");
      const ts      = Date.now();
      const newQs   = parsed.questions.map((q, i) => ({ ...q, id: `gen_${ts}_${i}` }));
      const updated = [...extraQs, ...newQs];
      setExtraQs(updated);
      await persist({ extraQs: updated });
      setErrType("success");
      setErr(`✓ ${newQs.length} preguntas PAES añadidas correctamente`);
    } catch (e) {
      setErrType("error");
      setErr(`Error: ${e.message}. Intenta nuevamente.`);
    } finally { setGenerating(false); }
  };

  const uploadImg = (e, type) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const b64 = reader.result;
      if (type === "icon")    { setAppIcon(b64);      await persist({ appIcon: b64 }); }
      if (type === "success") { setSuccessImage(b64); await persist({ successImage: b64 }); }
      if (type === "error")   { setErrorImage(b64);   await persist({ errorImage: b64 }); }
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
      <Loader2 style={{ width:32, height:32, color:"#C8A84B", animation:"spin 1s linear infinite" }} />
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
        <div style={S.loginWrap} className="fade">
          <div style={S.loginIconBox}>
            {appIcon
              ? <img src={appIcon} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:16}} alt="" />
              : <span style={{fontFamily:"'Playfair Display',serif",fontWeight:800,fontSize:26,color:"#C8A84B"}}>P</span>}
          </div>
          <p style={S.eyebrow}>Competencia Lectora · Chile</p>
          <h1 style={S.bigTitle}>PAES<br/>Premium</h1>
          <p style={S.subtitle}>Tu entrenador personal de lectura</p>
          {err && <p style={S.errBanner}>{err}</p>}
          <input type="password" value={loginPass} placeholder="Contraseña"
            onChange={e => { setLoginPass(e.target.value); setErr(""); }}
            onKeyDown={e => e.key === "Enter" && (loginPass === "ElaEdionda" ? setView("home") : setErr("Clave incorrecta"))}
            style={S.loginInput}
          />
          <button onClick={() => loginPass === "ElaEdionda" ? setView("home") : setErr("Clave incorrecta")} style={S.btnPrimary}>
            Ingresar <ChevronRight style={{width:18,height:18}} />
          </button>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#ccc4b5",marginTop:24,letterSpacing:"0.08em"}}>— uso exclusivo —</p>
        </div>
      )}

      {view !== "login" && (
        <>
          <div style={S.header}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={S.headerIcon}>
                {appIcon
                  ? <img src={appIcon} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:10}} alt="" />
                  : <span style={{fontFamily:"'Playfair Display',serif",fontWeight:800,fontSize:16,color:"#C8A84B"}}>P</span>}
              </div>
              <div>
                <p style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:15,color:"#F5F0E8",margin:0,lineHeight:1.2}}>PAES Premium</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:"#C8A84B",margin:0,letterSpacing:"0.15em",textTransform:"uppercase"}}>Competencia Lectora</p>
              </div>
            </div>
            <div style={S.balancePill}>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,fontSize:14,color:"#1a1a2e"}}>
                {fmt(balance)}
              </span>
            </div>
          </div>

          <div style={S.body}>

            {view === "home" && (
              <div className="fade">
                <div style={S.statsRow}>
                  {[
                    { icon:<Layers style={{width:15,height:15,color:"#9a8f7e",marginBottom:6}}/>, val:`${attemptedIds.length}`, sub:`/${allQs.length}`, label:"Respondidas", col:"#1a1a2e" },
                    { icon:<Trophy style={{width:15,height:15,color:"#C8A84B",marginBottom:6}}/>, val:`${completedIds.length}`, label:"Correctas", col:"#92601a" },
                    { icon:<Zap    style={{width:15,height:15,color:"#2d6a4f",marginBottom:6}}/>, val:`${accuracy}%`, label:"Precisión", col:"#2d6a4f" },
                  ].map((s,i) => (
                    <div key={i} style={S.statCard}>
                      {s.icon}
                      <p style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,fontSize:22,color:s.col,lineHeight:1,marginBottom:4}}>
                        {s.val}<span style={{fontSize:11,color:"#bbb5a8",fontWeight:400}}>{s.sub||""}</span>
                      </p>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:"#9a8f7e",textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:600}}>{s.label}</p>
                    </div>
                  ))}
                </div>
                <div style={S.progWrap}>
                  <div style={{...S.progBar, width:`${allQs.length > 0 ? (attemptedIds.length / allQs.length) * 100 : 0}%`}} />
                </div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#9a8f7e",textAlign:"right",marginBottom:28}}>
                  {allQs.length - attemptedIds.length} pendientes
                </p>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <button disabled={available.length === 0} onClick={() => { setIsReview(false); setQIdx(0); setView("test"); }} style={available.length === 0 ? S.btnDisabled : S.btnPrimary}>
                    Iniciar Entrenamiento <ChevronRight style={{width:18,height:18}} />
                  </button>
                  <button onClick={() => { setIsReview(true); setQIdx(0); setView("test"); }} style={S.btnSecondary}>
                    <History style={{width:15,height:15}} /> Repasar Todo
                  </button>
                  <button onClick={() => setView("settings")} style={S.btnGhost}>
                    <Settings style={{width:13,height:13}} /> Configuración Parental
                  </button>
                </div>
              </div>
            )}

            {view === "test" && currentQ && (() => {
              const d = DIFF_LIGHT[currentQ.difficulty] || DIFF_LIGHT.Fácil;
              return (
                <div className="fade">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
                    <button onClick={goHome} style={S.backBtn}><ArrowLeft style={{width:14,height:14}} /></button>
                    <span style={{fontSize:10,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",padding:"4px 12px",borderRadius:6,color:d.color,background:d.bg,border:`1px solid ${d.border}`,fontFamily:"'DM Sans',sans-serif"}}>
                      {currentQ.difficulty}
                    </span>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#9a8f7e",fontWeight:500}}>{currentQ.category}</span>
                  </div>

                  <div style={S.passage}>
                    <div style={{maxHeight:220, overflowY:"auto"}}>
                      {currentQ.text.split("\n\n").map((p, i, arr) => (
                        <p key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#3d3628",lineHeight:1.85,marginBottom:i < arr.length-1 ? 12 : 0,fontStyle:"italic"}}>
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>

                  <h3 style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:17,color:"#1a1a2e",lineHeight:1.4,marginBottom:16}}>
                    {currentQ.question}
                  </h3>

                  <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:18}}>
                    {currentQ.options.map(opt => {
                      const isConf  = confirmed === opt.id;
                      const isRight = showExp && opt.id === currentQ.correct;
                      let bg="#fff", border="1px solid #E8E5DC", lBg="#f0ede4", lCol="#9a8f7e";
                      if (!showExp && selected === opt.id) { bg="#fffbf0"; border="1px solid #C8A84B"; lBg="#1a1a2e"; lCol="#C8A84B"; }
                      if (isConf && correct)              { bg="#f0faf4"; border="1px solid #86efac"; lBg="#2d6a4f"; lCol="#fff"; }
                      if (isConf && !correct)             { bg="#fff5f5"; border="1px solid #fca5a5"; lBg="#991b1b"; lCol="#fff"; }
                      if (isRight && !isConf)             { bg="#f0faf4"; border="1px solid #86efac"; lBg="#2d6a4f"; lCol="#fff"; }
                      return (
                        <button key={opt.id} disabled={!!showExp} onClick={() => setSelected(opt.id)}
                          style={{background:bg,border,borderRadius:11,padding:"12px 14px",display:"flex",alignItems:"flex-start",gap:12,textAlign:"left",transition:"all 0.15s",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                          <span style={{width:30,height:30,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",background:lBg,color:lCol,fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,fontSize:12,flexShrink:0,marginTop:1,transition:"all 0.15s"}}>
                            {opt.id}
                          </span>
                          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#3d3628",fontWeight:500,lineHeight:1.55}}>
                            {opt.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button disabled={!selected} onClick={confirmAnswer} style={!selected ? S.btnDisabled : S.btnPrimary}>
                    <Send style={{width:16,height:16}} /> Confirmar Respuesta
                  </button>

                  {showExp && (
                    <>
                      <div style={S.modalBackdrop} />
                      <div style={{...S.modalCard, borderColor:correct?"#86efac":"#fca5a5", background:correct?"#f0faf4":"#fff5f5"}}>
                        {(correct ? successImage : errorImage)
                          ? <img src={correct?successImage:errorImage} style={{width:"100%",maxWidth:180,borderRadius:12,objectFit:"contain"}} alt="" />
                          : correct
                            ? <CheckCircle style={{width:52,height:52,color:"#2d6a4f"}} />
                            : <XCircle    style={{width:52,height:52,color:"#991b1b"}} />
                        }
                        <p style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:22,color:correct?"#2d6a4f":"#991b1b",textAlign:"center"}}>
                          {correct ? "¡Correcto!" : "¡Ánimo, tú puedes!"}
                        </p>
                        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#5a5040",textAlign:"center",lineHeight:1.8,maxWidth:300}}>
                          {currentQ.explanation}
                        </p>
                        <button onClick={nextQ} style={{...S.btnPrimary, width:"100%", background:correct?"#2d6a4f":"#1a1a2e"}}>
                          Siguiente pregunta <ChevronRight style={{width:16,height:16}} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })()}

            {view === "settings" && (
              <div className="fade">
                {!settingsOpen ? (
                  <div style={{textAlign:"center",paddingTop:32}}>
                    <div style={S.lockBox}><Lock style={{width:24,height:24,color:"#C8A84B"}} /></div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:22,color:"#1a1a2e",marginBottom:6}}>Acceso Parental</h2>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#9a8f7e",marginBottom:24}}>Ingresa la clave de configuración</p>
                    {err && <p style={S.errBanner}>{err}</p>}
                    <input type="password" value={settingsPass} placeholder="Contraseña"
                      onChange={e => { setSettingsPass(e.target.value); setErr(""); }}
                      onKeyDown={e => e.key === "Enter" && (settingsPass === "camboropaes" ? setSettingsOpen(true) : setErr("Clave incorrecta"))}
                      style={{...S.loginInput, marginBottom:12}}
                    />
                    <div style={{display:"flex",gap:10}}>
                      <button onClick={goHome} style={{...S.btnGhost,flex:1}}>Volver</button>
                      <button onClick={() => settingsPass === "camboropaes" ? setSettingsOpen(true) : setErr("Clave incorrecta")} style={{...S.btnPrimary,flex:2}}>
                        Entrar <ChevronRight style={{width:15,height:15}} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
                      <h2 style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:20,color:"#1a1a2e"}}>Configuración</h2>
                      <button onClick={() => { setSettingsOpen(false); goHome(); }} style={S.closeBtn}>✕</button>
                    </div>

                    {/* IA */}
                    <div style={{background:"#fff",border:"1px solid #E8E5DC",borderLeft:"4px solid #C8A84B",borderRadius:"0 12px 12px 0",padding:18,marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                        <Sparkles style={{width:15,height:15,color:"#C8A84B"}} />
                        <p style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:15,color:"#1a1a2e"}}>Generar Preguntas PAES con IA</p>
                      </div>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#9a8f7e",marginBottom:14}}>Genera 3 preguntas nuevas con textos y criterios PAES reales.</p>
                      {err && (
                        <p style={{...S.errBanner,
                          borderColor: errType==="success"?"#86efac":"#fca5a5",
                          background:  errType==="success"?"#f0faf4":"#fff5f5",
                          color:       errType==="success"?"#2d6a4f":"#991b1b",
                        }}>{err}</p>
                      )}
                      <button onClick={generateWithAI} disabled={generating} style={generating ? S.btnDisabled : S.btnPrimary}>
                        {generating ? <Loader2 style={{width:14,height:14,animation:"spin 1s linear infinite"}} /> : <Wand2 style={{width:14,height:14}} />}
                        {generating ? "Generando preguntas..." : "Generar 3 Preguntas PAES"}
                      </button>
                      <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#bbb5a8",marginTop:10,textAlign:"center"}}>
                        {extraQs.length} preguntas generadas · {allQs.length} total
                      </p>
                    </div>

                    {/* Valores por dificultad */}
                    <div style={{background:"#fff",border:"1px solid #E8E5DC",borderRadius:12,padding:16,marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:"#9a8f7e",textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:600,marginBottom:14}}>Valor por dificultad (CLP)</p>
                      {[
                        { label:"Fácil",      key:"Fácil",      color:"#2d6a4f" },
                        { label:"Intermedio", key:"Intermedio", color:"#92601a" },
                        { label:"Difícil",    key:"Difícil",    color:"#991b1b" },
                      ].map(item => (
                        <div key={item.key} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:item.color,fontWeight:600,minWidth:90}}>{item.label}</span>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <button
                              onClick={() => { const u = {...rates,[item.key]:Math.max(0,(rates[item.key]||0)-50)}; setRates(u); persist({rates:u}); }}
                              style={{width:30,height:30,borderRadius:7,background:"#f0ede4",border:"1px solid #E8E5DC",color:"#1a1a2e",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}
                            >−</button>
                            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,fontSize:14,color:"#1a1a2e",minWidth:60,textAlign:"center"}}>
                              ${(rates[item.key]||0).toLocaleString("es-CL")}
                            </span>
                            <button
                              onClick={() => { const u = {...rates,[item.key]:(rates[item.key]||0)+50}; setRates(u); persist({rates:u}); }}
                              style={{width:30,height:30,borderRadius:7,background:"#1a1a2e",border:"none",color:"#C8A84B",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}
                            >+</button>
                          </div>
                        </div>
                      ))}
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#bbb5a8",marginTop:6}}>Al responder mal se descuenta el 50% del valor.</p>
                    </div>

                    {/* Multimedia */}
                    <div style={{background:"#fff",border:"1px solid #E8E5DC",borderRadius:12,padding:16,marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:"#9a8f7e",textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:600,marginBottom:12}}>Multimedia</p>
                      {[
                        { label:"Imagen de acierto ✓", type:"success" },
                        { label:"Imagen de error ✗",   type:"error" },
                        { label:"Icono de la app",      type:"icon" },
                      ].map(item => (
                        <label key={item.type} style={{display:"flex",alignItems:"center",gap:12,background:"#FAFAF7",border:"1px solid #E8E5DC",borderRadius:9,padding:"10px 14px",marginBottom:8,cursor:"pointer"}}>
                          <Upload style={{width:13,height:13,color:"#9a8f7e"}} />
                          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#3d3628"}}>{item.label}</span>
                          <input type="file" style={{display:"none"}} accept="image/*" onChange={e => uploadImg(e, item.type)} />
                        </label>
                      ))}
                    </div>

                    <button onClick={resetAll} style={{width:"100%",background:"#fff5f5",border:"1px solid #fca5a5",color:"#991b1b",borderRadius:11,padding:"13px",fontSize:13,fontWeight:600,marginBottom:10,fontFamily:"'DM Sans',sans-serif"}}>
                      Reiniciar Todo el Progreso
                    </button>
                    <button onClick={() => { setSettingsOpen(false); goHome(); }} style={{...S.btnGhost,width:"100%"}}>Cerrar</button>
                  </div>
                )}
              </div>
            )}

            {view === "results" && (
              <div className="fade" style={{textAlign:"center",paddingTop:16}}>
                <div style={{width:88,height:88,background:"#fffbf0",border:"2px solid #C8A84B",borderRadius:22,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}>
                  <Trophy style={{width:44,height:44,color:"#C8A84B"}} />
                </div>
                <h2 style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:28,color:"#1a1a2e",lineHeight:1.2,marginBottom:8}}>¡Entrenamiento<br/>Completo!</h2>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#9a8f7e",marginBottom:24}}>Has respondido todas las preguntas disponibles.</p>
                <div style={{background:"#fff",border:"1px solid #E8E5DC",borderRadius:18,padding:"24px 20px",marginBottom:20,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#9a8f7e",textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:8}}>Dinero Acumulado</p>
                  <p style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,fontSize:40,color:"#C8A84B"}}>{fmt(balance)}</p>
                  <div style={{display:"flex",justifyContent:"center",gap:28,marginTop:16}}>
                    <div>
                      <p style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,fontSize:20,color:"#1a1a2e"}}>{completedIds.length}</p>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#9a8f7e"}}>Correctas</p>
                    </div>
                    <div style={{width:1,background:"#E8E5DC"}} />
                    <div>
                      <p style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,fontSize:20,color:"#2d6a4f"}}>{accuracy}%</p>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#9a8f7e"}}>Precisión</p>
                    </div>
                  </div>
                </div>
                <button onClick={goHome} style={S.btnPrimary}>Volver al Inicio <ChevronRight style={{width:18,height:18}} /></button>
              </div>
            )}

          </div>

          <div style={{textAlign:"center",padding:"18px",fontSize:10,color:"#ccc4b5",letterSpacing:"0.12em",textTransform:"uppercase",borderTop:"1px solid #E8E5DC",fontFamily:"'DM Sans',sans-serif"}}>
            PAES Study · 2025
          </div>
        </>
      )}
    </div>
  );
}

const S = {
  root:         { minHeight:"100vh", background:"#FAFAF7", fontFamily:"'DM Sans',sans-serif", color:"#1a1a2e" },
  center:       { minHeight:"100vh", background:"#FAFAF7", display:"flex", alignItems:"center", justifyContent:"center" },
  loginWrap:    { minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:28, background:"#FAFAF7" },
  loginIconBox: { width:78, height:78, background:"#1a1a2e", border:"3px solid #C8A84B", borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:22, overflow:"hidden" },
  eyebrow:      { fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:600, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A84B", marginBottom:10 },
  bigTitle:     { fontFamily:"'Playfair Display',serif", fontWeight:800, fontSize:52, lineHeight:1, textAlign:"center", color:"#1a1a2e", marginBottom:10 },
  subtitle:     { fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"#9a8f7e", marginBottom:32, textAlign:"center" },
  loginInput:   { width:"100%", maxWidth:320, background:"#fff", border:"1px solid #E8E5DC", borderRadius:11, padding:"14px 18px", fontSize:15, color:"#1a1a2e", textAlign:"center", letterSpacing:"0.3em", outline:"none", marginBottom:12, display:"block", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" },
  errBanner:    { background:"#fff5f5", border:"1px solid #fca5a5", borderRadius:9, padding:"9px 14px", fontSize:12, color:"#991b1b", textAlign:"center", marginBottom:12, width:"100%", maxWidth:320, fontFamily:"'DM Sans',sans-serif" },
  btnPrimary:   { width:"100%", maxWidth:320, background:"#1a1a2e", color:"#F5F0E8", fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:15, padding:"15px 20px", borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 2px 8px rgba(26,26,46,0.18)" },
  btnSecondary: { width:"100%", background:"#fff", border:"1px solid #E8E5DC", color:"#1a1a2e", fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:14, padding:"13px 18px", borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" },
  btnGhost:     { background:"transparent", border:"1px solid #E8E5DC", color:"#9a8f7e", fontFamily:"'DM Sans',sans-serif", fontWeight:500, fontSize:13, padding:"11px 16px", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", gap:8 },
  btnDisabled:  { width:"100%", maxWidth:320, background:"#E8E5DC", color:"#bbb5a8", fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:15, padding:"15px 20px", borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center", gap:8 },
  header:       { background:"#1a1a2e", borderBottom:"3px solid #C8A84B", padding:"14px 22px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"fixed", top:0, left:0, right:0, zIndex:40, boxShadow:"0 4px 20px rgba(26,26,46,0.25)" },
  headerIcon:   { width:40, height:40, background:"rgba(200,168,75,0.15)", border:"1px solid rgba(200,168,75,0.4)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" },
  balancePill:  { background:"#C8A84B", padding:"7px 16px", borderRadius:20 },
  body:         { maxWidth:"95%", margin:"0 auto", padding:"24px 18px", paddingTop:"100px" },
  statsRow:     { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 },
  statCard:     { background:"#fff", border:"1px solid #E8E5DC", borderRadius:13, padding:"14px 10px", display:"flex", flexDirection:"column", alignItems:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" },
  progWrap:     { height:5, background:"#E8E5DC", borderRadius:4, overflow:"hidden", marginBottom:7 },
  progBar:      { height:"100%", background:"linear-gradient(90deg,#C8A84B,#2d6a4f)", borderRadius:4, transition:"width 0.5s ease" },
  backBtn:      { background:"#fff", border:"1px solid #E8E5DC", borderRadius:9, padding:"7px 9px", display:"flex", alignItems:"center", color:"#9a8f7e", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" },
  passage:      { background:"#fff", borderLeft:"4px solid #C8A84B", borderTop:"1px solid #E8E5DC", borderRight:"1px solid #E8E5DC", borderBottom:"1px solid #E8E5DC", borderRadius:"0 12px 12px 0", padding:"16px 18px", marginBottom:18, boxShadow:"0 1px 6px rgba(0,0,0,0.05)" },
  lockBox:      { width:60, height:60, background:"#fffbf0", border:"2px solid #C8A84B", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" },
  closeBtn:     { background:"#fff", border:"1px solid #E8E5DC", borderRadius:8, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", color:"#9a8f7e", fontSize:13, cursor:"pointer" },
  modalBackdrop:{ position:"fixed", inset:0, background:"rgba(26,26,46,0.55)", backdropFilter:"blur(6px)", WebkitBackdropFilter:"blur(6px)", zIndex:50 },
  modalCard:    { position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:51, width:"calc(100% - 48px)", maxWidth:380, border:"2px solid", borderRadius:24, padding:"32px 24px", display:"flex", flexDirection:"column", alignItems:"center", gap:16, animation:"modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards", boxShadow:"0 24px 60px rgba(0,0,0,0.15)" },
};
