import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSessionStore, type Profile } from '@/store/useSessionStore';
import { platformErrorHandler } from '@/lib/platformErrorHandler';

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.warn('Unable to load profile', error.message);
    return null;
  }

  return data as Profile;
}

export function useAuthBootstrap() {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const setSession = useSessionStore((state) => state.setSession);
  const setProfile = useSessionStore((state) => state.setProfile);

  useEffect(() => {
    let isBootstrapComplete = false;
    let unsubscribe: (() => void) | null = null;

    const bootstrap = async () => {
      try {
        // Step 1: Get initial session
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          platformErrorHandler.handleAuthError(error);
          console.warn('Session lookup failed', error.message);
        }

        const session = data?.session ?? null;
        setSession(session);

        // Step 2: Fetch profile if session exists
        if (session) {
          const profile = await fetchProfile(session.user.id);
          setProfile(profile);
        } else {
          setProfile(null);
        }

        isBootstrapComplete = true;
        setIsBootstrapping(false);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        platformErrorHandler.handleInitError(err, 'useAuthBootstrap');
        isBootstrapComplete = true;
        setIsBootstrapping(false);
      }
    };

    // Step 3: Set up auth state change listener AFTER initial load
    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Only update state if we're past the initial bootstrap phase
      // This prevents race conditions where the listener updates state
      // before hydrateSession finishes
      if (isBootstrapComplete) {
        setSession(session);
        if (session) {
          const profile = await fetchProfile(session.user.id);
          setProfile(profile);
        } else {
          setProfile(null);
        }
      }
    });

    unsubscribe = subscription.subscription.unsubscribe;

    // Start bootstrap
    bootstrap();

    return () => {
      unsubscribe?.();
    };
  }, [setProfile, setSession]);

  return { isBootstrapping };
}
