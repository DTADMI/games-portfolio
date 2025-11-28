"use client";

import { useEffect, useMemo, useState } from "react";
import { useStomp } from "@/lib/realtime/useStomp";

type PresenceMsg = {
  type?: string;
  payload?: { count?: number };
};

type Props = {
  game: "snake" | "breakout" | string;
  nickname?: string;
};

export function PresenceBadge({ game, nickname }: Props) {
  const realtimeEnabled = process.env.NEXT_PUBLIC_FEATURE_REALTIME === "true";
  const { connected, subscribe, publish } = useStomp({ enabled: realtimeEnabled });
  const [count, setCount] = useState<number>(0);

  // Memoize envelope base
  const baseEnv = useMemo(() => ({
    room: { id: `${game}:global`, game, visibility: "public" },
    user: { id: undefined, role: "guest", nickname: nickname || "guest", subscription: "free" },
  }), [game, nickname]);

  useEffect(() => {
    if (!realtimeEnabled) return;
    // Subscribe to presence updates
    const off = subscribe(`/topic/${game}/presence`, (msg: PresenceMsg) => {
      if (msg?.type === "presence") {
        setCount(msg?.payload?.count ?? 0);
      }
    });
    // Join on mount
    publish(`/app/${game}/presence`, { ...baseEnv, type: "presence", payload: { status: "join" } });

    const hb = setInterval(() => {
      publish(`/app/${game}/presence`, { ...baseEnv, type: "presence", payload: { status: "heartbeat" } });
    }, 15000);

    return () => {
      clearInterval(hb);
      publish(`/app/${game}/presence`, { ...baseEnv, type: "presence", payload: { status: "leave" } });
      if (typeof off === "function") off();
    };
  }, [realtimeEnabled, subscribe, publish, game, baseEnv]);

  if (!realtimeEnabled) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600/15 px-3 py-1 text-sm text-emerald-900 dark:text-emerald-200">
      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
      <span>{connected ? `${count} online` : "connecting…"}</span>
    </div>
  );
}
