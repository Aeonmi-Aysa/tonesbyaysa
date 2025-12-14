import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { AudioContext } from 'react-native-audio-api';

interface FrequencyInfo {
  frequency: number;
  description: string;
  benefits: string;
  filename: string;
}

const FREQUENCY_MAP: Record<number, FrequencyInfo> = {
  174: {
    frequency: 174,
    description: '💫 Root Chakra Frequency',
    benefits: '🎵 Grounding, pain relief, stability',
    filename: '174hz.wav'
  },
  285: {
    frequency: 285,
    description: '💫 Sacral Chakra Frequency',
    benefits: '🎵 Creativity, energy, vitality',
    filename: '285hz.wav'
  },
  396: {
    frequency: 396,
    description: '💫 Liberation Frequency',
    benefits: '🎵 Freedom, relief, release',
    filename: '396hz.wav'
  },
  417: {
    frequency: 417,
    description: '💫 Transformation Frequency',
    benefits: '🎵 Change, growth, renewal',
    filename: '417hz.wav'
  },
  528: {
    frequency: 528,
    description: '💫 Love & DNA Repair Frequency',
    benefits: '🎵 Healing, love, transformation',
    filename: '528hz.wav'
  },
  639: {
    frequency: 639,
    description: '💫 Heart Chakra Frequency',
    benefits: '🎵 Communication, relationships, harmony',
    filename: '639hz.wav'
  },
  741: {
    frequency: 741,
    description: '💫 Awakening Intuition',
    benefits: '🎵 Self-expression, truth, intuition',
    filename: '741hz.wav'
  },
  852: {
    frequency: 852,
    description: '💫 Spiritual Awakening',
    benefits: '🎵 Spiritual awareness, divine connection',
    filename: '852hz.wav'
  },
  963: {
    frequency: 963,
    description: '💫 Divine Connection',
    benefits: '🎵 Universal energy, higher consciousness',
    filename: '963hz.wav'
  },
  256: {
    frequency: 256,
    description: '💫 Root Frequency',
    benefits: '🎵 Grounding, stability, foundation',
    filename: '256hz.wav'
  },
  288: {
    frequency: 288,
    description: '💫 Sacral Frequency',
    benefits: '🎵 Creativity, passion, flow',
    filename: '288hz.wav'
  },
  320: {
    frequency: 320,
    description: '💫 Solar Plexus Frequency',
    benefits: '🎵 Confidence, personal power, will',
    filename: '320hz.wav'
  },
  341: {
    frequency: 341,
    description: '💫 Heart Frequency',
    benefits: '🎵 Love, compassion, connection',
    filename: '341hz.wav'
  },
  384: {
    frequency: 384,
    description: '💫 Throat Frequency',
    benefits: '🎵 Communication, expression, truth',
    filename: '384hz.wav'
  },
  426: {
    frequency: 426,
    description: '💫 Third Eye Frequency',
    benefits: '🎵 Intuition, insight, wisdom',
    filename: '426hz.wav'
  },
  480: {
    frequency: 480,
    description: '💫 Crown Frequency',
    benefits: '🎵 Spiritual connection, enlightenment',
    filename: '480hz.wav'
  },
  40: {
    frequency: 40,
    description: '💫 Gamma Brainwave (MIT Research-Backed)',
    benefits: '🎵 Peak cognition, memory enhancement, focus. Based on peer-reviewed MIT gamma entrainment studies showing cognitive benefits.',
    filename: '40hz.wav'
  },
  60: {
    frequency: 60,
    description: '💫 Theta Frequency',
    benefits: '🎵 Deep relaxation, meditation, creativity',
    filename: '60hz.wav'
  },
  80: {
    frequency: 80,
    description: '💫 Alpha Frequency',
    benefits: '🎵 Relaxation, stress relief, learning',
    filename: '80hz.wav'
  },
  100: {
    frequency: 100,
    description: '💫 High Alpha Frequency',
    benefits: '🎵 Mental clarity, focus, calm',
    filename: '100hz.wav'
  },
  120: {
    frequency: 120,
    description: '💫 Low Beta Frequency',
    benefits: '🎵 Alertness, concentration, cognition',
    filename: '120hz.wav'
  },
  150: {
    frequency: 150,
    description: '💫 Mid Beta Frequency',
    benefits: '🎵 Active thinking, problem solving',
    filename: '150hz.wav'
  },
  200: {
    frequency: 200,
    description: '💫 High Beta Frequency',
    benefits: '🎵 High focus, stress, anxiety relief',
    filename: '200hz.wav'
  }
};

