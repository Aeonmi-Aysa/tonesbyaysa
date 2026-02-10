import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';

export type SubscriptionTier = 'free' | 'weekly' | 'lifetime';

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: SubscriptionTier | null;
  subscription_status: string | null;
  is_admin?: boolean;
  avatar_url?: string | null;
  trial_started_at?: string | null;
  trial_ends_at?: string | null;
};

export type SessionState = {
  session: Session | null;
  profile: Profile | null;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  reset: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  profile: null,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  reset: () => set({ session: null, profile: null })
}));

// Map subscription tiers to a simple numeric level for gating logic.
// Level 1: free, 2: weekly, 3: lifetime
export const getTierLevel = (tier: SubscriptionTier | null | undefined): 1 | 2 | 3 => {
  switch (tier) {
    case 'weekly':
      return 2;
    case 'lifetime':
      return 3;
    case 'free':
    default:
      return 1;
  }
};
