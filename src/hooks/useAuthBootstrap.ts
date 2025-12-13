import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSessionStore, type Profile } from '@/store/useSessionStore';

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

  const hydrateSession = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Session lookup failed', error.message);
    }

    const session = data?.session ?? null;
    setSession(session);

    if (session) {
      const profile = await fetchProfile(session.user.id);
      setProfile(profile);
    } else {
      setProfile(null);
    }

    setIsBootstrapping(false);
  }, [setProfile, setSession]);

  useEffect(() => {
    hydrateSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        const profile = await fetchProfile(session.user.id);
        setProfile(profile);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [hydrateSession, setProfile, setSession]);

  return { isBootstrapping };
}
