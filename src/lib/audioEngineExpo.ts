/**
 * Audio Engine for HealTone - Pure Expo-AV Implementation
 * 
 * This engine generates frequency tones by creating WAV audio buffers
 * and playing them with expo-av. Works on all platforms without native modules.
 */

import { Audio, AVPlaybackStatus } from 'expo-av';
import { Platform } from 'react-native';

// Waveform types
export type WaveformType = 'sine' | 'square' | 'sawtooth' | 'triangle';

export const WAVEFORM_OPTIONS: { type: WaveformType; label: string; icon: string; description: string }[] = [
  { type: 'sine', label: 'Sine', icon: '〰️', description: 'Smooth, pure tone - best for meditation' },
  { type: 'square', label: 'Square', icon: '⬜', description: 'Rich harmonics - energizing' },
  { type: 'sawtooth', label: 'Sawtooth', icon: '📐', description: 'Bright, buzzy - stimulating' },
  { type: 'triangle', label: 'Triangle', icon: '🔺', description: 'Soft harmonics - calming' }
];

interface FrequencyInfo {
  frequency: number;
  description: string;
  benefits: string;
}

const FREQUENCY_MAP: Record<number, FrequencyInfo> = {
  174: { frequency: 174, description: '💫 Root Chakra Frequency', benefits: '🎵 Grounding, deep comfort, stability' },
  285: { frequency: 285, description: '💫 Sacral Chakra Frequency', benefits: '🎵 Creativity, energy, vitality' },
  396: { frequency: 396, description: '💫 Liberation Frequency', benefits: '🎵 Freedom, relief, release' },
  417: { frequency: 417, description: '💫 Transformation Frequency', benefits: '🎵 Change, growth, renewal' },
  528: { frequency: 528, description: '💫 Love & Harmony Frequency', benefits: '🎵 Wellness, love, transformation' },
  639: { frequency: 639, description: '💫 Heart Chakra Frequency', benefits: '🎵 Communication, relationships, harmony' },
  741: { frequency: 741, description: '💫 Awakening Intuition', benefits: '🎵 Self-expression, truth, intuition' },
  852: { frequency: 852, description: '💫 Spiritual Awakening', benefits: '🎵 Spiritual awareness, divine connection' },
  963: { frequency: 963, description: '💫 Divine Connection', benefits: '🎵 Universal energy, higher consciousness' },
  40: { frequency: 40, description: '💫 Gamma Brainwave (MIT Research-Backed)', benefits: '🎵 Peak cognition, memory enhancement, focus' },
};

// WAV file generation helpers
function createWavHeader(dataLength: number, sampleRate: number, channels: number = 1, bitsPerSample: number = 16): ArrayBuffer {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);
  
  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  
  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels * bitsPerSample / 8, true); // ByteRate
  view.setUint16(32, channels * bitsPerSample / 8, true); // BlockAlign
  view.setUint16(34, bitsPerSample, true);
  
  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);
  
  return buffer;
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function generateWaveformSample(phase: number, waveform: WaveformType): number {
  switch (waveform) {
    case 'sine':
      return Math.sin(phase);
    case 'square':
      return Math.sin(phase) >= 0 ? 1 : -1;
    case 'sawtooth':
      return 2 * ((phase / (2 * Math.PI)) % 1) - 1;
    case 'triangle':
      const t = (phase / (2 * Math.PI)) % 1;
      return 4 * Math.abs(t - 0.5) - 1;
    default:
      return Math.sin(phase);
  }
}

function generateToneWavData(
  frequency: number,
  durationMs: number,
  sampleRate: number = 44100,
  waveform: WaveformType = 'sine',
  amplitude: number = 0.5
): ArrayBuffer {
  const numSamples = Math.floor(sampleRate * (durationMs / 1000));
  const dataLength = numSamples * 2; // 16-bit = 2 bytes per sample
  
  const header = createWavHeader(dataLength, sampleRate);
  const headerArray = new Uint8Array(header);
  
  const dataBuffer = new ArrayBuffer(dataLength);
  const dataView = new DataView(dataBuffer);
  
  // Fade in/out time in samples (50ms)
  const fadeLength = Math.min(Math.floor(sampleRate * 0.05), numSamples / 4);
  
  for (let i = 0; i < numSamples; i++) {
    const phase = 2 * Math.PI * frequency * i / sampleRate;
    let sample = generateWaveformSample(phase, waveform);
    
    // Apply fade in
    if (i < fadeLength) {
      sample *= i / fadeLength;
    }
    // Apply fade out
    if (i > numSamples - fadeLength) {
      sample *= (numSamples - i) / fadeLength;
    }
    
    // Apply amplitude and convert to 16-bit integer
    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * amplitude * 32767)));
    dataView.setInt16(i * 2, intSample, true);
  }
  
  // Combine header and data
  const fullBuffer = new ArrayBuffer(44 + dataLength);
  const fullArray = new Uint8Array(fullBuffer);
  fullArray.set(headerArray);
  fullArray.set(new Uint8Array(dataBuffer), 44);
  
  return fullBuffer;
}

