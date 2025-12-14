import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { DashboardScreen } from '@/screens/main/DashboardScreen';
import { ComposerScreen } from '@/screens/main/ComposerScreen';
import { FavoritesScreen } from '@/screens/main/FavoritesScreen';
import { ManifestationScreen } from '@/screens/main/ManifestationScreen';
import { ProfileScreen } from '@/screens/main/ProfileScreen';
import { AdminScreen } from '@/screens/main/AdminScreen';
import { useSessionStore, type SessionState } from '@/store/useSessionStore';
import { useMemo } from 'react';

export type MainTabParamList = {
  Dashboard: undefined;
  Composer: undefined;
  Manifest: undefined;
  Favorites: undefined;
  Profile: undefined;
  Admin: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  const profile = useSessionStore((state: SessionState) => state.profile);
  const isAdmin = !!profile?.is_admin;

  const adminKey = useMemo(() => (isAdmin ? 'admin-enabled' : 'admin-disabled'), [isAdmin]);

  const renderIcon = (name: keyof typeof Feather.glyphMap) => (color: string) => (
    <Feather name={name} size={20} color={color} />
  );

  return (
    <Tab.Navigator
      key={adminKey}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#a855f7',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { backgroundColor: '#111827', borderTopColor: '#1f2937' }
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }: { color: string }) => renderIcon('activity')(color)
        }}
      />
      <Tab.Screen
        name="Composer"
        component={ComposerScreen}
        options={{
          tabBarIcon: ({ color }: { color: string }) => renderIcon('music')(color)
        }}
      />
      <Tab.Screen
        name="Manifest"
        component={ManifestationScreen}
        options={{
          tabBarIcon: ({ color }: { color: string }) => renderIcon('star')(color)
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({ color }: { color: string }) => renderIcon('heart')(color)
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }: { color: string }) => renderIcon('user')(color)
        }}
      />
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminScreen}
          options={{
            tabBarIcon: ({ color }: { color: string }) => renderIcon('shield')(color)
          }}
        />
      )}
    </Tab.Navigator>
  );
}
