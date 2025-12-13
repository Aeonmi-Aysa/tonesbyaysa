import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSessionStore } from '@/store/useSessionStore';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { MainTabs } from '@/navigation/MainTabs';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const session = useSessionStore((state) => state.session);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
