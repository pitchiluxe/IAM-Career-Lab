"use client";

import { useState } from "react";
import { referenceSections } from "@/lib/data/reference";
import { years } from "@/lib/data/years";

export default function ReferencePage() {
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const sections = referenceSections
    .filter((s) => yearFilter === "all" || s.yearId === yearFilter)
    .map((s) => ({
      ...s,
      entries: q
        ? s.entries.filter(
            (e) =>
              e.item.toLowerCase().includes(q) ||
              e.meaning.toLowerCase().includes(q) ||
              (e.note ?? "").toLowerCase().includes(q),
          )
        : s.entries,
    }))
    .filter((s) => s.entries.length > 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Working Reference</h1>
        <p className="mt-1 text-sm text-[#93a4c0]">
          Scoped to what is worth having in recall rather than everything that could be looked up. The test applied to
          every entry: would needing to search for this mid-incident or mid-interview cost you credibility?
        </p>
      </div>

      <div className="mb-6 space-y-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search commands, ports, event IDs, terms..."
          className="input"
          aria-label="Search reference"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setYearFilter("all")}
            className={`badge px-3 py-1.5 text-sm ${
              yearFilter === "all" ? "bg-omari-600 text-white" : "bg-[#1f2d4d] text-[#93a4c0]"
            }`}
          >
            All
          </button>
          {years.map((y) => (
            <button
              key={y.id}
              onClick={() => setYearFilter(y.id)}
              className={`badge px-3 py-1.5 text-sm ${
                yearFilter === y.id ? "bg-omari-600 text-white" : "bg-[#1f2d4d] text-[#93a4c0]"
              }`}
            >
              Year {y.number}
            </button>
          ))}
        </div>
      </div>

      {sections.length === 0 && (
        <div className="panel p-6 text-sm text-[#93a4c0]">No entries match that search.</div>
      )}

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="panel p-5">
            <h2 className="text-lg font-semibold text-white">{section.title}</h2>
            <p className="mt-1 text-sm text-[#93a4c0]">{section.intro}</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <tbody>
                  {section.entries.map((e) => (
                    <tr key={e.item} className="border-b border-[#1f2d4d] align-top last:border-0">
                      <td className="w-56 py-3 pr-4 font-mono text-xs text-omari-300">{e.item}</td>
                      <td className="py-3">
                        <div className="text-[#e6edf7]">{e.meaning}</div>
                        {e.note && <div className="mt-1 text-xs text-[#93a4c0]">{e.note}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
