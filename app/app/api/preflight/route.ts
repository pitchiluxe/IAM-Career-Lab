import { NextResponse } from "next/server";
import { runPreflight } from "@/lib/preflight";
import { checkOllamaStatus } from "@/lib/ollama";

export const dynamic = "force-dynamic";
// The probe shells out to PowerShell, so it must run on Node, not Edge.
export const runtime = "nodejs";

export async function GET() {
  const ollamaStatus = await checkOllamaStatus();
  const result = await runPreflight({
    available: ollamaStatus.available,
    models: ollamaStatus.models.map((m) => m.name),
    error: ollamaStatus.error,
  });
  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
