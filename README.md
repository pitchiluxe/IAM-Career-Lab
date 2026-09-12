# IAM Career Lab

**A four-year progressive, hands-on Identity & Access Management training platform.**

> Build your IAM career, one lab at a time — from IT Help Desk to IAM Architect.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Platform: Windows](https://img.shields.io/badge/Platform-Windows-blue)](https://github.com/pitchiluxe/IAM-Career-Lab/releases)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![Electron](https://img.shields.io/badge/Electron-33-blue)](https://www.electronjs.org)

---

## What is the IAM Career Lab?

The IAM Career Lab is a professional, hands-on training platform that takes you through a complete four-year IAM career progression. It is not a simulation — it coordinates **real Hyper-V VMs**, **real Active Directory**, **real tickets**, and a **real AI instructor** (Ollama) to build genuine, demonstrable skills.

### The Four-Year Path

| Year | Role | Skills |
|------|------|--------|
| **Year 1** | Help Desk / IT Support | Windows, Networking, AD, GPO, DNS, PowerShell, Ticketing |
| **Year 2** | IAM Analyst | SSO, MFA, RBAC, Lifecycle, Access Reviews, Federation |
| **Year 3** | IAM Engineer | Automation, REST APIs, IGA, PAM, Incident Response |
| **Year 4** | IAM Architect | Zero Trust, Governance, Risk, Architecture, Leadership |

Each year has **11 progressive lab phases** (44 total), unlocked sequentially by career gates that require demonstrated competency.

---

## Key Features

- **44 Progressive Lab Phases** — Four years × 11 phases, each with scenarios, objectives, hidden root causes, hints, evidence requirements, and portfolio artifacts
- **27 Realistic Tickets** — Password resets, account lockouts, DNS failures, GPO issues, suspicious logins, IAM investigations, contractor deprovisioning, orphaned accounts, and more
- **Ollama AI Tutor** — Local AI instructor with progressive hints, Socratic questioning, and a scoring rubric (25% process, 30% technical, 15% security, 15% documentation, 15% communication)
- **Real VM Infrastructure** — PowerShell scripts for Hyper-V: DC01 domain controller, HD01 Windows client, FS01 file server on an isolated 10.10.10.0/24 network
- **Portfolio Generation** — GitHub-ready markdown artifacts: READMEs, architecture docs, troubleshooting reports, root-cause analysis, lessons learned
- **Progress Tracking** — Per-phase status, scores, evidence, and career gate logic with localStorage persistence
- **Desktop App** — Native Windows application with auto-updates from GitHub Releases

---

## Download

### Desktop App (Recommended)

Download the latest Windows installer from [GitHub Releases](https://github.com/pitchiluxe/IAM-Career-Lab/releases/latest).

- Windows 10/11 (64-bit)
- Auto-updates from GitHub Releases
- Opens directly to the dashboard
- No browser needed

### Web Version

The web version is hosted on Vercel: [iam-career-lab.vercel.app](https://iam-career-lab.vercel.app)

---

## Quick Start (Development)

```bash
# Clone the repo
git clone https://github.com/pitchiluxe/IAM-Career-Lab.git
cd IAM-Career-LAB/app

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page or [http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the dashboard.

### Electron Development

```bash
# Run Next.js + Electron together
npm run electron:dev
```

### Build the Installer

```bash
# Build Next.js + Electron Windows installer
npm run electron:build
```

The installer will be in `release/`.

---

## Ollama AI Tutor Setup

The tutor requires [Ollama](https://ollama.com) running locally:

```bash
# Install Ollama from https://ollama.com
ollama serve          # Start the server
ollama pull llama3.1  # Download a model
```

The app connects to `http://localhost:11434` by default. When Ollama is offline, the tutor shows "Offline" with install instructions — it never fakes AI responses.

---

## VM Infrastructure

PowerShell scripts for building real Hyper-V VMs are in `09-SCRIPTS/vm/`:

| Script | Purpose |
|--------|---------|
| `00-Host-Preflight.ps1` | Host discovery + preflight report |
| `01-New-LabSwitch.ps1` | Create isolated Hyper-V private switch |
| `02-New-DC01.ps1` | Create DC01 VM, install Windows Server, promote to DC |
| `03-Build-ADStructure.ps1` | Create OUs, users, groups, GPOs for lab.local |
| `04-New-HD01.ps1` | Create HD01 Windows 11 client, domain join |
| `05-New-FS01.ps1` | Optional file server (FS01) |
| `06-Manage-Checkpoints.ps1` | Checkpoint management |
| `07-Validate-Lab.ps1` | Full validation suite |

### Host Requirements for Real VMs

- Windows 10/11 Pro, Enterprise, or Education (Hyper-V support)
- CPU virtualization enabled in BIOS/UEFI
- At least 60 GB free disk space
- At least 8 GB free RAM
- Legitimate Windows Server and Windows 11 installation media (ISO)

---

## Lab Configuration

| Setting | Value |
|---------|-------|
| Company | IAM Career Lab |
| Domain | lab.local |
| NetBIOS | LAB |
| Network | 10.10.10.0/24 (isolated) |
| DC01 | 10.10.10.10 |
| HD01 | 10.10.10.100 |
| FS01 | 10.10.10.20 |

---

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Desktop**: Electron 33, electron-builder, electron-updater
- **AI Tutor**: Ollama (local LLM)
- **VM Infrastructure**: PowerShell, Hyper-V, Windows Server, Active Directory
- **Hosting**: Vercel (web), GitHub Releases (desktop)

---

## Project Structure

```
IAM-CAREER-LAB/
├── app/                    # Next.js application
│   ├── app/                # App Router pages + API routes
│   ├── components/         # Shared React components
│   ├── lib/                # Business logic + data layer
│   └── public/             # Static assets (icon, manifest, images)
├── electron/               # Electron desktop app
│   ├── main.js             # Main process (starts Next.js, creates window)
│   ├── preload.js          # Preload script
│   └── build/              # Build resources (icon)
├── 00-MASTER-CONTROL/      # Master build docs
├── 01-LAB-ARCHITECTURE/    # Architecture docs
├── 02-OLLAMA-INSTRUCTOR/   # AI tutor docs
├── 03-PROGRESS-TRACKING/   # Progress tracker docs
├── 04-YEAR-1-HELP-DESK/    # Year 1 phases + tickets
├── 05-YEAR-2-IAM-ANALYST/  # Year 2 phases + tickets
├── 06-YEAR-3-IAM-ENGINEER/ # Year 3 phases
├── 07-YEAR-4-IAM-ARCHITECT/ # Year 4 phases
├── 08-PORTFOLIO/           # Portfolio guide
├── 09-SCRIPTS/             # PowerShell VM scripts + icon generation
├── 10-CONFIGURATION/      # Environment templates
├── 11-CHECKPOINTS/         # Checkpoint templates
└── 12-DOCUMENTATION/       # Troubleshooting docs
```

---

## Safety & Ethics

- All exercises are isolated and defensive
- Uses synthetic company and employee data only
- Never stores secrets, passwords, or tokens in source control
- Never pirates or bypasses Microsoft licensing
- Never tests against unauthorized third-party systems
- Never claims commercial products (Okta, SailPoint, CyberArk) are installed unless legitimately available
- Portfolio artifacts are labeled as hands-on lab projects, not production experience

---

## License

MIT License — see [LICENSE](LICENSE).

---

## Creator

**Erick OMARI** — IAM Lab Architect

Created to provide a realistic, hands-on training platform for anyone pursuing a career in Identity and Access Management.

---

*Built with Next.js, Electron, Tailwind CSS, Ollama, and PowerShell.*
