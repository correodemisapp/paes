import { useState, useEffect, useMemo } from "react";
import { Trophy, Settings, ChevronRight, Brain, Lock, History, Send, Layers, Loader2, Sparkles, Upload, Wand2, ArrowLeft, Zap, XCircle, CheckCircle } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { STATIC_QUESTIONS, DIFF, RATES, AI_SYSTEM, AI_USER } from "./questions";

const DOC_REF = doc(db, "progreso", "usuario-principal");

const fmt = (v) => new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(v);

export default function App() {
  const [ready, setReady]           = useState(false);
  const [view, setView]             = useState("login");
  const [balance, setBalance]       = useState(0);
  const [completedIds, setCompleted]= useState([]);
  const [attemptedIds, setAttempted]= useState([]);
  const [extraQs, setExtraQs]       = useState([]);
  const [appIcon, setAppIcon]       = useState(null);
  const [successImage, setSuccessImage] = useState(null);
  const [errorImage, setErrorImage]     = useState(null);
  const [isReview, setIsReview]     = useState(false);
  const [qIdx, setQIdx]             = useState(0);
  const [selected, setSelected]     = useState(null);
  const [confirmed, setConfirmed]   = useState(null);
  const [showExp, setShowExp]       = useState(false);
  const [correct, setCorrect]       = useState(null);
  const [loginPass, setLoginPass]   = useState("");
  const [settingsPass, setSettingsPass] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [err, setErr]               = useState("");
  const [errType, setErrType]       = useState("error");
  const [generating, setGenerating] = useState(false);

  // ── CARGA INICIAL DESDE FIRESTORE ──
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
        }
      } catch (e) {
        console.error("Error cargando datos:", e);
      }
      setReady(true);
    })();
  }, []);

  // ── GUARDAR EN FIRESTORE ──
  const persist = async (patch) => {
    const state = {
      balance, completedIds, attemptedIds, extraQs,
      appIcon, successImage, errorImage,
      ...patch
    };
    try {
      await setDoc(DOC_REF, state);
    } catch (e) {
      console.error("Error guardando datos:", e);
    }
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
    const rate = RATES[currentQ.difficulty] || 100;
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
      const res = await fetch("https://api.anthropic.com/v1/messages", {
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
      const data = await res.json();
      const rawText = data.content?.map(b => b.text || "").join("") || "";
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Respuesta sin JSON válido");
      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.questions || !Array.isArray(parsed.questions)) throw new Error("Estructura JSON incorrecta");
      const ts = Date.now();
      const newQs = parsed.questions.map((q, i) => ({ ...q, id: `gen_${ts}_${i}` }));
      const updated = [...extraQs, ...newQs];
      setExtraQs(updated);
      await persist({ extraQs: updated });
      setErrType("success");
      setErr(`✓ ${newQs.length} preguntas PAES añadidas correctamente`);
    } catch (e) {
      setErrType("error");
      setErr(`Error: ${e.message}. Intenta nuevamente.`);
    } finally {
      setGenerating(false);
    }
  };

  const uploadImg = (e, type) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const b64 = reader.result;
      if (type === "icon")    { setAppIcon(b64);       await persist({ appIcon: b64 }); }
      if (type === "success") { setSuccessImage(b64);  await persist({ successImage: b64 }); }
      if (type === "error")   { setErrorImage(b64);    await persist({ errorImage: b64 }); }
    };
    reader.readAsDataURL(file);
  };

  const resetAll = async () => {
    if (!confirm("¿Reiniciar todo el progreso?")) return;
    const reset = { balance: 0, completedIds: [], attemptedIds: [] };
    setBalance(0); setCompleted([]); setAttempted([]);
    await persist(reset);
    goHome();
  };

  const accuracy = attemptedIds.length > 0 ? Math.round((completedIds.length / attemptedIds.length) * 100) : 0;

  if (!ready) return (
    <div style={S.center}>
      <Loader2 style={{ width:32, height:32, color:"#F5C842", animation:"spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        button{cursor:pointer;border:none;font-family:'DM Sans',sans-serif}
        input{font-family:'DM Sans',sans-serif}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .fade{animation:fadeUp 0.3s ease}
        button:disabled{cursor:not-allowed}
      `}</style>

      {view === "login" && (
        <div style={S.loginWrap} className="fade">
          <div style={S.loginIconBox}>
            {appIcon ? <img src={appIcon} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:18}} alt="" /> : <span style={{fontSize:32}}>📚</span>}
          </div>
          <p style={S.eyebrow}>Competencia Lectora</p>
          <h1 style={S.bigTitle}>PAES<br/>Premium</h1>
          <p style={S.subtitle}>Tu entrenador personal de lectura</p>
          {err && <p style={S.errBanner}>{err}</p>}
          <input type="password" value={loginPass} placeholder="Contraseña"
            onChange={e => { setLoginPass(e.target.value); setErr(""); }}
            onKeyDown={e => e.key === "Enter" && (loginPass === "ElaEdionda" ? setView("home") : setErr("Clave incorrecta"))}
            style={S.loginInput}
          />
          <button onClick={() => loginPass === "ElaEdionda" ? setView("home") : setErr("Clave incorrecta")} style={S.btnGold}>
            Ingresar <ChevronRight style={{width:18,height:18}} />
          </button>
        </div>
      )}

      {view !== "login" && (
        <>
          <div style={S.header}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={S.headerIcon}>
                {appIcon
                  ? <img src={appIcon} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:13}} alt="" />
                  : <Brain style={{width:20,height:20,color:"#F5C842"}} />}
              </div>
              <div>
                <p style={{fontFamily:"Syne",fontWeight:700,fontSize:14,color:"#F1F0EC"}}>PAES Premium</p>
                <p style={{fontSize:10,color:"#F5C842",fontWeight:600,letterSpacing:"0.06em"}}>Guardado ✦</p>
              </div>
            </div>
            <div style={S.balancePill}>
              <span style={{fontSize:10,color:"#F5C842",fontWeight:700}}>CLP</span>
              <span style={{fontFamily:"Syne",fontWeight:800,fontSize:17,color:"#F5C842"}}>{fmt(balance).replace(/[^0-9.,]/g,"")}</span>
            </div>
          </div>

          <div style={S.body}>
            {view === "home" && (
              <div className="fade">
                <div style={S.statsRow}>
                  {[
                    { icon:<Layers style={{width:16,height:16,color:"#8B8FA8",marginBottom:6}}/>, val:`${attemptedIds.length}`, sub:`/${allQs.length}`, label:"Respondidas", col:"#F1F0EC" },
                    { icon:<Trophy style={{width:16,height:16,color:"#F5C842",marginBottom:6}}/>, val:`${completedIds.length}`, label:"Correctas", col:"#F5C842" },
                    { icon:<Zap style={{width:16,height:16,color:"#4ade80",marginBottom:6}}/>, val:`${accuracy}%`, label:"Precisión", col:"#4ade80" },
                  ].map((s,i) => (
                    <div key={i} style={S.statCard}>
                      {s.icon}
                      <p style={{fontFamily:"Syne",fontWeight:800,fontSize:24,color:s.col,lineHeight:1,marginBottom:4}}>
                        {s.val}<span style={{fontSize:13,color:"#8B8FA8",fontWeight:400}}>{s.sub||""}</span>
                      </p>
                      <p style={{fontSize:10,color:"#8B8FA8",textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:600}}>{s.label}</p>
                    </div>
                  ))}
                </div>
                <div style={S.progWrap}>
                  <div style={{...S.progBar, width:`${allQs.length > 0 ? (attemptedIds.length / allQs.length) * 100 : 0}%`}} />
                </div>
                <p style={{fontSize:11,color:"#8B8FA8",textAlign:"right",marginBottom:28}}>{allQs.length - attemptedIds.length} pendientes</p>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <button disabled={available.length === 0} onClick={() => { setIsReview(false); setQIdx(0); setView("test"); }} style={available.length === 0 ? S.btnDisabled : S.btnGold}>
                    Iniciar Entrenamiento <ChevronRight style={{width:18,height:18}} />
                  </button>
                  <button onClick={() => { setIsReview(true); setQIdx(0); setView("test"); }} style={S.btnOutline}>
                    <History style={{width:16,height:16}} /> Repasar Todo
                  </button>
                  <button onClick={() => setView("settings")} style={S.btnGhost}>
                    <Settings style={{width:14,height:14}} /> Configuración Parental
                  </button>
                </div>
              </div>
            )}

            {view === "test" && currentQ && (() => {
              const d = DIFF[currentQ.difficulty] || DIFF.Fácil;
              return (
                <div className="fade">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
                    <button onClick={goHome} style={S.backBtn}><ArrowLeft style={{width:15,height:15}} /></button>
                    <span style={{...S.badge, color:d.color, background:d.bg, border:`1px solid ${d.border}`}}>{currentQ.difficulty}</span>
                    <span style={{fontSize:11,color:"#8B8FA8",fontWeight:600}}>{currentQ.category}</span>
                  </div>
                  <div style={S.passage}>
                    <div style={S.passageBar} />
                    <div style={{paddingLeft:14, maxHeight:220, overflowY:"auto"}}>
                      {currentQ.text.split("\n\n").map((p, i) => (
                        <p key={i} style={{fontSize:13,color:"#C8CAD6",lineHeight:1.8,marginBottom:i < currentQ.text.split("\n\n").length-1 ? 12 : 0}}>{p}</p>
                      ))}
                    </div>
                  </div>
                  <h3 style={{fontFamily:"Syne",fontWeight:700,fontSize:16,color:"#F1F0EC",lineHeight:1.35,marginBottom:16}}>{currentQ.question}</h3>
                  <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:18}}>
                    {currentQ.options.map(opt => {
                      const isConf = confirmed === opt.id;
                      const isRight = showExp && opt.id === currentQ.correct;
                      let bg="#141520", border="1px solid #1C1E2A", lBg="rgba(255,255,255,0.06)", lCol="#8B8FA8";
                      if (!showExp && selected === opt.id) { bg="rgba(245,200,66,0.06)"; border="1px solid rgba(245,200,66,0.35)"; lBg="#F5C842"; lCol="#0A0B0F"; }
                      if (isConf && correct)  { bg="rgba(74,222,128,0.06)";  border="1px solid rgba(74,222,128,0.35)"; }
                      if (isConf && !correct) { bg="rgba(248,113,113,0.06)"; border="1px solid rgba(248,113,113,0.35)"; }
                      if (isRight && !isConf) { bg="rgba(74,222,128,0.06)";  border="1px solid rgba(74,222,128,0.35)"; }
                      return (
                        <button key={opt.id} disabled={!!showExp} onClick={() => setSelected(opt.id)}
                          style={{background:bg,border,borderRadius:13,padding:"12px 14px",display:"flex",alignItems:"flex-start",gap:12,textAlign:"left",transition:"all 0.15s"}}>
                          <span style={{width:30,height:30,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",background:lBg,color:lCol,fontFamily:"Syne",fontWeight:700,fontSize:12,flexShrink:0,marginTop:1}}>{opt.id}</span>
                          <span style={{fontSize:13,color:"#C8CAD6",fontWeight:500,lineHeight:1.5}}>{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                  {!showExp ? (
                    <button disabled={!selected} onClick={confirmAnswer} style={!selected ? S.btnDisabled : S.btnGold}>
                      <Send style={{width:16,height:16}} /> Confirmar Respuesta
                    </button>
                  ) : (
                    <div style={{background:correct?"rgba(74,222,128,0.06)":"rgba(248,113,113,0.06)", border:`1px solid ${correct?"rgba(74,222,128,0.25)":"rgba(248,113,113,0.25)"}`, borderRadius:18, padding:20, display:"flex", flexDirection:"column", alignItems:"center", gap:12}}>
                      {(correct ? successImage : errorImage) && (
                        <img src={correct ? successImage : errorImage} style={{width:"100%",maxWidth:240,borderRadius:12,objectFit:"contain"}} alt="" />
                      )}
                      {!(correct ? successImage : errorImage) && (
                        correct
                          ? <CheckCircle style={{width:40,height:40,color:"#4ade80"}} />
                          : <XCircle style={{width:40,height:40,color:"#f87171"}} />
                      )}
                      <p style={{fontFamily:"Syne",fontWeight:800,fontSize:20,color:correct?"#4ade80":"#f87171"}}>{correct?"¡Correcto!":"¡Ánimo, tú puedes!"}</p>
                      <p style={{fontSize:12,color:"#8B8FA8",textAlign:"center",lineHeight:1.7}}>{currentQ.explanation}</p>
                      <button onClick={nextQ} style={{...S.btnOutline,width:"100%"}}>
                        Siguiente <ChevronRight style={{width:16,height:16}} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {view === "settings" && (
              <div className="fade">
                {!settingsOpen ? (
                  <div style={{textAlign:"center",paddingTop:32}}>
                    <div style={S.lockBox}><Lock style={{width:26,height:26,color:"#F5C842"}} /></div>
                    <h2 style={{fontFamily:"Syne",fontWeight:800,fontSize:22,color:"#F1F0EC",marginBottom:6}}>Acceso Parental</h2>
                    <p style={{fontSize:13,color:"#8B8FA8",marginBottom:24}}>Ingresa la clave de configuración</p>
                    {err && <p style={S.errBanner}>{err}</p>}
                    <input type="password" value={settingsPass} placeholder="Contraseña"
                      onChange={e => { setSettingsPass(e.target.value); setErr(""); }}
                      onKeyDown={e => e.key === "Enter" && (settingsPass === "camboropaes" ? setSettingsOpen(true) : setErr("Clave incorrecta"))}
                      style={{...S.loginInput, marginBottom:12}}
                    />
                    <div style={{display:"flex",gap:10}}>
                      <button onClick={goHome} style={{...S.btnGhost,flex:1}}>Volver</button>
                      <button onClick={() => settingsPass === "camboropaes" ? setSettingsOpen(true) : setErr("Clave incorrecta")} style={{...S.btnGold,flex:2}}>
                        Entrar <ChevronRight style={{width:15,height:15}} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
                      <h2 style={{fontFamily:"Syne",fontWeight:800,fontSize:20,color:"#F1F0EC"}}>Configuración</h2>
                      <button onClick={() => { setSettingsOpen(false); goHome(); }} style={S.closeBtn}>✕</button>
                    </div>
                    <div style={{background:"#141520",border:"1px solid rgba(245,200,66,0.2)",borderRadius:16,padding:18,marginBottom:16}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                        <Sparkles style={{width:18,height:18,color:"#F5C842"}} />
                        <p style={{fontFamily:"Syne",fontWeight:700,fontSize:15,color:"#F5C842"}}>Generar Preguntas PAES con IA</p>
                      </div>
                      <p style={{fontSize:12,color:"#8B8FA8",marginBottom:14}}>Genera 3 preguntas nuevas con textos y criterios PAES reales.</p>
                      {err && (
                        <p style={{...S.errBanner, borderColor: errType==="success"?"rgba(74,222,128,0.25)":"rgba(248,113,113,0.2)", background: errType==="success"?"rgba(74,222,128,0.08)":"rgba(248,113,113,0.1)", color: errType==="success"?"#4ade80":"#f87171"}}>
                          {err}
                        </p>
                      )}
                      <button onClick={generateWithAI} disabled={generating} style={generating ? S.btnDisabled : S.btnGold}>
                        {generating ? <Loader2 style={{width:15,height:15,animation:"spin 1s linear infinite"}} /> : <Wand2 style={{width:15,height:15}} />}
                        {generating ? "Generando preguntas..." : "Generar 3 Preguntas PAES"}
                      </button>
                      <p style={{fontSize:11,color:"#4A4C60",marginTop:10,textAlign:"center"}}>
                        {extraQs.length} preguntas generadas · {allQs.length} total
                      </p>
                    </div>
                    <div style={{background:"#141520",border:"1px solid #1C1E2A",borderRadius:14,padding:16,marginBottom:14}}>
                      <p style={{fontSize:10,color:"#8B8FA8",textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:700,marginBottom:12}}>Multimedia</p>
                      {[
                        { label:"Imagen de acierto ✓", type:"success" },
                        { label:"Imagen de error ✗", type:"error" },
                        { label:"Icono de la app", type:"icon" },
                      ].map(item => (
                        <label key={item.type} style={{display:"flex",alignItems:"center",gap:12,background:"#0E0F15",border:"1px solid #252738",borderRadius:10,padding:"11px 14px",marginBottom:8,cursor:"pointer"}}>
                          <Upload style={{width:14,height:14,color:"#8B8FA8"}} />
                          <span style={{fontSize:13,color:"#C8CAD6"}}>{item.label}</span>
                          <input type="file" style={{display:"none"}} accept="image/*" onChange={e => uploadImg(e, item.type)} />
                        </label>
                      ))}
                    </div>
                    <button onClick={resetAll} style={{width:"100%",background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.25)",color:"#f87171",borderRadius:12,padding:"13px",fontSize:13,fontWeight:600,marginBottom:10}}>
                      Reiniciar Todo el Progreso
                    </button>
                    <button onClick={() => { setSettingsOpen(false); goHome(); }} style={{...S.btnGhost,width:"100%"}}>Cerrar</button>
                  </div>
                )}
              </div>
            )}

            {view === "results" && (
              <div className="fade" style={{textAlign:"center",paddingTop:16}}>
                <div style={{width:88,height:88,background:"rgba(245,200,66,0.1)",border:"1px solid rgba(245,200,66,0.2)",borderRadius:22,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}>
                  <Trophy style={{width:44,height:44,color:"#F5C842"}} />
                </div>
                <h2 style={{fontFamily:"Syne",fontWeight:800,fontSize:26,color:"#F1F0EC",lineHeight:1.2,marginBottom:8}}>¡Entrenamiento<br/>Completo!</h2>
                <p style={{fontSize:13,color:"#8B8FA8",marginBottom:24}}>Has respondido todas las preguntas disponibles.</p>
                <div style={{background:"#141520",border:"1px solid #1C1E2A",borderRadius:18,padding:"24px 20px",marginBottom:20}}>
                  <p style={{fontSize:11,color:"#8B8FA8",textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:8}}>Dinero Acumulado</p>
                  <p style={{fontFamily:"Syne",fontWeight:800,fontSize:40,color:"#F5C842"}}>{fmt(balance)}</p>
                  <div style={{display:"flex",justifyContent:"center",gap:28,marginTop:16}}>
                    <div><p style={{fontFamily:"Syne",fontWeight:700,fontSize:20,color:"#fff"}}>{completedIds.length}</p><p style={{fontSize:11,color:"#8B8FA8"}}>Correctas</p></div>
                    <div style={{width:1,background:"#252738"}} />
                    <div><p style={{fontFamily:"Syne",fontWeight:700,fontSize:20,color:"#4ade80"}}>{accuracy}%</p><p style={{fontSize:11,color:"#8B8FA8"}}>Precisión</p></div>
                  </div>
                </div>
                <button onClick={goHome} style={S.btnGold}>Volver al Inicio <ChevronRight style={{width:18,height:18}} /></button>
              </div>
            )}
          </div>
          <div style={{textAlign:"center",padding:"18px",fontSize:10,color:"#3A3D52",letterSpacing:"0.1em",textTransform:"uppercase",borderTop:"1px solid #1C1E2A"}}>PAES Study Cloud · 2025</div>
        </>
      )}
    </div>
  );
}

const S = {
  root:        { minHeight:"100vh", background:"#0A0B0F", fontFamily:"'DM Sans',sans-serif", color:"#F1F0EC" },
  center:      { minHeight:"100vh", background:"#0A0B0F", display:"flex", alignItems:"center", justifyContent:"center" },
  loginWrap:   { minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:28 },
  loginIconBox:{ width:76, height:76, background:"#141520", border:"1px solid #252738", borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:22, overflow:"hidden" },
  eyebrow:     { fontSize:10, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:"#F5C842", marginBottom:8 },
  bigTitle:    { fontFamily:"Syne", fontWeight:800, fontSize:46, lineHeight:1.05, textAlign:"center", color:"#F1F0EC", marginBottom:8 },
  subtitle:    { fontSize:13, color:"#8B8FA8", marginBottom:32, textAlign:"center" },
  loginInput:  { width:"100%", maxWidth:320, background:"#141520", border:"1px solid #252738", borderRadius:13, padding:"15px 18px", fontSize:15, color:"#F1F0EC", textAlign:"center", letterSpacing:"0.3em", outline:"none", marginBottom:12, display:"block" },
  errBanner:   { background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)", borderRadius:10, padding:"9px 14px", fontSize:12, color:"#f87171", textAlign:"center", marginBottom:12, width:"100%", maxWidth:320 },
  btnGold:     { width:"100%", maxWidth:320, background:"#F5C842", color:"#0A0B0F", fontFamily:"Syne", fontWeight:700, fontSize:15, padding:"15px 20px", borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center", gap:8 },
  btnOutline:  { width:"100%", background:"#141520", border:"1px solid #252738", color:"#F1F0EC", fontFamily:"Syne", fontWeight:700, fontSize:14, padding:"13px 18px", borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center", gap:8 },
  btnGhost:    { background:"transparent", border:"1px solid #252738", color:"#8B8FA8", fontFamily:"DM Sans", fontWeight:500, fontSize:13, padding:"12px 16px", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", gap:8 },
  btnDisabled: { width:"100%", maxWidth:320, background:"#252738", color:"#4A4C60", fontFamily:"Syne", fontWeight:700, fontSize:15, padding:"15px 20px", borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center", gap:8 },
  header:      { background:"#0E0F15", borderBottom:"1px solid #1C1E2A", padding:"16px 22px", display:"flex", justifyContent:"space-between", alignItems:"center" },
  headerIcon:  { width:42, height:42, background:"#141520", border:"1px solid #252738", borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" },
  balancePill: { background:"rgba(245,200,66,0.1)", border:"1px solid rgba(245,200,66,0.22)", borderRadius:11, padding:"7px 14px", display:"flex", alignItems:"baseline", gap:5 },
  body:        { maxWidth:540, margin:"0 auto", padding:"24px 18px" },
  statsRow:    { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9, marginBottom:16 },
  statCard:    { background:"#141520", border:"1px solid #1C1E2A", borderRadius:14, padding:"16px 10px", display:"flex", flexDirection:"column", alignItems:"center" },
  progWrap:    { height:4, background:"#1C1E2A", borderRadius:4, overflow:"hidden", marginBottom:6 },
  progBar:     { height:"100%", background:"linear-gradient(90deg,#F5C842,#4ade80)", borderRadius:4, transition:"width 0.5s ease" },
  backBtn:     { background:"#141520", border:"1px solid #252738", borderRadius:10, padding:"7px 9px", display:"flex", alignItems:"center", color:"#8B8FA8" },
  badge:       { fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", padding:"4px 11px", borderRadius:7 },
  passage:     { background:"#141520", border:"1px solid #1C1E2A", borderRadius:14, padding:18, marginBottom:16, position:"relative", overflow:"hidden" },
  passageBar:  { position:"absolute", left:0, top:0, bottom:0, width:3, background:"#F5C842" },
  lockBox:     { width:60, height:60, background:"#141520", border:"1px solid #252738", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" },
  closeBtn:    { background:"#141520", border:"1px solid #252738", borderRadius:9, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", color:"#8B8FA8", fontSize:13, cursor:"pointer" },
};
