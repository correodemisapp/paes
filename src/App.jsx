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
  const [extraQs, setExtraQs]           = useState([]); // <--- Ahora viene de Vercel KV
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

  // --- CARGA INICIAL UNIFICADA (Firebase + Vercel) ---
  useEffect(() => {
    (async () => {
      try {
        // 1. Cargar progreso, imágenes y configuración de Firebase
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

        // 2. Cargar preguntas dinámicas de Vercel KV
        const res = await fetch('/api/questions');
        const data = await res.json();
        if (data.questions) setExtraQs(data.questions);

      } catch (e) { 
        console.error("Error cargando datos maestros:", e); 
      }
      setReady(true);
    })();
  }, []);

  const persist = async (patch) => {
    // Solo guardamos progreso y config en Firebase (ya no las preguntas)
    const state = { balance, completedIds, attemptedIds, appIcon, successImage, errorImage, rates, ...patch };
    try { await setDoc(DOC_REF, state); }
    catch (e) { console.error("Error guardando datos:", e); }
  };

const allQs = useMemo(() => [...(STATIC_QUESTIONS || []), ...(extraQs || [])], [extraQs]);

const available = useMemo(() =>
  isReview ? allQs : allQs.filter(q => q && q.id && !attemptedIds.includes(q.id)),
[allQs, attemptedIds, isReview]);
  
  // Clave: Si no hay disponibles, currentQ es null
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
    // Si era la última disponible de esta tanda, ir a resultados
    if (available.length <= 1 && !isReview) { setView("results"); return; }
    setQIdx(isReview ? (p => (p + 1) % available.length) : 0);
    setSelected(null); setConfirmed(null); setShowExp(false); setCorrect(null);
  };

  // --- GENERACIÓN CON IA (Vercel KV) ---
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
      if (!res.ok) throw new Error(`Error ${res.status}`);
      
      // Tras generar, refrescamos la lista desde la API
      const updatedRes = await fetch('/api/questions');
      const updatedData = await updatedRes.json();
      
      setExtraQs(updatedData.questions || []);
      setErrType("success");
      setErr(`✓ Preguntas añadidas correctamente a la nube`);
    } catch (e) {
      setErrType("error");
      setErr(`Error: ${e.message}`);
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
        </div>
      )}

      {view !== "login" && (
        <>
        <div style={S.header}>
  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
    <div style={S.headerIcon}>
      {appIcon ? (
        <img src={appIcon} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} alt="" />
      ) : (
        <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 16, color: "#C8A84B" }}>P</span>
      )}
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 14, color: "#F5F0E8", margin: 0, lineHeight: 1.1 }}>
        PAES Premium
      </p>
      
      {/* Contador de preguntas */}
      <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#C8A84B", margin: "2px 0", fontWeight: 600 }}>
        {attemptedIds?.length || 0} de {allQs?.length || 0} completadas
      </p>

      {/* Mini Barra de Progreso en el Título */}
      <div style={{ width: "100%", maxWidth: "120px", height: "3px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", marginTop: "4px", overflow: "hidden" }}>
        <div style={{ 
          width: `${allQs?.length > 0 ? ((attemptedIds?.length || 0) / allQs.length) * 100 : 0}%`, 
          height: "100%", 
          background: "#C8A84B", 
          transition: "width 0.4s ease" 
        }} />
      </div>
    </div>
  </div>
  
  <div style={S.balancePill}>
    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, fontSize: 13, color: "#1a1a2e" }}>
      {fmt(balance || 0)}
    </span>
  </div>
