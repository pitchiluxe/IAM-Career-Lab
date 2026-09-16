"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import {
  DEFAULT_PROGRESS,
  migrateProgress,
  type ProgressState,
  type PhaseStatus,
  type TicketStatus,
  type TicketProgress,
} from "@/lib/progress";

const STORAGE_KEY = "omari-iam-lab-progress";

interface ProgressContextValue {
  progress: ProgressState;
  /** False until localStorage has been read, so the UI can avoid flashing empty state. */
  loaded: boolean;
  setPhaseStatus: (phaseId: string, status: PhaseStatus, score?: number, evidenceNotes?: string) => void;
  savePhaseEvidence: (phaseId: string, score: number | undefined, evidenceNotes: string) => void;
  setCurrentPhase: (yearId: string, phaseId: string) => void;
  updateTicket: (ticketId: string, patch: Partial<Omit<TicketProgress, "ticketId">>) => void;
  setTicketStatus: (ticketId: string, status: TicketStatus) => void;
  recordHintReveal: (ticketId: string, hintsRevealed: number) => void;
  recordRootCauseReveal: (ticketId: string) => void;
  recordDrillResult: (cardId: string, correct: boolean) => void;
  replaceProgress: (next: ProgressState) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(DEFAULT_PROGRESS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setProgress(migrateProgress(JSON.parse(stored)));
    } catch {
      // A corrupt or unreadable blob must not brick the app. Falling back to
      // DEFAULT_PROGRESS loses history, which is why Settings offers export.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Quota exceeded or storage blocked (private window). Nothing actionable
      // here; the Settings page surfaces export as the durable path.
    }
  }, [progress, loaded]);

  const setPhaseStatus = useCallback(
    (phaseId: string, status: PhaseStatus, score?: number, evidenceNotes?: string) => {
      setProgress((prev) => {
        const existing = prev.phases[phaseId];
        return {
          ...prev,
          phases: {
            ...prev.phases,
            [phaseId]: {
              phaseId,
              status,
              // Preserve previously saved work when the caller only changes status.
              score: score ?? existing?.score,
              evidenceNotes: evidenceNotes ?? existing?.evidenceNotes,
              completedAt:
                status === "PASSED" || status === "PORTFOLIO READY"
                  ? (existing?.completedAt ?? new Date().toISOString())
                  : undefined,
            },
          },
          lastUpdated: new Date().toISOString(),
        };
      });
    },
    [],
  );

  const savePhaseEvidence = useCallback((phaseId: string, score: number | undefined, evidenceNotes: string) => {
    setProgress((prev) => {
      const existing = prev.phases[phaseId];
      return {
        ...prev,
        phases: {
          ...prev.phases,
          [phaseId]: {
            phaseId,
            status: existing?.status ?? "IN PROGRESS",
            score,
            evidenceNotes,
            completedAt: existing?.completedAt,
          },
        },
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const setCurrentPhase = useCallback((yearId: string, phaseId: string) => {
    setProgress((prev) => ({
      ...prev,
      currentYearId: yearId,
      currentPhaseId: phaseId,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const updateTicket = useCallback((ticketId: string, patch: Partial<Omit<TicketProgress, "ticketId">>) => {
    setProgress((prev) => {
      const existing: TicketProgress = prev.tickets[ticketId] ?? {
        ticketId,
        status: "NEW",
        hintsRevealed: 0,
        rootCauseRevealed: false,
      };
      const next: TicketProgress = { ...existing, ...patch, ticketId };
      if (patch.status === "RESOLVED" && !existing.resolvedAt) {
        next.resolvedAt = new Date().toISOString();
      }
      return {
        ...prev,
        tickets: { ...prev.tickets, [ticketId]: next },
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const setTicketStatus = useCallback(
    (ticketId: string, status: TicketStatus) => updateTicket(ticketId, { status }),
    [updateTicket],
  );

  /**
   * Hint counts only ever go up. If they could go down, closing and reopening
   * the hints panel would erase the record of having used them, which would
   * make the "solved unaided" statistic a lie.
   */
  const recordHintReveal = useCallback(
    (ticketId: string, hintsRevealed: number) => {
      setProgress((prev) => {
        const existing = prev.tickets[ticketId];
        const current = existing?.hintsRevealed ?? 0;
        if (hintsRevealed <= current) return prev;
        return {
          ...prev,
          tickets: {
            ...prev.tickets,
            [ticketId]: {
              ticketId,
              status: existing?.status ?? "INVESTIGATING",
              rootCauseRevealed: existing?.rootCauseRevealed ?? false,
              diagnosis: existing?.diagnosis,
              resolutionNotes: existing?.resolutionNotes,
              resolvedAt: existing?.resolvedAt,
              hintsRevealed,
            },
          },
          lastUpdated: new Date().toISOString(),
        };
      });
    },
    [],
  );

  const recordRootCauseReveal = useCallback(
    (ticketId: string) => updateTicket(ticketId, { rootCauseRevealed: true }),
    [updateTicket],
  );

  const recordDrillResult = useCallback((cardId: string, correct: boolean) => {
    setProgress((prev) => ({
      ...prev,
      drills: {
        streaks: {
          ...prev.drills.streaks,
          // A wrong answer resets the streak to zero rather than decrementing:
          // spaced repetition treats a lapse as "you do not know this yet".
          [cardId]: correct ? (prev.drills.streaks[cardId] ?? 0) + 1 : 0,
        },
        lastReviewed: { ...prev.drills.lastReviewed, [cardId]: new Date().toISOString() },
      },
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const replaceProgress = useCallback((next: ProgressState) => {
    setProgress({ ...next, lastUpdated: new Date().toISOString() });
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({ ...DEFAULT_PROGRESS, lastUpdated: new Date().toISOString() });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({
      progress,
      loaded,
      setPhaseStatus,
      savePhaseEvidence,
      setCurrentPhase,
      updateTicket,
      setTicketStatus,
      recordHintReveal,
      recordRootCauseReveal,
      recordDrillResult,
      replaceProgress,
      resetProgress,
    }),
    [
      progress,
      loaded,
      setPhaseStatus,
      savePhaseEvidence,
      setCurrentPhase,
      updateTicket,
      setTicketStatus,
      recordHintReveal,
      recordRootCauseReveal,
      recordDrillResult,
      replaceProgress,
      resetProgress,
    ],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
