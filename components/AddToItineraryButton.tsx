import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { useAddItem, useMyItineraries } from '@/hooks/useItineraries';
import type { Itinerary } from '@/types/itinerary';

interface Props {
  placeId?: string;
  placeName?: string;
  eventId?: string;
  eventTitle?: string;
}

export function AddToItineraryButton({ placeId, placeName, eventId, eventTitle }: Props) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);

  const { data: itineraries = [], isLoading } = useMyItineraries();

  function close() {
    setShowModal(false);
    setSelectedItinerary(null);
  }

  return (
    <>
      <Pressable
        onPress={() => setShowModal(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#2563eb',
          paddingVertical: 12,
        }}
      >
        <FontAwesome name="bookmark-o" size={14} color="#2563eb" />
        <Text style={{ color: '#2563eb', fontWeight: '600', fontSize: 14 }}>Add to Itinerary</Text>
      </Pressable>

      <Modal visible={showModal} animationType="slide" transparent onRequestClose={close}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '80%' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
              <Pressable onPress={selectedItinerary ? () => setSelectedItinerary(null) : close} hitSlop={8}>
                <FontAwesome name={selectedItinerary ? 'arrow-left' : 'times'} size={18} color="#64748b" />
              </Pressable>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a' }}>
                {selectedItinerary ? 'Pick a day' : 'Add to Itinerary'}
              </Text>
              <View style={{ width: 18 }} />
            </View>

            {selectedItinerary ? (
              <DayPicker
                itinerary={selectedItinerary}
                placeId={placeId}
                eventId={eventId}
                onDone={close}
              />
            ) : (
              <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
                {isLoading ? (
                  <ActivityIndicator style={{ paddingVertical: 24 }} />
                ) : itineraries.length === 0 ? (
                  <Text style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', paddingVertical: 12 }}>
                    No itineraries yet.
                  </Text>
                ) : (
                  itineraries.map((it) => (
                    <Pressable
                      key={it.id}
                      onPress={() => setSelectedItinerary(it)}
                      style={{ backgroundColor: '#f8fafc', borderRadius: 10, padding: 14, gap: 2 }}
                    >
                      <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a' }}>{it.title}</Text>
                      <Text style={{ fontSize: 12, color: '#64748b' }}>
                        {formatRange(it.start_date, it.end_date)}
                      </Text>
                    </Pressable>
                  ))
                )}
                <Pressable
                  onPress={() => { close(); router.push('/itinerary/new' as never); }}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed', paddingVertical: 14 }}
                >
                  <FontAwesome name="plus" size={12} color="#64748b" />
                  <Text style={{ fontSize: 14, color: '#64748b', fontWeight: '500' }}>Create new itinerary</Text>
                </Pressable>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

function DayPicker({
  itinerary,
  placeId,
  eventId,
  onDone,
}: {
  itinerary: Itinerary;
  placeId?: string;
  eventId?: string;
  onDone: () => void;
}) {
  const totalDays = Math.floor(
    (new Date(itinerary.end_date).getTime() - new Date(itinerary.start_date).getTime()) / 86400000,
  ) + 1;

  const { mutate: doAdd, isPending } = useAddItem(itinerary.id);

  function add(dayNumber: number) {
    doAdd(
      {
        itineraryId: itinerary.id,
        placeId,
        eventId,
        dayNumber,
        sortOrder: Math.floor(Date.now() / 1000),
      },
      {
        onSuccess: onDone,
        onError: (e) => Alert.alert('Error', (e as Error).message),
      },
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
      <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>{itinerary.title}</Text>
      {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
        const date = new Date(itinerary.start_date);
        date.setDate(date.getDate() + day - 1);
        const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        return (
          <Pressable
            key={day}
            onPress={() => add(day)}
            disabled={isPending}
            style={{ backgroundColor: '#f8fafc', borderRadius: 10, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a' }}>Day {day}</Text>
              <Text style={{ fontSize: 12, color: '#64748b' }}>{label}</Text>
            </View>
            {isPending ? (
              <ActivityIndicator size="small" />
            ) : (
              <FontAwesome name="plus" size={14} color="#2563eb" />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function formatRange(start: string, end: string): string {
  const s = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const e = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${s} – ${e}`;
}
