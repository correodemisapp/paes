import React from 'react';
import { ArrowLeft, Send } from "lucide-react";
import FeedbackModal from "./FeedbackModal";

export default function QuestionView({ 
  currentQ, goHome, confirmAnswer, selected, setSelected, 
  showExp, confirmed, correct, nextQ, 
  successImage, errorImage, DIFF_LIGHT, S 
}) {
  
  // --- GUARDIA CRÍTICA ---
  // Si los datos de Firestore aún no llegan, mostramos un estado de carga amable
  if (!currentQ || !currentQ.text || !currentQ.options) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
        <p style={{ color: '#9a8f7e', fontSize: '14px', fontFamily: 'sans-serif' }}>
          Preparando tu entrenamiento...
        </p>
      </div>
    );
  }

  // Ahora es seguro definir 'd' porque sabemos que currentQ existe
  const d = DIFF_LIGHT[currentQ.difficulty] || DIFF_LIGHT.Fácil;

  return (
    <div className="fade">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18}}>
        <button onClick={goHome} style={S.backBtn}><ArrowLeft style={{width:14, height:14}} /></button>
        <span style={{
          fontSize:10, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", 
          padding:"4px 12px", borderRadius:6, color:d.color, background:d.bg, border:`1px solid ${d.border}`
        }}>
          {currentQ.difficulty}
        </span>
        <span style={{fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#9a8f7e", fontWeight:500}}>
          {currentQ.category}
        </span>
      </div>

      <div style={S.passage}>
        <div style={{maxHeight:220, overflowY:"auto"}}>
          {currentQ.text.split("\n\n").map((p, i, arr) => (
            <p key={i} style={{fontSize:13, color:"#3d3628", lineHeight:1.85, marginBottom:i < arr.length-1 ? 12 : 0, fontStyle:"italic"}}>
              {p}
            </p>
          ))}
        </div>
      </div>

      <h3 style={{fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:17, color:"#1a1a2e", lineHeight:1.4, marginBottom:16}}>
        {currentQ.question}
      </h3>

      <div style={{display:"flex", flexDirection:"column", gap:9, marginBottom:18}}>
        {currentQ.options.map(opt => {
          const isConf = confirmed === opt.id;
          const isRight = showExp && opt.id === currentQ.correct;
          let bg="#fff", border="1px solid #E8E5DC", lBg="#f0ede4", lCol="#9a8f7e";
          
          if (!showExp && selected === opt.id) { bg="#fffbf0"; border="1px solid #C8A84B"; lBg="#1a1a2e"; lCol="#C8A84B"; }
          if (isConf && correct) { bg="#f0faf4"; border="1px solid #86efac"; lBg="#2d6a4f"; lCol="#fff"; }
          if (isConf && !correct) { bg="#fff5f5"; border="1px solid #fca5a5"; lBg="#991b1b"; lCol="#fff"; }
          if (isRight && !isConf) { bg="#f0faf4"; border="1px solid #86efac"; lBg="#2d6a4f"; lCol="#fff"; }
          
          return (
            <button key={opt.id} disabled={!!showExp} onClick={() => setSelected(opt.id)}
              style={{background:bg, border, borderRadius:11, padding:"12px 14px", display:"flex", alignItems:"flex-start", gap:12, textAlign:"left", transition:"all 0.15s"}}>
              <span style={{width:30, height:30, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", background:lBg, color:lCol, fontWeight:600, fontSize:12}}>
                {opt.id}
              </span>
              <span style={{fontSize:13, color:"#3d3628", fontWeight:500, lineHeight:1.55}}>
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>

      <button disabled={!selected || showExp} onClick={confirmAnswer} style={!selected ? S.btnDisabled : S.btnPrimary}>
        <Send style={{width:16, height:16}} /> Confirmar Respuesta
      </button>

      <FeedbackModal 
        showExp={showExp} 
        correct={correct} 
        successImage={successImage} 
        errorImage={errorImage} 
        explanation={currentQ.explanation} 
        nextQ={nextQ} 
        S={S} 
      />
    </div>
  );
}