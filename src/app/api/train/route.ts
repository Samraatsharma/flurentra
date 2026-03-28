import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, history, userName } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    // Build full conversation for Gemini
    const conversationText = history
      .map((m: { role: string; text: string }) => `${m.role === 'user' ? userName || 'Student' : 'Teacher'}: ${m.text}`)
      .join('\n');

    const prompt = `Act as a friendly but slightly strict English teacher named "Aria".

The student's name is ${userName || 'the student'}. They are learning spoken English.

Your job:
- Correct grammar mistakes clearly but kindly
- Give an improved version of what they said (1 sentence max)
- Ask exactly ONE follow-up question to keep conversation going
- Be encouraging but honest
- Do NOT give long explanations (max 3 sentences total)
- Be conversational like a real human teacher, not a robot
- Never end the conversation — always ask something

Previous conversation:
${conversationText || 'This is the start of the session.'}

Student just said: "${message}"

Respond naturally as teacher Aria. Format:
- First: brief correction/praise (1 sentence)  
- Second: improved version if needed (1 sentence, skip if perfect)
- Third: ONE follow-up question

Keep it short, warm, and conversational.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 200,
          }
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || "Gemini API error");
    }

    const aiText = result.candidates[0].content.parts[0].text.trim();
    return NextResponse.json({ reply: aiText });

  } catch (error) {
    console.error("Train API Error:", error);
    return NextResponse.json({ error: "Training session error" }, { status: 500 });
  }
}
