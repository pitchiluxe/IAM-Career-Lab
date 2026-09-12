import { NextRequest, NextResponse } from "next/server";
import { getYear } from "@/lib/data/years";
import { getTicket } from "@/lib/data/tickets";
import { generateTicketPortfolio } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { ticketId } = await req.json();
    const ticket = getTicket(ticketId);
    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    const year = getYear(ticket.yearId);
    if (!year) return NextResponse.json({ error: "Year not found" }, { status: 404 });

    const artifact = generateTicketPortfolio(ticket, year);
    return NextResponse.json(artifact);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal error" }, { status: 500 });
  }
}