// File-based modules are no longer used; playback is fully synthesized.
// This remains as an empty map so older helper code can safely query it.
const FREQUENCY_AUDIO_MODULES: Record<number, any> = {};

// Waveform types supported by the oscillator
export type WaveformType = 'sine' | 'square' | 'sawtooth' | 'triangle';

export const WAVEFORM_OPTIONS: { type: WaveformType; label: string; icon: string; description: string }[] = [
  { type: 'sine', label: 'Sine', icon: '〰️', description: 'Smooth, pure tone - best for meditation' },
  { type: 'square', label: 'Square', icon: '⬜', description: 'Rich harmonics - energizing' },
  { type: 'sawtooth', label: 'Sawtooth', icon: '📐', description: 'Bright, buzzy - stimulating' },
  { type: 'triangle', label: 'Triangle', icon: '🔺', description: 'Soft harmonics - calming' }
];

export class FrequencyPlayer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private oscillator: OscillatorNode | null = null;
  private oscillatorGain: GainNode | null = null;
  // Binaural beat oscillators
  private carrierOsc: OscillatorNode | null = null;
  private lfoOsc: OscillatorNode | null = null;
  private carrierGain: GainNode | null = null;
  private sound: Audio.Sound | null = null;
  private isPlaying = false;
  private currentFrequency = 0;
  private currentWaveform: WaveformType = 'sine';
  private analysisBuffer: Float32Array | null = null;
  private stopTimeout: NodeJS.Timeout | null = null;
  private initialized = false;

  constructor() {
    this.initialize();
  }

  async initialize() {
    // Prevent double initialization
    if (this.initialized) {
      console.log('🔊 AudioContext already initialized, skipping');
      return;
    }
    
    try {
      // Set up Expo Audio for mobile (background playback, silent mode)
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: 0,
        shouldDuckAndroid: false, // Don't let other apps duck our audio
        playThroughEarpieceAndroid: false,
      });

      // Set up AudioContext via react-native-audio-api on all platforms.
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
        console.log('🎧 New AudioContext created, state:', this.audioContext.state);
      }

      const ctx = this.audioContext;
      const masterGain = ctx.createGain();
      const analyser = ctx.createAnalyser();

      masterGain.gain.setValueAtTime(0.3, ctx.currentTime);
      masterGain.connect(analyser);
      analyser.connect(ctx.destination);
      analyser.fftSize = 2048;

      this.masterGain = masterGain;
      this.analyser = analyser;
      this.analysisBuffer = new Float32Array(analyser.frequencyBinCount);
      this.initialized = true;

      console.log(`🔊 AudioContext initialized: state=${ctx.state}, sampleRate=${ctx.sampleRate}`);
    } catch (error) {
      console.error('Audio initialization failed:', error);
    }
  }

  private isWebPlatform(): boolean {
    return Platform.OS === 'web' ||
      (typeof window !== 'undefined' && typeof document !== 'undefined');
  }

  private hasWebAudio(): boolean {
    return this.audioContext !== null;
  }

  async playFrequency(frequency: number, duration: number = 5000, waveform: WaveformType = 'sine'): Promise<void> {
    if (this.isPlaying) {
      await this.stop();
    }

    // Frequency range validation and handling
    // Human hearing: ~20Hz - 20kHz, most phone speakers: ~80-100Hz minimum
    const MIN_AUDIBLE = 20;          // Below this, frequency is truly sub-audible
    const SPEAKER_MIN = 80;          // Phone speakers can't reproduce below ~80Hz
    const MAX_PRACTICAL = 15000;     // Most phone speakers can't produce above this
    
    // Clamp very high frequencies to practical speaker limits
    let effectiveFreq = frequency;
    if (frequency > MAX_PRACTICAL) {
      console.log(`⚠️ ${frequency}Hz exceeds speaker limits, clamping to ${MAX_PRACTICAL}Hz`);
      effectiveFreq = MAX_PRACTICAL;
    }
    
    // For sub-audible frequencies (<20Hz), automatically use isochronic tones
    if (frequency < MIN_AUDIBLE) {
      console.log(`🧠 ${frequency}Hz is sub-audible, using isochronic modulation`);
      await this.playBinauralBeat(200, frequency, duration); // 200Hz carrier pulsing at target rate
      return;
    }
    
    // For low frequencies (20-80Hz) that phone speakers can't reproduce well,
    // use isochronic beats (carrier pulsing at target frequency) for brainwave entrainment
    // This includes gamma waves (40Hz), low beta, and theta ranges
    if (frequency >= MIN_AUDIBLE && frequency < SPEAKER_MIN) {
      console.log(`🧠 ${frequency}Hz is below speaker range (~${SPEAKER_MIN}Hz), using isochronic entrainment for optimal effect`);
      console.log(`📱 For raw ${frequency}Hz tone, use headphones. Playing as isochronic beat instead.`);
      await this.playBinauralBeat(200, frequency, duration); // 200Hz carrier pulsing at target gamma/theta rate
      return;
    }

    this.currentFrequency = effectiveFreq;
    this.currentWaveform = waveform;
    console.log(`🎵 Playing ${effectiveFreq}Hz ${waveform} wave for ${duration/1000} seconds`);

    try {
      await this.playWithWebAudio(effectiveFreq, duration, waveform);
    } catch (error) {
      console.error(`Failed to play frequency ${effectiveFreq}:`, error);
      this.simulateWithRichFeedback(effectiveFreq, duration);
    }
  }

  setWaveform(waveform: WaveformType): void {
    this.currentWaveform = waveform;
    // If currently playing, update the oscillator type
    if (this.oscillator && this.isPlaying) {
      this.oscillator.type = waveform;
      console.log(`🎛️ Waveform changed to ${waveform}`);
    }
  }

  getWaveform(): WaveformType {
    return this.currentWaveform;
  }

  private async playWithWebAudio(
    frequency: number,
    duration: number,
    waveform: WaveformType = 'sine'
  ): Promise<void> {
    if (!this.audioContext || !this.masterGain) return;

    // Clear any existing stop timeout
    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout);
      this.stopTimeout = null;
    }

    // Resume context if suspended (required for user interaction)
    if (this.audioContext.state === 'suspended') {
      console.log('🎧 Resuming suspended AudioContext...');
      await this.audioContext.resume();
      console.log('🎧 AudioContext resumed, state:', this.audioContext.state);
    }

    this.isPlaying = true;

    // Create oscillator routed through master gain/analyser chain
    this.oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    this.oscillatorGain = gainNode;

    this.oscillator.frequency.setValueAtTime(
      frequency,
      this.audioContext.currentTime
    );
    this.oscillator.type = waveform;

    // Adjust gain based on waveform (non-sine waves are louder due to harmonics)
    const baseGain = waveform === 'sine' ? 0.3 : 0.15;

    // Calculate fade times (minimum duration of 0.3s for fades)
    const fadeTime = Math.min(0.1, duration / 1000 / 4);
    const durationSec = duration / 1000;

    // Smooth fade in and out
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      baseGain,
      this.audioContext.currentTime + fadeTime
    );
    
    // Only add fade out if duration is long enough
    if (durationSec > fadeTime * 2) {
      gainNode.gain.setValueAtTime(
        baseGain,
        this.audioContext.currentTime + durationSec - fadeTime
      );
      gainNode.gain.linearRampToValueAtTime(
        0,
        this.audioContext.currentTime + durationSec
      );
    }

    this.oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    this.oscillator.start();
    
    console.log(`🔊 Synth: Playing ${frequency}Hz ${waveform === 'sine' ? '〰️' : waveform === 'square' ? '⬜' : waveform === 'sawtooth' ? '📐' : '🔺'} ${waveform} wave, gain=${baseGain}, ctx.state=${this.audioContext.state}`);
    
    // Schedule oscillator stop (this handles the actual audio stopping)
    this.oscillator.stop(this.audioContext.currentTime + durationSec);

    // Clean up state after duration (but don't call stop() which would try to stop again)
    this.stopTimeout = setTimeout(() => {
      this.isPlaying = false;
      this.oscillator = null;
      this.oscillatorGain = null;
      console.log('🏁 Playback complete');
    }, duration);
  }

  private async playWithExpoAudio(
    frequency: number,
    duration: number
  ): Promise<void> {
    const audioModule = this.getAudioFileForFrequency(frequency);

    if (!audioModule) {
      throw new Error(`No audio file for frequency ${frequency}`);
    }

    this.isPlaying = true;

    try {
      const { sound } = await Audio.Sound.createAsync(
        // For native we pass the module id from require(), not a URI string.
        audioModule,
        {
          shouldPlay: true,
          isLooping: false,
          volume: 0.7,
          progressUpdateIntervalMillis: 1000
        }
      );

      this.sound = sound;
      console.log(`🔊 MOBILE: Playing ${frequency}Hz file for ${duration/1000}s`);

      // Set up completion handler
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          console.log(`✅ Audio file playback complete`);
          this.stop();
        }
      });

      // Auto-stop after duration (in case file is longer)
      setTimeout(() => this.stop(), duration);
    } catch (error) {
      throw error;
    }
  }

  private getAudioFileForFrequency(frequency: number): any | null {
    // File-based playback has been retired in favor of live synthesis.
    return FREQUENCY_AUDIO_MODULES[frequency] ?? null;
  }

  private getFrequencyInfo(frequency: number): FrequencyInfo {
    return FREQUENCY_MAP[frequency] || {
      frequency,
      description: `💫 ${frequency}Hz Healing Frequency`,
      benefits: '🎵 Promotes balance, healing, and well-being',
      filename: `${frequency}hz.wav`
    };
  }

  private simulateWithRichFeedback(
    frequency: number,
    duration: number
  ): void {
    const info = this.getFrequencyInfo(frequency);
    console.log(`🎧 MOBILE: ${info.description}`);
    console.log(`💫 ${info.benefits}`);

    this.isPlaying = true;

    // Progress feedback
    let countdown = Math.ceil(duration / 1000);
    const interval = setInterval(() => {
      countdown -= 1;
      if (countdown % 10 === 0 && countdown > 0) { // Log every 10 seconds
        console.log(`🔊 ${frequency}Hz playing... ${countdown}s remaining`);
      }
      if (countdown <= 0) {
        clearInterval(interval);
        console.log(`✅ ${frequency}Hz healing session complete`);
        this.isPlaying = false;
      }
    }, 1000);

    setTimeout(() => this.stop(), duration);
  }

  async stop(): Promise<void> {
    // Don't do anything if not actually playing
    if (!this.isPlaying && !this.oscillator && !this.carrierOsc && !this.stopTimeout) {
      return;
    }

    // Clear any pending stop timeout
    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout);
      this.stopTimeout = null;
    }

    this.isPlaying = false;

    // Stop regular oscillator
    if (this.oscillator) {
      try {
        // Fade out quickly to avoid click
        if (this.oscillatorGain && this.audioContext) {
          this.oscillatorGain.gain.cancelScheduledValues(this.audioContext.currentTime);
          this.oscillatorGain.gain.setValueAtTime(
            this.oscillatorGain.gain.value,
            this.audioContext.currentTime
          );
          this.oscillatorGain.gain.linearRampToValueAtTime(
            0,
            this.audioContext.currentTime + 0.05
          );
        }
        this.oscillator.stop(this.audioContext ? this.audioContext.currentTime + 0.05 : 0);
        this.oscillator.disconnect();
      } catch (error) {
        // Oscillator may have already stopped - this is fine
      }
      this.oscillator = null;
      this.oscillatorGain = null;
    }

    // Stop binaural/isochronic oscillators
    if (this.carrierOsc) {
      try {
        // Fade out carrier
        if (this.carrierGain && this.audioContext) {
          this.carrierGain.gain.cancelScheduledValues(this.audioContext.currentTime);
          this.carrierGain.gain.linearRampToValueAtTime(
            0,
            this.audioContext.currentTime + 0.05
          );
        }
        this.carrierOsc.stop(this.audioContext ? this.audioContext.currentTime + 0.05 : 0);
        this.carrierOsc.disconnect();
      } catch (error) {
        // Oscillator may have already stopped
      }
      this.carrierOsc = null;
      this.carrierGain = null;
    }

    if (this.lfoOsc) {
      try {
        this.lfoOsc.stop(this.audioContext ? this.audioContext.currentTime + 0.05 : 0);
        this.lfoOsc.disconnect();
      } catch (error) {
        // Oscillator may have already stopped
      }
      this.lfoOsc = null;
    }

    // Stop bath oscillators (multiple layered frequencies)
    const bathOscs = (this as any)._bathOscillators;
    const bathGains = (this as any)._bathGains;
    if (bathOscs && Array.isArray(bathOscs)) {
      for (const osc of bathOscs) {
        try {
          osc.stop(this.audioContext ? this.audioContext.currentTime + 0.05 : 0);
          osc.disconnect();
        } catch (error) {
          // Already stopped
        }
      }
      (this as any)._bathOscillators = null;
    }
    if (bathGains && Array.isArray(bathGains)) {
      for (const gain of bathGains) {
        try {
          if (this.audioContext) {
            gain.gain.cancelScheduledValues(this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.05);
          }
        } catch (error) {
          // Already disconnected
        }
      }
      (this as any)._bathGains = null;
    }

    console.log('🛑 Audio stopped');
  }

  /**
   * Play an isochronic/binaural beat for brainwave entrainment
   * @param carrierFreq - The audible carrier frequency (e.g., 200Hz)
   * @param beatFreq - The brainwave entrainment frequency (e.g., 4Hz for theta)
   * @param duration - Duration in milliseconds
   */
  async playBinauralBeat(carrierFreq: number, beatFreq: number, duration: number = 5000) {
    // Stop any currently playing audio first
    if (this.isPlaying) {
      await this.stop();
    }
    
    console.log(`🎧 Brainwave Entrainment: ${carrierFreq}Hz carrier, ${beatFreq}Hz beat for ${duration/1000}s`);

    // Use the unified AudioContext path on all platforms.
    this.playIsochronicBeat(carrierFreq, beatFreq, duration);
  }

  private playIsochronicBeat(carrierFreq: number, beatFreq: number, duration: number) {
    if (!this.audioContext || !this.masterGain) return;

    // Clear any existing stop timeout
    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout);
      this.stopTimeout = null;
    }

    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Isochronic tones: A carrier frequency that pulses on/off at the beat frequency
      // This creates a perceivable rhythmic pattern that entrains brainwaves
      
      // Primary carrier oscillator - store as class property for stop()
      this.carrierOsc = this.audioContext.createOscillator();
      this.carrierGain = this.audioContext.createGain();
      this.carrierOsc.frequency.setValueAtTime(carrierFreq, this.audioContext.currentTime);
      this.carrierOsc.type = 'sine';

      // LFO for amplitude modulation at beat frequency - store as class property
      this.lfoOsc = this.audioContext.createOscillator();
      const lfoGain = this.audioContext.createGain();
      this.lfoOsc.frequency.setValueAtTime(beatFreq, this.audioContext.currentTime);
      // Use sine for smoother pulses (less harsh than square)
      this.lfoOsc.type = 'sine';
      
      // Higher modulation depth for more pronounced pulses (0.4 = 80% volume swing)
      lfoGain.gain.setValueAtTime(0.4, this.audioContext.currentTime);

      // Route LFO to carrier gain (AM synthesis)
      this.lfoOsc.connect(lfoGain);
      lfoGain.connect(this.carrierGain.gain);

      // Base carrier level (0.5 so pulses range from 0.1 to 0.9)
      this.carrierGain.gain.setValueAtTime(0.5, this.audioContext.currentTime);

      // Connect carrier to output
      this.carrierOsc.connect(this.carrierGain);
      this.carrierGain.connect(this.masterGain);

      // Start both oscillators
      const currentTime = this.audioContext.currentTime;
      const durationSec = duration / 1000;
      this.carrierOsc.start(currentTime);
      this.lfoOsc.start(currentTime);
      this.carrierOsc.stop(currentTime + durationSec);
      this.lfoOsc.stop(currentTime + durationSec);

      this.isPlaying = true;
      this.currentFrequency = beatFreq; // Track the brainwave frequency
      
      // Helpful brainwave state descriptions
      let brainwaveState = '';
      if (beatFreq <= 4) brainwaveState = 'Delta (deep sleep/healing)';
      else if (beatFreq <= 8) brainwaveState = 'Theta (meditation/creativity)';
      else if (beatFreq <= 12) brainwaveState = 'Alpha (relaxation/learning)';
      else if (beatFreq <= 30) brainwaveState = 'Beta (focus/alertness)';
      else brainwaveState = 'Gamma (peak awareness)';
      
      console.log(`🧠 Isochronic Beat: ${carrierFreq}Hz carrier pulsing at ${beatFreq}Hz`);
      console.log(`🌊 Target brainwave: ${brainwaveState}`);

      // Clean up state after duration (oscillators auto-stop, just update state)
      if (this.stopTimeout) clearTimeout(this.stopTimeout);
      this.stopTimeout = setTimeout(() => {
        this.isPlaying = false;
        this.carrierOsc = null;
        this.lfoOsc = null;
        this.carrierGain = null;
        console.log('🏁 Binaural beat complete');
      }, duration);
    } catch (error) {
      console.error('Binaural audio error:', error);
      // Fallback: simulate with carrier frequency
      this.simulatePlayback(carrierFreq, duration);
    }
  }

  private simulatePlayback(frequency: number, duration: number) {
    this.isPlaying = true;
    console.log(`🎧 Simulating ${frequency}Hz healing frequency for ${duration/1000}s`);
    console.log(`💫 Visualize the healing energy of ${frequency}Hz flowing through you`);

    // Provide helpful feedback
    if (frequency === 528) {
      console.log('💚 Love frequency - DNA repair and transformation');
    } else if (frequency === 741) {
      console.log('💙 Awakening intuition - self-expression and truth');
    } else if (frequency === 396) {
      console.log('❤️ Liberating fear and guilt - grounding energy');
    }

    // Auto-stop simulation
    setTimeout(() => {
      this.isPlaying = false;
      console.log(`✅ ${frequency}Hz healing session complete`);
    }, duration);
  }

  getAnalysisSnapshot(): { peakHz: number | null; displayHz: number | null; isLocked: boolean; normalizedSpectrum: number[] } | null {
    if (!this.audioContext || !this.analyser || !this.analysisBuffer) {
      return null;
    }

    const ctx = this.audioContext;
    const analyser = this.analyser;
    const buffer = this.analysisBuffer;

    analyser.getFloatFrequencyData(buffer);

    let maxMag = -Infinity;
    let maxIndex = -1;

    for (let i = 0; i < buffer.length; i++) {
      const v = buffer[i];
      if (v > maxMag) {
        maxMag = v;
        maxIndex = i;
      }
    }

    const nyquist = ctx.sampleRate / 2;
    const binWidth = nyquist / buffer.length;
    const peakHz = maxIndex >= 0 ? maxIndex * binWidth : null;

    const bands = 32;
    const normalizedSpectrum: number[] = [];

    for (let band = 0; band < bands; band++) {
      const start = Math.floor((band / bands) * buffer.length);
      const end = Math.floor(((band + 1) / bands) * buffer.length);
      let bandMax = -Infinity;

      for (let i = start; i < end; i++) {
        if (buffer[i] > bandMax) {
          bandMax = buffer[i];
        }
      }

      if (!Number.isFinite(bandMax)) {
        bandMax = -160;
      }

      const norm = Math.min(1, Math.max(0, (bandMax + 120) / 60));
      normalizedSpectrum.push(norm);
    }

    const dominantTarget = this.currentFrequency || null;
    const displayHz = dominantTarget ?? peakHz;
    const isLocked =
      displayHz != null &&
      peakHz != null &&
      Math.abs(displayHz - peakHz) < 0.05;

    return {
      peakHz,
      displayHz,
      isLocked,
      normalizedSpectrum
    };
  }

  getCurrentFrequency(): number {
    return this.currentFrequency;
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }
}

