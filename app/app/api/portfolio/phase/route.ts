import { NextRequest, NextResponse } from "next/server";
import { getYear, getPhase } from "@/lib/data/years";
import { generatePhasePortfolio } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { yearId, phaseId, score, evidenceNotes } = await req.json();
    const year = getYear(yearId);
    if (!year) return NextResponse.json({ error: "Year not found" }, { status: 404 });
    const phase = getPhase(yearId, phaseId);
    if (!phase) return NextResponse.json({ error: "Phase not found" }, { status: 404 });

    const artifact = generatePhasePortfolio(year, phase, score, evidenceNotes);
    return NextResponse.json(artifact);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal error" }, { status: 500 });
  }
}
