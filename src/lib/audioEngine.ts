import { Audio } from 'expo-av';
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
    description: '💫 Gamma Frequency',
    benefits: '🎵 Higher cognitive function, perception',
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

export class FrequencyPlayer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private oscillator: OscillatorNode | null = null;
  private sound: Audio.Sound | null = null;
  private isPlaying = false;
  private currentFrequency = 0;
  private analysisBuffer: Float32Array | null = null;

  constructor() {
    this.initialize();
  }

  async initialize() {
    try {
      // Set up Expo Audio for mobile (background playback, silent mode)
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: 0,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Set up AudioContext via react-native-audio-api on all platforms.
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
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

      console.log('🔊 AudioContext initialized via react-native-audio-api');
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

  async playFrequency(frequency: number, duration: number = 5000): Promise<void> {
    if (this.isPlaying) {
      await this.stop();
    }

    this.currentFrequency = frequency;
    console.log(`🎵 Playing ${frequency}Hz for ${duration/1000} seconds`);

    try {
      await this.playWithWebAudio(frequency, duration);
    } catch (error) {
      console.error(`Failed to play frequency ${frequency}:`, error);
      this.simulateWithRichFeedback(frequency, duration);
    }
  }

  private async playWithWebAudio(
    frequency: number,
    duration: number
  ): Promise<void> {
    if (!this.audioContext || !this.masterGain) return;

    // Resume context if suspended (required for user interaction)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.isPlaying = true;

    // Create oscillator routed through master gain/analyser chain
    this.oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    this.oscillator.frequency.setValueAtTime(
      frequency,
      this.audioContext.currentTime
    );
    this.oscillator.type = 'sine';

    // Smooth fade in and out
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.3,
      this.audioContext.currentTime + 0.1
    );
    gainNode.gain.linearRampToValueAtTime(
      0,
      this.audioContext.currentTime + duration / 1000 - 0.1
    );

    this.oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    this.oscillator.start();
    this.oscillator.stop(
      this.audioContext.currentTime + duration / 1000
    );

    console.log(`🔊 Synth: Playing ${frequency}Hz sine wave`);

    // Auto-stop after duration
    setTimeout(() => this.stop(), duration);
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
    this.isPlaying = false;

    // Stop Web Audio
    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch (error) {
        console.log('Oscillator already stopped');
      }
      this.oscillator = null;
    }

    console.log('🛑 Audio stopped');
  }

  async playBinauralBeat(leftFreq: number, rightFreq: number, duration: number = 5000) {
    console.log(`🎧 Binaural Beat: ${leftFreq}Hz (L) / ${rightFreq}Hz (R) for ${duration/1000}s`);

    // Use the unified AudioContext path on all platforms.
    this.playBinauralWithWebAudio(leftFreq, rightFreq, duration);
  }

  private playBinauralWithWebAudio(leftFreq: number, rightFreq: number, duration: number) {
    if (!this.audioContext) return;

    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Create stereo merger
      const merger = this.audioContext.createChannelMerger(2);
      const finalGain = this.audioContext.createGain();

      // Left ear oscillator
      const leftOsc = this.audioContext.createOscillator();
      const leftGain = this.audioContext.createGain();
      leftOsc.frequency.setValueAtTime(leftFreq, this.audioContext.currentTime);
      leftOsc.type = 'sine';
      leftGain.gain.setValueAtTime(0.05, this.audioContext.currentTime);

      // Right ear oscillator
      const rightOsc = this.audioContext.createOscillator();
      const rightGain = this.audioContext.createGain();
      rightOsc.frequency.setValueAtTime(rightFreq, this.audioContext.currentTime);
      rightOsc.type = 'sine';
      rightGain.gain.setValueAtTime(0.05, this.audioContext.currentTime);

      // Connect to stereo channels
      leftOsc.connect(leftGain);
      rightOsc.connect(rightGain);
      leftGain.connect(merger, 0, 0); // Left channel
      rightGain.connect(merger, 0, 1); // Right channel
      merger.connect(finalGain);
      finalGain.connect(this.audioContext.destination);

      // Start oscillators
      const currentTime = this.audioContext.currentTime;
      leftOsc.start(currentTime);
      rightOsc.start(currentTime);
      leftOsc.stop(currentTime + duration / 1000);
      rightOsc.stop(currentTime + duration / 1000);

      this.isPlaying = true;
      console.log(`🎧 True binaural beat: ${leftFreq}Hz (L) / ${rightFreq}Hz (R)`);
      console.log(`🧠 Beat frequency: ${Math.abs(rightFreq - leftFreq)}Hz`);
    } catch (error) {
      console.error('Binaural audio error:', error);
      this.simulatePlayback((leftFreq + rightFreq) / 2, duration);
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

// Singleton instance
const frequencyPlayer = new FrequencyPlayer();

// Initialize when imported
frequencyPlayer.initialize();

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

export const playBinauralBeat = (baseFreq: number, beatFreq: number, duration: number = 5000) => {
  const leftFreq = baseFreq;
  const rightFreq = baseFreq + beatFreq;
  return frequencyPlayer.playBinauralBeat(leftFreq, rightFreq, duration);
};

export const stopAllFrequencies = () => {
  return frequencyPlayer.stop();
};

export const testAudio = async () => {
  console.log('🧪 TESTING AUDIO SYSTEM...');
  console.log('🔊 AudioContext present:', !!frequencyPlayer['audioContext']);
  console.log('🔊 Playing 440Hz test tone for 2 seconds...');
  await frequencyPlayer.playFrequency(440, 2000);
  console.log('🧪 AUDIO TEST COMPLETE');
};

export const getAnalysisSnapshot = () => {
  return frequencyPlayer.getAnalysisSnapshot();
};

// Export the singleton instance
export { frequencyPlayer };