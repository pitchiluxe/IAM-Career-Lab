"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { years } from "@/lib/data/years";
import { architecture } from "@/lib/data/architecture";
import { useProgress } from "./ProgressProvider";
import { isYearCompleteByPhases } from "@/lib/progress";

const navGroups: { heading: string; items: { href: string; label: string; icon: string }[] }[] = [
  {
    heading: "Platform",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
      { href: "/tickets", label: "Tickets", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
      { href: "/tutor", label: "Ollama Tutor", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 3v-3z" },
      { href: "/vm-status", label: "VM Status", icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8M9 12h6" },
    ],
  },
  {
    heading: "Study",
    items: [
      { href: "/drills", label: "Recall Drills", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
      { href: "/reference", label: "Reference", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
      { href: "/interview", label: "Interview Prep", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    ],
  },
  {
    heading: "Records",
    items: [
      { href: "/portfolio", label: "Portfolio", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
      { href: "/progress", label: "Progress", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
      { href: "/settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" },
    ],
  },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { progress } = useProgress();

  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col border-r border-[#1f2d4d] bg-[#0d1626]">
      <div className="flex items-center gap-3 border-b border-[#1f2d4d] px-5 py-4">
        {/* The icon already carries its own blue background and rounding, so it is
            rendered directly rather than inside a coloured tile. alt is empty
            because the visible product name sits right beside it.
            unoptimized: the Electron build runs the standalone server without
            sharp, where on-demand optimisation fails - and a 256px icon gains
            nothing from it anyway. */}
        <Image src="/icon.png" alt="" unoptimized width={40} height={40} className="h-10 w-10 rounded-lg" priority />
        <div>
          <div className="text-sm font-bold text-white">IAM Career Lab</div>
          <div className="text-xs text-[#93a4c0]">Identity &amp; Access Training</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.heading} className="mb-4">
            <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[#5a6b88]">
              {group.heading}
            </div>
            {group.items.map((item) => {
              const isActive =
                item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`nav-link ${isActive ? "nav-link-active" : ""}`}
                >
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}

        <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[#5a6b88]">Career Years</div>
        {years.map((year, i) => {
          const isActive = pathname === `/year/${year.id}`;
          const yearPhaseIds = year.phases.map((p) => p.id);
          const completedCount = yearPhaseIds.filter((id) => {
            const p = progress.phases[id];
            return p && (p.status === "PASSED" || p.status === "PORTFOLIO READY");
          }).length;
          const pct = Math.round((completedCount / yearPhaseIds.length) * 100);
          const prev = i > 0 ? years[i - 1] : null;
          const unlocked = i === 0 || (prev ? isYearCompleteByPhases(progress, prev.phases.map((p) => p.id)) : false);

          return (
            <Link
              key={year.id}
              href={`/year/${year.id}`}
              onClick={onNavigate}
              className={`nav-link ${isActive ? "nav-link-active" : ""}`}
            >
              <span
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-xs font-bold ${
                  unlocked ? "bg-omari-600/20 text-omari-300" : "bg-[#1f2d4d] text-[#5a6b88]"
                }`}
              >
                {year.number}
              </span>
              <span className={`flex-1 truncate ${unlocked ? "" : "text-[#5a6b88]"}`}>{year.title}</span>
              <span className="text-xs text-[#5a6b88]">{unlocked ? `${pct}%` : "Locked"}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#1f2d4d] px-5 py-3">
        <Link href="/" onClick={onNavigate} className="mb-2 flex items-center gap-2 text-xs text-[#93a4c0] transition hover:text-white">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Back to landing page
        </Link>
        <div className="text-xs text-[#5a6b88]">
          Domain: <span className="text-[#93a4c0]">{architecture.domain}</span>
        </div>
        <div className="text-xs text-[#5a6b88]">
          Network: <span className="text-[#93a4c0]">{architecture.networkPlan.subnet}</span>
        </div>
      </div>
    </aside>
  );
}
