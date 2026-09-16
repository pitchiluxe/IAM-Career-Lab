"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Client-side tutor settings.
 *
 * These were previously written to localStorage by the Settings page and read
 * by nothing at all, so changing the model or endpoint had no effect. Both the
 * Settings page and TutorChat now go through this hook, and the values are sent
 * with every request so the setting actually takes effect.
 */

export const OLLAMA_URL_KEY = "ollama_base_url";
export const OLLAMA_MODEL_KEY = "ollama_model";

export const DEFAULT_OLLAMA_URL = "http://localhost:11434";
export const DEFAULT_OLLAMA_MODEL = "llama3.1";

export interface TutorSettings {
  baseUrl: string;
  model: string;
}

function read(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

export function useTutorSettings() {
  const [settings, setSettings] = useState<TutorSettings>({
    baseUrl: DEFAULT_OLLAMA_URL,
    model: DEFAULT_OLLAMA_MODEL,
  });
  /** False during the first render pass, before localStorage has been read. */
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSettings({
      baseUrl: read(OLLAMA_URL_KEY, DEFAULT_OLLAMA_URL),
      model: read(OLLAMA_MODEL_KEY, DEFAULT_OLLAMA_MODEL),
    });
    setLoaded(true);
  }, []);

  const save = useCallback((next: TutorSettings) => {
    setSettings(next);
    try {
      localStorage.setItem(OLLAMA_URL_KEY, next.baseUrl);
      localStorage.setItem(OLLAMA_MODEL_KEY, next.model);
    } catch {
      // Storage unavailable. The in-memory value still applies for this
      // session, so the tutor works; it just will not persist across reloads.
    }
  }, []);

  return { settings, loaded, save };
}

/**
 * Builds the status URL.
 *
 * The default endpoint is omitted from the query string so the server falls
 * back to its own OLLAMA_BASE_URL environment variable, which is how the
 * desktop build points at a bundled runtime.
 */
export function statusUrl(baseUrl: string): string {
  return baseUrl && baseUrl !== DEFAULT_OLLAMA_URL
    ? `/api/ollama/status?baseUrl=${encodeURIComponent(baseUrl)}`
    : "/api/ollama/status";
}
