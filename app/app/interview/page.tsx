"use client";

import { useState } from "react";
import { interviewQuestions, certifications } from "@/lib/data/reference";
import { years } from "@/lib/data/years";

export default function InterviewPage() {
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [open, setOpen] = useState<string | null>(null);
  const [tab, setTab] = useState<"questions" | "certs">("questions");

  const questions = yearFilter === "all" ? interviewQuestions : interviewQuestions.filter((q) => q.yearId === yearFilter);
  const certs = yearFilter === "all" ? certifications : certifications.filter((c) => c.yearId === yearFilter);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Interview &amp; Certification Prep</h1>
        <p className="mt-1 text-sm text-[#93a4c0]">
          Each question names what the interviewer is actually testing, and what quietly gets candidates rejected.
          Every one points at the lab or ticket in this platform that gives you a real story to tell instead of a
          textbook answer.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setTab("questions")}
          className={`badge px-3 py-1.5 text-sm ${tab === "questions" ? "bg-omari-600 text-white" : "bg-[#1f2d4d] text-[#93a4c0]"}`}
        >
          Questions ({interviewQuestions.length})
        </button>
        <button
          onClick={() => setTab("certs")}
          className={`badge px-3 py-1.5 text-sm ${tab === "certs" ? "bg-omari-600 text-white" : "bg-[#1f2d4d] text-[#93a4c0]"}`}
        >
          Certifications ({certifications.length})
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setYearFilter("all")}
          className={`badge px-3 py-1.5 text-sm ${yearFilter === "all" ? "bg-omari-600 text-white" : "bg-[#1f2d4d] text-[#93a4c0]"}`}
        >
          All
        </button>
        {years.map((y) => (
          <button
            key={y.id}
            onClick={() => setYearFilter(y.id)}
            className={`badge px-3 py-1.5 text-sm ${yearFilter === y.id ? "bg-omari-600 text-white" : "bg-[#1f2d4d] text-[#93a4c0]"}`}
          >
            Year {y.number}
          </button>
        ))}
      </div>

      {tab === "questions" && (
        <div className="space-y-3">
          {questions.map((q) => {
            const isOpen = open === q.id;
            return (
              <div key={q.id} className="panel overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : q.id)}
                  className="flex w-full items-start gap-4 p-4 text-left transition hover:bg-[#16213a]"
                  aria-expanded={isOpen}
                >
                  <span className="flex-shrink-0 font-mono text-xs font-bold text-omari-300">{q.id}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{q.question}</div>
                    <div className="mt-1 text-xs text-[#93a4c0]">Tests: {q.tests}</div>
                  </div>
                  <svg
                    className={`h-5 w-5 flex-shrink-0 text-[#5a6b88] transition ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="space-y-4 border-t border-[#1f2d4d] p-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-green-400">
                        A strong answer hits
                      </div>
                      <ul className="mt-2 space-y-1.5">
                        {q.strongAnswer.map((s, i) => (
                          <li key={i} className="flex gap-2 text-sm text-[#cfd9ec]">
                            <span className="text-green-400">+</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-lg border border-red-500/25 bg-red-500/5 p-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-red-400">
                        What gets you rejected
                      </div>
                      <p className="mt-2 text-sm text-[#cfd9ec]">{q.weakAnswer}</p>
                    </div>

                    {q.drawOnLab && (
                      <div className="rounded-lg border border-[#2a3a5e] bg-[#0d1626] p-3">
                        <div className="text-xs font-semibold uppercase tracking-wider text-omari-300">
                          Your story comes from
                        </div>
                        <p className="mt-1 text-sm text-[#cfd9ec]">{q.drawOnLab}</p>
                        <p className="mt-1 text-xs text-[#5a6b88]">
                          Describe what you actually did there, what went wrong, and what you changed as a result. A
                          specific lab you built beats a general answer every time.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === "certs" && (
        <>
          <div className="panel-2 mb-4 p-4 text-sm text-[#cfd9ec]">
            Positioning below is honest, including where a certification is weak or market-specific. Completing labs in
            this platform is preparation and portfolio evidence; it is not certification, and you should never describe
            it as such.
          </div>
          <div className="space-y-3">
            {certs.map((c) => (
              <div key={c.id} className="panel p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-white">{c.name}</div>
                    <div className="text-xs text-[#93a4c0]">{c.vendor}</div>
                  </div>
                  <span className="badge bg-omari-600/15 text-omari-300">
                    Year {years.find((y) => y.id === c.yearId)?.number}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#cfd9ec]">{c.worthIt}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.mapsToPhases.map((p) => (
                    <span key={p} className="badge bg-[#1f2d4d] font-mono text-[#93a4c0]">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
