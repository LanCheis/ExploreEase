import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import '../global.css';

import { useColorScheme } from '@/components/useColorScheme';
import { isProfileComplete, useAuthStore } from '@/stores/auth';

const queryClient = new QueryClient();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    useAuthStore
      .getState()
      .init()
      .then((u) => {
        unsub = u;
      });
    return () => unsub?.();
  }, []);

  useEffect(() => {
    if (loaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isLoading]);

  if (!loaded || isLoading) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const interests = useAuthStore((s) => s.interests);

  useEffect(() => {
    // Recovery flow: don't redirect away from the reset-password screen even if a
    // session is present (Supabase sets a recovery session when the email link is clicked).
    if (segments[1] === 'reset-password') return;

    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';
    const complete = isProfileComplete(profile, interests);

    if (!session) {
      if (!inAuth) router.replace('/sign-in');
    } else if (!complete) {
      if (!inOnboarding) router.replace('/profile-setup');
    } else if (inAuth || inOnboarding) {
      router.replace('/');
    }
  }, [session, profile, interests, segments, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
