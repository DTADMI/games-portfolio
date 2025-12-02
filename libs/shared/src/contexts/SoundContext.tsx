// Shared: contexts/SoundContext.tsx

import React, { createContext, useContext, useEffect, useState } from "react";
import { soundManager } from "../lib/sound";

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playSound: (name: string, volume?: number) => void;
  playMusic: (name: string, loop?: boolean) => void;
  stopMusic: () => void;
  setVolume: (volume: number) => void;
  volume: number;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.5);

  // Use the singleton instance of SoundManager
  const manager = soundManager;

  useEffect(() => {
    // Load saved settings
    const savedMuted = localStorage.getItem("soundMuted") === "true";
    const savedVolume = parseFloat(localStorage.getItem("soundVolume") || "0.5");

    setIsMuted(savedMuted);
    setVolumeState(savedVolume);
  }, []);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    manager.setMuted(newMuted);
    localStorage.setItem("soundMuted", String(newMuted));
  };

  const playSound = (name: string, soundVolume = 1) => {
    if (isMuted) {
      return;
    }
    manager.playSound(name, soundVolume);
  };

  const playMusic = (name: string) => {
    if (isMuted) {
      return;
    }
    // Looping behavior should be configured during preloadSound(name, path, loop)
    // Here we just start music respecting the current volume from context
    manager.playMusic(name, volume);
  };

  const stopMusic = () => {
    manager.stopMusic();
  };

  const setVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    manager.setVolume(clampedVolume);
    localStorage.setItem("soundVolume", String(clampedVolume));

    if (clampedVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  // Initialize the sound manager with the current volume and mute state
  useEffect(() => {
    manager.setVolume(volume);
    manager.setMuted(isMuted);
  }, [manager, volume, isMuted]);

  return (
    <SoundContext.Provider
      value={{
        isMuted,
        toggleMute,
        playSound,
        playMusic,
        stopMusic,
        setVolume,
        volume,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = (): SoundContextType => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
};
