import { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { getAnalysisSnapshot } from '@/lib/audioEngine';

const POLL_INTERVAL_MS = 120;
const MAX_BARS = 24;

export function AnalyzerBar() {
  const [visible, setVisible] = useState(true);
  const [peakHz, setPeakHz] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [bars, setBars] = useState<number[]>([]);
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    let isMounted = true;
    const interval = setInterval(() => {
      const snapshot = getAnalysisSnapshot();
      if (!snapshot || !isMounted) return;

      setPeakHz(snapshot.displayHz ?? snapshot.peakHz ?? null);
      setLocked(snapshot.isLocked);
      setBars(snapshot.normalizedSpectrum.slice(0, MAX_BARS));
    }, POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 8,
      onPanResponderMove: (_, gestureState) => {
        const clamped = Math.min(0, Math.max(-120, gestureState.dy));
        translateY.setValue(clamped);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 48) {
          setVisible(false);
          return;
        }
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true
        }).start();
      }
    })
  ).current;

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY }] }]}
      {...panResponder.panHandlers}
    >
      <View style={styles.inner}>
        <View
          style={[styles.lockDot, locked ? styles.lockDotActive : undefined]}
        />
        <View style={styles.textContainer}>
          <Text style={styles.label}>Analyzer</Text>
          <Text style={styles.value}>
            {peakHz != null ? `${peakHz.toFixed(2)} Hz` : 'Idle'}
          </Text>
        </View>
        <Svg width={MAX_BARS * 4} height={24}>
          {bars.map((v, i) => {
            const height = Math.max(1, v * 24);
            const y = 24 - height;
            return (
              <Rect
                key={i}
                x={i * 4}
                y={y}
                width={3}
                height={height}
                fill="#22d3ee"
              />
            );
          })}
        </Svg>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.0)'
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#22d3ee',
    backgroundColor: 'rgba(3,7,18,0.92)',
    shadowColor: '#22d3ee',
    shadowOpacity: 0.9,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 }
  },
  lockDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#22d3ee',
    marginRight: 8,
    backgroundColor: 'transparent'
  },
  lockDotActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e'
  },
  textContainer: {
    flex: 1,
    marginRight: 12
  },
  label: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  value: {
    fontSize: 13,
    color: '#e5e7eb',
    fontWeight: '600'
  }
});
