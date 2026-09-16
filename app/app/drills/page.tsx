"use client";

import { useState, useMemo, useCallback } from "react";
import { drillCards, orderForStudy } from "@/lib/data/drills";
import { years } from "@/lib/data/years";
import { useProgress } from "@/components/ProgressProvider";
import type { DrillCard } from "@/lib/data/types";

/**
 * Active recall study page.
 *
 * The interaction is deliberately awkward in one specific way: you cannot see
 * the answer until you have committed to attempting it. That friction is the
 * entire mechanism. Recognition ("yes, I'd have got that") feels like learning
 * and is not; retrieval is. Every design choice here protects the retrieval
 * attempt from being skipped.
 */
export default function DrillsPage() {
  const { progress, recordDrillResult } = useProgress();
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [sessionSeen, setSessionSeen] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);

  const streaks = progress.drills.streaks;

  const deck: DrillCard[] = useMemo(() => {
    const pool = yearFilter === "all" ? drillCards : drillCards.filter((c) => c.yearId === yearFilter);
    return orderForStudy(pool, streaks);
    // Intentionally excluding `streaks` from the ordering recompute during a
    // session: if the deck reordered after every answer, the card under the
    // cursor would change mid-session and feel broken.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearFilter]);

  const card = deck[index];

  const changeYear = useCallback((y: string) => {
    setYearFilter(y);
    setIndex(0);
    setRevealed(false);
  }, []);

  const grade = useCallback(
    (correct: boolean) => {
      if (!card) return;
      recordDrillResult(card.id, correct);
      setSessionSeen((n) => n + 1);
      if (correct) setSessionCorrect((n) => n + 1);
      setRevealed(false);
      setIndex((i) => (i + 1) % Math.max(deck.length, 1));
    },
    [card, deck.length, recordDrillResult],
  );

  const mastered = deck.filter((c) => (streaks[c.id] ?? 0) >= 3).length;
  const streak = card ? (streaks[card.id] ?? 0) : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Recall Drills</h1>
        <p className="mt-1 text-sm text-[#93a4c0]">
          Answer out loud or in writing before you reveal. Recognising the answer once you see it is not the same as
          being able to produce it in an interview or an incident, and only one of those is being trained here.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => changeYear("all")}
          className={`badge px-3 py-1.5 text-sm ${
            yearFilter === "all" ? "bg-omari-600 text-white" : "bg-[#1f2d4d] text-[#93a4c0]"
          }`}
        >
          All ({drillCards.length})
        </button>
        {years.map((y) => {
          const count = drillCards.filter((c) => c.yearId === y.id).length;
          return (
            <button
              key={y.id}
              onClick={() => changeYear(y.id)}
              className={`badge px-3 py-1.5 text-sm ${
                yearFilter === y.id ? "bg-omari-600 text-white" : "bg-[#1f2d4d] text-[#93a4c0]"
              }`}
            >
              Year {y.number} ({count})
            </button>
          );
        })}
      </div>

      {/* Session stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["This session", `${sessionCorrect}/${sessionSeen}`],
          ["Deck size", String(deck.length)],
          ["Mastered", `${mastered}/${deck.length}`],
          ["Card streak", String(streak)],
        ].map(([label, value]) => (
          <div key={label} className="panel p-4">
            <div className="text-xs uppercase tracking-wider text-[#5a6b88]">{label}</div>
            <div className="mt-1 text-xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      {!card && (
        <div className="panel p-6 text-sm text-[#93a4c0]">No cards in this deck yet.</div>
      )}

      {card && (
        <div className="panel p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="badge bg-omari-600/15 text-omari-300">{card.category}</span>
            <span className="badge bg-[#1f2d4d] text-[#93a4c0]">
              Year {years.find((y) => y.id === card.yearId)?.number}
            </span>
            <span className="ml-auto font-mono text-xs text-[#5a6b88]">
              {index + 1} / {deck.length}
            </span>
          </div>

          <p className="text-lg font-medium leading-relaxed text-white">{card.prompt}</p>

          {!revealed && (
            <div className="mt-6">
              <p className="mb-3 text-xs text-[#5a6b88]">
                Commit to an answer first. Say it out loud or write it down, then reveal.
              </p>
              <button onClick={() => setRevealed(true)} className="btn-primary">
                Reveal answer
              </button>
            </div>
          )}

          {revealed && (
            <div className="mt-6 space-y-4">
              <div className="rounded-lg border border-[#2a3a5e] bg-[#0d1626] p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-omari-300">Answer</div>
                <p className="mt-2 text-sm leading-relaxed text-[#e6edf7]">{card.answer}</p>
              </div>

              <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">Why it matters</div>
                <p className="mt-2 text-sm leading-relaxed text-[#cfd9ec]">{card.whyItMatters}</p>
              </div>

              <div>
                <p className="mb-2 text-xs text-[#5a6b88]">
                  Grade yourself honestly. Marking a near-miss as correct only removes the card from the rotation you
                  still need.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => grade(false)} className="btn-ghost">
                    Missed it
                  </button>
                  <button onClick={() => grade(true)} className="btn-primary">
                    Got it
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="panel-2 mt-6 p-5">
        <h2 className="mb-2 text-sm font-semibold text-white">How this deck orders itself</h2>
        <p className="text-sm text-[#cfd9ec]">
          Cards you have missed, or never seen, come first. Each correct answer raises that card&apos;s streak by one
          and pushes it further back; a miss resets the streak to zero, because a lapse means you do not know it yet
          rather than that you partly know it. A card is treated as mastered at a streak of three. Ordering is
          recalculated when you change deck, not after every card, so the deck stays stable while you work through it.
        </p>
      </div>
    </div>
  );
}
