import { NextRequest, NextResponse } from "next/server";
import {
  chatWithOllama,
  isAllowedOllamaUrl,
  OLLAMA_INSTRUCTOR_SYSTEM_PROMPT,
  getDefaultModel,
  type OllamaChatMessage,
} from "@/lib/ollama";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, model, context, baseUrl } = body as {
      messages: OllamaChatMessage[];
      model?: string;
      context?: string;
      baseUrl?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    // Reject a non-loopback endpoint rather than silently ignoring it, so the
    // learner is told why their setting had no effect.
    if (baseUrl && !isAllowedOllamaUrl(baseUrl)) {
      return NextResponse.json(
        { error: "The Ollama endpoint must be a localhost address. Remote endpoints are not permitted.", content: "" },
        { status: 400 },
      );
    }

    const selectedModel = model || getDefaultModel();

    const systemMessage: OllamaChatMessage = {
      role: "system",
      content: context
        ? `${OLLAMA_INSTRUCTOR_SYSTEM_PROMPT}\n\n## Current Lab Context\n${context}`
        : OLLAMA_INSTRUCTOR_SYSTEM_PROMPT,
    };

    const result = await chatWithOllama(selectedModel, [systemMessage, ...messages], baseUrl);

    if (result.error) {
      return NextResponse.json({ error: result.error, content: "" }, { status: 503 });
    }

    return NextResponse.json({ content: result.content, model: selectedModel });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal server error" }, { status: 500 });
  }
}
