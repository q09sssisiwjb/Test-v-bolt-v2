// Example API Route for Next.js App Router
// Location: app/api/chat/route.ts

import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, model, customApiKey } = body;

    // EXAMPLE 1: OpenRouter
    if (!customApiKey) {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model || "meta-llama/llama-4-maverick:free",
          messages: messages,
          stream: true,
        }),
      });

      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // EXAMPLE 2: OpenAI
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "gpt-4o",
        messages: messages,
        stream: true,
      }),
    });

    return new Response(openaiResponse.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// EXAMPLE 3: Anthropic API Route
// Location: app/api/anthropic-chat/route.ts
/*
export async function POST(req: NextRequest) {
  const body = await req.json();
  
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: body.model || "claude-3-5-sonnet-20241022",
      messages: body.messages,
      max_tokens: 1024,
      stream: true,
    }),
  });

  return new Response(response.body);
}
*/

// EXAMPLE 4: Google Gemini API Route
// Location: app/api/google-chat/route.ts
/*
export async function POST(req: NextRequest) {
  const body = await req.json();
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${body.model || "gemini-1.5-pro"}:streamGenerateContent?key=${process.env.GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body.contents),
    }
  );

  return new Response(response.body);
}
*/

// Environment Variables (.env.local):
/*
OPENROUTER_API_KEY=your_openrouter_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key
*/
