import { useEffect, useState } from 'react';
import { useRemindersStore } from '@/store/useRemindersStore';
import { useJournalStore } from '@/store/useJournalStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useOfflineStore } from '@/store/useOfflineStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useCommunityStore } from '@/store/useCommunityStore';
import { platformErrorHandler } from '@/lib/platformErrorHandler';

/**
 * Wait for all Zustand stores with AsyncStorage persistence to hydrate from storage.
 * This prevents rendering before persisted data is loaded.
 */
export function useStoreHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const checkHydration = async () => {
      // Get the hydrated flag from each store's internal state
      // Zustand stores set a _hasHydrated flag after loading from storage
      const reminderState = useRemindersStore.getState();
      const journalState = useJournalStore.getState();
      const themeState = useThemeStore.getState();
      const offlineState = useOfflineStore.getState();
      const favoritesState = useFavoritesStore.getState();
      const communityState = useCommunityStore.getState();

      // Wait for each store's persist middleware to mark as hydrated
      // The persist middleware sets a _hasHydrated flag when done
      let retries = 0;
      const maxRetries = 50; // 5 seconds max wait

      while (retries < maxRetries) {
        const remindersHydrated = (reminderState as any)._hasHydrated !== false;
        const journalHydrated = (journalState as any)._hasHydrated !== false;
        const themeHydrated = (themeState as any)._hasHydrated !== false;
        const offlineHydrated = (offlineState as any)._hasHydrated !== false;
        const favoritesHydrated = (favoritesState as any)._hasHydrated !== false;
        const communityHydrated = (communityState as any)._hasHydrated !== false;

        if (
          remindersHydrated &&
          journalHydrated &&
          themeHydrated &&
          offlineHydrated &&
          favoritesHydrated &&
          communityHydrated
        ) {
          setIsHydrated(true);
          console.log('✅ All stores hydrated');
          return;
        }

        // Wait 100ms and retry
        await new Promise((resolve) => setTimeout(resolve, 100));
        retries++;
      }

      // If we get here, at least one store didn't hydrate
      // But log and continue anyway to prevent infinite loading
      const msg = 'Store hydration timeout - some stores may not be ready';
      platformErrorHandler.handleAsyncStorageError(new Error(msg));
      console.warn('⚠️', msg);
      setIsHydrated(true);
    };

    checkHydration();
  }, []);

  return { isHydrated };
}
