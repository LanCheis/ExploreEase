import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

import { CategoryTabs } from '@/components/CategoryTabs';
import { DEFAULT_FILTERS, FilterBar } from '@/components/FilterBar';
import type { FilterState } from '@/components/FilterBar';
import { PlaceCard } from '@/components/PlaceCard';
import { SearchBar } from '@/components/SearchBar';
import { useFavoriteIds, useToggleFavorite } from '@/hooks/useFavorites';
import { usePlacesInfinite } from '@/hooks/usePlaces';
import { useAuthStore } from '@/stores/auth';
import type { PlaceCategory } from '@/types/place';

export default function DiscoverScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.session?.user.id);
  const [category, setCategory] = useState<PlaceCategory>('attraction');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePlacesInfinite({
      category,
      search: search || undefined,
      minRating: filters.minRating,
      maxPriceLevel: filters.maxPriceLevel,
      sort: filters.sort,
    });

  const { data: favoriteIds = [] } = useFavoriteIds();
  const { mutate: toggleFavorite } = useToggleFavorite();

  const places = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <View className="flex-1 bg-slate-50">
      <View className="gap-2 px-4 pb-2 pt-4">
        <CategoryTabs value={category} onChange={setCategory} />
        <SearchBar value={search} onChange={setSearch} />
        <FilterBar value={filters} onChange={setFilters} />
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
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator style={{ paddingVertical: 16 }} />
            ) : !hasNextPage && places.length > 0 ? (
              <Text className="py-4 text-center text-xs text-slate-400">No more results</Text>
            ) : null
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.3}
        />
      )}
    </View>
  );
}
