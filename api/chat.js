// ✅ NEW: Add this at the very top
const MOCK = process.env.MOCK || "0";

function allowCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// Existing code
export default async function handler(req, res) {
  allowCORS(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Use POST with JSON { message }" });

  try {
    const { message, persona } = req.body || {};
    const apikey = process.env.OPENAI_API_KEY;

    // ✅ NEW: Mock mode logic — goes right here
    if (MOCK === "1") {
      const mockReplies = {
        highElf:
          "🌿 Elyndra inclines her head, her voice melodic. 'Greetings, traveler. The forest whispers of your arrival.'",
        default:
          "✨ Hello, I’m your SoulForge companion. What do you wish to talk about?",
      };

      const reply = mockReplies[persona] || mockReplies.default;
      return res.status(200).json({ reply });
    }

    // --- Your existing OpenAI call below ---
    if (!apikey) return res.status(500).json({ error: "Missing API key" });

    let systemPrompt = "";
    if (persona === "highElf") {
      systemPrompt =
        "You are Elyndra, a High Elf from the ancient forests of Valen’dor. You speak with grace, wisdom, and calm authority.";
    } else {
      systemPrompt = "You are SoulForge, a kind fantasy companion.";
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apikey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply)
      return res.status(502).json({ error: "No reply from model", raw: data });
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
