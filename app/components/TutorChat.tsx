"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTutorSettings, statusUrl, DEFAULT_OLLAMA_URL } from "@/lib/settings";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface TutorChatProps {
  context?: string;
  title?: string;
}

export function TutorChat({ context, title = "Ollama Tutor" }: TutorChatProps) {
  const { settings, loaded } = useTutorSettings();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<{ available: boolean; models: { name: string }[] } | null>(null);
  const [selectedModel, setSelectedModel] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loaded) return;
    let cancelled = false;
    fetch(statusUrl(settings.baseUrl), { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setOllamaStatus(data);
        if (data.available && data.models?.length > 0) {
          // Prefer the configured model when it is actually installed, rather
          // than silently using whatever happens to be first in the list.
          const configured = data.models.find((m: { name: string }) => m.name === settings.model);
          setSelectedModel(configured ? configured.name : data.models[0].name);
        }
      })
      .catch(() => {
        if (!cancelled) setOllamaStatus({ available: false, models: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [loaded, settings.baseUrl, settings.model]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    const userMsg: ChatMessage = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ollama/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          model: selectedModel || settings.model || undefined,
          baseUrl: settings.baseUrl !== DEFAULT_OLLAMA_URL ? settings.baseUrl : undefined,
          context,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `**Tutor error:** ${data.error}\n\nCheck that Ollama is running (\`ollama serve\`) and that a model is installed (\`ollama pull llama3.1\`).`,
          },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `**Connection error:** ${e instanceof Error ? e.message : "Unknown error"}` },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, selectedModel, settings.model, settings.baseUrl, context]);

  return (
    <div className="panel flex flex-col" style={{ height: "600px" }}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1f2d4d] px-4 py-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <div className="flex items-center gap-2">
          {ollamaStatus && (
            <span className={`badge ${ollamaStatus.available ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
              {ollamaStatus.available ? "Online" : "Offline"}
            </span>
          )}
          {ollamaStatus?.available && ollamaStatus.models.length > 0 && (
            <label>
              <span className="sr-only">Tutor model</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="rounded border border-[#2a3a5e] bg-[#0d1626] px-2 py-1 text-xs text-[#e6edf7]"
              >
                {ollamaStatus.models.map((m) => (
                  <option key={m.name} value={m.name}>{m.name}</option>
                ))}
              </select>
            </label>
          )}
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} className="text-xs text-[#5a6b88] hover:text-white">
              Clear
            </button>
          )}
        </div>
      </div>

      {ollamaStatus && !ollamaStatus.available && (
        <div className="border-b border-[#1f2d4d] bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
          <strong>Tutor offline.</strong> Install Ollama from{" "}
          <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="underline">ollama.com</a>,
          then run <code className="rounded bg-[#0d1626] px-1">ollama serve</code> and{" "}
          <code className="rounded bg-[#0d1626] px-1">ollama pull llama3.1</code>. Every other part of the platform
          works without it.
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-center text-sm text-[#5a6b88]">
            <div>
              <p className="mb-2">Ask the tutor about your current lab.</p>
              <p className="text-xs">
                It coaches with progressive hints and will not hand you the answer. Tell it what you have already
                tried and it can be far more specific.
              </p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-omari-600 text-white"
                  : "border border-[#1f2d4d] bg-[#16213a] text-[#e6edf7]"
              }`}
            >
              <div className="whitespace-pre-wrap break-words">{msg.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="mb-4 flex justify-start">
            <div className="rounded-lg border border-[#1f2d4d] bg-[#16213a] px-4 py-2 text-sm text-[#93a4c0]">
              <span className="animate-pulse">Tutor is thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-[#1f2d4d] p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask the instructor..."
            className="input flex-1"
            disabled={loading}
            aria-label="Message to the tutor"
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()} className="btn-primary">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
