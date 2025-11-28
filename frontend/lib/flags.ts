"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Simple feature flag reader for the frontend.
 * - Reads NEXT_PUBLIC_FEATURE_* env at build/runtime first
 * - Optionally fetches backend evaluation at /api/features when `preferBackend` is true
 */
export function useFeature(flag: string, defaultValue = false, opts?: { preferBackend?: boolean }) {
  const preferBackend = opts?.preferBackend ?? false;
  const [value, setValue] = useState<boolean>(() => readEnv(flag, defaultValue));

  useEffect(() => {
    if (!preferBackend) return;
    // Try to read from backend (best effort)
    const api = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8080/api";
    fetch(`${api}/features`).then(async (res) => {
      if (!res.ok) return;
      const json = await res.json();
      if (typeof json?.[flag] === "boolean") setValue(Boolean(json[flag]));
    }).catch(() => void 0);
  }, [flag, preferBackend]);

  return value;
}

export function readEnv(flag: string, defaultValue = false): boolean {
  const key = `NEXT_PUBLIC_FEATURE_${flag.toUpperCase()}`;
  // @ts-ignore
  const raw = process.env[key];
  if (typeof raw === "string") return raw === "true";
  if (typeof window !== "undefined") {
    // also check window.env style if injected by runtime
    // @ts-ignore
    const winRaw = window?.[key];
    if (typeof winRaw === "string") return winRaw === "true";
  }
  return defaultValue;
}
