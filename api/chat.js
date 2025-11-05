export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST with JSON { message }" });
  }

  try {
    const { message } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: "Missing 'message' in body" });
    }

    // For now, simple echo reply (we can wire a real model next)
    return res.status(200).json({ reply: `You said: ${message}` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
