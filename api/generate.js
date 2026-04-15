export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("Falta GEMINI_API_KEY en las variables de entorno");
      return res.status(500).json({ error: "Configuración del servidor incompleta" });
    }

    const { system, messages } = req.body;

    const userContent = messages?.[0]?.content || "";
    const fullPrompt  = system ? `${system}\n\n${userContent}` : userContent;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Gemini error" });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return res.status(200).json({
      content: [{ type: "text", text }],
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}