"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const features = [
  {
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "44 Progressive Phases",
    desc: "Four years of hands-on labs: Help Desk, IAM Analyst, IAM Engineer, and IAM Architect — each with 11 phases.",
  },
  {
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    title: "27 Realistic Tickets",
    desc: "Password resets, account lockouts, DNS failures, GPO issues, suspicious logins, and IAM investigations with hidden root causes.",
  },
  {
    icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 3v-3z",
    title: "Ollama AI Tutor",
    desc: "Local AI instructor with progressive hints, Socratic questioning, and scoring rubric. Coaches you — never just gives the answer.",
  },
  {
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    title: "Progress Tracking",
    desc: "Career gates unlock sequentially. Track your status, scores, and evidence across all four years with persistent progress.",
  },
  {
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    title: "Portfolio Generation",
    desc: "Generate employer-ready GitHub artifacts: READMEs, architecture docs, troubleshooting reports, and root-cause analysis.",
  },
  {
    icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8M9 12h6",
    title: "Real VM Infrastructure",
    desc: "Ready-to-run PowerShell scripts for Hyper-V VMs: DC01 domain controller, HD01 client, and FS01 file server on an isolated network.",
  },
];

const yearPath = [
  { year: "Year 1", role: "Help Desk / IT Support", color: "from-blue-500 to-cyan-500", skills: ["Windows", "Networking", "AD", "GPO", "PowerShell"] },
  { year: "Year 2", role: "IAM Analyst", color: "from-cyan-500 to-teal-500", skills: ["SSO", "MFA", "RBAC", "Lifecycle", "Access Reviews"] },
  { year: "Year 3", role: "IAM Engineer", color: "from-teal-500 to-green-500", skills: ["Automation", "REST APIs", "IGA", "PAM", "Incident Response"] },
  { year: "Year 4", role: "IAM Architect", color: "from-green-500 to-emerald-500", skills: ["Zero Trust", "Governance", "Risk", "Architecture", "Leadership"] },
];

