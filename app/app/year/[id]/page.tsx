"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getYear, years } from "@/lib/data/years";
import { getTicketsByYear } from "@/lib/data/tickets";
import { useProgress } from "@/components/ProgressProvider";
import {
  getYearProgressPercent,
  isYearCompleteByPhases,
  getPhaseStatus,
  isPhaseUnlocked,
  getNextIncompletePhase,
} from "@/lib/progress";

const statusColors: Record<string, string> = {
  "NOT STARTED": "bg-[#1f2d4d] text-[#5a6b88]",
  "IN PROGRESS": "bg-blue-500/20 text-blue-400",
  BLOCKED: "bg-red-500/20 text-red-400",
  PASSED: "bg-green-500/20 text-green-400",
  "PORTFOLIO READY": "bg-purple-500/20 text-purple-400",
};

export default function YearPage() {
  const params = useParams();
  const yearId = params.id as string;
  const year = getYear(yearId);
  const { progress } = useProgress();

  if (!year) {
    return <div className="p-8 text-[#93a4c0]">Year not found.</div>;
  }

  const phaseIds = year.phases.map((p) => p.id);
  const pct = getYearProgressPercent(progress, phaseIds);
  const complete = isYearCompleteByPhases(progress, phaseIds);

  const prevYear = year.number > 1 ? years[year.number - 2] : null;
  const unlocked = year.number === 1 || (prevYear ? isYearCompleteByPhases(progress, prevYear.phases.map((p) => p.id)) : false);

  const nextPhaseId = getNextIncompletePhase(progress, phaseIds);
  const ticketCount = getTicketsByYear(year.id).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/dashboard" className="mb-4 inline-block text-sm text-omari-300 hover:underline">
        &larr; Dashboard
      </Link>

      <div className="panel mb-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-omari-300">Year {year.number}</div>
            <h1 className="mt-1 text-2xl font-bold text-white">{year.title}</h1>
            <p className="mt-2 text-sm text-[#93a4c0]">{year.description}</p>
          </div>
          <div className="text-right">
            {complete ? (
              <span className="badge bg-green-500/20 text-green-400">Year complete</span>
            ) : unlocked ? (
              <span className="badge bg-omari-600/20 text-omari-300">Unlocked</span>
            ) : (
              <span className="badge bg-[#1f2d4d] text-[#5a6b88]">Locked</span>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#1f2d4d]">
            <div className="h-full rounded-full bg-omari-500" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm font-semibold text-white">{pct}%</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#5a6b88]">
          <span>{year.phases.length} phases</span>
          <span>{ticketCount} tickets</span>
          {unlocked && nextPhaseId && (
            <Link href={`/year/${year.id}/phase/${nextPhaseId}`} className="text-omari-300 hover:underline">
              Resume at {nextPhaseId} &rarr;
            </Link>
          )}
        </div>
      </div>

      <div className="panel-2 mb-6 p-6">
        <h2 className="text-sm font-semibold text-amber-400">{year.gate.title}</h2>
        <p className="mt-1 text-xs text-[#93a4c0]">
          This gate cannot be passed by reading. Every competency below requires demonstrated hands-on work with
          recorded evidence.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {year.gate.competencies.map((c) => (
            <div key={c} className="flex items-center gap-2 text-sm text-[#cfd9ec]">
              <svg className="h-4 w-4 flex-shrink-0 text-[#5a6b88]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {c}
            </div>
          ))}
        </div>
      </div>

      {!unlocked && prevYear && (
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          This year is locked. Complete all {prevYear.phases.length} phases of Year {prevYear.number} (
          {prevYear.title}) to unlock it.{" "}
          <Link href={`/year/${prevYear.id}`} className="underline">
            Go to Year {prevYear.number}
          </Link>
        </div>
      )}

      <h2 className="mb-4 text-lg font-semibold text-white">Phases ({year.phases.length})</h2>
      <div className="space-y-3">
        {year.phases.map((phase) => {
          const status = getPhaseStatus(progress, phase.id);
          const phaseUnlocked = isPhaseUnlocked(progress, phaseIds, phase.id, unlocked);

          const inner = (
            <>
              <span
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                  phaseUnlocked ? "bg-omari-600/15 text-omari-300" : "bg-[#1f2d4d] text-[#5a6b88]"
                }`}
              >
                {phaseUnlocked ? (
                  phase.number
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-[#5a6b88]">{phase.id}</span>
                  <span className={`badge ${statusColors[status]}`}>{status}</span>
                </div>
                <div className={`mt-1 font-semibold ${phaseUnlocked ? "text-white" : "text-[#5a6b88]"}`}>
                  {phase.title}
                </div>
                <div className="mt-0.5 text-xs text-[#93a4c0]">
                  {phaseUnlocked ? phase.goal : "Complete the previous phase to unlock this one."}
                </div>
              </div>
            </>
          );

          // A locked phase renders as a div, not a Link. Rendering it as a
          // disabled-looking link that still navigates is what made the
          // sequential gate purely decorative before.
          return phaseUnlocked ? (
            <Link
              key={phase.id}
              href={`/year/${year.id}/phase/${phase.id}`}
              className="panel flex items-center gap-4 p-4 transition hover:border-omari-500"
            >
              {inner}
              <svg className="h-5 w-5 flex-shrink-0 text-[#5a6b88]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div
              key={phase.id}
              className="panel flex cursor-not-allowed items-center gap-4 p-4 opacity-60"
              aria-disabled="true"
            >
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
