"use client";

import React, { useEffect, useState } from "react";
import { useSound } from "@games/shared";

export default function SoundControls() {
  const { isMuted, toggleMute, setVolume, volume } = useSound();
  const [localVolume, setLocalVolume] = useState<number>(volume ?? 0.5);

  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);

  return (
    <div
      className="fixed top-2 right-2 z-40 flex items-center gap-2 rounded-md border border-gray-300/50 bg-white/70 px-2 py-1 text-sm shadow-sm backdrop-blur dark:border-gray-700/60 dark:bg-gray-900/60"
      role="region"
      aria-label="Global sound controls"
    >
      <button
        type="button"
        onClick={toggleMute}
        aria-pressed={isMuted}
        aria-label={isMuted ? "Unmute" : "Mute"}
        className="rounded px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
      >
        {isMuted ? "Unmute" : "Mute"}
      </button>
      <label className="inline-flex items-center gap-2">
        <span className="sr-only" id="volume-label">
          Volume
        </span>
        <input
          aria-labelledby="volume-label"
          type="range"
          min={0}
          max={100}
          value={Math.round(localVolume * 100)}
          onChange={(e) => {
            const v = (Number(e.target.value) || 0) / 100;
            setLocalVolume(v);
            setVolume(v);
          }}
        />
      </label>
    </div>
  );
}
