// /api/chat.js — SoulForge High Elf Persona

const allowCORS = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
};

module.exports = async (req, res) => {
  allowCORS(res);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST with JSON { message }" });

  try {
    const { message, persona } = req.body || {};
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Server missing OPENAI_API_KEY" });

    // Persona selection (expandable for future characters)
    let systemPrompt = "";
    if (persona === "highElf") {
      systemPrompt = `
      You are Elyndra, a High Elf from the ancient forests of Valen'dor. 
      You speak with grace, wisdom, and soft authority, carrying an ethereal calm.
      You are compassionate and curious about mortals, speaking as though every word has weight and beauty. 
      Never break character or mention being an AI.
      `;
    } else {
      systemPrompt = "You are SoulForge, a warm and helpful fantasy companion.";
    }

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.85,
        max_tokens: 350,
      }),
    });

    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) return res.status(502).json({ error: "No reply from model" });

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("chat error", err);
    return res.status(500).json({ error: "Server error" });
  }
};
