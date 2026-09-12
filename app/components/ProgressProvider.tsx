"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { DEFAULT_PROGRESS, type ProgressState, type PhaseStatus } from "@/lib/progress";

const STORAGE_KEY = "omari-iam-lab-progress";

interface ProgressContextValue {
  progress: ProgressState;
  setPhaseStatus: (phaseId: string, status: PhaseStatus, score?: number, evidenceNotes?: string) => void;
  setCurrentPhase: (yearId: string, phaseId: string) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(DEFAULT_PROGRESS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProgress(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch {
        // ignore storage errors
      }
    }
  }, [progress, loaded]);

  const setPhaseStatus = (phaseId: string, status: PhaseStatus, score?: number, evidenceNotes?: string) => {
    setProgress((prev) => {
      const updated = { ...prev };
      updated.phases = {
        ...prev.phases,
        [phaseId]: {
          phaseId,
          status,
          score,
          evidenceNotes,
          completedAt: status === "PASSED" || status === "PORTFOLIO READY" ? new Date().toISOString() : undefined,
        },
      };
      updated.lastUpdated = new Date().toISOString();
      return updated;
    });
  };

  const setCurrentPhase = (yearId: string, phaseId: string) => {
    setProgress((prev) => ({
      ...prev,
      currentYearId: yearId,
      currentPhaseId: phaseId,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const resetProgress = () => {
    setProgress(DEFAULT_PROGRESS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <ProgressContext.Provider value={{ progress, setPhaseStatus, setCurrentPhase, resetProgress }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
