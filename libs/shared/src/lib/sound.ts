// libs/shared/src/lib/sound.ts
export class SoundManager {
  private static instance: SoundManager;
  private sounds: Map<string, HTMLAudioElement> = new Map<string, HTMLAudioElement>();
  private musicEnabled = true;
  private soundEffectsEnabled = true;
  private currentMusic: string | null = null;
  private audioContext: AudioContext | null = null;
  private initialized = false;
  private isMuted = false;
  private volume = 0.5;

  private constructor() {
    // Initialize with default sounds
    void this.preloadSound("background", "/sounds/background.mp3", true);
    void this.preloadSound("click", "/sounds/click.mp3");
    void this.preloadSound("gameOver", "/sounds/game-over.mp3");
  }

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /** Toggle global mute state */
  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopMusic();
    }
  }

  /** Set global volume [0..1] applied to all sounds/music */
  public setVolume(v: number) {
    this.volume = Math.min(1, Math.max(0, v));
    // Apply to currently playing music
    if (this.currentMusic) {
      const music = this.sounds.get(this.currentMusic);
      if (music) {
        music.volume = this.volume * 0.5; // keep music softer by default
      }
    }
  }

  async preloadSound(name: string, path: string, loop = false): Promise<boolean> {
    // Skip on server-side
    if (typeof window === "undefined") {
      return false;
    }

    try {
      await this.initializeAudioContext();

      const audio = new Audio(path);
      audio.loop = loop;

      await new Promise<void>((resolve, reject) => {
        const onReady = () => {
          cleanup();
          resolve();
        };

        const onError = (_e: Event) => {
          cleanup();
          reject(new Error(`Failed to load sound: ${name}`));
        };

        const cleanup = () => {
          audio.removeEventListener("canplaythrough", onReady);
          audio.removeEventListener("error", onError);
        };

        audio.addEventListener("canplaythrough", onReady, { once: true });
        audio.addEventListener("error", onError, { once: true });
      });

      this.sounds.set(name, audio);
      return true;
    } catch (error) {
      console.warn(`Failed to preload sound ${name}:`, error);
      return false;
    }
  }

  public playSound(name: string, volume = 1): void {
    if (typeof window === "undefined") {
      return;
    } // Skip on server

    const audio = this.sounds.get(name);
    if (audio) {
      try {
        audio.volume = Math.min(Math.max(volume, 0), 1);
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.warn(`Error playing sound ${name}:`, error);
          });
        }
      } catch (error) {
        console.warn(`Error playing sound ${name}:`, error);
      }
    } else {
      console.warn(`Sound not found: ${name}`);
    }
  }

  playMusic(name: string, volume = 0.5): void {
    if (!this.musicEnabled || this.isMuted) {
      return;
    }

    this.stopMusic();
    const music = this.sounds.get(name);
    if (music) {
      this.currentMusic = name;
      music.volume = Math.min(1, Math.max(0, volume * this.volume));
      void music.play().catch((e) => console.warn(`Could not play music ${name}:`, e));
    }
  }

  public stopMusic() {
    if (this.currentMusic) {
      const music = this.sounds.get(this.currentMusic);
      if (music) {
        music.pause();
        music.currentTime = 0;
      }
      this.currentMusic = null;
    }
  }

  toggleMusic(): void {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled && this.currentMusic) {
      this.playMusic(this.currentMusic);
    } else {
      this.stopMusic();
    }
  }

  toggleSoundEffects(): void {
    this.soundEffectsEnabled = !this.soundEffectsEnabled;
  }

  isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  areSoundEffectsEnabled(): boolean {
    return this.soundEffectsEnabled;
  }

  private async initializeAudioContext() {
    // Skip on server-side or if already initialized
    if (typeof window === "undefined" || this.initialized) {
      return;
    }

    try {
      // @ts-ignore - Web Audio API types
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;

      if (AudioContextCtor) {
        this.audioContext = new AudioContextCtor();
        if (this.audioContext.state === "suspended") {
          await this.audioContext.resume();
        }
        this.initialized = true;
      }
    } catch (error) {
      console.warn("Web Audio API not supported", error);
    }
  }
}

export const soundManager = SoundManager.getInstance();
