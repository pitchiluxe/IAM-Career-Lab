# IAM Career Lab — IAM Career Lab Management Platform

A Next.js + TypeScript + Tailwind CSS web application that manages the four-year IAM Career Lab.

## Quick Start

```bash
cd app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What This App Does

The management platform is the professional UI that surrounds the real VMs. It provides:

- **Dashboard** — current year, current phase, lab status, VM status, progress, career gates
- **Career Years** — 4 years with 11 phases each (44 total), locked by progression gates
- **Tickets** — 27 realistic tickets (15 Year 1 help desk + 12 Year 2 IAM) with hidden root causes, progressive hints, and portfolio generation
- **Ollama Tutor** — real API integration with the instructor system prompt (progressive hints, Socratic method, scoring rubric)
- **VM Status** — host preflight report, VM inventory, and upgrade requirements
- **Portfolio** — GitHub-ready artifact generation (README, architecture, troubleshooting, RCA, remediation, lessons learned)
- **Progress Tracker** — per-phase status tracking with career gate logic
- **Settings** — Ollama configuration and lab settings

## VM Provisioning Scripts

PowerShell scripts for building real Hyper-V VMs are in `../09-SCRIPTS/vm/`:

| Script | Purpose |
|--------|---------|
| `00-Host-Preflight.ps1` | Full host discovery + preflight report |
| `01-New-LabSwitch.ps1` | Create isolated Hyper-V private switch (10.10.10.0/24) |
| `02-New-DC01.ps1` | Create DC01 VM, install Windows Server, promote to DC |
| `03-Build-ADStructure.ps1` | Create OUs, users, groups, GPOs for lab.local |
| `04-New-HD01.ps1` | Create HD01 Windows 11 client, domain join |
| `05-New-FS01.ps1` | Optional file server (FS01) |
| `06-Manage-Checkpoints.ps1` | Checkpoint management |
| `07-Validate-Lab.ps1` | Full validation suite |

## Ollama Setup

The tutor requires Ollama running locally:

```bash
# Install from https://ollama.com
ollama serve          # Start the server
ollama pull llama3.1  # Download a model
```

The app connects to `http://localhost:11434` by default. Configure via `.env` or Settings page.

## Host Requirements for Real VMs

This host (Windows 11 Home, virtualization disabled, ~27GB free disk) cannot run Hyper-V VMs. To build real VMs:

1. Upgrade to Windows 11 Pro/Enterprise/Education
2. Enable CPU virtualization in BIOS/UEFI
3. Free up disk space to at least 60GB
4. Obtain legitimate Windows Server and Windows 11 installation media (ISO)

The app honestly reports VM status as "Requires Host Upgrade" rather than faking a VM.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React 18

## Project Structure

```
app/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes (Ollama, preflight, portfolio)
│   ├── year/[id]/          # Year overview + phase detail pages
│   ├── tickets/            # Ticket queue
│   ├── tutor/              # Ollama tutor
│   ├── vm-status/          # Preflight + VM status
│   ├── portfolio/          # Portfolio generation
│   ├── progress/           # Progress tracker
│   └── settings/           # Settings
├── components/             # Shared components (Sidebar, TutorChat, ProgressProvider)
├── lib/                    # Business logic (ollama, progress, preflight, portfolio)
│   └── data/               # Course content data (years, phases, tickets, gates, architecture)
└── package.json
```
