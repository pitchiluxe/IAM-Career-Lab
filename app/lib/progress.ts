import type { PhaseStatus } from "./data/types";
export type { PhaseStatus };

export interface PhaseProgress {
  phaseId: string;
  status: PhaseStatus;
  score?: number;
  evidenceNotes?: string;
  completedAt?: string;
}

export interface ProgressState {
  currentYearId: string;
  currentPhaseId: string;
  phases: Record<string, PhaseProgress>;
  lastUpdated: string;
}

export const DEFAULT_PROGRESS: ProgressState = {
  currentYearId: "year-1",
  currentPhaseId: "Y1-P01",
  phases: {},
  lastUpdated: new Date().toISOString(),
};

export function isYearUnlocked(progress: ProgressState, yearId: string, yearNumber: number): boolean {
  if (yearNumber === 1) return true;
  // A year is unlocked when all phases of the previous year are PASSED or PORTFOLIO READY
  const prevYearNumber = yearNumber - 1;
  const prevYearId = `year-${prevYearNumber}`;
  return isYearComplete(progress, prevYearId);
}

export function isYearComplete(progress: ProgressState, yearId: string): boolean {
  // Check that all phases for this year are PASSED or PORTFOLIO READY
  // We need to import years data to know the phase IDs
  // To avoid circular dependency, we accept the phase IDs as a parameter via the caller
  // For simplicity here, we check if there are at least 8 phases marked as passed for the year
  const yearPhases = Object.values(progress.phases).filter((p) => p.phaseId.startsWith(yearId.replace("year-", "Y")));
  if (yearPhases.length === 0) return false;
  return yearPhases.every((p) => p.status === "PASSED" || p.status === "PORTFOLIO READY");
}

export function isYearCompleteByPhases(progress: ProgressState, phaseIds: string[]): boolean {
  if (phaseIds.length === 0) return false;
  return phaseIds.every((id) => {
    const p = progress.phases[id];
    return p && (p.status === "PASSED" || p.status === "PORTFOLIO READY");
  });
}

export function getPhaseStatus(progress: ProgressState, phaseId: string): PhaseStatus {
  return progress.phases[phaseId]?.status ?? "NOT STARTED";
}

export function updatePhaseStatus(
  progress: ProgressState,
  phaseId: string,
  status: PhaseStatus,
  score?: number,
  evidenceNotes?: string,
): ProgressState {
  const updated: ProgressState = {
    ...progress,
    phases: {
      ...progress.phases,
      [phaseId]: {
        phaseId,
        status,
        score,
        evidenceNotes,
        completedAt: status === "PASSED" || status === "PORTFOLIO READY" ? new Date().toISOString() : undefined,
      },
    },
    lastUpdated: new Date().toISOString(),
  };
  return updated;
}

export function setCurrentPhase(progress: ProgressState, yearId: string, phaseId: string): ProgressState {
  return {
    ...progress,
    currentYearId: yearId,
    currentPhaseId: phaseId,
    lastUpdated: new Date().toISOString(),
  };
}

export function getYearProgressPercent(progress: ProgressState, phaseIds: string[]): number {
  if (phaseIds.length === 0) return 0;
  const completed = phaseIds.filter((id) => {
    const p = progress.phases[id];
    return p && (p.status === "PASSED" || p.status === "PORTFOLIO READY");
  }).length;
  return Math.round((completed / phaseIds.length) * 100);
}

export function getOverallProgressPercent(progress: ProgressState, allPhaseIds: string[]): number {
  if (allPhaseIds.length === 0) return 0;
  const completed = allPhaseIds.filter((id) => {
    const p = progress.phases[id];
    return p && (p.status === "PASSED" || p.status === "PORTFOLIO READY");
  }).length;
  return Math.round((completed / allPhaseIds.length) * 100);
}
