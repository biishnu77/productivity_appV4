// Sound service for managing audio effects
class SoundService {
  private sounds: { [key: string]: HTMLAudioElement | null } = {};
  private initialized = false;

  constructor() {
    // Initialize with null values
    this.sounds = {
      start: null,
      pause: null,
      reset: null,
      complete: null,
    };
  }

  initialize() {
    // Only initialize once and only in browser environment
    if (this.initialized || typeof window === 'undefined') return;

    const soundUrls = {
      start: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
      pause: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      reset: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
      complete: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3',
    };

    // Create Audio instances only in browser environment
    Object.entries(soundUrls).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.load();
      audio.volume = 0.5;
      this.sounds[key as keyof typeof this.sounds] = audio;
    });

    this.initialized = true;
  }

  play(soundName: 'start' | 'pause' | 'reset' | 'complete') {
    const sound = this.sounds[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(error => {
        console.warn('Audio playback failed:', error);
      });
    }
  }

  setVolume(volume: number) {
    Object.values(this.sounds).forEach(audio => {
      if (audio) {
        audio.volume = Math.max(0, Math.min(1, volume));
      }
    });
  }
}

export const soundService = new SoundService();