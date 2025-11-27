// frontend/contexts/SoundContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { soundManager } from '@games/shared';

interface SoundContextType {
    isMuted: boolean;
    toggleMute: () => void;
    playSound: (sound: string, volume?: number) => void;
    playMusic: (music: string, loop?: boolean) => void;
    stopMusic: () => void;
    setVolume: (volume: number) => void;
    volume: number;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolumeState] = useState(0.5);

    // Load saved settings from localStorage
    useEffect(() => {
        try {
            const savedMuted = localStorage.getItem('soundMuted') === 'true';
            const savedVolume = parseFloat(localStorage.getItem('soundVolume') || '0.5');

            setIsMuted(savedMuted);
            setVolumeState(Math.min(1, Math.max(0, savedVolume))); // Clamp between 0 and 1

            // Initialize sound manager with saved volume
            soundManager.setVolume(savedMuted ? 0 : savedVolume);
        } catch (err) {
            console.error('Failed to load sound settings:', err);
        }
    }, []);

    const toggleMute = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        soundManager.setMuted(newMuted);
        localStorage.setItem('soundMuted', String(newMuted));
    };

    const setVolume = (newVolume: number) => {
        const clampedVolume = Math.min(1, Math.max(0, newVolume));
        setVolumeState(clampedVolume);
        soundManager.setVolume(clampedVolume);
        localStorage.setItem('soundVolume', String(clampedVolume));

        // Unmute if volume is set above 0
        if (clampedVolume > 0 && isMuted) {
            setIsMuted(false);
            localStorage.setItem('soundMuted', 'false');
        }
    };

    const playSound = (sound: string, volume: number = 1) => {
        if (isMuted) return;
        soundManager.playSound(sound, volume * volumeState);
    };

    const playMusic = (music: string, loop: boolean = true) => {
        if (isMuted) return;
        soundManager.playMusic(music, loop);
    };

    const stopMusic = () => {
        soundManager.stopCurrentMusic();
    };

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
}

export function useSound() {
    const context = useContext(SoundContext);
    if (context === undefined) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
}