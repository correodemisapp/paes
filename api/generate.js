export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Configuración del servidor incompleta" });
    }

    const { system, messages } = req.body;
    const userContent = messages?.[0]?.content || "";
    const fullPrompt = system ? `${system}\n\n${userContent}` : userContent;

    // CORRECCIÓN: Se eliminó el "models/" duplicado en la URL
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        // Nota: Asegúrate de que el prompt realmente pida un JSON si usas esto
        generationConfig: { 
          responseMimeType: "application/json" 
        },
      }),
    });

    // Validamos si la respuesta es JSON antes de parsear
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: "Google no devolvió JSON", 
        raw: errorText.substring(0, 100) // Para depurar
      });
    }

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.error?.message || "Gemini error",
        details: data.error
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    return res.status(200).json({
      content: [{ type: "text", text }],
    });

  } catch (error) {
    console.error("Error en el handler:", error);
    return res.status(500).json({ error: error.message });
  }
}