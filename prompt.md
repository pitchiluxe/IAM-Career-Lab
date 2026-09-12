# MASTER PROMPT — BUILD OMARI TECHNOLOGIES IAM CAREER LAB

You are building the complete **OMARI Technologies IAM Career Lab**.

Your job is to create the entire four-year hands-on learning platform now so the learner does not have to rebuild the environment every year.

The learner will START at Year 1 and progress sequentially.

## PRIMARY OBJECTIVE

Build an interactive, realistic enterprise IT/IAM training environment on the learner's Windows 11 computer.

The platform must progress:

**Year 1 → Help Desk / IT Support**

→ **Year 2 → IAM Analyst**

→ **Year 3 → IAM Engineer**

→ **Year 4 → IAM Architect / Leadership**

Use the attached `CLAUDE.md` as the governing engineering contract.

## IMPORTANT: VM REQUIREMENT

The learner wants a REAL interactive VM experience.

Do NOT create a browser page that merely looks like Windows.

When legal installation media and host resources permit, build actual Hyper-V virtual machines.

The learner must be able to log into a normal Windows graphical desktop and use:

- Start menu
- taskbar
- Settings
- File Explorer
- Command Prompt
- PowerShell
- normal Windows applications
- domain login
- administrative tools

Create:

### DC01
Windows Server with:
- AD DS
- DNS
- domain controller
- OUs
- users
- groups
- GPO

### HD01
Windows client:
- normal Windows desktop
- domain joined
- student workstation
- help desk troubleshooting target

Add FS01 and MGMT01 only when required.

If the required Windows media/license is unavailable, STOP short of piracy and explain exactly what is required. Do not fake the VM.

## HOST DISCOVERY FIRST

Before changing anything:

1. Detect Windows edition/version.
2. Detect CPU and RAM.
3. Detect available disk space.
4. Detect Hyper-V.
5. Detect virtualization support.
6. Detect existing virtual switches.
7. Detect existing VMs.
8. Determine safe VM resource allocations.
9. Check whether Windows installation media is available.
10. Produce a preflight report.

Do not consume excessive host resources.

## NETWORK

Create an isolated lab network.

Preferred training subnet:

`10.10.10.0/24`

Use:

- DC01: `10.10.10.10`
- FS01: `10.10.10.20`
- MGMT01: `10.10.10.30`
- clients: DHCP/reserved range `10.10.10.100-199`

Detect conflicts before applying addresses.

## DOMAIN

Create the fictional organization:

**OMARI Technologies**

Training domain:

`omari.local`

Create:

- Users OU
- Groups OU
- Workstations OU
- Servers OU
- HelpDesk OU
- IAM OU
- Privileged OU
- Disabled OU
- ServiceAccounts OU

Populate with fictional employees and synthetic data.

## YEAR 1

Build 11 progressive phases:

1. IT Support Foundations
2. Networking Fundamentals
3. Windows Troubleshooting
4. Active Directory Core
5. Group Policy
6. File and Access Support
7. PowerShell for Support
8. Ticketing and Customer Service
9. Security Fundamentals
10. Escalation and IAM Bridge
11. Help Desk Capstone

Each phase must have:
- realistic scenario
- ticket
- objectives
- student task
- hidden root cause
- hints
- evidence requirements
- validation
- scoring
- remediation
- portfolio artifact

Examples of tickets:
- password reset
- account locked
- DNS failure
- network drive unavailable
- printer problem
- application failure
- GPO not applying
- permissions denied
- new employee onboarding
- terminated employee access removal
- suspicious login escalation

## YEAR 2

Build:

1. IAM Fundamentals
2. Identity Lifecycle
3. SSO/Federation
4. MFA/Conditional Access
5. Okta/Entra Concepts
6. Access Reviews
7. IAM Operations
8. Reporting/Audit
9. Identity Security
10. Analyst Automation
11. IAM Analyst Capstone

