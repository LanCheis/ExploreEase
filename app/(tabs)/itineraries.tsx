import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

import { useDeleteItinerary, useMyItineraries } from '@/hooks/useItineraries';
import { useAuthStore } from '@/stores/auth';
import type { Itinerary } from '@/types/itinerary';

function formatRange(start: string, end: string): string {
  const s = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const e = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${s} – ${e}`;
}

function dayCount(start: string, end: string): number {
  return (
    Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1
  );
}

export default function ItinerariesScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.session?.user.id);
  const { data: itineraries = [], isLoading } = useMyItineraries();
  const { mutate: doDelete } = useDeleteItinerary();

  if (!userId) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <Text style={{ textAlign: 'center', fontSize: 14, color: '#64748b' }}>
          Sign in to manage your travel itineraries.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>
        <Pressable
          onPress={() => router.push('/itinerary/new' as never)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#2563eb', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 }}
        >
          <FontAwesome name="plus" size={12} color="white" />
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 13 }}>New Itinerary</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={itineraries}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <ItineraryCard
              itinerary={item}
              onPress={() => router.push(`/itinerary/${item.id}` as never)}
              onDelete={() => doDelete(item.id)}
              onEdit={() => router.push(`/itinerary/new?edit=${item.id}` as never)}
            />
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', paddingVertical: 32 }}>
              No itineraries yet. Tap "New Itinerary" to get started.
            </Text>
          }
        />
      )}
    </View>
  );
}

function ItineraryCard({
  itinerary,
  onPress,
  onDelete,
  onEdit,
}: {
  itinerary: Itinerary;
  onPress: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a' }} numberOfLines={1}>
            {itinerary.title}
          </Text>
          <Text style={{ fontSize: 12, color: '#64748b' }}>
            {formatRange(itinerary.start_date, itinerary.end_date)} · {dayCount(itinerary.start_date, itinerary.end_date)} days
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12, paddingTop: 2 }}>
          <Pressable onPress={onEdit} hitSlop={8}>
            <FontAwesome name="pencil" size={15} color="#94a3b8" />
          </Pressable>
          <Pressable onPress={onDelete} hitSlop={8}>
            <FontAwesome name="trash-o" size={15} color="#94a3b8" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