// Generate binaural beat WAV (stereo)
function generateBinauralBeatWavData(
  baseFrequency: number,
  beatFrequency: number,
  durationMs: number,
  sampleRate: number = 44100,
  amplitude: number = 0.5
): ArrayBuffer {
  const numSamples = Math.floor(sampleRate * (durationMs / 1000));
  const dataLength = numSamples * 4; // 16-bit stereo = 4 bytes per sample
  
  const header = createWavHeader(dataLength, sampleRate, 2);
  const headerArray = new Uint8Array(header);
  
  const dataBuffer = new ArrayBuffer(dataLength);
  const dataView = new DataView(dataBuffer);
  
  const leftFreq = baseFrequency - beatFrequency / 2;
  const rightFreq = baseFrequency + beatFrequency / 2;
  
  const fadeLength = Math.min(Math.floor(sampleRate * 0.05), numSamples / 4);
  
  for (let i = 0; i < numSamples; i++) {
    const leftPhase = 2 * Math.PI * leftFreq * i / sampleRate;
    const rightPhase = 2 * Math.PI * rightFreq * i / sampleRate;
    
    let leftSample = Math.sin(leftPhase);
    let rightSample = Math.sin(rightPhase);
    
    // Apply fade
    let fadeMultiplier = 1;
    if (i < fadeLength) {
      fadeMultiplier = i / fadeLength;
    } else if (i > numSamples - fadeLength) {
      fadeMultiplier = (numSamples - i) / fadeLength;
    }
    
    leftSample *= fadeMultiplier * amplitude;
    rightSample *= fadeMultiplier * amplitude;
    
    const leftInt = Math.max(-32768, Math.min(32767, Math.floor(leftSample * 32767)));
    const rightInt = Math.max(-32768, Math.min(32767, Math.floor(rightSample * 32767)));
    
    dataView.setInt16(i * 4, leftInt, true);
    dataView.setInt16(i * 4 + 2, rightInt, true);
  }
  
  const fullBuffer = new ArrayBuffer(44 + dataLength);
  const fullArray = new Uint8Array(fullBuffer);
  fullArray.set(headerArray);
  fullArray.set(new Uint8Array(dataBuffer), 44);
  
  return fullBuffer;
}

// Convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // Use btoa in React Native via global polyfill or base64 library
  if (typeof btoa !== 'undefined') {
    return btoa(binary);
  }
  // Fallback for environments without btoa
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let result = '';
  let i = 0;
  while (i < binary.length) {
    const a = binary.charCodeAt(i++);
    const b = binary.charCodeAt(i++);
    const c = binary.charCodeAt(i++);
    result += chars[a >> 2] + chars[((a & 3) << 4) | (b >> 4)] + 
              (isNaN(b) ? '=' : chars[((b & 15) << 2) | (c >> 6)]) +
              (isNaN(c) ? '=' : chars[c & 63]);
  }
  return result;
}

export class FrequencyPlayerExpo {
  private sound: Audio.Sound | null = null;
  private isPlaying = false;
  private currentFrequency = 0;
  private currentWaveform: WaveformType = 'sine';
  private initialized = false;
  private playbackSubscription: ((status: AVPlaybackStatus) => void) | null = null;

  constructor() {
    this.initialize();
  }

  async initialize() {
    if (this.initialized) {
      console.log('🔊 Audio already initialized, skipping');
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      this.initialized = true;
      console.log('🔊 Expo Audio initialized successfully');
    } catch (error) {
      console.error('Audio initialization failed:', error);
    }
  }

