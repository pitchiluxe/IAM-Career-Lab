"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { getYear, getPhase } from "@/lib/data/years";
import { useProgress } from "@/components/ProgressProvider";
import type { PhaseStatus } from "@/lib/data/types";
import { TutorChat } from "@/components/TutorChat";

const statusOptions: PhaseStatus[] = ["NOT STARTED", "IN PROGRESS", "BLOCKED", "PASSED", "PORTFOLIO READY"];

export default function PhasePage() {
  const params = useParams();
  const yearId = params.id as string;
  const phaseId = params.phase as string;
  const year = getYear(yearId);
  const phase = getPhase(yearId, phaseId);
  const { progress, setPhaseStatus, setCurrentPhase } = useProgress();
  const [showRootCause, setShowRootCause] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [revealedHints, setRevealedHints] = useState(0);
  const [evidenceNotes, setEvidenceNotes] = useState(progress.phases[phaseId]?.evidenceNotes || "");
  const [score, setScore] = useState(progress.phases[phaseId]?.score);
  const [portfolioResult, setPortfolioResult] = useState<string | null>(null);

  if (!year || !phase) {
    return <div className="p-8 text-[#93a4c0]">Phase not found.</div>;
  }

  const currentStatus = progress.phases[phaseId]?.status || "NOT STARTED";
  const phaseIndex = year.phases.findIndex((p) => p.id === phaseId);
  const prevPhase = phaseIndex > 0 ? year.phases[phaseIndex - 1] : null;
  const nextPhase = phaseIndex < year.phases.length - 1 ? year.phases[phaseIndex + 1] : null;

  const tutorContext = `Current lab: Year ${year.number} — ${year.title}
Phase: ${phase.id} — ${phase.title}
Goal: ${phase.goal}
Objectives: ${phase.objectives.join("; ")}
The student is working on this phase. Coach them using progressive hints. Do not reveal answers immediately.`;

  const handleGeneratePortfolio = async () => {
    const res = await fetch("/api/portfolio/phase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ yearId, phaseId, score, evidenceNotes }),
    });
    const data = await res.json();
    if (data.content) {
      setPortfolioResult(data.content);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard" className="text-omari-300 hover:underline">Dashboard</Link>
        <span className="text-[#5a6b88]">/</span>
        <Link href={`/year/${yearId}`} className="text-omari-300 hover:underline">Year {year.number}</Link>
        <span className="text-[#5a6b88]">/</span>
        <span className="text-[#cfd9ec]">{phase.id}</span>
      </div>

      <div className="panel mb-6 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-omari-300">
              {phase.id} · Phase {phase.number} of {year.phases.length}
            </div>
            <h1 className="mt-1 text-2xl font-bold text-white">{phase.title}</h1>
          </div>
          <select
            value={currentStatus}
            onChange={(e) => setPhaseStatus(phaseId, e.target.value as PhaseStatus, score, evidenceNotes)}
            className="rounded-lg border border-[#2a3a5e] bg-[#0d1626] px-3 py-2 text-sm text-[#e6edf7]"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <p className="mt-3 text-sm text-[#93a4c0]">{phase.goal}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {phase.topics.map((t) => (
            <span key={t} className="badge bg-omari-600/15 text-omari-300">{t}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column: lab details */}
        <div className="space-y-6">
          {/* Objectives */}
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

          {/* Student outcomes */}
          <div className="panel p-5">
            <h2 className="mb-3 text-sm font-semibold text-white">Student Outcomes</h2>
            <ul className="space-y-1.5">
              {phase.studentOutcome.map((o, i) => (
                <li key={i} className="flex gap-2 text-sm text-[#cfd9ec]">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {o}
                </li>
              ))}
            </ul>
          </div>

          {/* Evidence */}
          <div className="panel p-5">
            <h2 className="mb-3 text-sm font-semibold text-white">Evidence Requirements</h2>
            <ul className="space-y-1.5">
              {phase.evidence.map((e, i) => (
                <li key={i} className="flex gap-2 text-sm text-[#cfd9ec]">
                  <span className="text-amber-400">•</span>
                  {e}
                </li>
              ))}
            </ul>
          </div>

          {/* Acceptance */}
          <div className="panel p-5">
            <h2 className="mb-3 text-sm font-semibold text-white">Acceptance Criteria</h2>
            <ul className="space-y-1.5">
              {phase.acceptance.map((a, i) => (
                <li key={i} className="flex gap-2 text-sm text-[#cfd9ec]">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-omari-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {a}
                </li>
              ))}
            </ul>
          </div>

          {/* Evidence notes + scoring */}
          <div className="panel p-5">
            <h2 className="mb-3 text-sm font-semibold text-white">Evidence & Scoring</h2>
            <textarea
              value={evidenceNotes}
              onChange={(e) => setEvidenceNotes(e.target.value)}
              placeholder="Document your evidence, commands used, and findings..."
              className="input mb-3 h-24 resize-y"
            />
            <div className="flex items-center gap-3">
              <label className="text-sm text-[#93a4c0]">Score:</label>
              <input
                type="number"
                min={0}
                max={100}
                value={score ?? ""}
                onChange={(e) => setScore(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="0-100"
                className="input w-24"
              />
              <span className="text-xs text-[#5a6b88]">Passing: 80%</span>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setPhaseStatus(phaseId, currentStatus, score, evidenceNotes)}
                className="btn-ghost text-xs"
              >
                Save Evidence
              </button>
              <button onClick={handleGeneratePortfolio} className="btn-primary text-xs">
                Generate Portfolio
              </button>
            </div>
            {portfolioResult && (
              <div className="mt-3">
                <pre className="max-h-48 overflow-auto rounded-lg border border-[#1f2d4d] bg-[#0d1626] p-3 text-xs text-[#cfd9ec]">{portfolioResult}</pre>
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

        {/* Right column: tutor + navigation */}
        <div className="space-y-6">
          <TutorChat context={tutorContext} title={`Tutor — ${phase.id}`} />

          {/* Navigation */}
          <div className="panel p-5">
            <div className="flex items-center justify-between gap-2">
              {prevPhase ? (
                <Link
                  href={`/year/${yearId}/phase/${prevPhase.id}`}
                  className="btn-ghost text-xs"
                  onClick={() => setCurrentPhase(yearId, prevPhase.id)}
                >
                  ← {prevPhase.id}
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
                  {nextPhase.id} →
                </Link>
              ) : (
                <Link href={`/year/${yearId}`} className="btn-primary text-xs">
                  Year Complete →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
