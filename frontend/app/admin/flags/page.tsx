"use client";

import React, {useEffect, useMemo, useState} from "react";

type Flags = Record<string, string | boolean | number | null>;

async function fetchFlags(): Promise<Flags> {
  const res = await fetch("/api/features", {cache: "no-store"});
  if (!res.ok) {
    return {} as Flags;
  }
  return (await res.json()) as Flags;
}

async function upsertFlag(key: string, value: string) {
  const res = await fetch("/api/admin/features", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({key, value}),
  });
  if (!res.ok) {
    throw new Error("Failed to update flag");
  }
  return (await res.json()) as Flags;
}

export default function AdminFlagsPage() {
  const [flags, setFlags] = useState<Flags>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchFlags()
      .then((f) => setFlags(f))
      .catch(() => setError("Unable to load flags"))
      .finally(() => setLoading(false));
  }, []);

  const entries = useMemo(() => Object.entries(flags).sort(([a], [b]) => a.localeCompare(b)), [flags]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-muted-foreground">Loading flags…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="rounded-md bg-destructive/10 px-4 py-2 text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="mb-4 text-2xl font-semibold">Feature Flags</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Toggle or edit non‑secret feature flags. Secrets must be managed via the environment/secret store.
      </p>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
          <tr>
            <th className="p-2 text-left">Key</th>
            <th className="p-2 text-left">Value</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
          </thead>
          <tbody>
          {entries.map(([key, value]) => {
            const isBool = typeof value === "boolean";
            return (
              <tr key={key} className="border-t border-border">
                <td className="p-2 font-mono text-xs md:text-sm">{key}</td>
                <td className="p-2">
                  {isBool ? (
                    <span
                      className={`inline-flex items-center rounded px-2 py-1 text-xs ${value ? "bg-emerald-600 text-white" : "bg-gray-300 text-gray-900 dark:bg-gray-700 dark:text-gray-100"}`}>
                        {String(value)}
                      </span>
                  ) : (
                    <span className="font-mono text-xs md:text-sm">{String(value)}</span>
                  )}
                </td>
                <td className="p-2 text-right">
                  {isBool ? (
                    <button
                      disabled={savingKey === key}
                      onClick={async () => {
                        try {
                          setSavingKey(key);
                          const next = !(value as boolean);
                          const updated = await upsertFlag(key, String(next));
                          setFlags(updated);
                        } catch (e) {
                          console.error(e);
                          alert("Failed to update flag");
                        } finally {
                          setSavingKey(null);
                        }
                      }}
                      className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
                    >
                      {savingKey === key ? "Saving…" : "Toggle"}
                    </button>
                  ) : (
                    <InlineEdit keyName={key} value={String(value ?? "")} onSaved={setFlags} savingKey={savingKey}
                                setSavingKey={setSavingKey}/>
                  )}
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InlineEdit({keyName, value, onSaved, savingKey, setSavingKey}: {
  keyName: string;
  value: string;
  onSaved: (f: Flags) => void;
  savingKey: string | null;
  setSavingKey: (k: string | null) => void;
}) {
  const [draft, setDraft] = useState(value);
  return (
    <div className="inline-flex items-center gap-2">
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="w-44 rounded-md border border-input bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-ring"
      />
      <button
        disabled={savingKey === keyName}
        onClick={async () => {
          try {
            setSavingKey(keyName);
            const updated = await upsertFlag(keyName, draft);
            onSaved(updated);
          } catch (e) {
            console.error(e);
            alert("Failed to update flag");
          } finally {
            setSavingKey(null);
          }
        }}
        className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
      >
        {savingKey === keyName ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
