import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSessionStore, type SessionState } from '@/store/useSessionStore';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { MainTabs, MainTabParamList } from '@/navigation/MainTabs';
import MobilePaywall from '@/screens/main/MobilePaywall';

export type RootStackParamList = {
  Auth: undefined;
  Main: MainTabParamList;
  Paywall: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const session = useSessionStore((state) => state.session);
  const profile = useSessionStore((state: SessionState) => state.profile);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen name="Paywall" component={MobilePaywall} />
          </Stack.Group>
        </>
      ) : (
        <Stack.Screen name="Auth" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