// Singleton instance - persists across hot reloads using global
declare const global: any;

const MODULE_LOAD_ID = Math.random().toString(36).substring(7);
console.log(`📦 audioEngine module loading, ID: ${MODULE_LOAD_ID}`);

function getFrequencyPlayer(): FrequencyPlayer {
  // Store on global to survive hot reloads
  if (!global.__HEALTONE_FREQUENCY_PLAYER__) {
    console.log(`📦 Creating new FrequencyPlayer (module ${MODULE_LOAD_ID})`);
    global.__HEALTONE_FREQUENCY_PLAYER__ = new FrequencyPlayer();
  } else {
    console.log(`📦 Reusing existing FrequencyPlayer (module ${MODULE_LOAD_ID})`);
  }
  return global.__HEALTONE_FREQUENCY_PLAYER__;
}

const frequencyPlayer = getFrequencyPlayer();

// Don't call initialize again - constructor already does it

// Helper functions for common frequency types
export const playHealingFrequency = (frequency: number, duration: number = 5000) => {
  return frequencyPlayer.playFrequency(frequency, duration);
};

export const playSolfeggioFrequency = (frequency: number, duration: number = 5000) => {
  return frequencyPlayer.playFrequency(frequency, duration);
};

export const playChakraFrequency = (frequency: number, duration: number = 5000) => {
  return frequencyPlayer.playFrequency(frequency, duration);
};

