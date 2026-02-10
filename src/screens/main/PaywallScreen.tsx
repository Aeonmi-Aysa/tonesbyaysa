import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { checkSubscriptionStatus as checkStripeSubscription } from '@/lib/stripeSetup';
import { handlePurchase } from '@/lib/paymentToggle';
import { useSessionStore, type SessionState } from '@/store/useSessionStore';
import { useTheme } from '@/store/useThemeStore';
import { supabase } from '@/lib/supabaseClient';

interface PricingTier {
  id: string;
  label: string;
  title: string;
  description: string;
  price?: string;
  period?: string;
  isLifetime?: boolean;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'weekly',
    label: 'Sustain',
    title: 'Weekly Renewal',
    description: 'Maintain your elevation with continuous access to all frequencies and features.',
    price: '$4.99',
    period: '/week',
  },
  {
    id: 'lifetime',
    label: 'Secure Forever',
    title: 'Lifetime Access',
    description: 'One-time investment for eternal access to all frequencies, updates, and new features.',
    price: '$69.99',
    isLifetime: true,
  },
];

const MUSICAL_NOTES = ['♪', '♫', '♪', '♬', '♫', '♪', '♬', '♫'];

// Animated floating note component
const AnimatedNote = ({ position, delay }: { position: number; delay: number }) => {
  const fadeAnim = new Animated.Value(0);
  const translateY = new Animated.Value(100);

  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: -100,
              duration: 18000,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    animate();
  }, []);

  return (
    <Animated.Text
      style={[
        styles.floatingNote,
        {
          left: `${position}%`,
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      {MUSICAL_NOTES[Math.floor(Math.random() * MUSICAL_NOTES.length)]}
    </Animated.Text>
  );
};

export function PaywallScreen({ onDismiss }: { onDismiss?: () => void }) {
  const profile = useSessionStore((state: SessionState) => state.profile);
  const setProfile = useSessionStore((state: SessionState) => state.setProfile);
  const { colors } = useTheme();

  const [loading, setLoading] = useState(false);
  const [currentTier, setCurrentTier] = useState(profile?.subscription_tier || 'free');
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);

  // Pulsing animation for avatar
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Check subscription status and load on mount
  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const session = await supabase.auth.getSession();
      if (!session?.data?.session?.user?.id) {
        setCurrentTier('free');
        return;
      }

      const status = await checkStripeSubscription(session.data.session.user.id);
      setCurrentTier(status.tier);
    } catch (error) {
      console.log('[PaywallScreen] Error checking subscription:', error);
      setCurrentTier('free');
    }
  };

  const handlePurchasePress = async (tier: PricingTier) => {
    setLoading(true);
    setSelectedTierId(tier.id);
    
    try {
      console.log('[PaywallScreen] Starting purchase for:', tier.title);

      const session = await supabase.auth.getSession();
      if (!session?.data?.session?.user?.id || !session?.data?.session?.user?.email) {
        Alert.alert('Error', 'Please log in to make a purchase');
        setLoading(false);
        setSelectedTierId(null);
        return;
      }

      const userId = session.data.session.user.id;
      const email = session.data.session.user.email;

      // Use payment toggle - routes to Stripe or RevenueCat
      const result = await handlePurchase(tier.id, userId, email);

      if (!result.success) {
        Alert.alert('Purchase Error', result.message);
        setLoading(false);
        setSelectedTierId(null);
        return;
      }

      // Update local state
      const newTier = tier.id === 'lifetime' ? 'lifetime' : 'weekly';
      if (profile) {
        setProfile({ ...profile, subscription_tier: newTier });
      }

      // Sync to Supabase
      try {
        await supabase
          .from('profiles')
          .update({
            subscription_tier: newTier,
            subscription_status: 'active',
          })
          .eq('id', userId);

        console.log('[PaywallScreen] ✅ Subscription synced to Supabase');
      } catch (error) {
        console.error('[PaywallScreen] Failed to sync to Supabase:', error);
      }

      setCurrentTier(newTier);

      Alert.alert(
        'Success! 🎉',
        `Welcome to ${tier.title}! Enjoy all the frequencies.`,
        [{ text: 'OK', onPress: onDismiss }]
      );
    } catch (error: any) {
      console.error('[PaywallScreen] Purchase error:', error);

      if (!error?.message?.includes('cancelled')) {
        Alert.alert(
          'Purchase Error',
          error?.message || 'Something went wrong. Please try again.'
        );
      }
    } finally {
      setLoading(false);
      setSelectedTierId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Multi-layer Gradient Background */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#533483', '#8e44ad', '#c84b8a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      />
      
      {/* Radial overlay for depth */}
      <View style={styles.radialOverlay} />

      {/* Floating Notes Animation */}
      <View style={styles.notesContainer} pointerEvents="none">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <AnimatedNote key={i} position={10 + i * 12} delay={i * 1000} />
        ))}
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brandTones}>TONES</Text>
          <Text style={styles.brandBy}>by</Text>
          <Text style={styles.brandAysa}>Aysa</Text>
        </View>

        {/* Pulsing Avatar Circle */}
        <Animated.View style={[styles.avatarCircle, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={['#533483', '#8e44ad']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarPlaceholder}>♫</Text>
          </LinearGradient>
        </Animated.View>

        {/* Tagline */}
        <Text style={styles.tagline}>
          Experience full immersion, no commitment required
        </Text>

        {/* Pricing Card */}
        <View style={styles.pricingCard}>
          {PRICING_TIERS.map((tier, index) => (
            <View
              key={tier.id}
              style={[
                styles.tier,
                tier.isLifetime && styles.lifetimeTier,
                index < PRICING_TIERS.length - 1 && styles.tierBorder,
              ]}
            >
              {tier.isLifetime && (
                <View style={styles.lifetimeBadge}>
                  <LinearGradient
                    colors={['#d4a5ff', '#8e44ad']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.badgeGradient}
                  >
                    <Text style={styles.badgeText}>✨ Special Offer</Text>
                  </LinearGradient>
                </View>
              )}

              <Text style={styles.tierLabel}>{tier.label}</Text>
              <Text style={styles.tierTitle}>{tier.title}</Text>
              <Text style={styles.tierDescription}>{tier.description}</Text>

              {tier.price && (
                <Text style={styles.tierPrice}>
                  {tier.price}
                  {tier.period && <Text style={styles.tierPeriod}> {tier.period}</Text>}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* CTA Button */}
        <Pressable
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && styles.ctaButtonPressed,
          ]}
          onPress={() => handlePurchasePress(PRICING_TIERS[0])} // Weekly tier (first item)
          disabled={loading}
        >
          <LinearGradient
            colors={['#b19cd9', '#8e44ad']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.ctaButtonText}>Continue</Text>
            )}
          </LinearGradient>
        </Pressable>

        <Text style={styles.trialText}>Start your 7-day free trial</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  radialOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  notesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 3,
  },
  floatingNote: {
    position: 'absolute',
    fontSize: 48,
    color: '#d4a5ff',
    textShadowColor: '#c79eff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandTones: {
    fontSize: 56,
    fontWeight: '600',
    color: '#e0b3ff',
    letterSpacing: 8,
    marginBottom: 8,
    textShadowColor: 'rgba(199, 158, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 40,
  },
  brandBy: {
    fontSize: 28,
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.8)',
    marginVertical: -5,
  },
  brandAysa: {
    fontSize: 80,
    fontStyle: 'italic',
    fontWeight: '600',
    color: '#f0d9ff',
    marginTop: -10,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  avatarCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginVertical: 30,
    overflow: 'hidden',
    shadowColor: '#c79eff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 20,
  },
  avatarGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 70,
    borderWidth: 3,
    borderColor: 'rgba(212, 165, 255, 0.6)',
  },
  avatarPlaceholder: {
    fontSize: 64,
    color: '#d4a5ff',
  },
  tagline: {
    fontSize: 15,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 0.5,
    maxWidth: 300,
  },
  pricingCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 28,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 12,
  },
  tier: {
    paddingVertical: 20,
  },
  tierBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  lifetimeTier: {
    backgroundColor: 'rgba(212, 165, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(212, 165, 255, 0.4)',
    padding: 20,
    marginTop: 0,
  },
  lifetimeBadge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  badgeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  tierLabel: {
    fontSize: 12,
    color: '#d4a5ff',
    fontWeight: '500',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 6,
  },
  tierDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 21,
    fontWeight: '300',
  },
  tierPrice: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    marginTop: 12,
  },
  tierPeriod: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  ctaButton: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8e44ad',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  ctaButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  ctaGradient: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  trialText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 0.5,
    marginTop: 12,
  },
  debugInfo: {
    marginTop: 30,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  debugTitle: {
    color: '#d4a5ff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  debugText: {
    color: '#fff',
    fontSize: 11,
    marginBottom: 4,
  },
});
