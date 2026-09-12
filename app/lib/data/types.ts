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
