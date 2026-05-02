import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, View } from 'react-native';

import { EventCard } from '@/components/EventCard';
import { SearchBar } from '@/components/SearchBar';
import { useEventsInfinite } from '@/hooks/useEvents';

const CATEGORIES = ['all', 'general', 'food', 'music', 'sports', 'arts', 'festival'] as const;
type CategoryFilter = (typeof CATEGORIES)[number];

export default function EventsScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useEventsInfinite({
      category: category === 'all' ? undefined : category,
      search: search || undefined,
    });

  const events = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ gap: 8, paddingHorizontal: 16, paddingBottom: 8, paddingTop: 16 }}>
        <SearchBar value={search} onChange={setSearch} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {CATEGORIES.map((c) => (
            <Pressable
              key={c}
              onPress={() => setCategory(c)}
              style={{
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 6,
                backgroundColor: category === c ? '#2563eb' : '#f1f5f9',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '500',
                  color: category === c ? 'white' : '#64748b',
                  textTransform: 'capitalize',
                }}
              >
                {c}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : isError ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Text style={{ textAlign: 'center', fontSize: 13, color: '#e11d48' }}>
            {(error as Error)?.message ?? 'Failed to load events.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(e) => e.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <EventCard event={item} onPress={() => router.push(`/event/${item.id}` as never)} />
          )}
          ListEmptyComponent={
            <Text
              style={{
                textAlign: 'center',
                fontSize: 13,
                color: '#94a3b8',
                paddingVertical: 32,
              }}
            >
              No upcoming events.
            </Text>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator style={{ paddingVertical: 16 }} />
            ) : !hasNextPage && events.length > 0 ? (
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 11,
                  color: '#94a3b8',
                  paddingVertical: 16,
                }}
              >
                No more events
              </Text>
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
