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

/**
 * CONFIGURACIÓN DE REFERENCIA (FIREBASE)
 * Este documento centraliza el estado global de la aplicación.
 */
const DOC_REF = doc(db, "progreso", "usuario-principal");

// Formateador de moneda para la economía del juego
const fmt = (v) => new Intl.NumberFormat("es-CL", { 
  style: "currency", 
  currency: "CLP", 
  maximumFractionDigits: 0 
}).format(v);

export default function App() {
  // --- 1. ESTADOS DE INFRAESTRUCTURA Y CARGA ---
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("login");
  const [balance, setBalance] = useState(0);
  
  // --- 2. ESTADOS DE DATOS (PREGUNTAS Y PROGRESO) ---
  const [completedIds, setCompleted] = useState([]);
  const [attemptedIds, setAttempted] = useState([]);
  const [extraQs, setExtraQs] = useState([]);
  
  // --- 3. ESTADOS DE PERSONALIZACIÓN (IMÁGENES BASE64) ---
  const [appIcon, setAppIcon] = useState(null);
  const [successImage, setSuccessImage] = useState(null);
  const [errorImage, setErrorImage] = useState(null);
  
  // --- 4. ESTADOS DE NAVEGACIÓN DEL QUIZ ---
  const [isReview, setIsReview] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(null);
  const [showExp, setShowExp] = useState(false);
  const [correct, setCorrect] = useState(null);
  
  // --- 5. ESTADOS DE ADMINISTRACIÓN Y SEGURIDAD ---
  const [loginPass, setLoginPass] = useState("");
  const [settingsPass, setSettingsPass] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [err, setErr] = useState("");
  const [errType, setErrType] = useState("error");
  const [generating, setGenerating] = useState(false);
  const [rates, setRates] = useState({ Fácil: 50, Intermedio: 150, Difícil: 250 });

  // --- 6. EFECTO DE CARGA INICIAL (FIREBASE) ---
useEffect(() => {
    const fetchData = async () => {
      try {
        const snap = await getDoc(DOC_REF);
        if (snap.exists()) {
          const d = snap.data();
          
          // --- LOG DE VALIDACIÓN ---
          console.log("☁️ Datos de Firebase recibidos:", d);
          
          if (d.balance !== undefined) setBalance(Number(d.balance)); // Aseguramos que sea número
          if (d.completedIds) setCompleted(d.completedIds);
          if (d.attemptedIds) setAttempted(d.attemptedIds);
          if (d.extraQs) setExtraQs(d.extraQs);
          if (d.appIcon) setAppIcon(d.appIcon);
          if (d.successImage) setSuccessImage(d.successImage);
          if (d.errorImage) setErrorImage(d.errorImage);
          if (d.rates) setRates(d.rates);
        }
      } catch (e) {
        console.error("Error al cargar:", e);
      } finally {
        setReady(true); // Esto es clave
      }
    };
    fetchData();
  }, []);

  // --- 7. PERSISTENCIA ATÓMICA (FIX: MERGE TRUE) ---
  const persist = async (patch) => {
    if (!ready) return; // Si no hemos terminado de cargar, no guardamos nada.
    try {
      // Usamos merge: true para no borrar campos existentes (como el icono)
      await setDoc(DOC_REF, patch, { merge: true });
      console.log("✓ Sincronización exitosa:", patch);
    } catch (e) {
      console.error("❌ Error de persistencia en Firebase:", e);
      if (e.message.includes("large")) {
        alert("El archivo es muy pesado para la base de datos.");
      }
    }
  };

  // --- 8. LÓGICA DE FILTRADO DE PREGUNTAS (USEMEMO) ---
  const allQs = useMemo(() => {
    return [
      ...(STATIC_QUESTIONS || []), 
      ...(extraQs || [])
    ];
  }, [extraQs]);
  
  // Preguntas que el usuario AÚN NO ha intentado
  const available = useMemo(() => {
    return allQs.filter(q => !attemptedIds.includes(q.id));
  }, [allQs, attemptedIds]);

  // Preguntas que el usuario YA intentó (Historial/Repaso)
  const reviewQs = useMemo(() => {
    return allQs.filter(q => attemptedIds.includes(q.id));
  }, [allQs, attemptedIds]);

  // Selección dinámica de la pregunta actual según el modo
  const currentQ = useMemo(() => {
    return isReview ? reviewQs[qIdx] : available[qIdx];
  }, [isReview, reviewQs, available, qIdx]);

  // --- 9. HANDLERS DE INTERFAZ ---
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

    // --- ESCUDO DE REPASO ---
    // Si estamos repasando, mostramos si es correcta o no, pero NO guardamos nada.
    if (isReview) {
      console.log("Modo Repaso: Visualización sin cambios en estadísticas.");
      return; 
    }
    // ------------------------

    // Cálculos de nuevo estado
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

    // Actualización de estado local
    setAttempted(newAttempted);
    setCompleted(newCompleted);
    setBalance(newBalance);

    // Persistencia parcial (más eficiente)
    await persist({ 
      balance: newBalance, 
      completedIds: newCompleted, 
      attemptedIds: newAttempted 
    });
  };

  const nextQ = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // En modo normal, si se acaban las preguntas, mostrar resultados
    if (!isReview && available.length <= 1) { 
      setView("results"); 
      return; 
    }
    
    // Navegación interna
    if (isReview) {
      setQIdx((prev) => (prev + 1) % reviewQs.length);
    } else {
      setQIdx(0); 
    }
    
    setSelected(null);
    setConfirmed(null);
    setShowExp(false);
    setCorrect(null);
  };

  // --- 10. LÓGICA DE INTELIGENCIA ARTIFICIAL ---
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

      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const data = await res.json();
      
      // Limpieza de JSON (Remover Markdown)
      const cleanText = JSON.stringify(data).replace(/```json/g, "").replace(/```/g, "").trim();
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("IA devolvió un formato no válido.");
      
      const parsed = JSON.parse(jsonMatch[0]);
      const rawQs = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.preguntas || []);

      const ts = Date.now();
      const newQs = rawQs.map((q, i) => ({
        ...q,
        id: `gen_${ts}_${i}`,
        options: Array.isArray(q.options) 
          ? q.options 
          : Object.entries(q.options).map(([id, text]) => ({ id, text })),
        correct: q.correct || q.respuesta || "A",
        difficulty: q.difficulty || "Intermedio",
        explanation: q.explanation || "Revisa el texto para fundamentar la respuesta."
      }));

      const updated = [...extraQs, ...newQs];
      setExtraQs(updated);
      await persist({ extraQs: updated });
      
      setErrType("success");
      setErr(`✓ ${newQs.length} nuevas preguntas preparadas.`);
    } catch (e) {
      setErr(`Error: ${e.message}`);
    } finally {
      setGenerating(false);
    }
  };

  // --- 11. GESTIÓN DE CARGA DE IMÁGENES ---
  const uploadImg = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const b64 = reader.result;
      if (type === "icon") { 
        setAppIcon(b64); 
        await persist({ appIcon: b64 }); 
      }
      if (type === "success") { 
        setSuccessImage(b64); 
        await persist({ successImage: b64 }); 
      }
      if (type === "error") { 
        setErrorImage(b64); 
        await persist({ errorImage: b64 }); 
      }
    };
    reader.readAsDataURL(file);
  };

  // --- 12. REINICIO TOTAL (PROTECTOR) ---
  const resetAll = async () => {
    if (window.confirm("¿Seguro que quieres limpiar el progreso? Se mantendrán tus 13 preguntas y el icono.")) {
      try {
        const resetData = {
          balance: 0,
          attemptedIds: [], 
          completedIds: [],
          // extraQs y appIcon no se incluyen para que el merge:true los deje intactos
        };
        
        await setDoc(DOC_REF, resetData, { merge: true });
        
        setAttempted([]);
        setCompleted([]);
        setBalance(0);
        
        alert("Progreso de repaso eliminado.");
        setView("home");
      } catch (e) {
        console.error("Error al resetear:", e);
      }
    }
  };

  const accuracy = attemptedIds.length > 0 
    ? Math.round((completedIds.length / attemptedIds.length) * 100) 
    : 0;

  // --- 13. COMPONENTE DE CARGA ---
  if (!ready) return (
    <div style={S.center}>
      <Loader2 style={{ width: 32, height: 32, color: "#C8A84B", animation: "spin 1s linear infinite" }} />
      <p style={{ marginTop: 12, fontSize: 12, color: "#C8A84B", fontWeight: 500 }}>Sincronizando con PAES Cloud...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // --- 14. ESTRUCTURA DE LA INTERFAZ ---
  return (
    <div style={S.root}>
      {/* CSS Global y Animaciones */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;600&display=swap');
        
        *{ box-sizing: border-box; margin: 0; padding: 0; }
        
        body { 
          background-color: #fcfaf5; 
          -webkit-tap-highlight-color: transparent;
        }

        button:active { transform: scale(0.98); }
        
        .home-card { 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important; 
          cursor: pointer; 
        }
        
        .home-card:hover { 
          transform: translateY(-4px); 
          box-shadow: 0 12px 24px rgba(200, 168, 75, 0.15) !important;
          border-color: #C8A84B !important;
        }

        .fade { animation: fadeUp 0.4s ease; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #C8A84B44; border-radius: 10px; }
      `}</style>

      {/* RENDERIZADO CONDICIONAL DE VISTAS */}
      
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
                appIcon={appIcon}
                S={S}
              />
            )}

            {/* VISTA: TEST (PREGUNTAS) */}
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
                <div style={{ textAlign: "center", padding: 60 }} className="fade">
                   <div style={{ marginBottom: 20, opacity: 0.5 }}><Sparkles size={48} /></div>
                   <p style={{ color: "#9a8f7e", fontSize: 14 }}>No hay más preguntas disponibles en este momento.</p>
                   <button onClick={goHome} style={{ marginTop: 24, color: "#C8A84B", fontWeight: 600 }}>Volver al menú</button>
                </div>
              )
            )}

            {/* VISTA: SETTINGS (ADMIN) */}
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

            {/* VISTA: RESULTADOS */}
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

          {/* FOOTER PERSISTENTE */}
          <div style={{ 
            textAlign: "center", 
            padding: "24px 0", 
            fontSize: 10, 
            color: "#ccc4b5", 
            letterSpacing: "0.15em", 
            textTransform: "uppercase", 
            borderTop: "1px solid #f0ede4", 
            marginTop: 40,
            fontFamily: "'DM Sans',sans-serif" 
          }}>
            PAES Study Premium · Edición 2026
          </div>
        </>
      )}
    </div>
  );
}