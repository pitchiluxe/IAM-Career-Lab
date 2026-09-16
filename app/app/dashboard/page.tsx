"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { years } from "@/lib/data/years";
import { tickets, getTicketsByYear } from "@/lib/data/tickets";
import { drillCards } from "@/lib/data/drills";
import { useProgress } from "@/components/ProgressProvider";
import {
  getOverallProgressPercent,
  getYearProgressPercent,
  isYearCompleteByPhases,
  getNextIncompletePhase,
  getTicketStats,
} from "@/lib/progress";
import { useTutorSettings, statusUrl } from "@/lib/settings";

type Health = { label: string; tone: "green" | "amber" | "red" | "muted" };

const TONE: Record<Health["tone"], { dot: string; text: string }> = {
  green: { dot: "bg-green-500", text: "text-green-400" },
  amber: { dot: "bg-amber-500", text: "text-amber-400" },
  red: { dot: "bg-red-500", text: "text-red-400" },
  muted: { dot: "bg-[#5a6b88]", text: "text-[#93a4c0]" },
};

export default function DashboardPage() {
  const { progress } = useProgress();
  const { settings, loaded } = useTutorSettings();

  // Both of these were previously hardcoded strings on this page, so the
  // dashboard asserted the tutor was offline and the host unusable regardless
  // of what was actually true. They are now fetched.
  const [tutor, setTutor] = useState<Health>({ label: "Checking...", tone: "muted" });
  const [vm, setVm] = useState<Health>({ label: "Checking...", tone: "muted" });

  useEffect(() => {
    if (!loaded) return;
    let cancelled = false;
    fetch(statusUrl(settings.baseUrl), { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setTutor(
          d.available
            ? { label: `Online (${d.models?.length ?? 0} model${d.models?.length === 1 ? "" : "s"})`, tone: "green" }
            : { label: "Offline", tone: "red" },
        );
      })
      .catch(() => !cancelled && setTutor({ label: "Unreachable", tone: "red" }));
    return () => {
      cancelled = true;
    };
  }, [loaded, settings.baseUrl]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/preflight", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.canBuildVMs === true) setVm({ label: "Host ready", tone: "green" });
        else if (d.canBuildVMs === false) setVm({ label: "Blocked", tone: "amber" });
        else setVm({ label: "Not inspected", tone: "muted" });
      })
      .catch(() => !cancelled && setVm({ label: "Check failed", tone: "red" }));
    return () => {
      cancelled = true;
    };
  }, []);

  const allPhaseIds = years.flatMap((y) => y.phases.map((p) => p.id));
  const overallPct = getOverallProgressPercent(progress, allPhaseIds);

  const currentYear = years.find((y) => y.id === progress.currentYearId) ?? years[0];
  const currentPhaseIds = currentYear.phases.map((p) => p.id);
  // Resume at the first incomplete phase rather than wherever the learner last
  // clicked, which is usually a phase they have already finished.
  const resumeId = getNextIncompletePhase(progress, currentPhaseIds) ?? currentPhaseIds[currentPhaseIds.length - 1];
  const currentPhase = currentYear.phases.find((p) => p.id === resumeId) ?? currentYear.phases[0];

  const yearTickets = getTicketsByYear(currentYear.id);
  const ticketStats = getTicketStats(progress, yearTickets.map((t) => t.id));
  const drillsSeen = Object.keys(progress.drills.streaks).length;
  const drillsMastered = Object.values(progress.drills.streaks).filter((s) => s >= 3).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">IAM Career Lab</h1>
        <p className="mt-1 text-sm text-[#93a4c0]">
          Four-year progressive hands-on training: Help Desk &rarr; IAM Analyst &rarr; IAM Engineer &rarr; IAM Architect
        </p>
      </div>

      <div className="panel mb-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm text-[#93a4c0]">Overall progress</div>
            <div className="mt-1 text-3xl font-bold text-white">{overallPct}%</div>
            <div className="mt-1 text-xs text-[#5a6b88]">
              {allPhaseIds.filter((id) => {
                const p = progress.phases[id];
                return p && (p.status === "PASSED" || p.status === "PORTFOLIO READY");
              }).length}{" "}
              of {allPhaseIds.length} phases complete
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[#93a4c0]">Current year</div>
            <div className="mt-1 text-lg font-semibold text-omari-300">
              Year {currentYear.number} &mdash; {currentYear.title}
            </div>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#1f2d4d]">
          <div className="h-full rounded-full bg-omari-500 transition-all" style={{ width: `${overallPct}%` }} />
        </div>
      </div>

      <div className="panel-2 mb-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Next up</h2>
          <Link href={`/year/${currentYear.id}/phase/${currentPhase.id}`} className="btn-primary text-xs">
            Continue &rarr;
          </Link>
        </div>
        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-omari-300">
            {currentPhase.id} &middot; Phase {currentPhase.number} of {currentYear.phases.length}
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

      {/* Study progress */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="panel p-5">
          <div className="text-sm text-[#93a4c0]">Tickets resolved</div>
          <div className="mt-2 text-2xl font-bold text-white">
            {ticketStats.resolved}
            <span className="text-base text-[#5a6b88]">/{ticketStats.total}</span>
          </div>
          <div className="mt-1 text-xs text-[#5a6b88]">{ticketStats.unaided} solved unaided</div>
          <Link href="/tickets" className="mt-2 inline-block text-xs text-omari-300 hover:underline">
            Open queue &rarr;
          </Link>
        </div>

        <div className="panel p-5">
          <div className="text-sm text-[#93a4c0]">Recall drills</div>
          <div className="mt-2 text-2xl font-bold text-white">
            {drillsMastered}
            <span className="text-base text-[#5a6b88]">/{drillCards.length}</span>
          </div>
          <div className="mt-1 text-xs text-[#5a6b88]">{drillsSeen} seen, {drillsMastered} mastered</div>
          <Link href="/drills" className="mt-2 inline-block text-xs text-omari-300 hover:underline">
            Study &rarr;
          </Link>
        </div>

        <div className="panel p-5">
          <div className="text-sm text-[#93a4c0]">Lab host</div>
          <div className="mt-2 flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${TONE[vm.tone].dot}`} />
            <span className={`text-lg font-semibold ${TONE[vm.tone].text}`}>{vm.label}</span>
          </div>
          <Link href="/vm-status" className="mt-2 inline-block text-xs text-omari-300 hover:underline">
            View preflight &rarr;
          </Link>
        </div>

        <div className="panel p-5">
          <div className="text-sm text-[#93a4c0]">Ollama tutor</div>
          <div className="mt-2 flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${TONE[tutor.tone].dot}`} />
            <span className={`text-lg font-semibold ${TONE[tutor.tone].text}`}>{tutor.label}</span>
          </div>
          <Link href="/tutor" className="mt-2 inline-block text-xs text-omari-300 hover:underline">
            Open tutor &rarr;
          </Link>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-white">Career years</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {years.map((year, i) => {
          const phaseIds = year.phases.map((p) => p.id);
          const pct = getYearProgressPercent(progress, phaseIds);
          const complete = isYearCompleteByPhases(progress, phaseIds);
          const prev = i > 0 ? years[i - 1] : null;
          const unlocked = i === 0 || (prev ? isYearCompleteByPhases(progress, prev.phases.map((p) => p.id)) : false);
          const count = getTicketsByYear(year.id).length;

          return (
            <Link key={year.id} href={`/year/${year.id}`} className="panel p-5 transition hover:border-omari-500">
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                    unlocked ? "bg-omari-600 text-white" : "bg-[#1f2d4d] text-[#5a6b88]"
                  }`}
                >
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
              <div className="mt-1 text-xs text-[#5a6b88]">
                {pct}% &middot; {year.phases.length} phases &middot; {count} tickets
              </div>
            </Link>
          );
        })}
      </div>

      <p className="mt-8 text-xs text-[#5a6b88]">
        {tickets.length} tickets and {drillCards.length} drill cards across all four years. Progress is stored in this
        browser &mdash; export a backup from{" "}
        <Link href="/settings" className="text-omari-300 hover:underline">Settings</Link>.
      </p>
    </div>
  );
}
