import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

import { PlaceCard } from '@/components/PlaceCard';
import { useFavoriteIds, useFavoritePlaces, useToggleFavorite } from '@/hooks/useFavorites';
import { useAuthStore } from '@/stores/auth';

export default function FavoritesScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.session?.user.id);
  const { data: places = [], isLoading, isError, error } = useFavoritePlaces();
  const { data: favoriteIds = [] } = useFavoriteIds();
  const { mutate: toggleFavorite } = useToggleFavorite();

  if (!userId) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Text className="text-center text-sm text-slate-500">
          Sign in to see your saved places.
        </Text>
      </View>
    );
  }

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
        <Text className="text-center text-sm text-rose-600">
          {(error as Error)?.message ?? 'Failed to load favorites.'}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={places}
      keyExtractor={(p) => p.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      style={{ backgroundColor: '#f8fafc' }}
      renderItem={({ item }) => (
        <PlaceCard
          place={item}
          onPress={() => router.push(`/place/${item.id}`)}
          isFavorite={favoriteIds.includes(item.id)}
          onToggleFavorite={() => toggleFavorite({ placeId: item.id, isFav: true })}
        />
      )}
      ListEmptyComponent={
        <View className="py-16">
          <Text className="text-center text-sm text-slate-500">
            {'No saved places yet.\nTap the heart on any place to save it.'}
          </Text>
        </View>
      }
    />
  );
}
