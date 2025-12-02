"use client";

import { useEffect, useState } from "react";

/**
 * Simple feature flag reader for the frontend.
 * - Reads NEXT_PUBLIC_FEATURE_* env at build/runtime first
 * - Optionally fetches backend evaluation at /api/features when `preferBackend` is true
 */
export function useFeature(flag: string, defaultValue = false, opts?: { preferBackend?: boolean }) {
  const preferBackend = opts?.preferBackend ?? false;
  const [value, setValue] = useState<boolean>(() => readEnv(flag, defaultValue));

  useEffect(() => {
    if (!preferBackend) {
      return;
    }
    // Try to read from backend (best effort)
    const api = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8080/api";
    fetch(`${api}/features`)
      .then(async (res) => {
        if (!res.ok) {
          return;
        }
        const json = await res.json();
        if (typeof json?.[flag] === "boolean") {
          setValue(Boolean(json[flag]));
        }
      })
      .catch(() => void 0);
  }, [flag, preferBackend]);

  return value;
}

export function readEnv(flag: string, defaultValue = false): boolean {
  const key = `NEXT_PUBLIC_FEATURE_${flag.toUpperCase()}`;

  // Safely access process.env with type assertion
  const env = process.env as unknown as Record<string, string | undefined>;
  const raw = env[key];
  if (typeof raw === "string") {
    return raw === "true";
  }

  // Check window object if in browser
  if (typeof window !== "undefined") {
    const winRaw = (window as unknown as Record<string, unknown>)[key];
    if (typeof winRaw === "string") {
      return winRaw === "true";
    }
  }

  return defaultValue;
}
