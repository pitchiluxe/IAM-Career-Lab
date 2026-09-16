"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

/**
 * App chrome.
 *
 * The sidebar is a permanent column from `lg` up and a slide-over drawer
 * below it. Previously it was a fixed 64-unit column at every width inside an
 * `h-screen overflow-hidden` wrapper, which on a phone left roughly a third of
 * the viewport for content and no way to dismiss it.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the drawer on navigation, otherwise it stays over the page the
  // learner just asked for.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Escape closes it, which is the expected behaviour for any overlay.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  if (pathname === "/") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Permanent column on large screens */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Drawer below lg */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation"
          />
          <div className="absolute inset-y-0 left-0 z-50">
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center gap-3 border-b border-[#1f2d4d] bg-[#0d1626] px-4 py-3 lg:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            className="rounded-lg border border-[#2a3a5e] p-2 text-[#cfd9ec]"
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-bold text-white">IAM Career Lab</span>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
