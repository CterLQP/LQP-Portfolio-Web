export async function POST(req) {
  try {
    const { message, systemInstruction } = await req.json();
    
    // Fallback if not configured yet, you should add GROQ_API_KEY to your Vercel env vars
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      return Response.json({ error: { message: "Missing API Key" } }, { status: 400 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: { message: error.message } }, { status: 500 });
  }
}