  async playFrequency(
    frequency: number,
    duration: number = 5000,
    waveform: WaveformType = 'sine'
  ): Promise<void> {
    if (this.isPlaying) {
      await this.stop();
    }

    // Frequency handling
    const MIN_AUDIBLE = 20;
    const SPEAKER_MIN = 80;
    const MAX_PRACTICAL = 15000;

    let effectiveFreq = Math.min(frequency, MAX_PRACTICAL);

    // For very low frequencies, use isochronic/binaural beats
    if (frequency < SPEAKER_MIN) {
      console.log(`🧠 ${frequency}Hz below speaker range, using binaural beat with 200Hz carrier`);
      await this.playBinauralBeat(200, frequency, duration);
      return;
    }

    this.currentFrequency = effectiveFreq;
    this.currentWaveform = waveform;

    console.log(`🎵 Playing ${effectiveFreq}Hz ${waveform} wave for ${duration / 1000}s`);

    try {
      // Generate WAV data
      const wavData = generateToneWavData(effectiveFreq, duration, 44100, waveform, 0.5);
      
      // Use data URI approach (more reliable)
      const base64 = arrayBufferToBase64(wavData);
      const dataUri = `data:audio/wav;base64,${base64}`;
      
      console.log('🎵 Generated audio data URI, length:', dataUri.length);

      // Create and play sound from file
      const { sound } = await Audio.Sound.createAsync(
        { uri: dataUri },
        { 
          shouldPlay: true, 
          isLooping: false, 
          volume: 0.8,
        }
      );

      this.sound = sound;
      this.isPlaying = true;

      // Set up completion handler
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          console.log(`✅ Playback complete`);
          this.cleanup();
        }
      });

      console.log(`🔊 Playing ${effectiveFreq}Hz...`);
    } catch (error) {
      console.error(`Failed to play frequency ${effectiveFreq}:`, error);
      this.isPlaying = false;
    }
  }

  async playBinauralBeat(
    carrier: number,
    beatFrequency: number,
    duration: number = 5000
  ): Promise<void> {
    if (this.isPlaying) {
      await this.stop();
    }

    console.log(`🧠 Playing binaural beat: ${carrier}Hz carrier, ${beatFrequency}Hz beat`);

    try {
      // Generate stereo binaural beat WAV
      const wavData = generateBinauralBeatWavData(carrier, beatFrequency, duration, 44100, 0.5);
      
      // Use data URI approach
      const base64 = arrayBufferToBase64(wavData);
      const dataUri = `data:audio/wav;base64,${base64}`;
      
      console.log('🧠 Generated binaural data URI, length:', dataUri.length);

      const { sound } = await Audio.Sound.createAsync(
        { uri: dataUri },
        { shouldPlay: true, isLooping: false, volume: 0.8 }
      );

      this.sound = sound;
      this.isPlaying = true;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          console.log(`✅ Binaural beat playback complete`);
          this.cleanup();
        }
      });
    } catch (error) {
      console.error(`Failed to play binaural beat:`, error);
      this.isPlaying = false;
    }
  }

  setWaveform(waveform: WaveformType): void {
    this.currentWaveform = waveform;
    console.log(`🎛️ Waveform set to ${waveform}`);
  }

  getWaveform(): WaveformType {
    return this.currentWaveform;
  }

  async stop(): Promise<void> {
    if (!this.isPlaying && !this.sound) {
      return;
    }

    console.log('⏹️ Stopping playback');

    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      } catch (error) {
        // Sound may already be stopped
      }
    }

    this.cleanup();
  }

  private cleanup(): void {
    this.sound = null;
    this.isPlaying = false;
    this.currentFrequency = 0;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentFrequency(): number {
    return this.currentFrequency;
  }

  // Stub for analyzer (not available with pure expo-av)
  getAnalysisSnapshot(): { frequencies: Float32Array | null; waveform: Float32Array | null } {
    return { frequencies: null, waveform: null };
  }
}

// Create singleton
const frequencyPlayerExpo = new FrequencyPlayerExpo();

// Export convenience functions
export const playFrequency = (freq: number, duration?: number, waveform?: WaveformType) =>
  frequencyPlayerExpo.playFrequency(freq, duration, waveform);

export const playBinauralBeat = (carrier: number, beat: number, duration?: number) =>
  frequencyPlayerExpo.playBinauralBeat(carrier, beat, duration);

export const stopFrequency = () => frequencyPlayerExpo.stop();

export const setWaveform = (waveform: WaveformType) => frequencyPlayerExpo.setWaveform(waveform);

export const getWaveform = () => frequencyPlayerExpo.getWaveform();

export const getIsPlaying = () => frequencyPlayerExpo.getIsPlaying();

export const getCurrentFrequency = () => frequencyPlayerExpo.getCurrentFrequency();

export const getAnalysisSnapshot = () => frequencyPlayerExpo.getAnalysisSnapshot();

