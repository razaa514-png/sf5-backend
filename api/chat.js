// api/chat.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST with JSON { message }" });
  }
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: "Missing 'message'." });

    // Simple echo to prove the route works:
    return res.status(200).json({
      reply: `You said: "${message}"`,
      ts: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error", detail: String(err) });
  }
}