export const playBinauralBeat = (carrierFreq: number, beatFreq: number, duration: number = 5000) => {
  return frequencyPlayer.playBinauralBeat(carrierFreq, beatFreq, duration);
};

export const stopAllFrequencies = () => {
  return frequencyPlayer.stop();
};

export const testAudio = async () => {
  console.log('🧪 TESTING AUDIO SYSTEM...');
  console.log('🔊 AudioContext present:', !!frequencyPlayer['audioContext']);
  
  // Try direct, simple oscillator test
  const ctx = frequencyPlayer['audioContext'];
  if (ctx) {
    console.log(`🧪 Context state: ${ctx.state}, sampleRate: ${ctx.sampleRate}`);
    
    if (ctx.state === 'suspended') {
      await ctx.resume();
      console.log('🧪 Context resumed, new state:', ctx.state);
    }
    
    // Direct oscillator test - bypass all abstraction
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.5, ctx.currentTime); // High volume
    
    osc.connect(gain);
    gain.connect(ctx.destination); // Direct to destination
    
    console.log('🧪 Starting direct oscillator test (440Hz, 0.5 gain, direct to destination)...');
    osc.start();
    osc.stop(ctx.currentTime + 2);
    
    console.log('🧪 Direct test started - you should hear 440Hz beep for 2 seconds');
  }
  
  console.log('🧪 AUDIO TEST COMPLETE');
};

