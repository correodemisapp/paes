import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Falta GEMINI_API_KEY en Vercel" });
    }

    const { system, messages } = req.body;
    const userContent = messages?.[0]?.content || "";
    // Nota: Asegúrate de que el modelo gemini-2.5-flash esté disponible, 
    // si no, usa gemini-1.5-flash que es el estándar actual.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: system + "\n\n" + userContent }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Error en Gemini");

    let textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanText = textResponse.replace(/```json|```/g, "").trim();
    const parsedData = JSON.parse(cleanText);
    
    // Extraemos las preguntas del JSON que generó Gemini
    const newQuestions = parsedData.questions || parsedData.preguntas || (Array.isArray(parsedData) ? parsedData : []);

    // Persistencia en KV (Vercel)
    const existingQuestions = (await kv.get('custom_questions')) || [];
    const updatedQuestions = [...existingQuestions, ...newQuestions];
    await kv.set('custom_questions', updatedQuestions);

    // --- LA CORRECCIÓN ESTÁ AQUÍ ---
    // Antes solo enviabas 'success' y 'count'. Ahora enviamos las 'questions' reales.
    return res.status(200).json({ 
      success: true, 
      count: newQuestions.length,
      questions: newQuestions // <--- ESTA LÍNEA ES VITAL
    });

  } catch (error) {
    console.error("ERROR BACKEND:", error);
    return res.status(500).json({ error: error.message });
  }
}