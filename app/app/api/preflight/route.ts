import { NextResponse } from "next/server";
import { createPreflightResult } from "@/lib/preflight";
import { checkOllamaStatus } from "@/lib/ollama";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = createPreflightResult();
  // Check live Ollama status
  const ollamaStatus = await checkOllamaStatus();
  result.ollama = {
    available: ollamaStatus.available,
    models: ollamaStatus.models.map((m) => m.name),
    error: ollamaStatus.error,
  };
  return NextResponse.json(result);
}
