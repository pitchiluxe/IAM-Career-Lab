import type { PhaseStatus } from "./data/types";
export type { PhaseStatus };

export const PASSING_SCORE = 80;

/** Statuses that count a phase as finished for unlock purposes. */
const COMPLETE_STATUSES: PhaseStatus[] = ["PASSED", "PORTFOLIO READY"];

export interface PhaseProgress {
  phaseId: string;
  status: PhaseStatus;
  score?: number;
  evidenceNotes?: string;
  completedAt?: string;
}

export type TicketStatus = "NEW" | "INVESTIGATING" | "ESCALATED" | "RESOLVED";

export interface TicketProgress {
  ticketId: string;
  status: TicketStatus;
  /**
   * How many progressive hints the learner opened. Recorded because a ticket
   * solved with zero hints is not the same achievement as one solved with
   * three, and the tutor needs that context to score honestly.
   */
  hintsRevealed: number;
  /** True once the root cause was revealed rather than deduced. */
  rootCauseRevealed: boolean;
  /** The learner's own diagnosis, written BEFORE revealing anything. */
  diagnosis?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
}

export interface DrillProgress {
  /** Card id -> number of times answered correctly in a row. */
  streaks: Record<string, number>;
  lastReviewed: Record<string, string>;
}

export interface ProgressState {
  /** Schema version, so a future change can migrate old saved state. */
  version: number;
  currentYearId: string;
  currentPhaseId: string;
  phases: Record<string, PhaseProgress>;
  tickets: Record<string, TicketProgress>;
  drills: DrillProgress;
  lastUpdated: string;
}

export const PROGRESS_VERSION = 2;

export const DEFAULT_PROGRESS: ProgressState = {
  version: PROGRESS_VERSION,
  currentYearId: "year-1",
  currentPhaseId: "Y1-P01",
  phases: {},
  tickets: {},
  drills: { streaks: {}, lastReviewed: {} },
  lastUpdated: new Date(0).toISOString(),
};

/**
 * Brings any previously saved state up to the current shape.
 *
 * v1 had no `tickets` or `drills` keys. Reading a v1 blob without filling them
 * in produces `undefined` where the UI expects an object, so every consumer
 * would need a null check. Migrating once here keeps the rest of the code
 * honest about its own types.
 */
export function migrateProgress(raw: unknown): ProgressState {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_PROGRESS };
  const p = raw as Partial<ProgressState>;
  return {
    version: PROGRESS_VERSION,
    currentYearId: typeof p.currentYearId === "string" ? p.currentYearId : DEFAULT_PROGRESS.currentYearId,
    currentPhaseId: typeof p.currentPhaseId === "string" ? p.currentPhaseId : DEFAULT_PROGRESS.currentPhaseId,
    phases: p.phases && typeof p.phases === "object" ? p.phases : {},
    tickets: p.tickets && typeof p.tickets === "object" ? p.tickets : {},
    drills:
      p.drills && typeof p.drills === "object"
        ? { streaks: p.drills.streaks ?? {}, lastReviewed: p.drills.lastReviewed ?? {} }
        : { streaks: {}, lastReviewed: {} },
    lastUpdated: typeof p.lastUpdated === "string" ? p.lastUpdated : new Date().toISOString(),
  };
}

export function isPhaseComplete(progress: ProgressState, phaseId: string): boolean {
  const p = progress.phases[phaseId];
  return Boolean(p && COMPLETE_STATUSES.includes(p.status));
}

/**
 * A year is complete only when EVERY one of its phase ids is complete.
 *
 * The caller passes the full id list rather than this module deriving it,
 * because deriving it here would mean importing the year data and creating a
 * circular import. The important part is that an absent phase counts as
 * incomplete — an earlier version filtered `Object.values(progress.phases)`,
 * which meant a single PASSED phase satisfied the whole year.
 */
export function isYearCompleteByPhases(progress: ProgressState, phaseIds: string[]): boolean {
  if (phaseIds.length === 0) return false;
  return phaseIds.every((id) => isPhaseComplete(progress, id));
}

