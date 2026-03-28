import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { chatHistory } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
    }

    const prompt = `You are a strict English evaluator.

Analyze the user's English from this conversation.

Reject meaningless or random input.

Evaluate:
* Grammar
* Sentence structure
* Clarity
* Confidence (based on response length and coherence)

User Conversation:
${chatHistory}

Rules:
1. Be strict.
2. Do not give high level easily.
3. Detect weak areas clearly.
4. Avoid generic responses.

Return ONLY JSON:
{
  "valid": true/false,
  "level": "Beginner/Intermediate/Advanced",
  "weaknesses": ["..."],
  "confidence_score": 1-10,
  "daily_plan": [
    {"day": 1, "focus": "..."},
    {"day": 2, "focus": "..."},
    {"day": 3, "focus": "..."}
  ],
  "advice": "specific improvement advice"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json"
          }
        }),
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || "Failed to call Gemini API");
    }

    const aiText = result.candidates[0].content.parts[0].text;
    const plan = JSON.parse(aiText);

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Generate Plan Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error analyzing your test." },
      { status: 500 }
    );
  }
}
