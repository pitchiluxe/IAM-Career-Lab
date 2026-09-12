"use client";

import { useState, useRef, useEffect } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface TutorChatProps {
  context?: string;
  title?: string;
}

export function TutorChat({ context, title = "Ollama Tutor" }: TutorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<{ available: boolean; models: { name: string }[] } | null>(null);
  const [selectedModel, setSelectedModel] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/ollama/status")
      .then((r) => r.json())
      .then((data) => {
        setOllamaStatus(data);
        if (data.available && data.models.length > 0) {
          setSelectedModel(data.models[0].name);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
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
          model: selectedModel || undefined,
          context,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `**Tutor Error:** ${data.error}\n\nMake sure Ollama is running with \`ollama serve\` and a model is pulled (e.g., \`ollama pull llama3.1\`).` },
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
  };

  return (
    <div className="panel flex flex-col" style={{ height: "600px" }}>
      <div className="flex items-center justify-between border-b border-[#1f2d4d] px-4 py-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <div className="flex items-center gap-2">
          {ollamaStatus && (
            <span
              className={`badge ${ollamaStatus.available ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
            >
              {ollamaStatus.available ? "Online" : "Offline"}
            </span>
          )}
          {ollamaStatus?.available && ollamaStatus.models.length > 0 && (
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="rounded border border-[#2a3a5e] bg-[#0d1626] px-2 py-1 text-xs text-[#e6edf7]"
            >
              {ollamaStatus.models.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {!ollamaStatus?.available && (
        <div className="border-b border-[#1f2d4d] bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
          <strong>Tutor Offline.</strong> Ollama is not running. Install from{" "}
          <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="underline">
            ollama.com
          </a>
          , then run <code className="rounded bg-[#0d1626] px-1">ollama serve</code> and{" "}
          <code className="rounded bg-[#0d1626] px-1">ollama pull llama3.1</code>.
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-center text-sm text-[#5a6b88]">
            <div>
              <p className="mb-2">Ask the tutor a question about your current lab.</p>
              <p className="text-xs">The tutor uses progressive hints — it won't give you the answer immediately.</p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-omari-600 text-white"
                  : "bg-[#16213a] text-[#e6edf7] border border-[#1f2d4d]"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="mb-4 flex justify-start">
            <div className="rounded-lg bg-[#16213a] border border-[#1f2d4d] px-4 py-2 text-sm text-[#93a4c0]">
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
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask the instructor..."
            className="input flex-1"
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()} className="btn-primary">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
