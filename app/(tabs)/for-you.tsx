import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

import { PlaceCard } from '@/components/PlaceCard';
import { useFavoriteIds, useToggleFavorite } from '@/hooks/useFavorites';
import { usePersonalizedPlaces } from '@/hooks/usePersonalizedPlaces';
import { useUserInterests } from '@/hooks/useUserInterests';
import { useAuthStore } from '@/stores/auth';

export default function ForYouScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.session?.user.id);
  const { data: interests = [] } = useUserInterests();
  const { data: places = [], isLoading, isError, refetch } = usePersonalizedPlaces();
  const { data: favoriteIds = [] } = useFavoriteIds();
  const { mutate: toggleFavorite } = useToggleFavorite();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Text className="mb-4 text-center text-sm text-rose-600">Failed to load places.</Text>
        <Pressable onPress={() => refetch()} className="rounded-lg bg-blue-600 px-4 py-2">
          <Text className="text-sm font-semibold text-white">Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (interests.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Text className="mb-2 text-center text-base font-semibold text-slate-900">
          No picks yet
        </Text>
        <Text className="mb-6 text-center text-sm text-slate-500">
          Tell us what you like to get personalized picks.
        </Text>
        <Pressable
          onPress={() => router.push('/(tabs)/profile')}
          className="rounded-lg bg-blue-600 px-4 py-2"
        >
          <Text className="text-sm font-semibold text-white">Update your interests</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <View className="px-4 pb-1 pt-4">
        <Text className="text-xs font-semibold uppercase tracking-wide text-blue-600">
          ML-powered
        </Text>
        <Text className="text-lg font-bold text-slate-900">For You</Text>
      </View>
      <FlatList
        data={places}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <PlaceCard
            place={item}
            onPress={() => router.push(`/place/${item.id}`)}
            isFavorite={favoriteIds.includes(item.id)}
            onToggleFavorite={
              userId
                ? () =>
                    toggleFavorite({
                      placeId: item.id,
                      isFav: favoriteIds.includes(item.id),
                    })
                : undefined
            }
          />
        )}
        ListEmptyComponent={
          <Text className="py-8 text-center text-sm text-slate-500">No places found.</Text>
        }
      />
    </View>
  );
}
