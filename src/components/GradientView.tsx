import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';

// Try to import LinearGradient, fallback to View if not available
let LinearGradientComponent: any = null;
let gradientAvailable = false;

try {
  const { LinearGradient } = require('expo-linear-gradient');
  LinearGradientComponent = LinearGradient;
  gradientAvailable = true;
} catch (e) {
  console.warn('expo-linear-gradient not available, using fallback');
  gradientAvailable = false;
}

interface GradientViewProps {
  colors: string[];
  style?: StyleProp<ViewStyle>;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  children?: React.ReactNode;
}

export function GradientView({ colors, style, children, ...props }: GradientViewProps) {
  if (gradientAvailable && LinearGradientComponent) {
    return (
      <LinearGradientComponent colors={colors} style={style} {...props}>
        {children}
      </LinearGradientComponent>
    );
  }

  // Fallback: use the first color as background
  const fallbackStyle = [
    style,
    { backgroundColor: colors[0] || '#1e1b4b' }
  ];

  return (
    <View style={fallbackStyle}>
      {children}
    </View>
  );
}

export default GradientView;
