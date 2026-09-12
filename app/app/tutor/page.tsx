"use client";

import { TutorChat } from "@/components/TutorChat";

export default function TutorPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Ollama Tutor</h1>
        <p className="mt-1 text-sm text-[#93a4c0]">
          Your local AI instructor. The tutor uses progressive hints and Socratic questioning — it won't give you the answer immediately.
        </p>
      </div>

      <div className="panel-2 mb-6 p-5">
        <h2 className="mb-2 text-sm font-semibold text-white">How the tutor works</h2>
        <ul className="space-y-1.5 text-sm text-[#cfd9ec]">
          <li>• Ask what you observe and what changed before asking for a solution</li>
          <li>• Give progressive hints — Hint 1 first, Hint 2 after an attempt</li>
          <li>• Require evidence before suggesting a fix</li>
          <li>• Reveal the root cause only after reasonable investigation</li>
          <li>• Score your work: Troubleshooting 25%, Technical 30%, Security 15%, Documentation 15%, Communication 15%</li>
          <li>• Passing score: 80%</li>
        </ul>
      </div>

      <TutorChat title="Instructor Chat" />

      <div className="panel-2 mt-6 p-5">
        <h2 className="mb-2 text-sm font-semibold text-white">Setup Ollama</h2>
        <p className="text-sm text-[#cfd9ec]">
          If the tutor shows offline, install Ollama from{" "}
          <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="text-omari-300 underline">
            ollama.com
          </a>{" "}
          and run:
        </p>
        <pre className="mt-3 rounded-lg border border-[#1f2d4d] bg-[#0d1626] p-3 text-sm text-[#cfd9ec]">
{`ollama serve          # Start the Ollama server
ollama pull llama3.1  # Download a model`}
        </pre>
        <p className="mt-3 text-xs text-[#5a6b88]">
          The tutor connects to <code className="text-omari-300">http://localhost:11434</code> by default. Configure the endpoint and model in Settings.
        </p>
      </div>
    </div>
  );
}
