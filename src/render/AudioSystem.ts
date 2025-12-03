/**
 * AudioSystem - Manages game audio using Tone.js
 * Background ambience, static, and voice-over playback
 */

import * as Tone from 'tone';

export class AudioSystem {
  private ambienceNoise?: Tone.Noise;
  private staticNoise?: Tone.Noise;
  private ambienceFilter?: Tone.Filter;
  private staticFilter?: Tone.Filter;
  private ambienceVolume?: Tone.Volume;
  private staticVolume?: Tone.Volume;
  private audioStarted: boolean = false;
  private muted: boolean = false;

  constructor() {
    // Audio context needs user interaction to start
  }

  /**
   * Check if audio is muted
   */
  isMuted(): boolean {
    return this.muted;
  }

  /**
   * Mute all audio
   */
  mute(): void {
    this.muted = true;
    if (this.ambienceVolume) this.ambienceVolume.volume.value = -Infinity;
    if (this.staticVolume) this.staticVolume.volume.value = -Infinity;
    Tone.Destination.mute = true;
  }

  /**
   * Unmute all audio
   */
  unmute(): void {
    this.muted = false;
    if (this.ambienceVolume) this.ambienceVolume.volume.value = -25;
    if (this.staticVolume) this.staticVolume.volume.value = -35;
    Tone.Destination.mute = false;
  }

  /**
   * Initialize and start audio context (call after user interaction)
   */
  async startAudio(): Promise<void> {
    if (this.audioStarted) return;

    try {
      await Tone.start();
      console.log('Audio context started');
      
      // Create background ambience (low rumble)
      this.ambienceNoise = new Tone.Noise('brown');
      this.ambienceFilter = new Tone.Filter({
        type: 'lowpass',
        frequency: 200,
        rolloff: -24
      });
      this.ambienceVolume = new Tone.Volume(-25); // Quiet background
      
      this.ambienceNoise.chain(this.ambienceFilter, this.ambienceVolume, Tone.Destination);
      this.ambienceNoise.start();

      // Create static noise (high frequency crackle)
      this.staticNoise = new Tone.Noise('white');
      this.staticFilter = new Tone.Filter({
        type: 'highpass',
        frequency: 2000,
        rolloff: -12
      });
      this.staticVolume = new Tone.Volume(-35); // Very quiet static
      
      this.staticNoise.chain(this.staticFilter, this.staticVolume, Tone.Destination);
      this.staticNoise.start();

      this.audioStarted = true;
      console.log('Background audio started');
    } catch (error) {
      console.error('Failed to start audio:', error);
    }
  }

  /**
   * Play "It's Alive" voice-over from audio file
   * Place your audio file at: /assets/its-alive.mp3 (or .wav, .ogg)
   */
  async playItsAlive(): Promise<void> {
    if (this.muted) return;
    
    if (!this.audioStarted) {
      await this.startAudio();
    }

    try {
      const player = new Tone.Player({
        url: '/assets/its-alive.mp3',
        volume: -5, // Adjust volume as needed
        onload: () => {
          console.log('Its Alive audio loaded');
          player.start();
        }
      }).toDestination();
    } catch (error) {
      console.warn('Could not play Its Alive audio:', error);
    }
  }

  /**
   * Set master volume (0-100)
   */
  setVolume(volume: number): void {
    const dbVolume = (volume / 100) * 20 - 20; // Convert 0-100 to -20 to 0 dB
    Tone.Destination.volume.value = dbVolume;
  }

  /**
   * Increase static intensity (for dramatic moments)
   */
  increaseStatic(duration: number = 1000): void {
    if (!this.staticVolume || this.muted) return;

    // Fade static up then back down
    this.staticVolume.volume.rampTo(-20, 0.1);
    setTimeout(() => {
      this.staticVolume!.volume.rampTo(-35, duration / 1000);
    }, 200);
  }

  /**
   * Play electric zap sound
   */
  playElectricZap(): void {
    if (!this.audioStarted || this.muted) return;

    const synth = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.1
      },
      volume: -10
    }).toDestination();

    synth.triggerAttackRelease('16n');
  }

  /**
   * Play error/failure sound
   */
  playErrorSound(): void {
    if (!this.audioStarted || this.muted) return;

    const synth = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0,
        release: 0.2
      },
      volume: -15
    }).toDestination();

    synth.triggerAttackRelease('C2', '0.3');
  }

  /**
   * Play success chime
   */
  playSuccessSound(): void {
    if (!this.audioStarted || this.muted) return;

    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.2,
        release: 0.5
      },
      volume: -12
    }).toDestination();

    // Play ascending notes
    const now = Tone.now();
    synth.triggerAttackRelease('C4', '0.2', now);
    synth.triggerAttackRelease('E4', '0.2', now + 0.15);
    synth.triggerAttackRelease('G4', '0.3', now + 0.3);
  }

  /**
   * Play start button ding sound
   */
  playStartSound(): void {
    if (!this.audioStarted || this.muted) return;

    const synth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.005,
        decay: 0.2,
        sustain: 0.1,
        release: 0.3
      },
      volume: -10
    }).toDestination();

    // Play a pleasant ding
    const now = Tone.now();
    synth.triggerAttackRelease('G4', '0.15', now);
    synth.triggerAttackRelease('C5', '0.2', now + 0.1);
  }

  /**
   * Stop all audio
   */
  stopAll(): void {
    this.ambienceNoise?.stop();
    this.staticNoise?.stop();
    this.audioStarted = false;
  }

  /**
   * Dispose of all audio resources
   */
  dispose(): void {
    this.ambienceNoise?.dispose();
    this.staticNoise?.dispose();
    this.ambienceFilter?.dispose();
    this.staticFilter?.dispose();
    this.ambienceVolume?.dispose();
    this.staticVolume?.dispose();
  }
}
