import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { AddItemModal } from '@/components/AddItemModal';
import {
  useDeleteItem,
  useDeleteItinerary,
  useItinerary,
  useItineraryItems,
  useMoveItem,
} from '@/hooks/useItineraries';
import type { ItineraryItemWithDetails } from '@/types/itinerary';

function dayDate(startDate: string, dayNumber: number): string {
  const d = new Date(startDate);
  d.setDate(d.getDate() + dayNumber - 1);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function itemLabel(item: ItineraryItemWithDetails): string {
  if (item.place) return item.place.name;
  if (item.event) return item.event.title;
  return item.custom_title ?? '—';
}

function itemSubLabel(item: ItineraryItemWithDetails): string {
  if (item.place) return item.place.category;
  if (item.event) return 'event';
  return 'custom';
}

export default function ItineraryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [addDay, setAddDay] = useState<number | null>(null);

  const { data: itinerary, isLoading, isError, error } = useItinerary(id);
  const { data: items = [], isLoading: itemsLoading } = useItineraryItems(id);
  const { mutate: doDeleteItinerary } = useDeleteItinerary();
  const { mutate: doDeleteItem } = useDeleteItem(id);
  const { mutate: doMove } = useMoveItem(id);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !itinerary) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <Text style={{ textAlign: 'center', fontSize: 13, color: '#e11d48' }}>
          {(error as Error)?.message ?? 'Itinerary not found.'}
        </Text>
      </View>
    );
  }

  const totalDays =
    Math.floor(
      (new Date(itinerary.end_date).getTime() - new Date(itinerary.start_date).getTime()) /
        86400000,
    ) + 1;

  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const itemsByDay: Record<number, ItineraryItemWithDetails[]> = {};
  for (const item of items) {
    if (!itemsByDay[item.day_number]) itemsByDay[item.day_number] = [];
    itemsByDay[item.day_number].push(item);
  }

  function confirmDeleteItinerary() {
    Alert.alert('Delete Itinerary', `Delete "${itinerary!.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          doDeleteItinerary(id, {
            onSuccess: () => router.replace('/(tabs)/itineraries' as never),
          }),
      },
    ]);
  }

  function moveUp(dayItems: ItineraryItemWithDetails[], idx: number) {
    if (idx === 0) return;
    const item = dayItems[idx];
    const neighbor = dayItems[idx - 1];
    doMove({
      itemId: item.id,
      itemNewOrder: neighbor.sort_order,
      neighborId: neighbor.id,
      neighborNewOrder: item.sort_order,
    });
  }

  function moveDown(dayItems: ItineraryItemWithDetails[], idx: number) {
    if (idx === dayItems.length - 1) return;
    const item = dayItems[idx];
    const neighbor = dayItems[idx + 1];
    doMove({
      itemId: item.id,
      itemNewOrder: neighbor.sort_order,
      neighborId: neighbor.id,
      neighborNewOrder: item.sort_order,
    });
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: itinerary.title,
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 16, marginRight: 4 }}>
              <Pressable
                onPress={() => router.push(`/itinerary/new?edit=${id}` as never)}
                hitSlop={8}
              >
                <FontAwesome name="pencil" size={18} color="#64748b" />
              </Pressable>
              <Pressable onPress={confirmDeleteItinerary} hitSlop={8}>
                <FontAwesome name="trash-o" size={18} color="#64748b" />
              </Pressable>
            </View>
          ),
        }}
      />

      <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        {/* Date range banner */}
        <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 }}>
          <Text style={{ fontSize: 13, color: '#64748b' }}>
            {new Date(itinerary.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            {' – '}
            {new Date(itinerary.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {' · '}
            {totalDays} {totalDays === 1 ? 'day' : 'days'}
          </Text>
        </View>

        {itemsLoading ? (
          <ActivityIndicator style={{ paddingVertical: 32 }} />
        ) : (
          days.map((day) => {
            const dayItems = itemsByDay[day] ?? [];
            return (
              <View key={day} style={{ marginBottom: 8 }}>
                {/* Day header */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    backgroundColor: '#f1f5f9',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#334155' }}>
                    Day {day} — {dayDate(itinerary.start_date, day)}
                  </Text>
                  <Pressable
                    onPress={() => setAddDay(day)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                  >
                    <FontAwesome name="plus" size={11} color="#2563eb" />
                    <Text style={{ fontSize: 12, color: '#2563eb', fontWeight: '600' }}>Add</Text>
                  </Pressable>
                </View>

                {/* Items */}
                {dayItems.length === 0 ? (
                  <Text style={{ paddingHorizontal: 16, paddingVertical: 12, fontSize: 13, color: '#94a3b8' }}>
                    Nothing planned yet.
                  </Text>
                ) : (
                  dayItems.map((item, idx) => (
                    <View
                      key={item.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: '#f1f5f9',
                        backgroundColor: 'white',
                        gap: 10,
                      }}
                    >
                      {/* Up/down */}
                      <View style={{ gap: 4 }}>
                        <Pressable
                          onPress={() => moveUp(dayItems, idx)}
                          disabled={idx === 0}
                          hitSlop={6}
                        >
                          <FontAwesome
                            name="chevron-up"
                            size={12}
                            color={idx === 0 ? '#e2e8f0' : '#94a3b8'}
                          />
                        </Pressable>
                        <Pressable
                          onPress={() => moveDown(dayItems, idx)}
                          disabled={idx === dayItems.length - 1}
                          hitSlop={6}
                        >
                          <FontAwesome
                            name="chevron-down"
                            size={12}
                            color={idx === dayItems.length - 1 ? '#e2e8f0' : '#94a3b8'}
                          />
                        </Pressable>
                      </View>

                      {/* Content */}
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }} numberOfLines={1}>
                          {itemLabel(item)}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                          <Text
                            style={{
                              fontSize: 11,
                              color: '#64748b',
                              textTransform: 'capitalize',
                            }}
                          >
                            {itemSubLabel(item)}
                          </Text>
                          {item.start_time ? (
                            <Text style={{ fontSize: 11, color: '#64748b' }}>
                              · {item.start_time.slice(0, 5)}
                            </Text>
                          ) : null}
                        </View>
                        {item.notes ? (
                          <Text style={{ fontSize: 12, color: '#94a3b8' }} numberOfLines={1}>
                            {item.notes}
                          </Text>
                        ) : null}
                      </View>

                      {/* Delete */}
                      <Pressable onPress={() => doDeleteItem(item.id)} hitSlop={8}>
                        <FontAwesome name="times" size={15} color="#cbd5e1" />
                      </Pressable>
                    </View>
                  ))
                )}
              </View>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {addDay !== null ? (
        <AddItemModal
          visible
          itineraryId={id}
          dayNumber={addDay}
          onClose={() => setAddDay(null)}
        />
      ) : null}
    </>
  );
}
