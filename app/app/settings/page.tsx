"use client";

import { useState, useRef } from "react";
import { architecture } from "@/lib/data/architecture";
import { years } from "@/lib/data/years";
import { tickets } from "@/lib/data/tickets";
import { useProgress } from "@/components/ProgressProvider";
import { exportProgress, parseProgressImport } from "@/lib/progress";
import { useTutorSettings, statusUrl, DEFAULT_OLLAMA_URL, DEFAULT_OLLAMA_MODEL } from "@/lib/settings";
import { isAllowedOllamaUrl } from "@/lib/ollama";

export default function SettingsPage() {
  const { progress, replaceProgress, resetProgress } = useProgress();
  const { settings, save } = useTutorSettings();
  const [url, setUrl] = useState(settings.baseUrl);
  const [model, setModel] = useState(settings.model);
  const [status, setStatus] = useState<{ available: boolean; models: { name: string }[]; error?: string } | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Keep the inputs in sync once localStorage has been read on mount.
  const [seeded, setSeeded] = useState(false);
  if (!seeded && (settings.baseUrl !== DEFAULT_OLLAMA_URL || settings.model !== DEFAULT_OLLAMA_MODEL)) {
    setUrl(settings.baseUrl);
    setModel(settings.model);
    setSeeded(true);
  }

  const testConnection = async () => {
    setStatus(null);
    if (!isAllowedOllamaUrl(url)) {
      setStatus({ available: false, models: [], error: "The endpoint must be a localhost address." });
      return;
    }
    try {
      const res = await fetch(statusUrl(url), { cache: "no-store" });
      setStatus(await res.json());
    } catch (e) {
      setStatus({ available: false, models: [], error: e instanceof Error ? e.message : "Request failed" });
    }
  };

  const handleSave = () => {
    if (!isAllowedOllamaUrl(url)) {
      setSaveMsg("Not saved: the endpoint must be a localhost address.");
      return;
    }
    save({ baseUrl: url.trim(), model: model.trim() || DEFAULT_OLLAMA_MODEL });
    setSaveMsg("Saved. The tutor will use these immediately.");
    setTimeout(() => setSaveMsg(null), 2500);
  };

  const handleExport = () => {
    const payload = exportProgress(progress);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `iam-career-lab-progress-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleImport = async (file: File) => {
    const result = parseProgressImport(await file.text());
    if (!result.ok) {
      setImportMsg({ ok: false, text: result.error });
      return;
    }
    replaceProgress(result.progress);
    const phaseCount = Object.keys(result.progress.phases).length;
    const ticketCount = Object.keys(result.progress.tickets).length;
    setImportMsg({
      ok: true,
      text: `Imported ${phaseCount} phase record${phaseCount === 1 ? "" : "s"} and ${ticketCount} ticket record${ticketCount === 1 ? "" : "s"}.`,
    });
  };

  const totalPhases = years.reduce((n, y) => n + y.phases.length, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-[#93a4c0]">Tutor connection, progress backup, and lab configuration.</p>
      </div>

      {/* Ollama */}
      <div className="panel mb-6 p-5">
        <h2 className="mb-1 text-sm font-semibold text-white">Ollama tutor</h2>
        <p className="mb-4 text-xs text-[#5a6b88]">
          These are applied to every tutor request from this browser. Only localhost endpoints are accepted, because
          the server makes the request on your behalf and a remote address would let it be pointed at arbitrary
          internal systems.
        </p>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-[#93a4c0]" htmlFor="ollama-url">Endpoint</label>
            <input id="ollama-url" value={url} onChange={(e) => setUrl(e.target.value)} className="input" placeholder={DEFAULT_OLLAMA_URL} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#93a4c0]" htmlFor="ollama-model">Default model</label>
            <input id="ollama-model" value={model} onChange={(e) => setModel(e.target.value)} className="input" placeholder={DEFAULT_OLLAMA_MODEL} />
            <p className="mt-1 text-xs text-[#5a6b88]">
              On modest hardware try <code className="text-omari-300">llama3.2:3b</code> &mdash; noticeably faster than
              an 8B model and adequate for coaching.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={testConnection} className="btn-ghost text-sm">Test connection</button>
            <button onClick={handleSave} className="btn-primary text-sm">Save</button>
            {saveMsg && <span className="self-center text-xs text-green-400">{saveMsg}</span>}
          </div>
          {status && (
            <div className="rounded-lg border border-[#1f2d4d] bg-[#0d1626] p-3 text-sm">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${status.available ? "bg-green-500" : "bg-red-500"}`} />
                <span className={status.available ? "text-green-400" : "text-red-400"}>
                  {status.available ? "Connected" : "Not connected"}
                </span>
              </div>
              {status.available && status.models.length > 0 && (
                <div className="mt-2 text-[#cfd9ec]">
                  Installed models: {status.models.map((m) => m.name).join(", ")}
                </div>
              )}
              {status.error && <div className="mt-2 text-xs text-red-400">{status.error}</div>}
            </div>
          )}
        </div>
      </div>

      {/* Progress backup */}
      <div className="panel mb-6 p-5">
        <h2 className="mb-1 text-sm font-semibold text-white">Progress backup</h2>
        <p className="mb-4 text-xs text-[#5a6b88]">
          Progress is stored in this browser only. Clearing site data, switching browser, or using a private window
          loses it permanently. Export regularly &mdash; this is the only copy of four years of work.
        </p>
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Phases tracked", `${Object.keys(progress.phases).length}/${totalPhases}`],
            ["Tickets tracked", `${Object.keys(progress.tickets).length}/${tickets.length}`],
            ["Drill cards seen", String(Object.keys(progress.drills.streaks).length)],
            ["Last updated", new Date(progress.lastUpdated).toLocaleDateString()],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-[#1f2d4d] bg-[#0d1626] p-3">
              <div className="text-xs uppercase tracking-wider text-[#5a6b88]">{label}</div>
              <div className="mt-1 text-sm font-bold text-white">{value}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleExport} className="btn-primary text-sm">Export progress</button>
          <button onClick={() => fileRef.current?.click()} className="btn-ghost text-sm">Import progress</button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImport(file);
              e.target.value = "";
            }}
          />
        </div>
        {importMsg && (
          <p className={`mt-3 text-xs ${importMsg.ok ? "text-green-400" : "text-red-400"}`}>{importMsg.text}</p>
        )}
        <p className="mt-2 text-xs text-[#5a6b88]">Importing replaces all current progress.</p>
      </div>

      {/* Lab config */}
      <div className="panel mb-6 p-5">
        <h2 className="mb-4 text-sm font-semibold text-white">Lab configuration</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-[#93a4c0]">Company</dt>
            <dd className="text-[#cfd9ec]">{architecture.company}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[#93a4c0]">Domain</dt>
            <dd className="font-mono text-[#cfd9ec]">{architecture.domain}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[#93a4c0]">NetBIOS</dt>
            <dd className="font-mono text-[#cfd9ec]">{architecture.netbios}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[#93a4c0]">Subnet</dt>
            <dd className="font-mono text-[#cfd9ec]">{architecture.networkPlan.subnet}</dd>
          </div>
          {architecture.networkPlan.assignments.map((a) => (
            <div key={a.host} className="flex justify-between gap-3">
              <dt className="text-[#93a4c0]">{a.host}</dt>
              <dd className="font-mono text-[#cfd9ec]">{a.ip}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-[#5a6b88]">
          These values come from the lab architecture definition and are shared with the provisioning scripts in
          09-SCRIPTS/vm/. All identities in the lab are fictional.
        </p>
      </div>

      {/* Danger zone */}
      <div className="panel border-red-500/30 p-5">
        <h2 className="mb-1 text-sm font-semibold text-red-400">Reset progress</h2>
        <p className="mb-4 text-xs text-[#93a4c0]">
          Permanently erases all phase, ticket and drill progress in this browser. This cannot be undone. Export first
          if there is any chance you want it back.
        </p>
        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} className="btn-ghost text-sm">Reset all progress</button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-red-300">Erase everything permanently?</span>
            <button
              onClick={() => {
                resetProgress();
                setConfirmReset(false);
              }}
              className="btn text-sm bg-red-600 text-white hover:bg-red-500"
            >
              Yes, erase it
            </button>
            <button onClick={() => setConfirmReset(false)} className="btn-ghost text-sm">Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}
