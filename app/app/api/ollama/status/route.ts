import { NextRequest, NextResponse } from "next/server";
import { checkOllamaStatus, isAllowedOllamaUrl } from "@/lib/ollama";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const baseUrl = req.nextUrl.searchParams.get("baseUrl") ?? undefined;

  if (baseUrl && !isAllowedOllamaUrl(baseUrl)) {
    return NextResponse.json(
      { available: false, models: [], error: "The Ollama endpoint must be a localhost address." },
      { status: 400 },
    );
  }

  const status = await checkOllamaStatus(baseUrl);
  return NextResponse.json(status, { headers: { "Cache-Control": "no-store" } });
}
