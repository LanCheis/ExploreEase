import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Platform, View, Text } from 'react-native';
import 'react-native-reanimated';

import '../global.css';

import { getPlacesPage } from '@/lib/places';
import { requestPermissionsAsync } from '@/lib/notifications';
import { useColorScheme } from '@/components/useColorScheme';
import { isProfileComplete, useAuthStore } from '@/stores/auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24 * 7,
      networkMode: 'offlineFirst',
      retry: 2,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

const persistOptions = {
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24 * 7,
  buster: 'v1',
  dehydrateOptions: {
    shouldDehydrateQuery: (query: { queryKey: unknown[] }) => {
      const key = query.queryKey[0] as string;
      return ['places', 'place', 'favorites', 'profile', 'events', 'event', 'itineraries', 'itinerary', 'reviews'].includes(key);
    },
  },
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

// PersistQueryClientProvider is the outermost wrapper so cache hydration from
// AsyncStorage begins immediately on launch — before auth or fonts load.
// This prevents the prefetchInfiniteQuery below from racing ahead of hydration.
export default function RootLayout() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <RootLayoutInner />
    </PersistQueryClientProvider>
  );
}

function RootLayoutInner() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    // Skip prefetch when offline — persisted cache already has this data and
    // firing a network request before hydration completes would race and lose.
    if (Platform.OS !== 'web' || navigator.onLine) {
      // Prefetch the default discover view in parallel with auth so data is
      // ready the moment the screen mounts, instead of waiting for auth first.
      queryClient.prefetchInfiniteQuery({
        queryKey: ['places', { category: 'attraction', sort: 'relevance' }],
        queryFn: ({ pageParam }) =>
          getPlacesPage({ category: 'attraction', sort: 'relevance', page: pageParam as number }),
        initialPageParam: 0,
      });
    }

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

function useIsOnline() {
  const [online, setOnline] = useState(
    Platform.OS === 'web' ? navigator.onLine : true
  );

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return online;
}

function OfflineBadge() {
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: '#ef4444',
        paddingVertical: 4,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Offline</Text>
    </View>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const isOnline = useIsOnline();

  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const interests = useAuthStore((s) => s.interests);

  useEffect(() => {
    if (session) {
      requestPermissionsAsync();
    }
  }, [session]);

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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
        {!isOnline && <OfflineBadge />}
      </View>
    </ThemeProvider>
  );
}
