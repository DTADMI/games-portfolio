"use client";

import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { useEffect, useMemo, useRef, useState } from "react";

export type StompMessage = {
  eventId?: string;
  type?: string;
  ts?: number;
  room?: { id?: string; game?: string; visibility?: string };
  user?: { id?: string; role?: string; nickname?: string; subscription?: string };
  payload?: unknown;
};

export function useStomp(opts?: {
  url?: string;
  enabled?: boolean;
  headers?: Record<string, string>;
}) {
  const enabled = opts?.enabled ?? process.env.NEXT_PUBLIC_FEATURE_REALTIME === "true";
  const url =
    opts?.url ??
    (typeof window !== "undefined" ? `${window.location.origin.replace(/^http/, "ws")}/ws` : "");
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const subsRef = useRef<StompSubscription[]>([]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    // Build connect headers: prefer provided headers; otherwise include Authorization from stored access token if present
    let connectHeaders: Record<string, string> | undefined = opts?.headers;
    if (!connectHeaders && typeof window !== "undefined") {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          connectHeaders = { Authorization: `Bearer ${token}` };
        }
      } catch {
        /* ignore */
      }
    }

    const client = new Client({
      brokerURL: url,
      reconnectDelay: 1000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectHeaders,
      onConnect: () => setConnected(true),
      onStompError: () => setConnected(false),
      onDisconnect: () => setConnected(false),
    });
    client.activate();
    clientRef.current = client;
    return () => {
      try {
        subsRef.current.forEach((s) => s.unsubscribe());
      } catch {}
      subsRef.current = [];
      client.deactivate();
      clientRef.current = null;
    };
  }, [enabled, url, opts?.headers]);

  const api = useMemo(
    () => ({
      connected,
      subscribe: (destination: string, cb: (msg: StompMessage) => void) => {
        if (!clientRef.current) {
          return () => {};
        }
        const sub = clientRef.current.subscribe(destination, (m: IMessage) => {
          try {
            cb(JSON.parse(m.body));
          } catch {
            /* ignore */
          }
        });
        subsRef.current.push(sub);
        return () => sub.unsubscribe();
      },
      publish: (destination: string, body: StompMessage) => {
        if (!clientRef.current) {
          return;
        }
        clientRef.current.publish({ destination, body: JSON.stringify(body) });
      },
    }),
    [connected],
  );

  return api;
}