export function getPhaseStatus(progress: ProgressState, phaseId: string): PhaseStatus {
  return progress.phases[phaseId]?.status ?? "NOT STARTED";
}

export function getTicketProgress(progress: ProgressState, ticketId: string): TicketProgress {
  return (
    progress.tickets[ticketId] ?? {
      ticketId,
      status: "NEW",
      hintsRevealed: 0,
      rootCauseRevealed: false,
    }
  );
}

export function getYearProgressPercent(progress: ProgressState, phaseIds: string[]): number {
  if (phaseIds.length === 0) return 0;
  const completed = phaseIds.filter((id) => isPhaseComplete(progress, id)).length;
  return Math.round((completed / phaseIds.length) * 100);
}

export function getOverallProgressPercent(progress: ProgressState, allPhaseIds: string[]): number {
  return getYearProgressPercent(progress, allPhaseIds);
}

/**
 * Sequential gate: a phase opens when every earlier phase in the same year is
 * complete, and the year itself is open.
 *
 * `phaseIds` must be in curriculum order.
 */
export function isPhaseUnlocked(
  progress: ProgressState,
  phaseIds: string[],
  phaseId: string,
  yearUnlocked: boolean,
): boolean {
  if (!yearUnlocked) return false;
  const index = phaseIds.indexOf(phaseId);
  if (index <= 0) return true;
  return phaseIds.slice(0, index).every((id) => isPhaseComplete(progress, id));
}

/** The first phase in the year that is not yet complete — where to resume. */
export function getNextIncompletePhase(progress: ProgressState, phaseIds: string[]): string | null {
  return phaseIds.find((id) => !isPhaseComplete(progress, id)) ?? null;
}

export interface TicketStats {
  total: number;
  resolved: number;
  unaided: number;
  hintsUsed: number;
  rootCausesRevealed: number;
}

/**
 * "Unaided" means resolved without opening a hint or the root cause. This is
 * the number worth putting in front of an employer, so it is worth computing
 * separately from the raw resolved count.
 */
export function getTicketStats(progress: ProgressState, ticketIds: string[]): TicketStats {
  const entries = ticketIds.map((id) => getTicketProgress(progress, id));
  const resolved = entries.filter((t) => t.status === "RESOLVED");
  return {
    total: ticketIds.length,
    resolved: resolved.length,
    unaided: resolved.filter((t) => t.hintsRevealed === 0 && !t.rootCauseRevealed).length,
    hintsUsed: entries.reduce((sum, t) => sum + t.hintsRevealed, 0),
    rootCausesRevealed: entries.filter((t) => t.rootCauseRevealed).length,
  };
}

export interface ProgressExport {
  kind: "iam-career-lab-progress";
  version: number;
  exportedAt: string;
  progress: ProgressState;
}

export function exportProgress(progress: ProgressState): ProgressExport {
  return {
    kind: "iam-career-lab-progress",
    version: PROGRESS_VERSION,
    exportedAt: new Date().toISOString(),
    progress,
  };
}

/**
 * Parses an exported file back into state.
 *
 * Returns a discriminated result rather than throwing or returning null,
 * because the import UI needs to tell the learner WHY a file was rejected —
 * "this is a JSON file but not a progress export" is very different advice
 * from "this file is corrupt".
 */
export function parseProgressImport(text: string): { ok: true; progress: ProgressState } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "That file is not valid JSON." };
  }
  if (!parsed || typeof parsed !== "object") {
    return { ok: false, error: "That file does not contain a progress object." };
  }
  const obj = parsed as Partial<ProgressExport>;
  if (obj.kind !== "iam-career-lab-progress") {
    return { ok: false, error: "That JSON file is not an IAM Career Lab progress export." };
  }
  if (!obj.progress) {
    return { ok: false, error: "The export is missing its progress data." };
  }
  return { ok: true, progress: migrateProgress(obj.progress) };
}
