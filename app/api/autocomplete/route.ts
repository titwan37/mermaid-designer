import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const dashscopeKey = process.env.DASHSCOPE_API_KEY3 || process.env.DASHSCOPE_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  
  let currentProvider = "ollama";
  if (dashscopeKey) {
    currentProvider = "dashscope";
  } else if (openrouterKey) {
    currentProvider = "openrouter";
  }

  try {
    const { prefix, suffix } = await req.json();
    const controller = new AbortController();

    // If the browser closes the connection (due to AbortController), cancel the upstream fetch
    req.signal.addEventListener("abort", () => {
      controller.abort();
    });

    // --- CASE A: DASHSCOPE CLOUD ENGINE ---
    if (dashscopeKey) {
      const dashscopeEndpoint = process.env.DASHSCOPE_OPENAI_COMPATIBLE_ENDPOINT || "https://dashscope.aliyuncs.com/compatible-mode/v1";
      const endpoint = dashscopeEndpoint.endsWith("/chat/completions") 
        ? dashscopeEndpoint 
        : `${dashscopeEndpoint.replace(/\/+$/, "")}/chat/completions`;
      const model = process.env.DASHSCOPE_MODEL || "qwen3.6-plus-2026-04-02";
      const systemPrompt = "You are a Mermaid.js diagram generator. Your job is to autocomplete the code. Continue the user's diagram based on the prefix and suffix. Output ONLY the code continuation. No markdown blocks, no explanations, no prefix repetition. If nothing is needed, return empty.";
      const userPrompt = `--- PREFIX ---\n${prefix}\n--- SUFFIX ---\n${suffix}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${dashscopeKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.1,
          max_tokens: 48,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json(
          { 
            error: `Dashscope failed: status ${response.status} - ${errorText}`, 
            provider: "dashscope" 
          },
          { status: response.status }
        );
      }

      const result = await response.json();
      const text = result.choices?.[0]?.message?.content || "";
      let suggestion = text.replace(/^```[a-z]*\n/i, "").replace(/\n```$/, "").trim();
      return NextResponse.json({ suggestion, provider: "dashscope" });
    }

    // --- CASE B: OPENROUTER CLOUD ENGINE ---
    if (openrouterKey) {
      const model = process.env.OPENROUTER_MODEL || "qwen/qwen-2.5-coder-32b-instruct";
      const systemPrompt = "You are a Mermaid.js diagram generator. Your job is to autocomplete the code. Continue the user's diagram based on the prefix and suffix. Output ONLY the code continuation. No markdown blocks, no explanations, no prefix repetition. If nothing is needed, return empty.";
      const userPrompt = `--- PREFIX ---\n${prefix}\n--- SUFFIX ---\n${suffix}`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openrouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://afastudio.ch",
          "X-Title": "Mermaid Designer Autocomplete",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.1,
          max_tokens: 48,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json(
          { 
            error: `OpenRouter failed: status ${response.status} - ${errorText}`, 
            provider: "openrouter" 
          },
          { status: response.status }
        );
      }

      const result = await response.json();
      const text = result.choices?.[0]?.message?.content || "";
      // Strip markdown code block wrappers if the model returned them
      let suggestion = text.replace(/^```[a-z]*\n/i, "").replace(/\n```$/, "").trim();
      return NextResponse.json({ suggestion, provider: "openrouter" });
    }

    // --- CASE B: OLLAMA LOCAL/EXTERNAL ENGINE ---
    const prompt = `<fim_prefix>${prefix}<fim_suffix>${suffix}<fim_middle>`;
    const ollamaHost = process.env.OLLAMA_HOST || "http://localhost:11434";
    const ollamaModel = process.env.OLLAMA_MODEL || "qwen2.5-coder:0.5b-base";

    const response = await fetch(`${ollamaHost}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: ollamaModel,
        prompt: prompt,
        options: {
          num_predict: 24,       // Limit generation length to save CPU
          stop: ["\n\n", "```", "---", "<fim_end>"],
          temperature: 0.1,      // Keep it deterministic
          num_ctx: 1024,         // Small context window for low RAM footprint
          num_thread: 2,         // Restrict to 2 vCores to keep Next.js responsive
        },
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to generate suggestions via Ollama", provider: "ollama" },
        { status: 500 }
      );
    }

    const result = await response.json();
    let text = result.response || "";

    // Clean up FIM tokens if they leak in the output
    text = text.replace("<fim_middle>", "").replace("<fim_end>", "").trimEnd();

    return NextResponse.json({ suggestion: text, provider: "ollama" });
  } catch (err: any) {
    if (err.name === "AbortError") {
      return new Response("Aborted", { status: 499 });
    }
    return NextResponse.json(
      { error: err.message, provider: currentProvider },
      { status: 500 }
    );
  }
}
