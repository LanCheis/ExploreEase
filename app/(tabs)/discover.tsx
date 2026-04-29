import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

import { CategoryTabs } from '@/components/CategoryTabs';
import { PlaceCard } from '@/components/PlaceCard';
import { usePlaces } from '@/hooks/usePlaces';
import type { PlaceCategory } from '@/types/place';

export default function DiscoverScreen() {
  const router = useRouter();
  const { data, isLoading, isError, error } = usePlaces();
  const [category, setCategory] = useState<PlaceCategory>('attraction');

  const filtered = (data ?? []).filter((p) => p.category === category);

  return (
    <View className="flex-1 bg-slate-50">
      <View className="px-4 pb-2 pt-4">
        <CategoryTabs value={category} onChange={setCategory} />
      </View>
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-rose-600">
            {(error as Error)?.message ?? 'Failed to load places.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <PlaceCard
              place={item}
              onPress={() => router.push(`/place/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <Text className="text-center text-sm text-slate-500">
              No places in this category.
            </Text>
          }
        />
      )}
    </View>
  );
}
