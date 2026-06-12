import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { findFAQAnswer, NO_MATCH_RESPONSE } from "@/lib/ai/knowledge-base";
import { formatPersonalizedAnswer, getUserAcademicContext } from "@/lib/ai/user-context";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `אתה "מנהל", עוזר AI אקדמי בתוך פלטפורמת מנהל.AI.
אתה עוזר לסטודנטים בישראל בנושאים כמו: ניהול לימודים, מלגות, שכר לימוד,
הלוואות סטודנטים, מסמכים אקדמיים, תזכורות ומועדים, ותכנון כספי.
ענה תמיד בעברית, בצורה תמציתית, ידידותית ומקצועית.`;

interface ChatRequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  }

  const body = (await req.json()) as ChatRequestBody;
  const { messages } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "חסרות הודעות" }, { status: 400 });
  }

  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    const match = findFAQAnswer(lastUserMessage?.content ?? "");

    if (!match) {
      return NextResponse.json({ content: NO_MATCH_RESPONSE, demo: true }, { status: 200 });
    }

    let answer = match.answer;

    if (match.dataKey) {
      try {
        const context = await getUserAcademicContext(supabase, user.id);
        answer = formatPersonalizedAnswer(match.dataKey, context);
      } catch (err) {
        console.error("Failed to load personalized AI context:", err);
        // Fall back to the static FAQ answer if real data can't be fetched.
      }
    }

    return NextResponse.json({ content: answer, actions: match.actions, demo: true }, { status: 200 });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "claude-sonnet-4-6",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      return NextResponse.json(
        { error: "שגיאה בתקשורת עם שירות ה-AI" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content =
      data.content?.[0]?.type === "text" ? data.content[0].text : "";

    return NextResponse.json({ content });
  } catch (err) {
    console.error("AI chat error:", err);
    return NextResponse.json(
      { error: "שגיאה לא צפויה בעוזר ה-AI" },
      { status: 500 }
    );
  }
}