export const getAnalysisSnapshot = () => {
  return frequencyPlayer.getAnalysisSnapshot();
};

/**
 * Play a frequency bath (multiple layered frequencies)
 * Each frequency is played simultaneously at reduced volume to create harmonious layering
 * @param frequencies - Array of Hz values to layer together
 * @param duration - Duration in milliseconds
 */
export const playFrequencyBath = async (frequencies: number[], duration: number = 30 * 60 * 1000) => {
  // Stop any currently playing audio
  await frequencyPlayer.stop();
  
  if (!frequencyPlayer['audioContext'] || !frequencyPlayer['masterGain']) {
    console.error('Audio not initialized');
    return;
  }
  
  const ctx = frequencyPlayer['audioContext'];
  const masterGain = frequencyPlayer['masterGain'];
  
  // Resume context if suspended
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  
  console.log(`🛁 Playing bath with ${frequencies.length} frequencies: [${frequencies.join(', ')}]Hz`);
  
  // Create an array to track all oscillators for this bath
  const oscillators: OscillatorNode[] = [];
  const gains: GainNode[] = [];
  
  // Calculate volume per oscillator (divide evenly, with reduction to avoid clipping)
  const volumePerOsc = 0.25 / frequencies.length;
  
  const currentTime = ctx.currentTime;
  const durationSec = duration / 1000;
  const fadeTime = 0.15;
  
  for (const freq of frequencies) {
    // Handle sub-audible frequencies differently
    if (freq < 20) {
      // For sub-audible frequencies in baths, use AM synthesis
      const carrier = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const carrierGain = ctx.createGain();
      const lfoGain = ctx.createGain();
      
      // Carrier at 200Hz, modulated at brainwave frequency
      carrier.frequency.setValueAtTime(200, currentTime);
      carrier.type = 'sine';
      
      lfo.frequency.setValueAtTime(freq, currentTime);
      lfo.type = 'sine';
      lfoGain.gain.setValueAtTime(0.3, currentTime);
      
      lfo.connect(lfoGain);
      lfoGain.connect(carrierGain.gain);
      
      // Fade in
      carrierGain.gain.setValueAtTime(0, currentTime);
      carrierGain.gain.linearRampToValueAtTime(volumePerOsc * 0.5, currentTime + fadeTime);
      
      carrier.connect(carrierGain);
      carrierGain.connect(masterGain);
      
      carrier.start(currentTime);
      lfo.start(currentTime);
      carrier.stop(currentTime + durationSec);
      lfo.stop(currentTime + durationSec);
      
      oscillators.push(carrier, lfo);
      gains.push(carrierGain);
    } else {
      // For audible frequencies, clamp if needed and play directly
      let effectiveFreq = freq;
      if (freq > 15000) {
        effectiveFreq = 15000;
        console.log(`⚠️ Clamping ${freq}Hz to 15000Hz for bath`);
      }
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.frequency.setValueAtTime(effectiveFreq, currentTime);
      osc.type = 'sine';
      
      // Fade in
      gain.gain.setValueAtTime(0, currentTime);
      gain.gain.linearRampToValueAtTime(volumePerOsc, currentTime + fadeTime);
      
      // Fade out
      if (durationSec > fadeTime * 2) {
        gain.gain.setValueAtTime(volumePerOsc, currentTime + durationSec - fadeTime);
        gain.gain.linearRampToValueAtTime(0, currentTime + durationSec);
      }
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.start(currentTime);
      osc.stop(currentTime + durationSec);
      
      oscillators.push(osc);
      gains.push(gain);
    }
  }
  
  // Store oscillators for cleanup on stop
  // We'll use the first oscillator for the main reference
  if (oscillators.length > 0) {
    frequencyPlayer['oscillator'] = oscillators[0];
    frequencyPlayer['oscillatorGain'] = gains[0];
    frequencyPlayer['isPlaying'] = true;
    
    // Store additional oscillators for cleanup
    (frequencyPlayer as any)._bathOscillators = oscillators;
    (frequencyPlayer as any)._bathGains = gains;
  }
  
  // Set timeout to clean up state
  const timeout = setTimeout(() => {
    frequencyPlayer['isPlaying'] = false;
    frequencyPlayer['oscillator'] = null;
    frequencyPlayer['oscillatorGain'] = null;
    (frequencyPlayer as any)._bathOscillators = null;
    (frequencyPlayer as any)._bathGains = null;
    console.log('🛁 Bath complete');
  }, duration);
  
  frequencyPlayer['stopTimeout'] = timeout;
};
// Export the singleton instance
export { frequencyPlayer };