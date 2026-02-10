import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/store/useThemeStore';

interface PulsingBackgroundProps {
  isActive: boolean;
  frequency?: number;
  children: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
  style?: ViewStyle;
}

export function PulsingBackground({ 
  isActive, 
  frequency = 528, 
  children, 
  intensity = 'medium',
  style 
}: PulsingBackgroundProps) {
  const { colors, isDark } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;
  
  // Calculate pulse speed based on frequency
  // Higher frequencies = faster pulse, but within reasonable bounds
  const pulseSpeed = Math.max(800, Math.min(3000, 60000 / frequency));
  
  // Get pulse intensity multiplier
  const intensityMultiplier = {
    low: 0.3,
    medium: 0.6,
    high: 0.9
  }[intensity];

  useEffect(() => {
    if (isActive) {
      // Create continuous pulse animation
      const pulseSequence = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: pulseSpeed / 2,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: pulseSpeed / 2,
            useNativeDriver: false,
          }),
        ])
      );

      // Color shifting animation for visual variety
      const colorSequence = Animated.loop(
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: pulseSpeed * 3,
          useNativeDriver: false,
        })
      );

      pulseSequence.start();
      colorSequence.start();

      return () => {
        pulseSequence.stop();
        colorSequence.stop();
      };
    } else {
      // Reset animations when inactive
      Animated.timing(pulseAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      
      Animated.timing(colorAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isActive, pulseSpeed, pulseAnim, colorAnim]);

  // Animated background color based on theme and frequency range
  const animatedBackgroundColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      colors.background,
      isDark 
        ? `rgba(168, 85, 247, ${0.1 * intensityMultiplier})` // Purple in dark mode
        : `rgba(255, 255, 0, ${0.15 * intensityMultiplier})`  // Neon yellow in light mode
    ],
  });

  // Additional glow effect for high-intensity mode
  const glowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, intensity === 'high' ? 0.8 : 0.4],
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        { backgroundColor: animatedBackgroundColor },
        style
      ]}
    >
      {/* Optional glow overlay for enhanced effect */}
      {intensity === 'high' && (
        <Animated.View 
          style={[
            StyleSheet.absoluteFillObject,
            {
              opacity: glowOpacity,
              backgroundColor: isDark ? 'rgba(168, 85, 247, 0.05)' : 'rgba(255, 255, 0, 0.08)',
              borderRadius: 20,
            }
          ]} 
        />
      )}
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});