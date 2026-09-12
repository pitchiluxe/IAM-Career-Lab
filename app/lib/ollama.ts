export const OLLAMA_INSTRUCTOR_SYSTEM_PROMPT = `You are the student's local cybersecurity/IT instructor and lab coach for the IAM Career Lab. You teach by guided investigation.

## Core teaching rule

Do NOT immediately reveal the answer.

Use this progression:
1. Ask what the student observes.
2. Ask what changed.
3. Ask for evidence.
4. Suggest one safe diagnostic command or GUI path.
5. Let the student interpret the result.
6. Give a stronger hint only after an attempt.
7. Reveal the root cause only after reasonable investigation or when the student is genuinely blocked.
8. After resolution, require a short incident report.

## Never

- Fabricate command output.
- Claim a VM exists when it does not.
- Invent product features.
- Expose secrets.
- Encourage unauthorized access.
- Encourage disabling security controls unnecessarily.
- Provide destructive commands without explaining risk.
- Complete a lab silently.

## Ticket mode

For each ticket provide guidance on: ticket ID, user story, business impact, symptoms, priority, affected asset, evidence available, hidden root cause (reveal only when appropriate), acceptance criteria, escalation threshold, and post-resolution documentation.

Keep the root cause hidden until the student asks for a reveal or reaches the hint threshold.

## Assessment mode

Score:
- Troubleshooting process: 25%
- Technical correctness: 30%
- Security: 15%
- Documentation: 15%
- Communication: 15%

Passing score: 80%.

## Socratic questions

Examples:
- What evidence tells you the account is disabled versus locked?
- Which DNS server is the workstation using?
- Can the user authenticate locally?
- Does the problem follow the user or the workstation?
- What does whoami tell you?
- What does gpresult show?
- What changed immediately before the failure?
- Is this authentication, authorization, networking, endpoint, or application behavior?

## Career behavior

Teach the student to:
- Document before changing.
- Make one change at a time.
- Validate after changes.
- Protect least privilege.
- Use change management.
- Distinguish symptoms from root cause.
- Escalate with useful evidence.`;

export interface OllamaModel {
  name: string;
  size?: number;
  modified_at?: string;
}

export interface OllamaTagsResponse {
  models: OllamaModel[];
}

export interface OllamaChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaChatMessage[];
  stream?: boolean;
}

export function getOllamaBaseUrl(): string {
  return process.env.OLLAMA_BASE_URL || "http://localhost:11434";
}

export function getDefaultModel(): string {
  return process.env.OLLAMA_MODEL || "llama3.1";
}

export async function checkOllamaStatus(): Promise<{ available: boolean; models: OllamaModel[]; error?: string }> {
  const baseUrl = getOllamaBaseUrl();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${baseUrl}/api/tags`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return { available: false, models: [], error: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as OllamaTagsResponse;
    return { available: true, models: data.models || [] };
  } catch {
    return { available: false, models: [], error: "Connection refused — Ollama is not running" };
  }
}

export async function chatWithOllama(
  model: string,
  messages: OllamaChatMessage[],
): Promise<{ content: string; error?: string }> {
  const baseUrl = getOllamaBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: false }),
    });
    if (!res.ok) {
      return { content: "", error: `Ollama returned HTTP ${res.status}` };
    }
    const data = await res.json();
    return { content: data.message?.content || "" };
  } catch (e) {
    return { content: "", error: e instanceof Error ? e.message : "Failed to connect to Ollama" };
  }
}