</div>
  
  <div style={S.balancePill}>
    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, fontSize: 14, color: "#1a1a2e" }}>
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

            {view === "test" && (
              <div className="fade">
                {!currentQ ? (
                  // --- MENSAJE DE FIN DE PREGUNTAS ---
                  <div style={{textAlign:"center", padding:"40px 20px"}}>
                    <div style={S.lockBox}><XCircle style={{width:32, height:32, color:"#991b1b"}} /></div>
                    <h2 style={{fontFamily:"'Playfair Display',serif", fontSize:26, color:"#1a1a2e", marginBottom:10}}>¡Sin preguntas nuevas!</h2>
                    <p style={{fontFamily:"'DM Sans',sans-serif", color:"#9a8f7e", marginBottom:24, lineHeight:1.6}}>Has completado todos los desafíos disponibles por ahora.</p>
                    <button onClick={() => setView("settings")} style={S.btnPrimary}>
                      <Sparkles style={{width:16, height:16}} /> Generar más con IA
                    </button>
                    <button onClick={goHome} style={{...S.btnGhost, marginTop:12, width:"100%"}}>Volver al inicio</button>
                  </div>
                ) : (() => {
                  const d = DIFF_LIGHT[currentQ.difficulty] || DIFF_LIGHT.Fácil;
                  return (
                    <>
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
                          if (isConf && correct)               { bg="#f0faf4"; border="1px solid #86efac"; lBg="#2d6a4f"; lCol="#fff"; }
                          if (isConf && !correct)              { bg="#fff5f5"; border="1px solid #fca5a5"; lBg="#991b1b"; lCol="#fff"; }
                          if (isRight && !isConf)              { bg="#f0faf4"; border="1px solid #86efac"; lBg="#2d6a4f"; lCol="#fff"; }
                          return (
                            <button key={opt.id} disabled={!!showExp} onClick={() => setSelected(opt.id)}
                              style={{background:bg,border,borderRadius:11,padding:"12px 14px",display:"flex",alignItems:"flex-start",gap:12,textAlign:"left",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                              <span style={{width:30,height:30,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",background:lBg,color:lCol,fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,fontSize:12,flexShrink:0,marginTop:1}}>{opt.id}</span>
                              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#3d3628",fontWeight:500,lineHeight:1.55}}>{opt.text}</span>
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
                            <p style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:22,color:correct?"#2d6a4f":"#991b1b",textAlign:"center"}}>{correct ? "¡Correcto!" : "¡Ánimo!"}</p>
                            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#5a5040",textAlign:"center",lineHeight:1.8}}>{currentQ.explanation}</p>
                            <button onClick={nextQ} style={{...S.btnPrimary, width:"100%", background:correct?"#2d6a4f":"#1a1a2e"}}>
                              Siguiente <ChevronRight style={{width:16,height:16}} />
                            </button>
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
                  <div style={{textAlign:"center",paddingTop:32}}>
                    <div style={S.lockBox}><Lock style={{width:24,height:24,color:"#C8A84B"}} /></div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:22,marginBottom:6}}>Acceso Parental</h2>
                    <input type="password" value={settingsPass} placeholder="Contraseña"
                      onChange={e => { setSettingsPass(e.target.value); setErr(""); }}
                      onKeyDown={e => e.key === "Enter" && (settingsPass === "camboropaes" ? setSettingsOpen(true) : setErr("Clave incorrecta"))}
                      style={{...S.loginInput, marginBottom:12}}
                    />
                    <div style={{display:"flex",gap:10}}>
                      <button onClick={goHome} style={{...S.btnGhost,flex:1}}>Volver</button>
                      <button onClick={() => settingsPass === "camboropaes" ? setSettingsOpen(true) : setErr("Clave incorrecta")} style={{...S.btnPrimary,flex:2}}>Entrar</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
                      <h2 style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:20}}>Configuración</h2>
                      <button onClick={() => { setSettingsOpen(false); goHome(); }} style={S.closeBtn}>✕</button>
                    </div>

                    <div style={{background:"#fff",border:"1px solid #E8E5DC",borderLeft:"4px solid #C8A84B",borderRadius:"0 12px 12px 0",padding:18,marginBottom:14}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                        <Sparkles style={{width:15,height:15,color:"#C8A84B"}} />
                        <p style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:15}}>Generar con IA (Nube)</p>
                      </div>
                      {err && <p style={{...S.errBanner, borderColor: errType==="success"?"#86efac":"#fca5a5", background: errType==="success"?"#f0faf4":"#fff5f5"}}>{err}</p>}
                      <button onClick={generateWithAI} disabled={generating} style={generating ? S.btnDisabled : S.btnPrimary}>
                        {generating ? <Loader2 style={{width:14,height:14,animation:"spin 1s linear infinite"}} /> : <Wand2 style={{width:14,height:14}} />}
                        {generating ? "Guardando en Vercel..." : "Generar 3 Preguntas PAES"}
                      </button>
                      <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#bbb5a8",marginTop:10,textAlign:"center"}}>
                        {extraQs.length} en KV · {allQs.length} total
                      </p>
                    </div>

                    <button onClick={resetAll} style={{width:"100%",background:"#fff5f5",border:"1px solid #fca5a5",color:"#991b1b",borderRadius:11,padding:"13px",fontSize:13,fontWeight:600,marginBottom:10}}>Reiniciar Progreso</button>
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
                <h2 style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:28,marginBottom:8}}>¡Entrenamiento<br/>Completo!</h2>
                <div style={{background:"#fff",border:"1px solid #E8E5DC",borderRadius:18,padding:"24px 20px",marginBottom:20}}>
                  <p style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,fontSize:40,color:"#C8A84B"}}>{fmt(balance)}</p>
                  <p style={{fontSize:11,color:"#9a8f7e",textTransform:"uppercase"}}>Dinero Total</p>
                </div>
                <button onClick={goHome} style={S.btnPrimary}>Volver al Inicio</button>
              </div>
            )}
          </div>

          <div style={{textAlign:"center",padding:"18px",fontSize:10,color:"#ccc4b5",letterSpacing:"0.12em",textTransform:"uppercase",borderTop:"1px solid #E8E5DC"}}>
            PAES Study · 2026
          </div>
        </>
      )}
    </div>
  );
}

