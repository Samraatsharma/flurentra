import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { sentence } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
    }

    const prompt = `Correct this sentence, improve it, and explain the mistake briefly. Be strict and concise.

User Sentence:
"${sentence}"

Return ONLY JSON in this format:
{
  "corrected": "grammatically correct version of the sentence",
  "improved": "a more natural, native-sounding way to say it",
  "explanation": "short explanation of the grammar rule or vocabulary correction"
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
    const correction = JSON.parse(aiText);

    return NextResponse.json(correction);
  } catch (error) {
    console.error("Practice Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error correcting your sentence." },
      { status: 500 }
    );
  }
}
