import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  Animated,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSessionStore, type SessionState } from '@/store/useSessionStore';
import { useTheme } from '@/store/useThemeStore';
import { handlePurchase } from '@/lib/paymentToggle';
import { checkSubscriptionStatus as checkStripeSubscription } from '@/lib/stripeSetup';
import { supabase } from '@/lib/supabaseClient';

interface Tier {
  id: 'trial' | 'weekly' | 'lifetime';
  label: string;
  name: string;
  price: string;
  period: string;
  badge: string | null;
  description: string;
  button: string;
  featured: boolean;
  stripeProductId?: string;
}

export default function MobilePaywall() {
  const [loading, setLoading] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTier, setSuccessTier] = useState('');
  const fadeAnim = new Animated.Value(0);
  const { width } = Dimensions.get('window');

  const { session } = useSessionStore((state: SessionState) => ({
    session: state.session,
  }));

  const tiers: Tier[] = [
    {
      id: 'trial',
      label: 'Begin Your Journey',
      name: '7-Day Trial',
      price: 'Free',
      period: '',
      badge: null,
      description: 'Full access to experience the transformation. Zero commitment, complete benefits. Converts to $4.99/week after trial.',
      button: 'START FREE TRIAL',
      featured: false,
      stripeProductId: undefined, // Trial handled server-side
    },
    {
      id: 'weekly',
      label: 'Sustain Your Elevation',
      name: 'Weekly Renewal',
      price: '$4.99',
      period: '/week',
      badge: '✨ Most Popular',
      description: 'Continuous access to all frequencies and premium features. Cancel anytime from your profile.',
      button: 'SUBSCRIBE WEEKLY',
      featured: true,
      stripeProductId: process.env.STRIPE_WEEKLY_PRICE_ID,
    },
    {
      id: 'lifetime',
      label: 'Lifetime Access',
      name: 'Forever Membership',
      price: '$69.99',
      period: '',
      badge: '🏆 Best Value',
      description: 'One-time investment. Eternal access to all frequencies, updates, and future features forever.',
      button: 'SECURE FOREVER',
      featured: false,
      stripeProductId: process.env.STRIPE_LIFETIME_PRICE_ID,
    },
  ];

  const handlePurchasePress = async (tierId: string) => {
    if (!session?.user?.id) {
      Alert.alert('Please login first', 'You need to be signed in to purchase.');
      return;
    }

    setLoading(tierId);

    try {
      const tier = tiers.find((t) => t.id === tierId);
      if (!tier) throw new Error('Tier not found');

      // For TRIAL: Still require card registration (complies with Google Play)
      // Card will NOT be charged during 7-day trial
      // After day 7: card is automatically charged $4.99/week
      const isTrialStart = tierId === 'trial';

      // Call the payment toggle which routes to Stripe or RevenueCat
      const result = await handlePurchase(
        tierId,
        session.user.id,
        session.user.email || 'unknown@example.com',
        tier.stripeProductId,
        isTrialStart
      );

      if (result.success) {
        setSuccessTier(tier.name);
        setShowSuccess(true);

        // Animate toast in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();

        // Auto-dismiss toast
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => setShowSuccess(false));
        }, 2500);

        // Check updated subscription
        await checkStripeSubscription(session.user.id);
      } else {
        Alert.alert('Purchase Failed', result.error || 'Something went wrong. Please try again.');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      Alert.alert('Error', error.message || 'Failed to process purchase');
    } finally {
      setLoading(null);
    }
  };

  const handleRestorePurchases = async () => {
    if (!session?.user?.id) {
      Alert.alert('Please login first');
      return;
    }

    try {
      setLoading('restore');
      await checkStripeSubscription(session.user.id);
      Alert.alert('Subscription Restored', 'Your subscription has been checked and restored.');
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Restore Failed', 'Could not restore your subscription.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#1e1b4b', '#312e81', '#4c1d95', '#581c87']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Close Button - Top Right */}
        <Pressable 
          style={styles.closeButton}
          onPress={() => {
            // Navigate back or close the paywall modal
            // If using navigation: navigation.goBack()
            // If using modal: setShowPaywall(false) or similar
            console.log('Close paywall');
          }}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            {/* Portrait with glow */}
            <View style={styles.portraitWrapper}>
              <View
                style={[
                  styles.portraitGlow,
                  { width: width * 0.8, height: width * 0.8 },
                ]}
              />
              <View
                style={[
                  styles.portraitContainer,
                  { width: width * 0.75, height: width * 0.75 },
                ]}
              >
                <Image
                source={require('../../../assets/adaptive-icon.png')}
                style={styles.portrait}
                resizeMode="cover"
                />
              </View>
            </View>

            {/* Brand and tagline */}
            <View style={styles.brandSection}>
              <Text style={styles.brandBy}>EXPERIENCE</Text>
              <Text style={styles.brandName}>Tones by Aysa</Text>
              <Text style={styles.tagline}>
                Transform your wellness with sacred sound frequencies designed for inner peace and
                elevation.
              </Text>
            </View>
          </View>

          {/* Pricing Section */}
          <View style={styles.pricingSection}>
            <Text style={styles.sectionTitle}>Choose Your Path</Text>

            {/* Tiers */}
            <View style={styles.tiersWrapper}>
              {tiers.map((tier, index) => (
                <View
                  key={tier.id}
                  style={[
                    styles.tierCardContainer,
                    tier.featured && styles.tierCardContainerFeatured,
                  ]}
                >
                  {tier.badge && (
                    <View style={styles.badgeWrapper}>
                      <LinearGradient
                        colors={['#fbbf24', '#ec4899']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.badgeGradient}
                      >
                        <Text style={styles.badge}>{tier.badge}</Text>
                      </LinearGradient>
                    </View>
                  )}

                  <View style={[styles.tierCard, tier.featured && styles.tierCardFeatured]}>
                    <View style={styles.tierContent}>
                      <Text style={styles.tierLabel}>{tier.label}</Text>
                      <Text style={styles.tierName}>{tier.name}</Text>

                      <View style={styles.priceRow}>
                        <Text style={styles.price}>{tier.price}</Text>
                        {tier.period && <Text style={styles.period}>{tier.period}</Text>}
                      </View>

                      <Text style={styles.tierDescription}>{tier.description}</Text>
                    </View>

                    <Pressable
                      style={({ pressed }) => [
                        styles.ctaButton,
                        tier.featured && styles.ctaButtonFeatured,
                        loading === tier.id && styles.ctaButtonLoading,
                        pressed && styles.ctaButtonPressed,
                      ]}
                      onPress={() => handlePurchasePress(tier.id)}
                      disabled={loading === tier.id || loading === 'restore'}
                    >
                      {loading === tier.id ? (
                        <View style={styles.loaderContent}>
                          <ActivityIndicator color={tier.featured ? '#0f172a' : '#fff'} />
                          <Text style={[styles.ctaText, tier.featured && styles.ctaTextFeatured]}>
                            Processing...
                          </Text>
                        </View>
                      ) : (
                        <Text style={[styles.ctaText, tier.featured && styles.ctaTextFeatured]}>
                          {tier.button}
                        </Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>

            {/* Trust Signals */}
            <View style={styles.trustContainer}>
              <View style={styles.trustSignal}>
                <Text style={styles.trustCheck}>✓</Text>
                <Text style={styles.trustSignalText}>Cancel anytime from your profile</Text>
              </View>
              <View style={styles.trustSignal}>
                <Text style={styles.trustCheck}>✓</Text>
                <Text style={styles.trustSignalText}>No hidden fees or surprises</Text>
              </View>
              <View style={styles.trustSignal}>
                <Text style={styles.trustCheck}>✓</Text>
                <Text style={styles.trustSignalText}>Secure Stripe payment processing</Text>
              </View>
              <View style={styles.trustSignal}>
                <Text style={styles.trustCheck}>✓</Text>
                <Text style={styles.trustSignalText}>Instant access after payment</Text>
              </View>
            </View>

            {/* Restore Purchases Button */}
            <Pressable
              style={styles.restoreButton}
              onPress={handleRestorePurchases}
              disabled={loading === 'restore'}
            >
              <Text style={styles.restoreButtonText}>
                {loading === 'restore' ? 'Restoring...' : 'Already have a subscription? Restore it'}
              </Text>
            </Pressable>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Success Toast */}
        {showSuccess && (
          <Animated.View
            style={[
              styles.successToast,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['#fbbf24', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.toastGradient}
            >
              <Text style={styles.successText}>✨ Welcome to {successTier}!</Text>
            </LinearGradient>
          </Animated.View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },

  portraitWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    position: 'relative',
  },

  portraitGlow: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    opacity: 0.5,
  },

  portraitContainer: {
    borderRadius: 9999,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: 'rgba(196, 181, 253, 0.7)',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 15,
  },

  portrait: {
    width: '100%',
    height: '100%',
  },

  brandSection: {
    alignItems: 'center',
  },

  brandBy: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(196, 181, 253, 0.8)',
    letterSpacing: 2,
    marginBottom: 6,
  },

  brandName: {
    fontSize: 44,
    fontWeight: '900',
    color: '#fbbf24',
    marginBottom: 16,
    letterSpacing: 0.5,
  },

  tagline: {
    fontSize: 15,
    color: 'rgba(196, 181, 253, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },

  // Pricing Section
  pricingSection: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fbbf24',
    textAlign: 'center',
    marginBottom: 28,
    letterSpacing: 0.5,
  },

  tiersWrapper: {
    gap: 16,
    marginBottom: 28,
  },

  tierCardContainer: {
    position: 'relative',
  },

  tierCardContainerFeatured: {
    marginVertical: 8,
  },

  badgeWrapper: {
    position: 'absolute',
    top: -10,
    left: 16,
    zIndex: 100,
  },

  badgeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },

  badge: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 0.5,
  },

  tierCard: {
    backgroundColor: 'rgba(30, 27, 75, 0.6)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.2)',
  },

  tierCardFeatured: {
    borderWidth: 2,
    borderColor: '#fbbf24',
    backgroundColor: 'rgba(79, 70, 229, 0.25)',
  },

  tierContent: {
    flex: 1,
    marginBottom: 16,
  },

  tierLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(196, 181, 253, 0.9)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  tierName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },

  price: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fbbf24',
  },

  period: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 4,
  },

  tierDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },

  ctaButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },

  ctaButtonFeatured: {
    backgroundColor: '#fbbf24',
  },

  ctaButtonLoading: {
    opacity: 0.7,
  },

  ctaButtonPressed: {
    opacity: 0.8,
  },

  ctaText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  ctaTextFeatured: {
    color: '#0f172a',
  },

  loaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  // Trust Signals
  trustContainer: {
    gap: 12,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(196, 181, 253, 0.2)',
  },

  trustSignal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  trustCheck: {
    color: 'rgba(196, 181, 253, 0.9)',
    fontWeight: '700',
    fontSize: 14,
  },

  trustSignalText: {
    fontSize: 13,
    color: 'rgba(196, 181, 253, 0.8)',
  },

  // Restore Button
  restoreButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.3)',
    alignItems: 'center',
  },

  restoreButtonText: {
    fontSize: 12,
    color: 'rgba(196, 181, 253, 0.7)',
    fontWeight: '500',
  },

  // Success Toast
  successToast: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  toastGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  successText: {
    color: '#0f172a',
    fontWeight: '600',
    fontSize: 14,
  },

  // Close Button
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 16,
    zIndex: 1000,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(196, 181, 253, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonText: {
    color: 'rgba(196, 181, 253, 0.8)',
    fontSize: 20,
    fontWeight: '300',
  },
});