// --- ESTILOS (S) ---
const S = {
  root:         { minHeight:"100vh", background:"#FAFAF7", fontFamily:"'DM Sans',sans-serif", color:"#1a1a2e" },
  center:       { minHeight:"100vh", background:"#FAFAF7", display:"flex", alignItems:"center", justifyContent:"center" },
  loginWrap:    { minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:28, background:"#FAFAF7" },
  loginIconBox: { width:78, height:78, background:"#1a1a2e", border:"3px solid #C8A84B", borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:22, overflow:"hidden" },
  eyebrow:      { fontSize:10, fontWeight:600, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A84B", marginBottom:10 },
  bigTitle:     { fontFamily:"'Playfair Display',serif", fontWeight:800, fontSize:52, lineHeight:1, textAlign:"center", color:"#1a1a2e", marginBottom:10 },
  subtitle:     { fontSize:14, color:"#9a8f7e", marginBottom:32, textAlign:"center" },
  loginInput:   { width:"100%", maxWidth:320, background:"#fff", border:"1px solid #E8E5DC", borderRadius:11, padding:"14px 18px", fontSize:15, textAlign:"center", letterSpacing:"0.3em", outline:"none", marginBottom:12, display:"block" },
  errBanner:    { background:"#fff5f5", border:"1px solid #fca5a5", borderRadius:9, padding:"9px 14px", fontSize:12, color:"#991b1b", textAlign:"center", marginBottom:12, width:"100%", maxWidth:320 },
  btnPrimary:   { width:"100%", maxWidth:320, background:"#1a1a2e", color:"#F5F0E8", fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:15, padding:"15px 20px", borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center", gap:8 },
  btnSecondary: { width:"100%", background:"#fff", border:"1px solid #E8E5DC", color:"#1a1a2e", fontWeight:600, fontSize:14, padding:"13px 18px", borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center", gap:8 },
  btnGhost:     { background:"transparent", border:"1px solid #E8E5DC", color:"#9a8f7e", fontWeight:500, fontSize:13, padding:"11px 16px", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", gap:8 },
  btnDisabled:  { width:"100%", maxWidth:320, background:"#E8E5DC", color:"#bbb5a8", fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:15, padding:"15px 20px", borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center", gap:8 },
  header:       { background:"#1a1a2e", borderBottom:"3px solid #C8A84B", padding:"14px 22px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"fixed", top:0, left:0, right:0, zIndex:40 },
  headerIcon:   { width:40, height:40, background:"rgba(200,168,75,0.15)", border:"1px solid rgba(200,168,75,0.4)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" },
  balancePill:  { background:"#C8A84B", padding:"7px 16px", borderRadius:20 },
  body:         { maxWidth:"95%", margin:"0 auto", padding:"24px 18px", paddingTop:"100px" },
  statsRow:     { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 },
  statCard:     { background:"#fff", border:"1px solid #E8E5DC", borderRadius:13, padding:"14px 10px", display:"flex", flexDirection:"column", alignItems:"center" },
  progWrap:     { height:5, background:"#E8E5DC", borderRadius:4, overflow:"hidden", marginBottom:7 },
  progBar:      { height:"100%", background:"linear-gradient(90deg,#C8A84B,#2d6a4f)", borderRadius:4, transition:"width 0.5s ease" },
  backBtn:      { background:"#fff", border:"1px solid #E8E5DC", borderRadius:9, padding:"7px 9px", display:"flex", alignItems:"center", color:"#9a8f7e" },
  passage:      { background:"#fff", borderLeft:"4px solid #C8A84B", borderTop:"1px solid #E8E5DC", borderRight:"1px solid #E8E5DC", borderBottom:"1px solid #E8E5DC", borderRadius:"0 12px 12px 0", padding:"16px 18px", marginBottom:18 },
  lockBox:      { width:60, height:60, background:"#fffbf0", border:"2px solid #C8A84B", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" },
  closeBtn:     { background:"#fff", border:"1px solid #E8E5DC", borderRadius:8, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", color:"#9a8f7e", fontSize:13 },
  modalBackdrop:{ position:"fixed", inset:0, background:"rgba(26,26,46,0.55)", backdropFilter:"blur(6px)", zIndex:50 },
  modalCard:    { position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:51, width:"calc(100% - 48px)", maxWidth:380, border:"2px solid", borderRadius:24, padding:"32px 24px", display:"flex", flexDirection:"column", alignItems:"center", gap:16, animation:"modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards" },
};