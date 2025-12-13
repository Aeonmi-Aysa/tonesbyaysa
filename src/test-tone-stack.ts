import { playHealingFrequency, playBinauralBeat } from '@/lib/audioEngine';

// Quick harness to exercise 528Hz carrier, a 4Hz binaural beat,
// and a very low 7Hz tone in sequence. Run from any screen by
// importing and calling testToneStack() from an onPress handler.
export const testToneStack = async () => {
  // 528 Hz live synth
  await playHealingFrequency(528, 8000);
  // 4 Hz binaural beat around 200 Hz
  await playBinauralBeat(200, 4, 8000);
  // 7 Hz represented as a sustained low tone
  await playHealingFrequency(7, 8000);
};
