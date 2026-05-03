import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { supabase } from '@/lib/supabase';
import { getEventsPage } from '@/lib/events';
import { useAddItem } from '@/hooks/useItineraries';

type Mode = 'custom' | 'place' | 'event';

interface Props {
  visible: boolean;
  itineraryId: string;
  dayNumber: number;
  onClose: () => void;
}

export function AddItemModal({ visible, itineraryId, dayNumber, onClose }: Props) {
  const [mode, setMode] = useState<Mode>('custom');
  const [customTitle, setCustomTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [notes, setNotes] = useState('');
  const [placeSearch, setPlaceSearch] = useState('');

  const { mutate: doAdd, isPending } = useAddItem(itineraryId);

  const { data: placeResults = [] } = useQuery({
    queryKey: ['places-picker', placeSearch],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('places')
        .select('id, name, category')
        .ilike('name', `%${placeSearch}%`)
        .limit(15);
      if (error) throw error;
      return (data ?? []) as { id: string; name: string; category: string }[];
    },
    enabled: placeSearch.length >= 1,
  });

  const { data: eventPage } = useQuery({
    queryKey: ['events-picker'],
    queryFn: () => getEventsPage({ page: 0, pageSize: 20 }),
    enabled: mode === 'event',
  });
  const events = eventPage?.data ?? [];

  function nextSortOrder() {
    return Math.floor(Date.now() / 1000);
  }

  function addPlace(placeId: string) {
    doAdd(
      { itineraryId, placeId, dayNumber, sortOrder: nextSortOrder() },
      {
        onSuccess: () => { reset(); onClose(); },
        onError: (e) => Alert.alert('Error', (e as Error).message),
      },
    );
  }

  function addEvent(eventId: string) {
    doAdd(
      { itineraryId, eventId, dayNumber, sortOrder: nextSortOrder() },
      {
        onSuccess: () => { reset(); onClose(); },
        onError: (e) => Alert.alert('Error', (e as Error).message),
      },
    );
  }

  function addCustom() {
    if (!customTitle.trim()) return;
    doAdd(
      {
        itineraryId,
        customTitle: customTitle.trim(),
        dayNumber,
        startTime: startTime.trim() || undefined,
        notes: notes.trim() || undefined,
        sortOrder: nextSortOrder(),
      },
      {
        onSuccess: () => { reset(); onClose(); },
        onError: (e) => Alert.alert('Error', (e as Error).message),
      },
    );
  }

  function reset() {
    setMode('custom');
    setCustomTitle('');
    setStartTime('');
    setNotes('');
    setPlaceSearch('');
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View style={{ backgroundColor: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '85%' }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a' }}>
              Add item — Day {dayNumber}
            </Text>
            <Pressable onPress={() => { reset(); onClose(); }} hitSlop={8}>
              <FontAwesome name="times" size={18} color="#64748b" />
            </Pressable>
          </View>

          {/* Mode tabs */}
          <View style={{ flexDirection: 'row', gap: 8, padding: 12 }}>
            {(['custom', 'place', 'event'] as Mode[]).map((m) => (
              <Pressable
                key={m}
                onPress={() => setMode(m)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 7,
                  borderRadius: 8,
                  backgroundColor: mode === m ? '#2563eb' : '#f1f5f9',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: mode === m ? 'white' : '#64748b', textTransform: 'capitalize' }}>
                  {m}
                </Text>
              </Pressable>
            ))}
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" style={{ paddingHorizontal: 16 }}>
            {mode === 'custom' && (
              <View style={{ gap: 12, paddingBottom: 24 }}>
                <TextInput
                  value={customTitle}
                  onChangeText={setCustomTitle}
                  placeholder="Activity title"
                  style={inputStyle}
                />
                <TextInput
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="Start time (HH:MM, optional)"
                  style={inputStyle}
                />
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Notes (optional)"
                  multiline
                  style={[inputStyle, { minHeight: 60 }]}
                />
                <Pressable
                  onPress={addCustom}
                  disabled={!customTitle.trim() || isPending}
                  style={{
                    alignItems: 'center',
                    backgroundColor: customTitle.trim() ? '#2563eb' : '#cbd5e1',
                    borderRadius: 8,
                    paddingVertical: 12,
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '600' }}>
                    {isPending ? '...' : 'Add'}
                  </Text>
                </Pressable>
              </View>
            )}

            {mode === 'place' && (
              <View style={{ gap: 8, paddingBottom: 24 }}>
                <TextInput
                  value={placeSearch}
                  onChangeText={setPlaceSearch}
                  placeholder="Search places..."
                  style={inputStyle}
                  autoFocus
                />
                {placeResults.length === 0 && placeSearch.length >= 1 ? (
                  <Text style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', paddingVertical: 12 }}>
                    No places found
                  </Text>
                ) : (
                  placeResults.map((p) => (
                    <Pressable
                      key={p.id}
                      onPress={() => addPlace(p.id)}
                      disabled={isPending}
                      style={{ backgroundColor: '#f8fafc', borderRadius: 8, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }}>{p.name}</Text>
                        <Text style={{ fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>{p.category}</Text>
                      </View>
                      {isPending ? <ActivityIndicator size="small" /> : <FontAwesome name="plus" size={14} color="#2563eb" />}
                    </Pressable>
                  ))
                )}
              </View>
            )}

            {mode === 'event' && (
              <View style={{ gap: 8, paddingBottom: 24 }}>
                {events.length === 0 ? (
                  <ActivityIndicator style={{ paddingVertical: 24 }} />
                ) : (
                  events.map((e) => (
                    <Pressable
                      key={e.id}
                      onPress={() => addEvent(e.id)}
                      disabled={isPending}
                      style={{ backgroundColor: '#f8fafc', borderRadius: 8, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }} numberOfLines={1}>{e.title}</Text>
                        <Text style={{ fontSize: 12, color: '#64748b' }}>
                          {new Date(e.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                      </View>
                      {isPending ? <ActivityIndicator size="small" /> : <FontAwesome name="plus" size={14} color="#2563eb" />}
                    </Pressable>
                  ))
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const inputStyle = {
  backgroundColor: '#f8fafc',
  borderWidth: 1,
  borderColor: '#e2e8f0',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 14,
  color: '#0f172a',
} as const;
