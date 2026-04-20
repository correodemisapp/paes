import { useState, useEffect, useMemo } from "react";
import { 
  Trophy, Settings, ChevronRight, Brain, Lock, History, Send, 
  Layers, Loader2, Sparkles, Upload, Wand2, ArrowLeft, Zap, 
  XCircle, CheckCircle, Trash2 
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

// Configuración de Referencia a la Base de Datos (Firebase)
const DOC_REF = doc(db, "progreso", "usuario-principal");

// Formateador de Moneda
const fmt = (v) => new Intl.NumberFormat("es-CL", { 
  style: "currency", 
  currency: "CLP", 
  maximumFractionDigits: 0 
}).format(v);

export default function App() {
  // --- ESTADOS PRINCIPALES ---
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("login");
  const [balance, setBalance] = useState(0);
  const [completedIds, setCompleted] = useState([]);
  const [attemptedIds, setAttempted] = useState([]);
  const [extraQs, setExtraQs] = useState([]);
  const [appIcon, setAppIcon] = useState(null);
  const [successImage, setSuccessImage] = useState(null);
  const [errorImage, setErrorImage] = useState(null);
  
  // --- ESTADOS DE NAVEGACIÓN Y JUEGO ---
  const [isReview, setIsReview] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(null);
  const [showExp, setShowExp] = useState(false);
  const [correct, setCorrect] = useState(null);
  
  // --- ESTADOS DE SEGURIDAD Y ADMIN ---
  const [loginPass, setLoginPass] = useState("");
  const [settingsPass, setSettingsPass] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [err, setErr] = useState("");
  const [errType, setErrType] = useState("error");
  const [generating, setGenerating] = useState(false);
  const [rates, setRates] = useState({ Fácil: 50, Intermedio: 150, Difícil: 250 });

  // --- CARGA INICIAL (FIREBASE) ---
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
      } catch (e) { 
        console.error("Error cargando datos de Firebase:", e); 
      }
      setReady(true);
    })();
  }, []);

  // --- PERSISTENCIA (PROTECCIÓN DE DATOS) ---
  const persist = async (patch) => {
    try {
      // Usamos merge: true para no borrar campos como el icono si no vienen en el parche
      await setDoc(DOC_REF, {
        balance,
        completedIds,
        attemptedIds,
        extraQs,
        appIcon,
        successImage,
        errorImage,
        rates,
        ...patch 
      }, { merge: true });
    } catch (e) {
      console.error("❌ Error crítico en Firebase:", e);
    }
  };

  // --- LÓGICA DE PREGUNTAS (USEMEMO) ---
  const allQs = useMemo(() => [
    ...(STATIC_QUESTIONS || []), 
    ...(extraQs || [])
  ], [extraQs]);
  
  // Preguntas no intentadas
  const available = useMemo(() => 
    allQs.filter(q => !attemptedIds.includes(q.id)), 
    [allQs, attemptedIds]
  );

  // Preguntas para el Modo Repaso (Intentadas)
  const reviewQs = useMemo(() => 
    allQs.filter(q => attemptedIds.includes(q.id)), 
    [allQs, attemptedIds]
  );

  // Selección de la pregunta actual según el modo
  const currentQ = isReview ? reviewQs[qIdx] : available[qIdx];

  // --- FUNCIONES DE NAVEGACIÓN ---
  const goHome = () => {
    setView("home"); 
    setSelected(null); 
    setConfirmed(null);
    setShowExp(false); 
    setCorrect(null); 
    setErr("");
  };

  const confirmAnswer = async () => {
    if (!selected || showExp || !currentQ) return;

    const isC = selected === currentQ.correct;
    const rate = rates[currentQ.difficulty] || 100;
    
    setCorrect(isC); 
    setConfirmed(selected); 
    setShowExp(true);

    const newAttempted = attemptedIds.includes(currentQ.id) 
      ? attemptedIds 
      : [...attemptedIds, currentQ.id];
      
    const newCompleted = (isC && !completedIds.includes(currentQ.id)) 
      ? [...completedIds, currentQ.id] 
      : completedIds;

    const newBalance = (isC && !completedIds.includes(currentQ.id)) 
      ? balance + rate
      : (!isC && !completedIds.includes(currentQ.id)) 
        ? Math.max(0, balance - (rate * 0.5))
        : balance;

    setAttempted(newAttempted); 
    setCompleted(newCompleted); 
    setBalance(newBalance);

    // Guardar progreso en la nube
    await persist({ 
      balance: newBalance, 
      completedIds: newCompleted, 
      attemptedIds: newAttempted 
    });
  };

  const nextQ = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Si estamos en modo normal y no quedan más, ir a resultados
    if (!isReview && available.length <= 1) { 
      setView("results"); 
      return; 
    }
    
    // En repaso, ciclar las preguntas
    if (isReview) {
      setQIdx((prev) => (prev + 1) % reviewQs.length);
    } else {
      setQIdx(0); // Siempre la primera de las disponibles
    }

    setSelected(null); 
    setConfirmed(null); 
    setShowExp(false); 
    setCorrect(null);
  };

  // --- GENERACIÓN CON IA (UNIFICADO) ---
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
      
      // Limpieza de formato JSON de la IA
      const rawText = JSON.stringify(data);
      const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) throw new Error("Formato de IA inválido.");
      
      const parsed = JSON.parse(jsonMatch[0]);
      const rawQs = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.preguntas || []);

      const ts = Date.now();
      const newQs = rawQs.map((q, i) => ({
        ...q,
        id: `gen_${ts}_${i}`,
        question: q.question, 
        text: q.text || "", 
        options: Array.isArray(q.options) 
          ? q.options 
          : Object.entries(q.options).map(([id, text]) => ({ id, text })),
        correct: q.correct || q.respuesta || "A",
        difficulty: q.difficulty || "Intermedio",
        explanation: q.explanation || "Analiza el texto para comprender la respuesta."
      }));

      const updated = [...extraQs, ...newQs];
      setExtraQs(updated);
      await persist({ extraQs: updated });
      
      setErrType("success");
      setErr(`✓ ${newQs.length} preguntas añadidas correctamente`);

    } catch (e) {
      console.error("Error IA:", e);
      setErr(`Error: ${e.message}`);
    } finally {
      setGenerating(false);
    }
  };

  // --- GESTIÓN DE IMÁGENES ---
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

  // --- RESET TOTAL (PROTEGIENDO ICONOS Y PREGUNTAS) ---
  const resetAll = async () => {
    if (window.confirm("¿Limpiar historial de repaso y aciertos? (Mantendrás tus 13 preguntas e iconos)")) {
      try {
        const resetData = {
          balance: 0,
          attemptedIds: [], 
          completedIds: [],
          extraQs: extraQs,  // Mantenemos las preguntas generadas
          appIcon: appIcon || "", // Mantenemos el icono
          successImage: successImage || "",
          errorImage: errorImage || "",
          rates: rates
        };

        await setDoc(DOC_REF, resetData);
        
        setAttempted([]);
        setCompleted([]);
        setBalance(0);

        alert("¡Progreso de repaso eliminado!");
        setView("home");
      } catch (e) {
        console.error("Error en reset:", e);
      }
    }
  };

  const accuracy = attemptedIds.length > 0 
    ? Math.round((completedIds.length / attemptedIds.length) * 100) 
    : 0;

  // --- PANTALLA DE CARGA ---
  if (!ready) return (
    <div style={S.center}>
      <Loader2 style={{ width: 32, height: 32, color: "#C8A84B", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <div style={S.root}>
      {/* Estilos Globales e Inyectados */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;600&display=swap');
        
        *{box-sizing:border-box;margin:0;padding:0}
        
        button{
          cursor:pointer;
          border:none;
          font-family:'DM Sans',sans-serif;
          transition: all 0.2s ease;
        }
        
        .home-card { 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important; 
          cursor: pointer; 
        }
        
        .home-card:hover { 
          transform: translateY(-4px) scale(1.01); 
          box-shadow: 0 12px 24px rgba(200, 168, 75, 0.15) !important;
          border-color: #C8A84B !important;
        }

        .fade{animation:fadeUp 0.3s ease}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#C8A84B55;border-radius:4px}
      `}</style>

      {/* VISTA: LOGIN */}
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

      {/* VISTAS: APP (HEADER + BODY) */}
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
            {/* VISTA: HOME */}
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
                appIcon={appIcon} // Ahora el Home puede mostrar el logo
                S={S}
              />
            )}

            {/* VISTA: TEST / PREGUNTAS */}
            {view === "test" && (
              currentQ ? (
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
              ) : (
                <div style={{ textAlign: "center", padding: 50 }}>
                   <p style={{ color: "#9a8f7e" }}>No hay preguntas en esta sección.</p>
                   <button onClick={goHome} style={{marginTop: 20, color: "#C8A84B"}}>Volver al inicio</button>
                </div>
              )
            )}

            {/* VISTA: ADMIN / SETTINGS */}
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

            {/* VISTA: RESULTADOS FINALES */}
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

          {/* FOOTER */}
          <div style={{ 
            textAlign: "center", 
            padding: "18px", 
            fontSize: 10, 
            color: "#ccc4b5", 
            letterSpacing: "0.12em", 
            textTransform: "uppercase", 
            borderTop: "1px solid #E8E5DC", 
            fontFamily: "'DM Sans',sans-serif" 
          }}>
            PAES Study · 2026
          </div>
        </>
      )}
    </div>
  );
}