// Generate progressive multi-frequency WAV (frequencies enter sequentially)
function generateProgressiveMultiFrequencyWavData(
  frequencies: number[],
  durationMs: number,
  sampleRate: number = 44100,
  waveform: WaveformType = 'sine',
  amplitude: number = 0.4,
  staggerDelayMs: number = 50 // 0.05 seconds between frequency introductions
): ArrayBuffer {
  const numSamples = Math.floor(sampleRate * (durationMs / 1000));
  const dataLength = numSamples * 2; // 16-bit mono
  
  const header = createWavHeader(dataLength, sampleRate);
  const headerArray = new Uint8Array(header);
  
  const dataBuffer = new ArrayBuffer(dataLength);
  const dataView = new DataView(dataBuffer);
  
  // Calculate when each frequency should start (in samples)
  const staggerDelaySamples = Math.floor(sampleRate * (staggerDelayMs / 1000));
  const frequencyStartTimes = frequencies.map((_, index) => index * staggerDelaySamples);
  
  // Fade in/out time in samples (50ms)
  const fadeLength = Math.min(Math.floor(sampleRate * 0.05), numSamples / 4);
  
  // Adjust amplitude per frequency to prevent clipping
  const amplitudePerFreq = amplitude / Math.sqrt(frequencies.length);
  
  console.log(`🎵 Progressive bath: ${frequencies.length} frequencies entering every ${staggerDelayMs}ms`);
  
  for (let i = 0; i < numSamples; i++) {
    let mixedSample = 0;
    
    // Mix all frequencies that should be playing at this time
    frequencies.forEach((frequency, freqIndex) => {
      const startTime = frequencyStartTimes[freqIndex];
      
      // Only play this frequency if we've reached its start time
      if (i >= startTime) {
        const samplesPlaying = i - startTime;
        
        // Handle very low frequencies as binaural beats mixed with carrier
        let effectiveFreq = frequency;
        let sample = 0;
        
        if (frequency < 20) {
          // Mix the binaural beat frequency with a 200Hz carrier
          const carrierPhase = 2 * Math.PI * 200 * samplesPlaying / sampleRate;
          const beatPhase = 2 * Math.PI * frequency * samplesPlaying / sampleRate;
          // Create amplitude modulation for binaural effect
          const modulation = (1 + Math.sin(beatPhase)) * 0.5;
          sample = generateWaveformSample(carrierPhase, waveform) * modulation;
        } else {
          const phase = 2 * Math.PI * effectiveFreq * samplesPlaying / sampleRate;
          sample = generateWaveformSample(phase, waveform);
        }
        
        // Apply individual frequency fade-in (first 0.1 seconds)
        const individualFadeLength = Math.min(Math.floor(sampleRate * 0.1), numSamples / 8);
        if (samplesPlaying < individualFadeLength) {
          sample *= samplesPlaying / individualFadeLength;
        }
        
        mixedSample += sample * amplitudePerFreq;
      }
    });
    
    // Apply global fade in/out to entire mix
    if (i < fadeLength) {
      mixedSample *= i / fadeLength;
    } else if (i > numSamples - fadeLength) {
      mixedSample *= (numSamples - i) / fadeLength;
    }
    
    // Convert to 16-bit integer with clipping protection
    const intSample = Math.max(-32768, Math.min(32767, Math.floor(mixedSample * 32767)));
    dataView.setInt16(i * 2, intSample, true);
  }
  
  // Combine header and data
  const fullBuffer = new ArrayBuffer(44 + dataLength);
  const fullArray = new Uint8Array(fullBuffer);
  fullArray.set(headerArray);
  fullArray.set(new Uint8Array(dataBuffer), 44);
  
  return fullBuffer;
}

