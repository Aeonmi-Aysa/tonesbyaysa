const fs = require('fs');
const path = require('path');

// Generate WAV file data for a sine wave
function generateWAV(frequency, duration = 300, sampleRate = 44100) {
  const samples = duration * sampleRate;
  const buffer = Buffer.alloc(44 + samples * 2); // 44 bytes header + 16-bit samples

  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + samples * 2, 4); // File size
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Format chunk size
  buffer.writeUInt16LE(1, 20); // Audio format (PCM)
  buffer.writeUInt16LE(1, 22); // Number of channels
  buffer.writeUInt32LE(sampleRate, 24); // Sample rate
  buffer.writeUInt32LE(sampleRate * 2, 28); // Byte rate
  buffer.writeUInt16LE(2, 32); // Block align
  buffer.writeUInt16LE(16, 34); // Bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(samples * 2, 40); // Data size

  // Generate sine wave samples
  for (let i = 0; i < samples; i++) {
    const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3 * 32767;
    buffer.writeInt16LE(Math.round(sample), 44 + i * 2);
  }

  return buffer;
}

// Key frequencies to pre-generate
const keyFrequencies = [
  174, 285, 396, 417, 528, 639, 741, 852, 963, // Solfeggio
  256, 288, 320, 341, 384, 426, 480, // Chakra
  40, 60, 80, 100, 120, 150, 200 // Binaural beats
];

console.log('🎵 Generating audio files for key frequencies...');

// Create output directory
const outputDir = path.join(__dirname, 'assets', 'audio', 'frequencies');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate WAV files
keyFrequencies.forEach(freq => {
  const wavData = generateWAV(freq);
  const filename = `${freq}hz.wav`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, wavData);
  console.log(`✅ Generated ${filename}`);
});

console.log('🎵 Audio file generation complete!');
console.log(`📁 Files saved to: ${outputDir}`);