import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Redirect, Stack, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useAuthStore } from '@/stores/auth';

function BackToAdmin() {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.replace('/admin')} style={{ paddingRight: 12 }}>
      <FontAwesome name="chevron-left" size={16} color="#2563eb" />
    </Pressable>
  );
}

export default function AdminLayout() {
  const profile = useAuthStore((s) => s.profile);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
  if (!profile?.is_admin) return <Redirect href="/(tabs)" />;

  const withBack = (title: string) => ({
    title,
    headerLeft: () => <BackToAdmin />,
  });

  return (
    <Stack>
      <Stack.Screen name="index"     options={{ title: 'Admin Dashboard' }} />
      <Stack.Screen name="users"     options={withBack('Users')} />
      <Stack.Screen name="events"    options={withBack('Events')} />
      <Stack.Screen name="reviews"   options={withBack('Reviews')} />
      <Stack.Screen name="analytics" options={withBack('Analytics')} />
    </Stack>
  );
}
