import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, View } from 'react-native';

import { useAdminEvents, useDeleteEvent, useSetEventStatus } from '@/hooks/useAdmin';
import type { EventStatus } from '@/types/event';

const FILTERS = ['all', 'pending', 'approved', 'rejected'] as const;
type Filter = (typeof FILTERS)[number];

const STATUS_COLOR: Record<EventStatus, string> = {
  pending: '#d97706',
  approved: '#16a34a',
  rejected: '#dc2626',
};

export default function AdminEvents() {
  const [filter, setFilter] = useState<Filter>('all');
  const { data: events = [], isLoading, refetch } = useAdminEvents(
    filter === 'all' ? undefined : (filter as EventStatus),
  );
  const setStatus = useSetEventStatus();
  const del = useDeleteEvent();

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="border-b border-slate-200 bg-white"
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}
      >
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 ${filter === f ? 'bg-blue-600' : 'bg-slate-100'}`}
          >
            <Text
              className={`text-sm font-semibold capitalize ${filter === f ? 'text-white' : 'text-slate-600'}`}
            >
              {f}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 16, gap: 8 }}
          data={events}
          keyExtractor={(e) => e.id}
          refreshing={isLoading}
          onRefresh={refetch}
          ListEmptyComponent={
            <Text className="mt-8 text-center text-slate-400">No events.</Text>
          }
          renderItem={({ item: e }) => {
            const color = STATUS_COLOR[e.status] ?? '#94a3b8';
            return (
              <View className="gap-2 rounded-xl border border-slate-200 bg-white p-4">
                <View className="flex-row items-center justify-between">
                  <Text className="mr-2 flex-1 font-semibold text-slate-900" numberOfLines={1}>
                    {e.title}
                  </Text>
                  <View
                    style={{
                      backgroundColor: color + '20',
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <Text
                      style={{ color, fontSize: 11, fontWeight: '600', textTransform: 'capitalize' }}
                    >
                      {e.status}
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-slate-500">
                  {new Date(e.start_time).toLocaleDateString()} · {e.category}
                </Text>
                <View className="mt-1 flex-row gap-2">
                  {e.status === 'pending' && (
                    <>
                      <Pressable
                        onPress={() => setStatus.mutate({ eventId: e.id, status: 'approved' })}
                        disabled={setStatus.isPending}
                        className="flex-1 flex-row items-center justify-center gap-1 rounded-lg bg-green-600 py-2"
                      >
                        <FontAwesome name="check" size={12} color="white" />
                        <Text className="text-xs font-semibold text-white">Approve</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setStatus.mutate({ eventId: e.id, status: 'rejected' })}
                        disabled={setStatus.isPending}
                        className="flex-1 flex-row items-center justify-center gap-1 rounded-lg bg-orange-500 py-2"
                      >
                        <FontAwesome name="times" size={12} color="white" />
                        <Text className="text-xs font-semibold text-white">Reject</Text>
                      </Pressable>
                    </>
                  )}
                  <Pressable
                    onPress={() => del.mutate(e.id)}
                    disabled={del.isPending}
                    className="flex-row items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2"
                  >
                    <FontAwesome name="trash" size={12} color="#dc2626" />
                    <Text className="text-xs font-semibold text-red-600">Delete</Text>
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
