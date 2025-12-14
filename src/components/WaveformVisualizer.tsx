import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Circle, Line } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface WaveformVisualizerProps {
  isPlaying: boolean;
  frequencies: number[]; // Active frequencies being played
  style?: object;
  height?: number;
  showLabels?: boolean;
}

export function WaveformVisualizer({ 
  isPlaying, 
  frequencies, 
  style,
  height = 120,
  showLabels = true
}: WaveformVisualizerProps) {
  const [phase, setPhase] = useState(0);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const waveWidth = width - 40;
  
  useEffect(() => {
    if (isPlaying && frequencies.length > 0) {
      animationRef.current = setInterval(() => {
        setPhase(prev => (prev + 0.1) % (Math.PI * 2));
      }, 50);
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    }
    
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isPlaying, frequencies.length]);

  // Generate wave path for a single frequency
  const generateWavePath = (frequency: number, amplitude: number, phaseOffset: number = 0) => {
    const points: string[] = [];
    const steps = 100;
    const centerY = height / 2;
    
    // Normalize frequency to visible wave cycles (higher freq = more cycles)
    const normalizedFreq = Math.min(frequency / 50, 8); // Cap at 8 visible cycles
    
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * waveWidth;
      const y = centerY + Math.sin((i / steps) * Math.PI * 2 * normalizedFreq + phase + phaseOffset) * amplitude;
      points.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
    }
    
    return points.join(' ');
  };

  // Generate combined wave from all frequencies
  const generateCombinedWavePath = () => {
    if (frequencies.length === 0) {
      // Flat line when no frequencies
      return `M 0 ${height / 2} L ${waveWidth} ${height / 2}`;
    }

    const points: string[] = [];
    const steps = 150;
    const centerY = height / 2;
    const baseAmplitude = (height * 0.35) / Math.sqrt(frequencies.length);

    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * waveWidth;
      let y = centerY;
      
      frequencies.forEach((freq, index) => {
        const normalizedFreq = Math.min(freq / 50, 8);
        const phaseOffset = (index * Math.PI) / frequencies.length;
        const amplitude = baseAmplitude * (1 - index * 0.1); // Slightly decrease amplitude for layered effect
        y += Math.sin((i / steps) * Math.PI * 2 * normalizedFreq + phase + phaseOffset) * amplitude;
      });
      
      points.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
    }
    
    return points.join(' ');
  };

  // Generate binaural beat visualization (difference frequency)
  const generateBinauralPath = () => {
    if (frequencies.length < 2) return null;
    
    // Calculate beat frequency (difference between frequencies)
    const sortedFreqs = [...frequencies].sort((a, b) => a - b);
    const beatFreq = sortedFreqs[sortedFreqs.length - 1] - sortedFreqs[0];
    
    if (beatFreq > 40) return null; // Only show for actual binaural range
    
    const points: string[] = [];
    const steps = 100;
    const centerY = height / 2;
    const beatAmplitude = height * 0.15;
    
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * waveWidth;
      // Slower, pulsing wave representing the binaural beat
      const y = centerY + Math.sin((i / steps) * Math.PI * 2 * (beatFreq / 10) + phase * 0.5) * beatAmplitude;
      points.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
    }
    
    return points.join(' ');
  };

  // Generate frequency bar visualization
  const renderFrequencyBars = () => {
    if (frequencies.length === 0) return null;
    
    const barWidth = Math.min(40, (waveWidth - 20) / frequencies.length);
    const maxBarHeight = height * 0.8;
    
    return frequencies.map((freq, index) => {
      // Animate bar height based on phase
      const animatedHeight = maxBarHeight * (0.3 + 0.7 * Math.abs(Math.sin(phase + index * 0.5)));
      const x = 10 + index * (barWidth + 5);
      const barY = height - animatedHeight;
      
      return (
        <React.Fragment key={index}>
          <Defs>
            <SvgGradient id={`barGrad${index}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#a855f7" stopOpacity="1" />
              <Stop offset="100%" stopColor="#7c3aed" stopOpacity="0.6" />
            </SvgGradient>
          </Defs>
          <Path
            d={`M ${x} ${height} L ${x} ${barY} L ${x + barWidth} ${barY} L ${x + barWidth} ${height} Z`}
            fill={`url(#barGrad${index})`}
          />
        </React.Fragment>
      );
    });
  };

  const binauralPath = generateBinauralPath();

  return (
    <View style={[styles.container, { height }, style]}>
      <Svg width={waveWidth} height={height}>
        <Defs>
          <SvgGradient id="waveGradient" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#7c3aed" stopOpacity="0.8" />
            <Stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
            <Stop offset="100%" stopColor="#c084fc" stopOpacity="0.8" />
          </SvgGradient>
          <SvgGradient id="binauralGradient" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
            <Stop offset="50%" stopColor="#22c55e" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#22c55e" stopOpacity="0.3" />
          </SvgGradient>
          <SvgGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
            <Stop offset="50%" stopColor="#a855f7" stopOpacity="0.2" />
            <Stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </SvgGradient>
        </Defs>
        
        {/* Center line */}
        <Line 
          x1="0" 
          y1={height / 2} 
          x2={waveWidth} 
          y2={height / 2} 
          stroke="rgba(148, 163, 184, 0.2)" 
          strokeWidth="1"
          strokeDasharray="5,5"
        />
        
        {/* Binaural beat visualization (if applicable) */}
        {binauralPath && (
          <Path
            d={binauralPath}
            stroke="url(#binauralGradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
        )}
        
        {/* Main waveform */}
        <Path
          d={generateCombinedWavePath()}
          stroke="url(#waveGradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Glow effect for playing state */}
        {isPlaying && (
          <Path
            d={generateCombinedWavePath()}
            stroke="url(#waveGradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            opacity={0.3}
          />
        )}

        {/* Active frequency indicator dots */}
        {isPlaying && frequencies.slice(0, 5).map((freq, index) => {
          const x = 15 + index * 20;
          const pulseSize = 4 + Math.sin(phase * 2 + index) * 2;
          return (
            <Circle
              key={index}
              cx={x}
              cy={12}
              r={pulseSize}
              fill="#a855f7"
              opacity={0.8}
            />
          );
        })}
      </Svg>
      
      {/* Labels */}
      {showLabels && frequencies.length > 0 && (
        <View style={styles.labelsContainer}>
          <Text style={styles.freqLabel}>
            {frequencies.length === 1 
              ? `${frequencies[0]} Hz`
              : `${frequencies.length} layers`
            }
          </Text>
          {frequencies.length >= 2 && (
            <Text style={styles.beatLabel}>
              Beat: {Math.abs(frequencies[frequencies.length - 1] - frequencies[0]).toFixed(1)} Hz
            </Text>
          )}
        </View>
      )}
      
      {/* Not playing indicator */}
      {!isPlaying && (
        <View style={styles.pausedOverlay}>
          <Text style={styles.pausedText}>▶ Play to visualize</Text>
        </View>
      )}
    </View>
  );
}

// Circular visualizer variant
interface CircularVisualizerProps {
  isPlaying: boolean;
  frequencies: number[];
  size?: number;
}

export function CircularVisualizer({ 
  isPlaying, 
  frequencies, 
  size = 200 
}: CircularVisualizerProps) {
  const [phase, setPhase] = useState(0);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const center = size / 2;
  const baseRadius = size * 0.3;
  
  useEffect(() => {
    if (isPlaying && frequencies.length > 0) {
      animationRef.current = setInterval(() => {
        setPhase(prev => (prev + 0.08) % (Math.PI * 2));
      }, 50);
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isPlaying, frequencies.length]);

  const generateCircularPath = () => {
    const points: string[] = [];
    const steps = 72;
    
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      let radius = baseRadius;
      
      frequencies.forEach((freq, index) => {
        const normalizedFreq = Math.min(freq / 100, 4);
        const amplitude = (size * 0.15) / Math.sqrt(frequencies.length);
        radius += Math.sin(angle * normalizedFreq + phase + index) * amplitude;
      });
      
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;
      points.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
    }
    
    return points.join(' ') + ' Z';
  };

  return (
    <View style={[styles.circularContainer, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgGradient id="circleGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#7c3aed" stopOpacity="0.5" />
          </SvgGradient>
        </Defs>
        
        {/* Base circle */}
        <Circle
          cx={center}
          cy={center}
          r={baseRadius}
          stroke="rgba(168, 85, 247, 0.2)"
          strokeWidth="1"
          fill="none"
        />
        
        {/* Animated shape */}
        <Path
          d={generateCircularPath()}
          stroke="url(#circleGrad)"
          strokeWidth="2"
          fill="rgba(168, 85, 247, 0.1)"
        />
        
        {/* Center glow */}
        {isPlaying && (
          <Circle
            cx={center}
            cy={center}
            r={10 + Math.sin(phase * 2) * 5}
            fill="#a855f7"
            opacity={0.6}
          />
        )}
      </Svg>
    </View>
  );
}

// Simple bar spectrum visualizer
interface SpectrumVisualizerProps {
  isPlaying: boolean;
  frequencies: number[];
  barCount?: number;
  height?: number;
}

export function SpectrumVisualizer({
  isPlaying,
  frequencies,
  barCount = 16,
  height = 60
}: SpectrumVisualizerProps) {
  const [phase, setPhase] = useState(0);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const barWidth = (width - 80) / barCount;
  
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = setInterval(() => {
        setPhase(prev => prev + 0.15);
      }, 50);
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <View style={[styles.spectrumContainer, { height }]}>
      <Svg width={width - 40} height={height}>
        <Defs>
          <SvgGradient id="spectrumGrad" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0%" stopColor="#7c3aed" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#a855f7" stopOpacity="1" />
          </SvgGradient>
        </Defs>
        
        {Array.from({ length: barCount }).map((_, index) => {
          // Generate pseudo-random but deterministic heights based on frequencies
          const freqInfluence = frequencies.reduce((sum, freq, i) => 
            sum + Math.sin(phase + index * 0.5 + freq * 0.01 + i) * 0.5, 0
          );
          
          const baseHeight = isPlaying 
            ? 0.3 + Math.abs(Math.sin(phase * 1.5 + index * 0.3)) * 0.5 + freqInfluence * 0.2
            : 0.1;
          
          const barHeight = Math.max(4, Math.min(height - 4, baseHeight * height));
          const x = index * (barWidth + 2) + 4;
          
          return (
            <Path
              key={index}
              d={`M ${x} ${height} L ${x} ${height - barHeight} L ${x + barWidth - 2} ${height - barHeight} L ${x + barWidth - 2} ${height} Z`}
              fill="url(#spectrumGrad)"
              rx={2}
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 16,
    padding: 10,
    overflow: 'hidden',
    position: 'relative'
  },
  labelsContainer: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    flexDirection: 'row',
    gap: 12
  },
  freqLabel: {
    fontSize: 11,
    color: '#a855f7',
    fontWeight: '600'
  },
  beatLabel: {
    fontSize: 11,
    color: '#22c55e',
    fontWeight: '600'
  },
  pausedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)'
  },
  pausedText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500'
  },
  circularContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  spectrumContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    padding: 8,
    overflow: 'hidden'
  }
});
