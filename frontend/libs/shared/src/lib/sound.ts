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
        this.preloadSound('background', '/sounds/background.mp3', true);
        this.preloadSound('click', '/sounds/click.mp3');
        this.preloadSound('gameOver', '/sounds/game-over.mp3');
        // Add more sounds as needed
    }

    static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    private async initializeAudioContext() {
        if (this.initialized) return;

        try {
            // @ts-ignore - webkitAudioContext for Safari
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            await this.audioContext.resume();
            this.initialized = true;
        } catch (error) {
            console.warn('Web Audio API not supported', error);
        }
    }

  async preloadSound(name: string, path: string, loop = false): Promise<boolean> {
    try {
      await this.initializeAudioContext();

      return new Promise((resolve) => {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.loop = loop;

        const handleLoad = () => {
          this.sounds.set(name, audio);
          resolve(true);
        };

        const handleError = () => {
          console.warn(`Failed to load sound: ${name} from ${path}`);
          resolve(false);
        };

        /*audio.addEventListener('canplaythrough', handleLoad, { once: true });
        audio.addEventListener('error', handleError, { once: true });*/
          audio.oncanplaythrough = () => {
              this.sounds.set(name, audio);
              resolve(true);
          };

          audio.onerror = () => {
              console.warn(`Failed to load sound: ${name}`);
              resolve(false);
          };

          audio.src = path;
      });
    } catch (error) {
      console.warn(`Error preloading sound ${name}:`, error);
      return false;
    }
  }

  playSound(name: string, volume = 1.0): void {
    if (!this.soundEffectsEnabled) return;

    try {
      const sound = this.sounds.get(name);
        if (!sound) {
            console.warn(`Sound not found: ${name}`);
            return;
        }
        // Create a new instance for each play to allow overlapping sounds
        const soundClone = sound.cloneNode() as HTMLAudioElement;
        soundClone.volume = Math.min(1, Math.max(0, volume * this.volume));
        soundClone.play().catch(e =>
          console.debug(`Could not play sound ${name}:`, e)
        );
    } catch (error) {
      console.debug(`Error playing sound ${name}:`, error);
    }
  }

    playMusic(name: string, volume = 0.5): void {
        if (!this.musicEnabled) return;

        this.stopCurrentMusic();
        const music = this.sounds.get(name);
        if (music) {
            this.currentMusic = name;
            music.volume = volume;
            music.play().catch(e => console.warn(`Could not play music ${name}:`, e));
        }
    }

    stopCurrentMusic(): void {
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
            this.stopCurrentMusic();
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
}

export const soundManager = SoundManager.getInstance();