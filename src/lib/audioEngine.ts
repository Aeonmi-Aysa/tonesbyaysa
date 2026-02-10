/**
 * HealTone Audio Engine
 * 
 * Pure expo-av implementation for cross-platform frequency tone generation.
 * Generates WAV audio buffers dynamically and plays them via expo-av.
 * 
 * Works on iOS, Android, and Web without native dependencies.
 */

// Re-export everything from the expo implementation
export {
  FrequencyPlayerExpo as FrequencyPlayer,
  frequencyPlayerExpo as frequencyPlayer,
  playFrequency,
  playBinauralBeat,
  stopFrequency,
  stopAllFrequencies,
  setWaveform,
  getWaveform,
  getIsPlaying,
  getCurrentFrequency,
  getAnalysisSnapshot,
  testAudio,
  playFrequencyBath,
  playHealingFrequency,
  playSolfeggioFrequency,
  playChakraFrequency,
  WAVEFORM_OPTIONS,
} from './audioEngineExpo';

export type { WaveformType } from './audioEngineExpo';