// Generate multi-frequency mixed WAV (layering multiple tones)
function generateMultiFrequencyWavData(
  frequencies: number[],
  durationMs: number,
  sampleRate: number = 44100,
  waveform: WaveformType = 'sine',
  amplitude: number = 0.4
): ArrayBuffer {
  const numSamples = Math.floor(sampleRate * (durationMs / 1000));
  const dataLength = numSamples * 2; // 16-bit mono
  
  const header = createWavHeader(dataLength, sampleRate);
  const headerArray = new Uint8Array(header);
  
  const dataBuffer = new ArrayBuffer(dataLength);
  const dataView = new DataView(dataBuffer);
  
  // Fade in/out time in samples (50ms)
  const fadeLength = Math.min(Math.floor(sampleRate * 0.05), numSamples / 4);
  
  // Adjust amplitude per frequency to prevent clipping
  const amplitudePerFreq = amplitude / Math.sqrt(frequencies.length);
  
  for (let i = 0; i < numSamples; i++) {
    let mixedSample = 0;
    
    // Mix all frequencies together
    for (const frequency of frequencies) {
      // Handle very low frequencies as binaural beats mixed with carrier
      let effectiveFreq = frequency;
      if (frequency < 20) {
        // Mix the binaural beat frequency with a 200Hz carrier
        const carrierPhase = 2 * Math.PI * 200 * i / sampleRate;
        const beatPhase = 2 * Math.PI * frequency * i / sampleRate;
        // Create amplitude modulation for binaural effect
        const modulation = (1 + Math.sin(beatPhase)) * 0.5;
        mixedSample += generateWaveformSample(carrierPhase, waveform) * modulation * amplitudePerFreq;
      } else {
        const phase = 2 * Math.PI * effectiveFreq * i / sampleRate;
        mixedSample += generateWaveformSample(phase, waveform) * amplitudePerFreq;
      }
    }
    
    // Apply fade in/out to mixed sample
    if (i < fadeLength) {
      mixedSample *= i / fadeLength;
    } else if (i > numSamples - fadeLength) {
      mixedSample *= (numSamples - i) / fadeLength;
    }
    
    // Convert to 16-bit integer with clipping protection
    const intSample = Math.max(-32768, Math.min(32767, Math.floor(mixedSample * 32767)));
    dataView.setInt16(i * 2, intSample, true);
  }
  
  // Combine header and data
  const fullBuffer = new ArrayBuffer(44 + dataLength);
  const fullArray = new Uint8Array(fullBuffer);
  fullArray.set(headerArray);
  fullArray.set(new Uint8Array(dataBuffer), 44);
  
  return fullBuffer;
}

export const testAudio = async () => {
  console.log('🧪 Testing audio with expo-av...');
  await playFrequency(440, 2000, 'sine');
  console.log('🧪 Audio test initiated');
};

/**
 * Play a frequency bath (multiple layered frequencies)
 * Frequencies enter progressively every 0.05 seconds for beautiful layering
 */
export const playFrequencyBath = async (
  frequencies: number[], 
  durationOrOptions: number | { duration?: number; waveform?: WaveformType } = 30 * 60 * 1000
) => {
  if (frequencies.length === 0) return;
  
  // Handle both old signature (duration number) and new signature (options object)
  let duration: number;
  let waveform: WaveformType = 'sine';
  
  if (typeof durationOrOptions === 'number') {
    duration = durationOrOptions;
  } else {
    duration = durationOrOptions.duration || 30 * 60 * 1000;
    waveform = durationOrOptions.waveform || 'sine';
  }
  
  console.log(`🛁 Playing progressive bath with ${frequencies.length} frequencies: ${frequencies.join('Hz, ')}Hz`);
  console.log(`🎵 Frequencies will enter every 50ms for layered effect`);
  
  // Stop any current audio first
  await frequencyPlayerExpo.stop();
  
  try {
    // Generate progressive WAV data with staggered frequency entry
    const wavData = generateProgressiveMultiFrequencyWavData(
      frequencies, 
      Math.min(duration, 60000), 
      44100, 
      waveform, 
      0.4,
      50 // 0.05 seconds = 50ms between frequency introductions
    );
    
    // Use data URI approach
    const base64 = arrayBufferToBase64(wavData);
    const dataUri = `data:audio/wav;base64,${base64}`;
    
    console.log('🛁 Generated progressive bath data URI, length:', dataUri.length);

    // Use the Audio module directly for the bath playback
    const { sound } = await Audio.Sound.createAsync(
      { uri: dataUri },
      { shouldPlay: true, isLooping: false, volume: 0.7 }
    );

    // Store in the global player using private property access
    (frequencyPlayerExpo as any).sound = sound;
    (frequencyPlayerExpo as any).isPlaying = true;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        console.log(`✅ Progressive bath playback complete`);
        // Call the private cleanup method
        (frequencyPlayerExpo as any).cleanup();
      }
    });
  } catch (error) {
    console.error(`Failed to play progressive frequency bath:`, error);
    (frequencyPlayerExpo as any).isPlaying = false;
  }
};

// Enhanced stop function with complete cleanup
export const stopAllFrequencies = async () => {
  console.log('🛑 GLOBAL STOP ALL FREQUENCIES');
  await frequencyPlayerExpo.stop();
};

export const playHealingFrequency = async (frequency: number, duration?: number) => {
  await playFrequency(frequency, duration || 30000, 'sine');
};

export const playSolfeggioFrequency = async (frequency: number, duration?: number) => {
  await playFrequency(frequency, duration || 30000, 'sine');
};

export const playChakraFrequency = async (frequency: number, duration?: number) => {
  await playFrequency(frequency, duration || 30000, 'sine');
};

export { frequencyPlayerExpo };