Use legitimate Okta/Entra sandboxes when available.

Otherwise build clearly labeled local/mock equivalents.

## YEAR 3

Build:

1. Engineering Practices
2. REST/API Fundamentals
3. IAM Automation
4. IGA Engineering
5. PAM Fundamentals
6. Directory Integration
7. IAM Monitoring
8. Identity Incident Response
9. Infrastructure-as-Code Concepts
10. IAM Engineering Project
11. IAM Engineer Capstone

Include real coding projects, APIs, JSON, PowerShell/Python where appropriate, testing, logging, rollback, and documentation.

SailPoint/CyberArk must use legitimate environments or honest mock equivalents.

## YEAR 4

Build:

1. IAM Architecture
2. Zero Trust
3. IGA/PAM Architecture
4. Security Architecture
5. Governance and Risk
6. Compliance and Audit
7. Cost/Vendor Strategy
8. Migration/Transformation
9. Leadership
10. CISSP-Level Concepts
11. Enterprise IAM Capstone

The final capstone should require the learner to defend architecture decisions to a fictional executive/security review board.

## OLLAMA TUTOR

Connect the platform to local Ollama.

Preferred local endpoint:

`http://localhost:11434`

Do not hard-code API keys.

The tutor must act as an instructor.

Rules:

- Do not immediately reveal solutions.
- Ask what the learner checked.
- Give progressive hints.
- Require evidence.
- Challenge incorrect assumptions.
- Explain the root cause after the learner has attempted the investigation.
- Score the work.
- Track progress.
- Recommend remediation.
- Connect the task to real job responsibilities.

## CAREER GATES

### Gate 1
Help Desk Ready.

### Gate 2
IAM Analyst Ready.

### Gate 3
IAM Engineer Ready.

### Gate 4
IAM Architect Ready.

A learner cannot pass a gate merely by reading files.

Require demonstrated hands-on competency.

## PORTFOLIO

Generate employer-ready artifacts throughout the course.

For every significant project:

- README
- architecture
- implementation notes
- screenshots
- troubleshooting
- root cause
- remediation
- verification
- lessons learned
- skills demonstrated

Create GitHub-safe output.

Never store secrets.

## UI

If you build a management application around the VMs, make it professional and practical.

It should show:

- current year
- current phase
- lab status
- VM status
- tickets
- objectives
- evidence
- score
- progress
- career gate
- Ollama tutor
- portfolio artifacts

Do not make the management UI a substitute for the actual VM.

## VALIDATION

Before declaring success, test:

- VM boot
- Windows login
- networking
- DNS
- domain join
- domain authentication
- AD users
- groups
- OUs
- GPO
- PowerShell
- snapshots/checkpoints
- reset process
- Ollama connection
- progress tracking

Produce a build report containing:

- what was successfully built
- what was not possible
- why
- prerequisites
- exact next steps

## DEVELOPMENT PROCESS

Follow this order:

### Phase A — Preflight
Inspect the host and report requirements.

### Phase B — Foundation
Create project directories and configuration.

### Phase C — Virtualization
Build the supported VM infrastructure.

### Phase D — Enterprise Identity
Build the OMARI Technologies AD/DNS foundation.

### Phase E — Learning Platform
Build course, labs, tickets, scoring, checkpoints, and progress tracking.

### Phase F — Ollama
Connect the local tutor.

### Phase G — Portfolio
Create GitHub-ready artifact generation.

### Phase H — Validation
Test the complete system.

### Phase I — Start Training
Unlock:

**YEAR 1 → PHASE 1 → IT SUPPORT FOUNDATIONS**

Do not skip directly to Year 2.

## FINAL RULE

Build the platform first.

Teach the learner second.

Never claim something was built when it was not.

Never substitute a fake simulation for a real VM when a real VM is technically and legally possible.

When a real commercial service is unavailable, provide a clearly labeled local/mock training equivalent and explain the difference.

Begin now with host preflight and the platform build.
