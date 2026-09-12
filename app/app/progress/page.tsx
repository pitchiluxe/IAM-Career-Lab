"use client";

import { years } from "@/lib/data/years";
import { useProgress } from "@/components/ProgressProvider";
import { getPhaseStatus, isYearCompleteByPhases } from "@/lib/progress";

const statusColors: Record<string, string> = {
  "NOT STARTED": "bg-[#1f2d4d] text-[#5a6b88]",
  "IN PROGRESS": "bg-blue-500/20 text-blue-400",
  BLOCKED: "bg-red-500/20 text-red-400",
  PASSED: "bg-green-500/20 text-green-400",
  "PORTFOLIO READY": "bg-purple-500/20 text-purple-400",
};

export default function ProgressPage() {
  const { progress, resetProgress } = useProgress();

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Progress Tracker</h1>
          <p className="mt-1 text-sm text-[#93a4c0]">Track your progress across all four years. Years unlock sequentially.</p>
        </div>
        <button
          onClick={() => { if (confirm("Reset all progress? This cannot be undone.")) resetProgress(); }}
          className="btn-ghost text-xs"
        >
          Reset Progress
        </button>
      </div>

      <div className="panel mb-6 p-5">
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <div className="text-[#93a4c0]">Current Year</div>
            <div className="mt-1 font-semibold text-white">{progress.currentYearId.replace("year-", "Year ")}</div>
          </div>
          <div>
            <div className="text-[#93a4c0]">Current Phase</div>
            <div className="mt-1 font-semibold text-white">{progress.currentPhaseId}</div>
          </div>
          <div>
            <div className="text-[#93a4c0]">Last Updated</div>
            <div className="mt-1 font-semibold text-white">{new Date(progress.lastUpdated).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="text-[#93a4c0]">Phases Tracked</div>
            <div className="mt-1 font-semibold text-white">{Object.keys(progress.phases).length}</div>
          </div>
        </div>
      </div>

      {years.map((year) => {
        const phaseIds = year.phases.map((p) => p.id);
        const complete = isYearCompleteByPhases(progress, phaseIds);
        const completedCount = phaseIds.filter((id) => {
          const p = progress.phases[id];
          return p && (p.status === "PASSED" || p.status === "PORTFOLIO READY");
        }).length;
        return (
          <div key={year.id} className="panel mb-6 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Year {year.number} — {year.title}</h2>
                <p className="text-xs text-[#93a4c0]">{year.roleTarget}</p>
              </div>
              <div className="text-right">
                {complete ? (
                  <span className="badge bg-green-500/20 text-green-400">Complete</span>
                ) : (
                  <span className="text-sm text-[#93a4c0]">{completedCount}/{phaseIds.length} passed</span>
                )}
              </div>
            </div>

            {/* Gate */}
            <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <div className="text-xs font-semibold text-amber-400">{year.gate.title}</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {year.gate.competencies.map((c) => (
                  <span key={c} className="badge bg-[#1f2d4d] text-[#93a4c0]">{c}</span>
                ))}
              </div>
            </div>

            {/* Phase table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#5a6b88]">
                    <th className="pb-2 pr-4">Phase</th>
                    <th className="pb-2 pr-4">Title</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Score</th>
                    <th className="pb-2">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {year.phases.map((phase) => {
                    const status = getPhaseStatus(progress, phase.id);
                    const p = progress.phases[phase.id];
                    return (
                      <tr key={phase.id} className="border-t border-[#1f2d4d]">
                        <td className="py-2 pr-4 font-mono text-xs text-omari-300">{phase.id}</td>
                        <td className="py-2 pr-4 text-[#cfd9ec]">{phase.title}</td>
                        <td className="py-2 pr-4">
                          <span className={`badge ${statusColors[status]}`}>{status}</span>
                        </td>
                        <td className="py-2 pr-4 text-[#cfd9ec]">{p?.score ? `${p.score}%` : "—"}</td>
                        <td className="py-2 text-[#cfd9ec]">{p?.completedAt ? new Date(p.completedAt).toLocaleDateString() : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
