"use client";

import { useState } from "react";
import { years, getYear } from "@/lib/data/years";
import { generateYearPortfolio } from "@/lib/portfolio";
import { useProgress } from "@/components/ProgressProvider";

export default function PortfolioPage() {
  const { progress } = useProgress();
  const [results, setResults] = useState<Record<string, string>>({});

  const generateYear = (yearId: string) => {
    const year = getYear(yearId);
    if (!year) return;
    const artifact = generateYearPortfolio(year);
    setResults((prev) => ({ ...prev, [yearId]: artifact.content }));
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
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Portfolio</h1>
        <p className="mt-1 text-sm text-[#93a4c0]">
          Generate employer-ready artifacts: README, architecture, implementation notes, troubleshooting, root cause, remediation, verification, lessons learned, and skills demonstrated.
        </p>
      </div>

      <div className="panel-2 mb-6 p-5">
        <h2 className="mb-2 text-sm font-semibold text-white">Portfolio Standards</h2>
        <ul className="space-y-1 text-sm text-[#cfd9ec]">
          <li>• Every major project generates a GitHub-ready README</li>
          <li>• Architecture diagrams and implementation notes included</li>
          <li>• Troubleshooting records and root-cause analysis</li>
          <li>• Security considerations and lessons learned</li>
          <li>• Skills demonstrated mapped to each artifact</li>
          <li>• Never include passwords, tokens, or personal data</li>
          <li>• Label as hands-on lab project — not production experience</li>
        </ul>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-white">Year Summaries</h2>
      <div className="space-y-4">
        {years.map((year) => {
          const phaseIds = year.phases.map((p) => p.id);
          const completed = phaseIds.filter((id) => {
            const p = progress.phases[id];
            return p && (p.status === "PASSED" || p.status === "PORTFOLIO READY");
          }).length;
          return (
            <div key={year.id} className="panel p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">Year {year.number} — {year.title}</div>
                  <div className="text-xs text-[#93a4c0]">{completed}/{phaseIds.length} phases completed</div>
                </div>
                <button onClick={() => generateYear(year.id)} className="btn-primary text-xs">
                  Generate Summary
                </button>
              </div>
              {results[year.id] && (
                <div className="mt-3">
                  <pre className="max-h-64 overflow-auto rounded-lg border border-[#1f2d4d] bg-[#0d1626] p-3 text-xs text-[#cfd9ec]">{results[year.id]}</pre>
                  <button
                    onClick={() => download(`year-${year.number}-portfolio-summary.md`, results[year.id])}
                    className="mt-2 text-xs text-omari-300 hover:underline"
                  >
                    Download .md
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="panel-2 mt-6 p-5">
        <h2 className="mb-2 text-sm font-semibold text-white">Per-Phase and Per-Ticket Artifacts</h2>
        <p className="text-sm text-[#cfd9ec]">
          Individual phase and ticket portfolio artifacts can be generated from their respective pages:
        </p>
        <ul className="mt-2 space-y-1 text-sm">
          <li>• <a href="/tickets" className="text-omari-300 hover:underline">Tickets page</a> — generate incident reports per ticket</li>
          <li>• Phase pages (via Year pages) — generate phase portfolio artifacts</li>
        </ul>
      </div>
    </div>
  );
}
