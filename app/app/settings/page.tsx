"use client";

import { useState, useEffect } from "react";
import { architecture } from "@/lib/data/architecture";

export default function SettingsPage() {
  const [ollamaUrl, setOllamaUrl] = useState("");
  const [ollamaModel, setOllamaModel] = useState("");
  const [status, setStatus] = useState<{ available: boolean; models: { name: string }[] } | null>(null);

  useEffect(() => {
    setOllamaUrl(localStorage.getItem("ollama_base_url") || "http://localhost:11434");
    setOllamaModel(localStorage.getItem("ollama_model") || "llama3.1");
  }, []);

  const testConnection = async () => {
    try {
      const res = await fetch("/api/ollama/status");
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({ available: false, models: [] });
    }
  };

  const save = () => {
    localStorage.setItem("ollama_base_url", ollamaUrl);
    localStorage.setItem("ollama_model", ollamaModel);
    alert("Settings saved. Note: server-side Ollama endpoint is configured via .env file.");
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-[#93a4c0]">Configure Ollama tutor connection and lab settings.</p>
      </div>

      <div className="panel mb-6 p-5">
        <h2 className="mb-4 text-sm font-semibold text-white">Ollama Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-[#93a4c0]">Ollama Base URL</label>
            <input value={ollamaUrl} onChange={(e) => setOllamaUrl(e.target.value)} className="input" placeholder="http://localhost:11434" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#93a4c0]">Default Model</label>
            <input value={ollamaModel} onChange={(e) => setOllamaModel(e.target.value)} className="input" placeholder="llama3.1" />
          </div>
          <div className="flex gap-2">
            <button onClick={testConnection} className="btn-ghost text-sm">Test Connection</button>
            <button onClick={save} className="btn-primary text-sm">Save</button>
          </div>
          {status && (
            <div className="rounded-lg border border-[#1f2d4d] bg-[#0d1626] p-3 text-sm">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${status.available ? "bg-green-500" : "bg-red-500"}`}></span>
                <span className={status.available ? "text-green-400" : "text-red-400"}>
                  {status.available ? "Connected" : "Not connected"}
                </span>
              </div>
              {status.available && status.models.length > 0 && (
                <div className="mt-2 text-[#cfd9ec]">Available models: {status.models.map((m) => m.name).join(", ")}</div>
              )}
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-[#5a6b88]">
          For server-side configuration, create a <code className="text-omari-300">.env</code> file with{" "}
          <code className="text-omari-300">OLLAMA_BASE_URL</code> and <code className="text-omari-300">OLLAMA_MODEL</code>.
        </p>
      </div>

      <div className="panel p-5">
        <h2 className="mb-4 text-sm font-semibold text-white">Lab Configuration</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-[#93a4c0]">Company:</dt><dd className="text-[#cfd9ec]">{architecture.company}</dd></div>
          <div className="flex justify-between"><dt className="text-[#93a4c0]">Domain:</dt><dd className="text-[#cfd9ec] font-mono">{architecture.domain}</dd></div>
          <div className="flex justify-between"><dt className="text-[#93a4c0]">NetBIOS:</dt><dd className="text-[#cfd9ec] font-mono">{architecture.netbios}</dd></div>
          <div className="flex justify-between"><dt className="text-[#93a4c0]">Subnet:</dt><dd className="text-[#cfd9ec] font-mono">{architecture.networkPlan.subnet}</dd></div>
          <div className="flex justify-between"><dt className="text-[#93a4c0]">DC01:</dt><dd className="text-[#cfd9ec] font-mono">10.10.10.10</dd></div>
          <div className="flex justify-between"><dt className="text-[#93a4c0]">FS01:</dt><dd className="text-[#cfd9ec] font-mono">10.10.10.20</dd></div>
          <div className="flex justify-between"><dt className="text-[#93a4c0]">MGMT01:</dt><dd className="text-[#cfd9ec] font-mono">10.10.10.30</dd></div>
        </dl>
      </div>
    </div>
  );
}
