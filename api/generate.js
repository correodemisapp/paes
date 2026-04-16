import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { system, messages } = req.body;
    const userContent = messages?.[0]?.content || "";
    const fullPrompt = system ? `${system}\n\n${userContent}` : userContent;

    // 1. Llamada a Gemini (mantenemos tu lógica corregida)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Gemini error");

    // 2. Parsear las nuevas preguntas enviadas por Gemini
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(responseText);
    const newQuestions = parsed.questions || [];

    // 3. LA MAGIA: Guardar en Vercel KV para que sea permanente
    // Intentamos obtener las preguntas que ya hemos guardado antes
    const existingQuestions = (await kv.get('custom_questions')) || [];
    
    // Combinamos las viejas con las nuevas
    const updatedQuestions = [...existingQuestions, ...newQuestions];
    
    // Guardamos el "JSON" actualizado
    await kv.set('custom_questions', updatedQuestions);

    // 4. Responder al widget
    return res.status(200).json({
      content: [{ type: "text", text: responseText }],
      totalStored: updatedQuestions.length
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}