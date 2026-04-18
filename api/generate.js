import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Falta GEMINI_API_KEY en Vercel" });
    }

    const { system, messages } = req.body;
    const userContent = messages?.[0]?.content || "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

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
    const newQuestions = parsedData.questions || [];

    // Persistencia en KV
    const existingQuestions = (await kv.get('custom_questions')) || [];
    const updatedQuestions = [...existingQuestions, ...newQuestions];
    await kv.set('custom_questions', updatedQuestions);

    return res.status(200).json({ success: true, count: newQuestions.length });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}