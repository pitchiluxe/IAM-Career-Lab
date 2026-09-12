"use client";

import { useState } from "react";
import Link from "next/link";
import { tickets, getTicketsByYear } from "@/lib/data/tickets";
import { years } from "@/lib/data/years";
import { getYear } from "@/lib/data/years";

const priorityColors: Record<string, string> = {
  Low: "bg-blue-500/20 text-blue-400",
  Medium: "bg-amber-500/20 text-amber-400",
  High: "bg-orange-500/20 text-orange-400",
  Critical: "bg-red-500/20 text-red-400",
};

export default function TicketsPage() {
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [showRootCause, setShowRootCause] = useState<Set<string>>(new Set());
  const [showHints, setShowHints] = useState<Set<string>>(new Set());
  const [revealedHints, setRevealedHints] = useState<Record<string, number>>({});
  const [portfolioResults, setPortfolioResults] = useState<Record<string, string>>({});

  const filteredTickets = selectedYear === "all" ? tickets : getTicketsByYear(selectedYear);

  const toggleRootCause = (id: string) => {
    setShowRootCause((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleHints = (id: string) => {
    setShowHints((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        setRevealedHints((r) => ({ ...r, [id]: 1 }));
      }
      return next;
    });
  };

  const revealNextHint = (id: string, total: number) => {
    setRevealedHints((r) => ({ ...r, [id]: Math.min((r[id] || 0) + 1, total) }));
  };

  const generatePortfolio = async (ticketId: string) => {
    const res = await fetch("/api/portfolio/ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId }),
    });
    const data = await res.json();
    if (data.content) {
      setPortfolioResults((prev) => ({ ...prev, [ticketId]: data.content }));
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Ticket Queue</h1>
        <p className="mt-1 text-sm text-[#93a4c0]">Realistic help desk and IAM tickets with hidden root causes. Investigate before revealing the answer.</p>
      </div>

      {/* Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedYear("all")}
          className={`badge px-3 py-1.5 text-sm ${selectedYear === "all" ? "bg-omari-600 text-white" : "bg-[#1f2d4d] text-[#93a4c0]"}`}
        >
          All ({tickets.length})
        </button>
        {years.map((y) => {
          const count = getTicketsByYear(y.id).length;
          return (
            <button
              key={y.id}
              onClick={() => setSelectedYear(y.id)}
              className={`badge px-3 py-1.5 text-sm ${selectedYear === y.id ? "bg-omari-600 text-white" : "bg-[#1f2d4d] text-[#93a4c0]"}`}
            >
              Year {y.number} ({count})
            </button>
          );
        })}
      </div>

      {/* Tickets */}
      <div className="space-y-3">
        {filteredTickets.map((ticket) => {
          const year = getYear(ticket.yearId);
          const isExpanded = expandedTicket === ticket.id;
          const showRC = showRootCause.has(ticket.id);
          const showH = showHints.has(ticket.id);
          const hintsShown = revealedHints[ticket.id] || 0;
          return (
            <div key={ticket.id} className="panel overflow-hidden">
              <button
                onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-[#16213a]"
              >
                <span className="flex-shrink-0 font-mono text-sm font-bold text-omari-300">{ticket.id}</span>
                <div className="flex-1">
                  <div className="font-semibold text-white">{ticket.title}</div>
                  <div className="mt-0.5 text-xs text-[#93a4c0]">Year {year?.number} · {ticket.affectedAsset}</div>
                </div>
                <span className={`badge ${priorityColors[ticket.priority]}`}>{ticket.priority}</span>
                <svg className={`h-5 w-5 flex-shrink-0 text-[#5a6b88] transition ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="border-t border-[#1f2d4d] p-4">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                      <div className="mb-3">
                        <div className="text-xs font-semibold uppercase text-[#5a6b88]">Scenario</div>
                        <p className="mt-1 text-sm text-[#cfd9ec]">{ticket.scenario}</p>
                      </div>
                      <div className="mb-3">
                        <div className="text-xs font-semibold uppercase text-[#5a6b88]">Business Impact</div>
                        <p className="mt-1 text-sm text-[#cfd9ec]">{ticket.businessImpact}</p>
                      </div>
                      <div className="mb-3">
                        <div className="text-xs font-semibold uppercase text-[#5a6b88]">Symptoms</div>
                        <ul className="mt-1 space-y-1">
                          {ticket.symptoms.map((s, i) => (
                            <li key={i} className="text-sm text-[#cfd9ec]">• {s}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="mb-3">
                        <div className="text-xs font-semibold uppercase text-[#5a6b88]">Evidence Available</div>
                        <ul className="mt-1 space-y-1">
                          {ticket.evidenceAvailable.map((e, i) => (
                            <li key={i} className="text-sm text-[#cfd9ec]">• {e}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      {/* Hints */}
                      <div className="mb-3">
                        <button onClick={() => toggleHints(ticket.id)} className="btn-ghost text-xs">
                          {showH ? "Hide Hints" : "Show Hints (progressive)"}
                        </button>
                        {showH && (
                          <div className="mt-2 space-y-2">
                            {ticket.hints.slice(0, hintsShown).map((h, i) => (
                              <div key={i} className="rounded-lg border border-[#1f2d4d] bg-[#0d1626] p-3 text-sm text-[#cfd9ec]">
                                <span className="font-semibold text-omari-300">Hint {i + 1}:</span> {h}
                              </div>
                            ))}
                            {hintsShown < ticket.hints.length && (
                              <button onClick={() => revealNextHint(ticket.id, ticket.hints.length)} className="text-xs text-omari-300 hover:underline">
                                Reveal next hint ({hintsShown}/{ticket.hints.length})
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Root cause */}
                      <div className="mb-3">
                        <button onClick={() => toggleRootCause(ticket.id)} className="btn-ghost text-xs">
                          {showRC ? "Hide Root Cause" : "Reveal Root Cause"}
                        </button>
                        {showRC && (
                          <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
                            <span className="font-semibold">Root Cause:</span> {ticket.hiddenRootCause}
                          </div>
                        )}
                      </div>

                      {/* Acceptance */}
                      <div className="mb-3">
                        <div className="text-xs font-semibold uppercase text-[#5a6b88]">Acceptance Criteria</div>
                        <ul className="mt-1 space-y-1">
                          {ticket.acceptanceCriteria.map((a, i) => (
                            <li key={i} className="text-sm text-[#cfd9ec]">✓ {a}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Remediation */}
                      <div className="mb-3">
                        <div className="text-xs font-semibold uppercase text-[#5a6b88]">Remediation</div>
                        <p className="mt-1 text-sm text-[#cfd9ec]">{ticket.remediation}</p>
                      </div>

                      {/* Escalation */}
                      <div className="mb-3">
                        <div className="text-xs font-semibold uppercase text-[#5a6b88]">Escalation Threshold</div>
                        <p className="mt-1 text-sm text-[#cfd9ec]">{ticket.escalationThreshold}</p>
                      </div>

                      {/* Portfolio */}
                      <div className="mb-3">
                        <button onClick={() => generatePortfolio(ticket.id)} className="btn-primary text-xs">
                          Generate Portfolio Artifact
                        </button>
                        {portfolioResults[ticket.id] && (
                          <div className="mt-2">
                            <pre className="max-h-40 overflow-auto rounded-lg border border-[#1f2d4d] bg-[#0d1626] p-3 text-xs text-[#cfd9ec]">{portfolioResults[ticket.id]}</pre>
                            <button
                              onClick={() => {
                                const blob = new Blob([portfolioResults[ticket.id]], { type: "text/markdown" });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `${ticket.id}-incident-report.md`;
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                              className="mt-1 text-xs text-omari-300 hover:underline"
                            >
                              Download .md
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-[#5a6b88]">
                        Portfolio artifact: {ticket.portfolioArtifact}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
