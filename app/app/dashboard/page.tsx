"use client";

import Link from "next/link";
import { years } from "@/lib/data/years";
import { tickets } from "@/lib/data/tickets";
import { useProgress } from "@/components/ProgressProvider";
import { getOverallProgressPercent, getYearProgressPercent, isYearCompleteByPhases } from "@/lib/progress";

export default function DashboardPage() {
  const { progress } = useProgress();
  const allPhaseIds = years.flatMap((y) => y.phases.map((p) => p.id));
  const overallPct = getOverallProgressPercent(progress, allPhaseIds);
  const currentYear = years.find((y) => y.id === progress.currentYearId) || years[0];
  const currentPhase = currentYear.phases.find((p) => p.id === progress.currentPhaseId) || currentYear.phases[0];
  const openTickets = tickets.filter((t) => t.yearId === progress.currentYearId).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">IAM Career Lab</h1>
        <p className="mt-1 text-sm text-[#93a4c0]">
          Four-year progressive hands-on training: Help Desk → IAM Analyst → IAM Engineer → IAM Architect
        </p>
      </div>

      {/* Overall progress */}
      <div className="panel mb-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-[#93a4c0]">Overall Progress</div>
            <div className="mt-1 text-3xl font-bold text-white">{overallPct}%</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[#93a4c0]">Current Year</div>
            <div className="mt-1 text-lg font-semibold text-omari-300">Year {currentYear.number} — {currentYear.title}</div>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#1f2d4d]">
          <div className="h-full rounded-full bg-omari-500 transition-all" style={{ width: `${overallPct}%` }} />
        </div>
      </div>

      {/* Current phase */}
      <div className="panel-2 mb-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Current Phase</h2>
          <Link href={`/year/${currentYear.id}/phase/${currentPhase.id}`} className="btn-primary text-xs">
            Continue →
          </Link>
        </div>
        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-omari-300">
            {currentPhase.id} · Phase {currentPhase.number}
          </div>
          <div className="mt-1 text-xl font-bold text-white">{currentPhase.title}</div>
          <p className="mt-2 text-sm text-[#93a4c0]">{currentPhase.goal}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {currentPhase.topics.map((t) => (
            <span key={t} className="badge bg-omari-600/15 text-omari-300">{t}</span>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="panel p-5">
          <div className="text-sm text-[#93a4c0]">Open Tickets</div>
          <div className="mt-2 text-2xl font-bold text-white">{openTickets}</div>
          <Link href="/tickets" className="mt-2 inline-block text-xs text-omari-300 hover:underline">View tickets →</Link>
        </div>
        <div className="panel p-5">
          <div className="text-sm text-[#93a4c0]">VM Status</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
            <span className="text-lg font-semibold text-amber-400">Requires Host Upgrade</span>
          </div>
          <Link href="/vm-status" className="mt-2 inline-block text-xs text-omari-300 hover:underline">View preflight →</Link>
        </div>
        <div className="panel p-5">
          <div className="text-sm text-[#93a4c0]">Ollama Tutor</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
            <span className="text-lg font-semibold text-red-400">Offline</span>
          </div>
          <Link href="/tutor" className="mt-2 inline-block text-xs text-omari-300 hover:underline">Open tutor →</Link>
        </div>
      </div>

      {/* Year cards */}
      <h2 className="mb-4 text-lg font-semibold text-white">Career Years</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {years.map((year) => {
          const phaseIds = year.phases.map((p) => p.id);
          const pct = getYearProgressPercent(progress, phaseIds);
          const complete = isYearCompleteByPhases(progress, phaseIds);
          const unlocked = year.number === 1 || isYearCompleteByPhases(progress, years[year.number - 2].phases.map((p) => p.id));
          return (
            <Link key={year.id} href={`/year/${year.id}`} className="panel p-5 transition hover:border-omari-500">
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-omari-600 text-sm font-bold text-white">
                  {year.number}
                </span>
                {complete ? (
                  <span className="badge bg-green-500/20 text-green-400">Complete</span>
                ) : unlocked ? (
                  <span className="badge bg-omari-600/20 text-omari-300">Unlocked</span>
                ) : (
                  <span className="badge bg-[#1f2d4d] text-[#5a6b88]">Locked</span>
                )}
              </div>
              <div className="mt-3 text-sm font-bold text-white">{year.title}</div>
              <div className="mt-1 text-xs text-[#93a4c0]">{year.roleTarget}</div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#1f2d4d]">
                <div className="h-full rounded-full bg-omari-500" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-1 text-xs text-[#5a6b88]">{pct}% · {year.phases.length} phases</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
