"use client";

import { useState } from "react";
import { tickets, getTicketsByYear } from "@/lib/data/tickets";
import { years, getYear } from "@/lib/data/years";
import { useProgress } from "@/components/ProgressProvider";
import { getTicketProgress, getTicketStats, type TicketStatus } from "@/lib/progress";

const priorityColors: Record<string, string> = {
  Low: "bg-blue-500/20 text-blue-400",
  Medium: "bg-amber-500/20 text-amber-400",
  High: "bg-orange-500/20 text-orange-400",
  Critical: "bg-red-500/20 text-red-400",
};

const statusColors: Record<TicketStatus, string> = {
  NEW: "bg-[#1f2d4d] text-[#93a4c0]",
  INVESTIGATING: "bg-blue-500/20 text-blue-400",
  ESCALATED: "bg-amber-500/20 text-amber-400",
  RESOLVED: "bg-green-500/20 text-green-400",
};

const STATUSES: TicketStatus[] = ["NEW", "INVESTIGATING", "ESCALATED", "RESOLVED"];

export default function TicketsPage() {
  const { progress, updateTicket, recordHintReveal, recordRootCauseReveal } = useProgress();
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [showHints, setShowHints] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<Record<string, { diagnosis: string; resolutionNotes: string }>>({});
  const [portfolioResults, setPortfolioResults] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredTickets = selectedYear === "all" ? tickets : getTicketsByYear(selectedYear);
  const stats = getTicketStats(progress, filteredTickets.map((t) => t.id));

  const draftFor = (id: string) => {
    const saved = getTicketProgress(progress, id);
    return drafts[id] ?? { diagnosis: saved.diagnosis ?? "", resolutionNotes: saved.resolutionNotes ?? "" };
  };

  const setDraft = (id: string, patch: Partial<{ diagnosis: string; resolutionNotes: string }>) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...draftFor(id), ...patch } }));

  const toggleHints = (id: string) => {
    setShowHints((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // Opening the panel reveals hint 1, so record it. The provider only
        // ever increases the count, so collapsing and reopening cannot be used
        // to erase the fact that help was taken.
        recordHintReveal(id, Math.max(1, getTicketProgress(progress, id).hintsRevealed));
      }
      return next;
    });
  };

  const generatePortfolio = async (ticketId: string) => {
    setErrors((prev) => ({ ...prev, [ticketId]: "" }));
    try {
      const saved = getTicketProgress(progress, ticketId);
      const draft = draftFor(ticketId);
      const res = await fetch("/api/portfolio/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          diagnosis: draft.diagnosis,
          resolutionNotes: draft.resolutionNotes,
          hintsRevealed: saved.hintsRevealed,
          rootCauseRevealed: saved.rootCauseRevealed,
          status: saved.status,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      setPortfolioResults((prev) => ({ ...prev, [ticketId]: data.content }));
    } catch (e) {
      setErrors((prev) => ({
        ...prev,
        [ticketId]: e instanceof Error ? e.message : "Could not generate the portfolio artifact.",
      }));
    }
  };

  const download = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Ticket Queue</h1>
        <p className="mt-1 text-sm text-[#93a4c0]">
          Realistic tickets with hidden root causes. Write your own diagnosis before you take a hint &mdash; the
          platform records how much help each ticket needed, because a ticket solved unaided is a different achievement
          from one solved with the answer on screen.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Resolved", `${stats.resolved}/${stats.total}`],
          ["Solved unaided", String(stats.unaided)],
          ["Hints used", String(stats.hintsUsed)],
          ["Root causes revealed", String(stats.rootCausesRevealed)],
        ].map(([label, value]) => (
          <div key={label} className="panel p-4">
            <div className="text-xs uppercase tracking-wider text-[#5a6b88]">{label}</div>
            <div className="mt-1 text-xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedYear("all")}
          className={`badge px-3 py-1.5 text-sm ${
            selectedYear === "all" ? "bg-omari-600 text-white" : "bg-[#1f2d4d] text-[#93a4c0]"
          }`}
        >
          All ({tickets.length})
        </button>
        {years.map((y) => {
          const count = getTicketsByYear(y.id).length;
          return (
            <button
              key={y.id}
              onClick={() => setSelectedYear(y.id)}
              className={`badge px-3 py-1.5 text-sm ${
                selectedYear === y.id ? "bg-omari-600 text-white" : "bg-[#1f2d4d] text-[#93a4c0]"
              }`}
            >
              Year {y.number} ({count})
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filteredTickets.map((ticket) => {
          const year = getYear(ticket.yearId);
          const isExpanded = expandedTicket === ticket.id;
          const tp = getTicketProgress(progress, ticket.id);
          const showH = showHints.has(ticket.id);
          const hintsShown = tp.hintsRevealed;
          const draft = draftFor(ticket.id);
          // The solution is gated behind a written diagnosis. Reading the fix
          // before attempting one removes the entire exercise, which is what
          // the previous version of this page did by printing it unconditionally.
          const hasDiagnosis = draft.diagnosis.trim().length >= 20;
          const solutionUnlocked = tp.rootCauseRevealed;

          return (
            <div key={ticket.id} className="panel overflow-hidden">
              <button
                onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                className="flex w-full flex-wrap items-center gap-3 p-4 text-left transition hover:bg-[#16213a]"
                aria-expanded={isExpanded}
              >
                <span className="flex-shrink-0 font-mono text-sm font-bold text-omari-300">{ticket.id}</span>
                <div className="min-w-[180px] flex-1">
                  <div className="font-semibold text-white">{ticket.title}</div>
                  <div className="mt-0.5 text-xs text-[#93a4c0]">
                    Year {year?.number} &middot; {ticket.affectedAsset}
                  </div>
                </div>
                <span className={`badge ${statusColors[tp.status]}`}>{tp.status}</span>
                <span className={`badge ${priorityColors[ticket.priority]}`}>{ticket.priority}</span>
                <svg
                  className={`h-5 w-5 flex-shrink-0 text-[#5a6b88] transition ${isExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="border-t border-[#1f2d4d] p-4">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Left: the brief */}
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-semibold uppercase text-[#5a6b88]">Scenario</div>
                        <p className="mt-1 text-sm text-[#cfd9ec]">{ticket.scenario}</p>
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase text-[#5a6b88]">Business impact</div>
                        <p className="mt-1 text-sm text-[#cfd9ec]">{ticket.businessImpact}</p>
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase text-[#5a6b88]">Symptoms</div>
                        <ul className="mt-1 space-y-1">
                          {ticket.symptoms.map((s, i) => (
                            <li key={i} className="text-sm text-[#cfd9ec]">
                              &bull; {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase text-[#5a6b88]">Evidence available</div>
                        <ul className="mt-1 space-y-1">
                          {ticket.evidenceAvailable.map((e, i) => (
                            <li key={i} className="text-sm text-[#cfd9ec]">
                              &bull; {e}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase text-[#5a6b88]">Acceptance criteria</div>
                        <ul className="mt-1 space-y-1">
                          {ticket.acceptanceCriteria.map((a, i) => (
                            <li key={i} className="text-sm text-[#cfd9ec]">
                              &#10003; {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase text-[#5a6b88]">Escalation threshold</div>
                        <p className="mt-1 text-sm text-[#cfd9ec]">{ticket.escalationThreshold}</p>
                      </div>
                    </div>

                    {/* Right: the learner's work */}
                    <div className="space-y-4">
                      <div className="rounded-lg border border-[#2a3a5e] bg-[#0d1626] p-3">
                        <label className="text-xs font-semibold uppercase tracking-wider text-omari-300">
                          Your diagnosis
                        </label>
                        <p className="mb-2 mt-1 text-xs text-[#5a6b88]">
                          What do you think is wrong, and what evidence points there? Write this before revealing
                          anything. It is what the solution unlock is gated on.
                        </p>
                        <textarea
                          value={draft.diagnosis}
                          onChange={(e) => setDraft(ticket.id, { diagnosis: e.target.value })}
                          onBlur={() => updateTicket(ticket.id, { diagnosis: draft.diagnosis })}
                          placeholder="My working theory is... The evidence supporting it is..."
                          className="input h-24 resize-y"
                        />
                        <div className="mt-1 text-xs text-[#5a6b88]">
                          {draft.diagnosis.trim().length} characters
                          {!hasDiagnosis && " (at least 20 needed to unlock the solution)"}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <label className="text-xs text-[#93a4c0]">Status:</label>
                        <select
                          value={tp.status}
                          onChange={(e) => updateTicket(ticket.id, { status: e.target.value as TicketStatus })}
                          className="rounded-lg border border-[#2a3a5e] bg-[#0d1626] px-3 py-1.5 text-sm text-[#e6edf7]"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Progressive hints */}
                      <div>
                        <button onClick={() => toggleHints(ticket.id)} className="btn-ghost text-xs">
                          {showH ? "Hide hints" : `Show hints (${ticket.hints.length} available)`}
                        </button>
                        {showH && (
                          <div className="mt-2 space-y-2">
                            {ticket.hints.slice(0, Math.max(hintsShown, 1)).map((h, i) => (
                              <div
                                key={i}
                                className="rounded-lg border border-[#1f2d4d] bg-[#0d1626] p-3 text-sm text-[#cfd9ec]"
                              >
                                <span className="font-semibold text-omari-300">Hint {i + 1}:</span> {h}
                              </div>
                            ))}
                            {Math.max(hintsShown, 1) < ticket.hints.length && (
                              <button
                                onClick={() => recordHintReveal(ticket.id, Math.max(hintsShown, 1) + 1)}
                                className="text-xs text-omari-300 hover:underline"
                              >
                                Reveal next hint ({Math.max(hintsShown, 1)}/{ticket.hints.length}) &mdash; try one more
                                thing first
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Solution: root cause AND remediation, both gated together */}
                      <div>
                        {!solutionUnlocked ? (
                          <>
                            <button
                              onClick={() => recordRootCauseReveal(ticket.id)}
                              disabled={!hasDiagnosis}
                              className="btn-ghost text-xs"
                              title={
                                hasDiagnosis
                                  ? "This is recorded against the ticket"
                                  : "Write your diagnosis above first"
                              }
                            >
                              Reveal root cause and remediation
                            </button>
                            <p className="mt-1 text-xs text-[#5a6b88]">
                              {hasDiagnosis
                                ? "Revealing is recorded on this ticket, so your unaided count stays honest."
                                : "Locked until you have written a diagnosis above."}
                            </p>
                          </>
                        ) : (
                          <div className="space-y-2">
                            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
                              <span className="font-semibold">Root cause:</span> {ticket.hiddenRootCause}
                            </div>
                            <div className="rounded-lg border border-[#2a3a5e] bg-[#0d1626] p-3 text-sm text-[#cfd9ec]">
                              <span className="font-semibold text-omari-300">Remediation:</span> {ticket.remediation}
                            </div>
                            <div className="rounded-lg border border-[#2a3a5e] bg-[#0d1626] p-3">
                              <label className="text-xs font-semibold uppercase tracking-wider text-omari-300">
                                How did your diagnosis compare?
                              </label>
                              <textarea
                                value={draft.resolutionNotes}
                                onChange={(e) => setDraft(ticket.id, { resolutionNotes: e.target.value })}
                                onBlur={() => updateTicket(ticket.id, { resolutionNotes: draft.resolutionNotes })}
                                placeholder="What I got right, what I missed, and what I would check first next time..."
                                className="input mt-2 h-20 resize-y"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <button onClick={() => generatePortfolio(ticket.id)} className="btn-primary text-xs">
                          Generate incident report
                        </button>
                        {errors[ticket.id] && (
                          <p className="mt-2 text-xs text-red-400">{errors[ticket.id]}</p>
                        )}
                        {portfolioResults[ticket.id] && (
                          <div className="mt-2">
                            <pre className="max-h-40 overflow-auto rounded-lg border border-[#1f2d4d] bg-[#0d1626] p-3 text-xs text-[#cfd9ec]">
                              {portfolioResults[ticket.id]}
                            </pre>
                            <button
                              onClick={() => download(`${ticket.id}-incident-report.md`, portfolioResults[ticket.id])}
                              className="mt-1 text-xs text-omari-300 hover:underline"
                            >
                              Download .md
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-[#5a6b88]">Portfolio artifact: {ticket.portfolioArtifact}</div>
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
