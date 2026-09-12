"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getYear } from "@/lib/data/years";
import { useProgress } from "@/components/ProgressProvider";
import { getYearProgressPercent, isYearCompleteByPhases, getPhaseStatus } from "@/lib/progress";

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
  const unlocked = year.number === 1 || isYearCompleteByPhases(progress, years_prev(year.number));
  const prevYear = year.number > 1 ? getYear(`year-${year.number - 1}`) : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <Link href="/dashboard" className="mb-4 inline-block text-sm text-omari-300 hover:underline">← Dashboard</Link>

      <div className="panel mb-6 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-omari-300">Year {year.number}</div>
            <h1 className="mt-1 text-2xl font-bold text-white">{year.title}</h1>
            <p className="mt-2 text-sm text-[#93a4c0]">{year.description}</p>
          </div>
          <div className="text-right">
            {complete ? (
              <span className="badge bg-green-500/20 text-green-400">Year Complete</span>
            ) : unlocked ? (
              <span className="badge bg-omari-600/20 text-omari-300">Unlocked</span>
            ) : (
              <span className="badge bg-[#1f2d4d] text-[#5a6b88]">Locked</span>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="h-2 overflow-hidden rounded-full bg-[#1f2d4d]">
              <div className="h-full rounded-full bg-omari-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <span className="text-sm font-semibold text-white">{pct}%</span>
        </div>
      </div>

      {/* Gate */}
      <div className="panel-2 mb-6 p-6">
        <h2 className="text-sm font-semibold text-amber-400">{year.gate.title}</h2>
        <p className="mt-1 text-xs text-[#93a4c0]">A learner cannot pass this gate merely by reading files. Demonstrated hands-on competency is required.</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {year.gate.competencies.map((c) => (
            <div key={c} className="flex items-center gap-2 text-sm text-[#cfd9ec]">
              <svg className="h-4 w-4 text-[#5a6b88]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {c}
            </div>
          ))}
        </div>
      </div>

      {!unlocked && prevYear && (
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          This year is locked. Complete all phases of Year {prevYear.number} ({prevYear.title}) to unlock.
        </div>
      )}

      {/* Phases */}
      <h2 className="mb-4 text-lg font-semibold text-white">Phases ({year.phases.length})</h2>
      <div className="space-y-3">
        {year.phases.map((phase) => {
          const status = getPhaseStatus(progress, phase.id);
          const statusColors: Record<string, string> = {
            "NOT STARTED": "bg-[#1f2d4d] text-[#5a6b88]",
            "IN PROGRESS": "bg-blue-500/20 text-blue-400",
            BLOCKED: "bg-red-500/20 text-red-400",
            PASSED: "bg-green-500/20 text-green-400",
            "PORTFOLIO READY": "bg-purple-500/20 text-purple-400",
          };
          return (
            <Link
              key={phase.id}
              href={`/year/${year.id}/phase/${phase.id}`}
              className="panel flex items-center gap-4 p-4 transition hover:border-omari-500"
            >
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-omari-600/15 text-sm font-bold text-omari-300">
                {phase.number}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#5a6b88]">{phase.id}</span>
                  <span className={`badge ${statusColors[status]}`}>{status}</span>
                </div>
                <div className="mt-1 font-semibold text-white">{phase.title}</div>
                <div className="mt-0.5 text-xs text-[#93a4c0]">{phase.goal}</div>
              </div>
              <svg className="h-5 w-5 flex-shrink-0 text-[#5a6b88]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function years_prev(currentNumber: number): string[] {
  // Returns phase IDs of the previous year for unlock check
  const prev = getYear(`year-${currentNumber - 1}`);
  return prev ? prev.phases.map((p) => p.id) : [];
}
