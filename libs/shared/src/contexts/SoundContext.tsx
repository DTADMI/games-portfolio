// Shared: contexts/SoundContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SoundManager } from '../sound';

const SoundContext = createContext<{
    isMuted: boolean;
    toggleMute: () => void;
    playSound: (name: string, volume?: number) => void;
    playMusic: (name: string, loop?: boolean) => void;
    stopMusic: () => void;
    setVolume: (volume: number) => void;
    volume: number;
}>(null!);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const soundManager = new SoundManager();

    useEffect(() => {
        // Load saved settings
        const savedMuted = localStorage.getItem('soundMuted') === 'true';
        const savedVolume = parseFloat(localStorage.getItem('soundVolume') || '0.5');

        setIsMuted(savedMuted);
        setVolume(savedVolume);
    }, []);

    const toggleMute = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        soundManager.setMuted(newMuted);
        localStorage.setItem('soundMuted', String(newMuted));
    };

    const setVolume = (newVolume: number) => {
        const clamped = Math.min(1, Math.max(0, newVolume));
        setVolume(clamped);
        soundManager.setVolume(clamped);
        localStorage.setItem('soundVolume', String(clamped));

        if (clamped > 0 && isMuted) {
            setIsMuted(false);
        }
    };

    return (
        <SoundContext.Provider
            value={{
                isMuted,
                toggleMute,
                playSound: soundManager.playSound.bind(soundManager),
                playMusic: soundManager.playMusic.bind(soundManager),
                stopMusic: soundManager.stopMusic.bind(soundManager),
                setVolume,
                volume,
            }}
        >
            {children}
        </SoundContext.Provider>
    );
};

export const useSound = () => {
    const context = useContext(SoundContext);
    if (!context) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
};