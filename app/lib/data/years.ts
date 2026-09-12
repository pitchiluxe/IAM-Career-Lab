import type { Year, Gate } from "./types";
import { year1Phases } from "./year1";
import { year2Phases } from "./year2";
import { year3Phases } from "./year3";
import { year4Phases } from "./year4";

export const years: Year[] = [
  {
    id: "year-1",
    number: 1,
    title: "Help Desk / IT Support",
    roleTarget: "Help Desk / IT Support",
    mainOutcome: "Become reliable at Windows, networking, AD and security troubleshooting",
    description:
      "Teach Windows fundamentals, hardware/software troubleshooting, networking, DNS, DHCP, TCP/IP, common ports, ticketing, SLA/priority, customer communication, Active Directory, users, groups, OUs, password resets, account lockouts, GPO, file/share permissions, PowerShell, security fundamentals, escalation, and joiner/mover/leaver concepts.",
    phases: year1Phases,
    gate: {
      title: "Gate 1 — Help Desk Ready",
      competencies: [
        "Windows administration",
        "Basic networking",
        "Ticket handling",
        "AD users/groups/OUs",
        "Password/account troubleshooting",
        "DNS/DHCP concepts",
        "GPO",
        "PowerShell basics",
        "Security fundamentals",
        "Documentation",
      ],
    },
  },
  {
    id: "year-2",
    number: 2,
    title: "IAM Analyst",
    roleTarget: "IAM Analyst",
    mainOutcome: "Operate identity lifecycle, SSO, MFA, RBAC and access workflows",
    description:
      "Teach identity concepts, authentication, authorization, accounting, RBAC, ABAC, least privilege, identity lifecycle, joiner/mover/leaver, provisioning, deprovisioning, SSO, SAML, OAuth 2.0, OIDC, MFA, conditional access concepts, access requests, access reviews, IAM ticket queues, audit evidence, Okta concepts, Microsoft Entra ID concepts, and basic IAM automation.",
    phases: year2Phases,
    gate: {
      title: "Gate 2 — IAM Analyst Ready",
      competencies: [
        "Authentication vs authorization",
        "Identity lifecycle",
        "Joiner/mover/leaver workflows",
        "SSO",
        "MFA",
        "RBAC",
        "Federation concepts",
        "Entra/Okta-style administration",
        "Access reviews",
        "IAM ticket investigation",
      ],
    },
  },
  {
    id: "year-3",
    number: 3,
    title: "IAM Engineer",
    roleTarget: "IAM Engineer",
    mainOutcome: "Build automation, integrations, APIs, IGA/PAM workflows",
    description:
      "Teach Git, engineering documentation, REST APIs, JSON, authentication, pagination, error handling, IAM automation, idempotency, provisioning automation, IGA, entitlement management, approvals, access certifications, separation of duties, PAM, privileged accounts, vault concepts, credential rotation, JIT/JEA concepts, directory integration, LDAP concepts, logging, monitoring, identity incident response, and infrastructure-as-code concepts.",
    phases: year3Phases,
    gate: {
      title: "Gate 3 — IAM Engineer Ready",
      competencies: [
        "Automation",
        "PowerShell/Python",
        "REST APIs",
        "Service accounts",
        "Secrets handling",
        "IGA concepts",
        "PAM concepts",
        "Access certification",
        "IAM incident response",
        "Engineering documentation",
      ],
    },
  },
  {
    id: "year-4",
    number: 4,
    title: "IAM Architect / Leadership",
    roleTarget: "IAM Architect / Leadership",
    mainOutcome: "Design enterprise IAM, Zero Trust, governance and executive strategy",
    description:
      "Teach enterprise IAM architecture, reference architectures, requirements gathering, architecture tradeoffs, Zero Trust, identity-centric security, IGA/PAM architecture, security architecture, threat modeling, governance, risk, compliance, audit, control mapping, vendor strategy, migration planning, transformation roadmaps, executive communication, leadership, and CISSP-level security concepts.",
    phases: year4Phases,
    gate: {
      title: "Gate 4 — IAM Architect Ready",
      competencies: [
        "Enterprise IAM architecture",
        "Zero Trust",
        "Governance",
        "Risk",
        "Policy",
        "Privileged access architecture",
        "IGA/PAM strategy",
        "Disaster recovery",
        "Executive communication",
        "Architecture defense",
      ],
    },
  },
];

export const gates: Gate[] = years.map((y, i) => ({
  id: `gate-${i + 1}`,
  number: i + 1,
  title: y.gate.title,
  yearId: y.id,
  competencies: y.gate.competencies,
}));

export function getYear(id: string): Year | undefined {
  return years.find((y) => y.id === id);
}

export function getPhase(yearId: string, phaseId: string) {
  const year = getYear(yearId);
  return year?.phases.find((p) => p.id === phaseId);
}
