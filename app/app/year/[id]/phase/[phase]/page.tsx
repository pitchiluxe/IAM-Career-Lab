"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getYear, getPhase, years } from "@/lib/data/years";
import { getTicketsByPhase } from "@/lib/data/tickets";
import { useProgress } from "@/components/ProgressProvider";
import type { PhaseStatus } from "@/lib/data/types";
import { isYearCompleteByPhases, isPhaseUnlocked, PASSING_SCORE } from "@/lib/progress";
import { TutorChat } from "@/components/TutorChat";

const statusOptions: PhaseStatus[] = ["NOT STARTED", "IN PROGRESS", "BLOCKED", "PASSED", "PORTFOLIO READY"];

export default function PhasePage() {
  const params = useParams();
  const yearId = params.id as string;
  const phaseId = params.phase as string;
  const year = getYear(yearId);
  const phase = getPhase(yearId, phaseId);
  const { progress, setPhaseStatus, savePhaseEvidence, setCurrentPhase } = useProgress();

  const saved = progress.phases[phaseId];
  const [evidenceNotes, setEvidenceNotes] = useState(saved?.evidenceNotes ?? "");
  const [score, setScore] = useState<number | undefined>(saved?.score);
  const [portfolioResult, setPortfolioResult] = useState<string | null>(null);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  /**
   * Re-seed the local draft when the route changes.
   *
   * Next.js reuses this component instance when only the dynamic segment
   * changes, so useState initialisers do NOT re-run on navigation between
   * phases. Without this effect the previous phase's evidence notes and score
   * stay on screen and get saved against the new phase.
   */
  useEffect(() => {
    const entry = progress.phases[phaseId];
    setEvidenceNotes(entry?.evidenceNotes ?? "");
    setScore(entry?.score);
    setPortfolioResult(null);
    setPortfolioError(null);
    // Keyed on phaseId only: including `progress` would clobber the learner's
    // in-flight typing every time any part of progress state updated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseId]);

  if (!year || !phase) {
    return <div className="p-8 text-[#93a4c0]">Phase not found.</div>;
  }

  const phaseIds = year.phases.map((p) => p.id);
  const prevYear = year.number > 1 ? years[year.number - 2] : null;
  const yearUnlocked =
    year.number === 1 || (prevYear ? isYearCompleteByPhases(progress, prevYear.phases.map((p) => p.id)) : false);
  const unlocked = isPhaseUnlocked(progress, phaseIds, phaseId, yearUnlocked);

  const currentStatus = saved?.status ?? "NOT STARTED";
  const phaseIndex = phaseIds.indexOf(phaseId);
  const prevPhase = phaseIndex > 0 ? year.phases[phaseIndex - 1] : null;
  const nextPhase = phaseIndex < year.phases.length - 1 ? year.phases[phaseIndex + 1] : null;
  const relatedTickets = getTicketsByPhase(phase.id);

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="panel p-8 text-center">
          <h1 className="text-xl font-bold text-white">{phase.id} is locked</h1>
          <p className="mt-2 text-sm text-[#93a4c0]">
            {yearUnlocked
              ? "Finish the preceding phases in this year first. The curriculum is sequential because each phase assumes the skills built in the one before it."
              : `Year ${year.number} is locked. Complete Year ${year.number - 1} to unlock it.`}
          </p>
          <Link href={`/year/${yearId}`} className="btn-primary mt-6 inline-flex">
            Back to Year {year.number}
          </Link>
        </div>
      </div>
    );
  }

  const tutorContext = `Current lab: Year ${year.number} - ${year.title}
Phase: ${phase.id} - ${phase.title}
Goal: ${phase.goal}
Objectives: ${phase.objectives.join("; ")}
Acceptance criteria: ${phase.acceptance.join("; ")}
The student is working on this phase. Coach them using progressive hints. Do not reveal answers immediately.`;

  const handleSave = () => {
    savePhaseEvidence(phaseId, score, evidenceNotes);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  };

  const handleGeneratePortfolio = async () => {
    setPortfolioError(null);
    try {
      const res = await fetch("/api/portfolio/phase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yearId, phaseId, score, evidenceNotes }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      setPortfolioResult(data.content);
    } catch (e) {
      setPortfolioError(e instanceof Error ? e.message : "Could not generate the portfolio artifact.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <Link href="/dashboard" className="text-omari-300 hover:underline">Dashboard</Link>
        <span className="text-[#5a6b88]">/</span>
        <Link href={`/year/${yearId}`} className="text-omari-300 hover:underline">Year {year.number}</Link>
        <span className="text-[#5a6b88]">/</span>
        <span className="text-[#cfd9ec]">{phase.id}</span>
      </div>

      <div className="panel mb-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-omari-300">
              {phase.id} &middot; Phase {phase.number} of {year.phases.length}
            </div>
            <h1 className="mt-1 text-2xl font-bold text-white">{phase.title}</h1>
          </div>
          <label className="text-sm">
            <span className="sr-only">Phase status</span>
            <select
              value={currentStatus}
              onChange={(e) => setPhaseStatus(phaseId, e.target.value as PhaseStatus)}
              className="rounded-lg border border-[#2a3a5e] bg-[#0d1626] px-3 py-2 text-sm text-[#e6edf7]"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-3 text-sm text-[#93a4c0]">{phase.goal}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {phase.topics.map((t) => (
            <span key={t} className="badge bg-omari-600/15 text-omari-300">{t}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="panel p-5">
            <h2 className="mb-3 text-sm font-semibold text-white">Objectives</h2>
            <ul className="space-y-2">
              {phase.objectives.map((o, i) => (
                <li key={i} className="flex gap-2 text-sm text-[#cfd9ec]">
                  <span className="text-omari-400">{i + 1}.</span>
                  {o}
                </li>
              ))}
            </ul>
          </div>

          <div className="panel p-5">
            <h2 className="mb-3 text-sm font-semibold text-white">Student outcomes</h2>
            <ul className="space-y-1.5">
              {phase.studentOutcome.map((o, i) => (
                <li key={i} className="flex gap-2 text-sm text-[#cfd9ec]">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {o}
                </li>
              ))}
            </ul>
          </div>

          <div className="panel p-5">
            <h2 className="mb-3 text-sm font-semibold text-white">Evidence requirements</h2>
            <ul className="space-y-1.5">
              {phase.evidence.map((e, i) => (
                <li key={i} className="flex gap-2 text-sm text-[#cfd9ec]">
                  <span className="text-amber-400">&bull;</span>
                  {e}
                </li>
              ))}
            </ul>
          </div>

          <div className="panel p-5">
            <h2 className="mb-3 text-sm font-semibold text-white">Acceptance criteria</h2>
            <ul className="space-y-1.5">
              {phase.acceptance.map((a, i) => (
                <li key={i} className="flex gap-2 text-sm text-[#cfd9ec]">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-omari-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {a}
                </li>
              ))}
            </ul>
          </div>

          {relatedTickets.length > 0 && (
            <div className="panel p-5">
              <h2 className="mb-1 text-sm font-semibold text-white">Tickets for this phase</h2>
              <p className="mb-3 text-xs text-[#5a6b88]">
                Apply the phase material to a real work item. These are where your portfolio stories come from.
              </p>
              <ul className="space-y-1.5">
                {relatedTickets.map((t) => (
                  <li key={t.id} className="text-sm">
                    <Link href="/tickets" className="text-omari-300 hover:underline">
                      <span className="font-mono text-xs">{t.id}</span> {t.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="panel p-5">
            <h2 className="mb-3 text-sm font-semibold text-white">Evidence &amp; scoring</h2>
            <textarea
              value={evidenceNotes}
              onChange={(e) => setEvidenceNotes(e.target.value)}
              placeholder="Document your evidence, the commands used, and what you found..."
              className="input mb-3 h-24 resize-y"
              aria-label="Evidence notes"
            />
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm text-[#93a4c0]" htmlFor="score">Score:</label>
              <input
                id="score"
                type="number"
                min={0}
                max={100}
                value={score ?? ""}
                onChange={(e) => setScore(e.target.value === "" ? undefined : Number(e.target.value))}
                placeholder="0-100"
                className="input w-24"
              />
              <span className="text-xs text-[#5a6b88]">Passing: {PASSING_SCORE}%</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button onClick={handleSave} className="btn-ghost text-xs">Save evidence</button>
              <button onClick={handleGeneratePortfolio} className="btn-primary text-xs">Generate portfolio</button>
              {savedFlash && <span className="text-xs text-green-400">Saved</span>}
            </div>
            {portfolioError && <p className="mt-2 text-xs text-red-400">{portfolioError}</p>}
            {portfolioResult && (
              <div className="mt-3">
                <pre className="max-h-48 overflow-auto rounded-lg border border-[#1f2d4d] bg-[#0d1626] p-3 text-xs text-[#cfd9ec]">
                  {portfolioResult}
                </pre>
                <button
                  onClick={() => {
                    const blob = new Blob([portfolioResult], { type: "text/markdown" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${phase.id}-portfolio.md`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="mt-2 text-xs text-omari-300 hover:underline"
                >
                  Download .md
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <TutorChat context={tutorContext} title={`Tutor - ${phase.id}`} />

          <div className="panel p-5">
            <div className="flex items-center justify-between gap-2">
              {prevPhase ? (
                <Link
                  href={`/year/${yearId}/phase/${prevPhase.id}`}
                  className="btn-ghost text-xs"
                  onClick={() => setCurrentPhase(yearId, prevPhase.id)}
                >
                  &larr; {prevPhase.id}
                </Link>
              ) : (
                <span />
              )}
              {nextPhase ? (
                <Link
                  href={`/year/${yearId}/phase/${nextPhase.id}`}
                  className="btn-primary text-xs"
                  onClick={() => setCurrentPhase(yearId, nextPhase.id)}
                >
                  {nextPhase.id} &rarr;
                </Link>
              ) : (
                <Link href={`/year/${yearId}`} className="btn-primary text-xs">
                  Back to Year {year.number}
                </Link>
              )}
            </div>
            {nextPhase && (
              <p className="mt-2 text-xs text-[#5a6b88]">
                {nextPhase.id} unlocks once this phase is marked PASSED or PORTFOLIO READY.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