export default function LandingPage() {
  const [typed, setTyped] = useState("");
  const fullText = "Build your IAM career, one lab at a time.";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setTyped(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 45);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0b1120]">
      {/* ===== NAV BAR ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1f2d4d]/50 bg-[#0b1120]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-omari-600 font-bold text-white">IL</div>
            <span className="text-sm font-bold text-white">IAM Career Lab</span>
          </div>
          <div className="hidden items-center gap-6 text-sm text-[#93a4c0] md:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#path" className="transition hover:text-white">Career Path</a>
            <a href="#contact" className="transition hover:text-white">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/pitchiluxe/IAM-Career-Lab/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-xs"
              title="Download for Windows from GitHub"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Download
            </a>
            <Link href="/dashboard" className="btn-primary text-xs pulse-glow">
              Launch Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
        {/* Grid background */}
        <div className="absolute inset-0 grid-bg opacity-60"></div>
        {/* Glow orbs */}
        <div className="orb bg-omari-600" style={{ width: 400, height: 400, top: "10%", left: "5%" }}></div>
        <div className="orb bg-cyan-500" style={{ width: 350, height: 350, top: "50%", right: "10%", animationDelay: "4s" }}></div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          {/* Terminal badge */}
          <div className="fade-in mb-8 inline-flex items-center gap-2 rounded-full border border-[#1f2d4d] bg-[#111a2e] px-4 py-2 text-xs text-[#93a4c0]" style={{ animationDelay: "0.2s" }}>
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            Hands-on Identity & Access Management Training
          </div>

          {/* Main heading */}
          <h1 className="fade-up text-5xl font-bold leading-tight text-white md:text-7xl" style={{ animationDelay: "0.4s" }}>
            <span className="gradient-text">IAM Career Lab</span>
          </h1>

          {/* Typed subtitle */}
          <p className="fade-up mt-6 min-h-[2em] text-xl text-[#93a4c0] md:text-2xl" style={{ animationDelay: "0.6s" }}>
            {typed}
            <span className="terminal-cursor"></span>
          </p>

          <p className="fade-up mx-auto mt-6 max-w-2xl text-base text-[#5a6b88]" style={{ animationDelay: "0.8s" }}>
            A four-year progressive, hands-on enterprise training platform taking you from
            IT Help Desk to IAM Architect — with real labs, realistic tickets, and an AI instructor.
          </p>

          {/* CTA buttons */}
          <div className="fade-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row" style={{ animationDelay: "1s" }}>
            <Link href="/dashboard" className="btn-primary pulse-glow px-8 py-3 text-base">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go to Dashboard
            </Link>
            <a href="#features" className="btn-ghost px-8 py-3 text-base">
              Explore Features
            </a>
          </div>

          {/* Stats */}
          <div className="fade-up mt-16 grid grid-cols-3 gap-8" style={{ animationDelay: "1.2s" }}>
            <div>
              <div className="text-3xl font-bold text-white">4</div>
              <div className="text-xs text-[#5a6b88]">Career Years</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">44</div>
              <div className="text-xs text-[#5a6b88]">Lab Phases</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">27</div>
              <div className="text-xs text-[#5a6b88]">Tickets</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#5a6b88]">
          <svg className="h-6 w-6 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Everything You Need to Master IAM</h2>
          <p className="mt-4 text-[#93a4c0]">A complete enterprise training environment built for hands-on learning.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={i}
              className="card-hover panel group relative overflow-hidden p-6"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="scan-line"></div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-omari-600/15 text-omari-300 transition group-hover:bg-omari-600 group-hover:text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{f.title}</h3>
              <p className="text-sm text-[#93a4c0]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CAREER PATH ===== */}
      <section id="path" className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Your Four-Year Career Path</h2>
          <p className="mt-4 text-[#93a4c0]">Progress sequentially through each role. Gates unlock as you demonstrate competency.</p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-blue-500 via-teal-500 to-green-500 opacity-30"></div>

          <div className="space-y-12">
            {yearPath.map((yp, i) => (
              <div key={i} className={`flex flex-col items-center gap-6 md:flex-row ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                <div className="flex-1">
                  <div className={`card-hover panel p-6 bg-gradient-to-br ${yp.color} bg-opacity-10`}>
                    <div className="mb-2 flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b1120] text-sm font-bold text-white border-2 border-omari-500">
                        {i + 1}
                      </span>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-omari-300">{yp.year}</div>
                        <div className="text-lg font-bold text-white">{yp.role}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {yp.skills.map((s) => (
                        <span key={s} className="badge bg-[#0b1120] text-[#93a4c0]">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Center dot */}
                <div className="relative z-10 flex h-4 w-4 flex-shrink-0 items-center justify-center">
                  <span className="h-4 w-4 rounded-full bg-omari-500 ring-4 ring-[#0b1120]"></span>
                </div>
                <div className="flex-1"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/dashboard" className="btn-primary pulse-glow px-8 py-3 text-base">
            Start Year 1 — IT Support Foundations
          </Link>
        </div>
      </section>

      {/* ===== CONTACT / CREATOR ===== */}
      <section id="contact" className="relative mx-auto max-w-4xl px-6 py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Meet the Creator</h2>
          <p className="mt-4 text-[#93a4c0]">Designed and built with passion for IAM education.</p>
        </div>

        <div className="panel relative overflow-hidden p-8 md:p-12">
          <div className="orb bg-omari-600" style={{ width: 300, height: 300, top: "-50%", right: "-10%", opacity: 0.2 }}></div>

          <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row">
            {/* Profile image */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 spin-slow rounded-full border-2 border-dashed border-omari-500/30"></div>
              <div className="h-40 w-40 overflow-hidden rounded-full border-4 border-omari-500/50 shadow-lg shadow-omari-600/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/Erick.jpg" alt="Erick OMARI" className="h-full w-full object-cover" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-white">Erick OMARI</h3>
              <p className="mt-1 text-sm font-semibold text-omari-300">Creator & IAM Lab Architect</p>
              <p className="mt-4 text-[#93a4c0]">
                Erick built this four-year IAM Career Lab to provide a realistic, hands-on training platform
                for anyone pursuing a career in Identity and Access Management — from help desk fundamentals
                to enterprise architecture.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
                <span className="badge bg-omari-600/15 text-omari-300">IAM</span>
                <span className="badge bg-omari-600/15 text-omari-300">Active Directory</span>
                <span className="badge bg-omari-600/15 text-omari-300">Cybersecurity</span>
                <span className="badge bg-omari-600/15 text-omari-300">Zero Trust</span>
                <span className="badge bg-omari-600/15 text-omari-300">Automation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DOWNLOAD ===== */}
      <section id="download" className="relative mx-auto max-w-4xl px-6 py-24">
        <div className="panel relative overflow-hidden p-8 text-center md:p-12">
          <div className="orb bg-omari-600" style={{ width: 300, height: 300, top: "-30%", left: "30%", opacity: 0.2 }}></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white md:text-4xl">Download the Desktop App</h2>
            <p className="mx-auto mt-4 max-w-xl text-[#93a4c0]">
              Get the IAM Career Lab as a native Windows desktop application with auto-updates.
              The installer opens directly to the dashboard — no browser needed.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="https://github.com/pitchiluxe/IAM-Career-Lab/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary pulse-glow px-8 py-3 text-base"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Download for Windows
              </a>
              <a
                href="https://github.com/pitchiluxe/IAM-Career-Lab"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost px-8 py-3 text-base"
              >
                View on GitHub
              </a>
            </div>
            <p className="mt-4 text-xs text-[#5a6b88]">
              Windows 10/11 · Auto-updates from GitHub Releases · Open source
            </p>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[#1f2d4d] bg-[#0d1626]">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-omari-600 text-sm font-bold text-white">IL</div>
              <span className="text-sm text-[#93a4c0]">IAM Career Lab — Identity & Access Management Training</span>
            </div>
            <div className="text-xs text-[#5a6b88]">
              Created by Erick OMARI · Domain: lab.local · Network: 10.10.10.0/24
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
