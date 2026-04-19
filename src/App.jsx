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
import { S, DIFF_LIGHT } from "./styles";

import { STATIC_QUESTIONS, DIFF, RATES, AI_SYSTEM, AI_USER } from "./questions";
/* 17/04*/
const DOC_REF = doc(db, "progreso", "usuario-principal");
const fmt = (v) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(v);


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
  const [rates, setRates] = useState({ Fácil: 50, Intermedio: 150, Difícil: 250 });

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

  const allQs = useMemo(() => [
  ...(STATIC_QUESTIONS || []), 
  ...(extraQs || [])
], [extraQs]);
  const available = useMemo(() =>
    isReview ? allQs : allQs.filter(q => !attemptedIds.includes(q.id)),
    [allQs, attemptedIds, isReview]);
    
  const currentQ = isReview ? allQs[qIdx] : available[qIdx];

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
    // Esto asegura que la pantalla vuelva arriba al cambiar de pregunta
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (available.length === 0) { 
      setView("results"); 
      return; 
    }
    
    setQIdx(isReview ? (p => (p + 1) % available.length) : 0);
    setSelected(null); 
    setConfirmed(null); 
    setShowExp(false); 
    setCorrect(null);
  };

const generateWithAI = async () => {
    if (generating) return;
    setGenerating(true); 
    setErr(""); 
    setErrType("error");

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
      
      // 1. ESPIAR LA RESPUESTA (Crucial para ver qué manda el servidor)
      console.log("RAW DATA DE IA:", data);

      // Si el servidor manda success pero no manda el array de preguntas
      if (data.success && !data.questions && !data.preguntas && !Array.isArray(data)) {
        throw new Error("El servidor confirmó éxito pero NO envió las preguntas. Revisa el Backend.");
      }

      // 2. EXTRAER EL TEXTO (Buscamos en todas las rutas posibles de la API)
      let rawText = "";
      if (data.questions || data.preguntas) {
        rawText = JSON.stringify(data);
      } else {
        // Caso de APIs de streaming o raw de Gemini/Claude
        rawText = data.content?.map(b => b.text).join("") || data.text || JSON.stringify(data);
      }

      // 3. LIMPIEZA DE MARKDOWN (Elimina ```json ... ```)
      const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      
      // 4. EXTRAER SOLO EL OBJETO JSON (Ignora texto extra de la IA)
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No se encontró un formato JSON válido en la respuesta.");
      
      const parsed = JSON.parse(jsonMatch[0]);

      // 5. DETECTAR EL ARRAY DE PREGUNTAS
      const rawQs = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.preguntas || []);

      if (rawQs.length === 0) {
        throw new Error("La IA no incluyó ninguna pregunta en el listado.");
      }

      // 6. NORMALIZACIÓN (Formatear para que React entienda todo)
      const ts = Date.now();
      const newQs = rawQs.map((q, i) => {
        // Si las opciones vienen como [{id: 'A', text: '...'}], las pasamos a { A: '...' }
        let fixedOptions = {};
        if (Array.isArray(q.options)) {
          q.options.forEach(opt => {
            const key = opt.id || opt.key || "A";
            fixedOptions[key] = opt.text || opt.value || "";
          });
        } else {
          fixedOptions = q.options || {};
        }

        return {
          ...q,
          id: `gen_${ts}_${i}`,
          // Unimos el texto de contexto con la pregunta para comprensión lectora
          question: q.text ? `${q.text}\n\n${q.question}` : q.question,
          options: fixedOptions,
          correct: q.correct || q.respuesta || "A",
          difficulty: q.difficulty || "Intermedio",
          explanation: q.explanation || "Explicación generada automáticamente."
        };
      });

      // 7. ACTUALIZAR Y PERSISTIR
      const updated = [...extraQs, ...newQs];
      setExtraQs(updated);
      await persist({ extraQs: updated });
      
      setErrType("success");
      setErr(`✓ ${newQs.length} preguntas añadidas correctamente`);

    } catch (e) {
      console.error("DETALLE ERROR IA:", e);
      setErrType("error");
      setErr(`Error: ${e.message}`);
    } finally {
      setGenerating(false);
    }
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
        
        button{
          cursor:pointer;
          border:none;
          font-family:'DM Sans',sans-serif;
          transition: all 0.2s ease;
        }
        
        input{
          font-family:'DM Sans',sans-serif;
          color:#1a1a2e;
          transition: all 0.2s ease;
        }

        /* --- NUEVAS REGLAS DE INTERACCIÓN --- */
        .home-card { 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important; 
          cursor: pointer; 
        }
        
        .home-card:hover { 
          transform: translateY(-4px) scale(1.01); 
          box-shadow: 0 12px 24px rgba(200, 168, 75, 0.15) !important;
          border-color: #C8A84B !important;
        }

        input:focus {
          border-color: #1a1a2e !important;
          background-color: #fffbf0 !important;
          transform: scale(1.02);
          box-shadow: 0 6px 20px rgba(200, 168, 75, 0.2) !important;
          outline: none;
        }
        /* ------------------------------------ */

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

