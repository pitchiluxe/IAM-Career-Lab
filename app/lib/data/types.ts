export type PhaseStatus = "NOT STARTED" | "IN PROGRESS" | "BLOCKED" | "PASSED" | "PORTFOLIO READY";

export interface Phase {
  id: string;
  number: number;
  title: string;
  goal: string;
  topics: string[];
  objectives: string[];
  studentOutcome: string[];
  evidence: string[];
  acceptance: string[];
  portfolioArtifact: string;
}

export interface Year {
  id: string;
  number: number;
  title: string;
  roleTarget: string;
  mainOutcome: string;
  description: string;
  phases: Phase[];
  gate: {
    title: string;
    competencies: string[];
  };
}

export interface Ticket {
  id: string;
  yearId: string;
  phaseId?: string;
  title: string;
  scenario: string;
  businessImpact: string;
  symptoms: string[];
  priority: "Low" | "Medium" | "High" | "Critical";
  affectedAsset: string;
  evidenceAvailable: string[];
  hiddenRootCause: string;
  hints: string[];
  acceptanceCriteria: string[];
  escalationThreshold: string;
  remediation: string;
  portfolioArtifact: string;
}

export interface Gate {
  id: string;
  number: number;
  title: string;
  yearId: string;
  competencies: string[];
}

export interface OUStructure {
  name: string;
  children?: OUStructure[];
}

export interface BaselineIdentity {
  name: string;
  department: string;
  role: string;
  ou: string;
}

export interface BaselineGroup {
  name: string;
  description: string;
}

export interface GPOConcept {
  name: string;
  description: string;
}

export interface NetworkPlan {
  subnet: string;
  assignments: { host: string; ip: string; role: string }[];
  clients: string;
}

export interface ArchitectureData {
  company: string;
  domain: string;
  netbios: string;
  ouStructure: OUStructure[];
  baselineIdentities: BaselineIdentity[];
  baselineGroups: BaselineGroup[];
  gpoConcepts: GPOConcept[];
  networkPlan: NetworkPlan;
}

// ===== Study aids =====

export type DrillCategory =
  | "Windows"
  | "Networking"
  | "Active Directory"
  | "PowerShell"
  | "Security"
  | "Identity"
  | "Protocols"
  | "Governance"
  | "Architecture";

export interface DrillCard {
  id: string;
  yearId: string;
  category: DrillCategory;
  /** The recall prompt. Phrased as a question a colleague would actually ask. */
  prompt: string;
  /** The answer, kept short enough to self-grade honestly. */
  answer: string;
  /** Why this matters on the job. Recall without context does not transfer. */
  whyItMatters: string;
}

export interface ReferenceEntry {
  /** Command, port, event id, or term. */
  item: string;
  meaning: string;
  /** Optional worked example or gotcha. */
  note?: string;
}

export interface ReferenceSection {
  id: string;
  title: string;
  yearId: string;
  intro: string;
  entries: ReferenceEntry[];
}

export interface InterviewQuestion {
  id: string;
  yearId: string;
  /** What a hiring manager is really testing with this question. */
  tests: string;
  question: string;
  /** Concrete points a strong answer hits. */
  strongAnswer: string[];
  /** The answer that gets candidates rejected. */
  weakAnswer: string;
  /** Which lab or ticket in this platform gives the candidate a real story. */
  drawOnLab?: string;
}

export interface Certification {
  id: string;
  name: string;
  vendor: string;
  yearId: string;
  /** Honest positioning: what this cert does and does not do for a career. */
  worthIt: string;
  mapsToPhases: string[];
}
