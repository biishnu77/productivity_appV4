class SoundService {
    private sounds: { [key: string]: HTMLAudioElement } = {};
  
    constructor() {
      this.sounds = {
        start: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),
        pause: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
        reset: new Audio('https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3'),
        complete: new Audio('https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3'),
      };
  
      // Preload all sounds
      Object.values(this.sounds).forEach(audio => {
        audio.load();
        audio.volume = 0.5; // Set volume to 50%
      });
    }
  
    play(soundName: 'start' | 'pause' | 'reset' | 'complete') {
      const sound = this.sounds[soundName];
      if (sound) {
        sound.currentTime = 0; // Reset to start
        sound.play().catch(error => {
          console.warn('Audio playback failed:', error);
        });
      }
    }
  
    setVolume(volume: number) {
      Object.values(this.sounds).forEach(audio => {
        audio.volume = Math.max(0, Math.min(1, volume));
      });
    }
  }
  
  export const soundService = new SoundService();