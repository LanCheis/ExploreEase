import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

import { useAdminReviews, useDeleteReview, useUnflagReview } from '@/hooks/useAdmin';

export default function AdminReviews() {
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const { data: reviews = [], isLoading, refetch } = useAdminReviews(flaggedOnly);
  const del = useDeleteReview();
  const unflag = useUnflagReview();

  return (
    <View className="flex-1 bg-slate-50">
      <View className="flex-row gap-2 border-b border-slate-200 bg-white px-4 py-3">
        <Pressable
          onPress={() => setFlaggedOnly(false)}
          className={`rounded-full px-4 py-1.5 ${!flaggedOnly ? 'bg-blue-600' : 'bg-slate-100'}`}
        >
          <Text className={`text-sm font-semibold ${!flaggedOnly ? 'text-white' : 'text-slate-600'}`}>
            All
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setFlaggedOnly(true)}
          className={`rounded-full px-4 py-1.5 ${flaggedOnly ? 'bg-red-600' : 'bg-slate-100'}`}
        >
          <Text className={`text-sm font-semibold ${flaggedOnly ? 'text-white' : 'text-slate-600'}`}>
            Flagged
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 16, gap: 8 }}
          data={reviews}
          keyExtractor={(r) => r.id}
          refreshing={isLoading}
          onRefresh={refetch}
          ListEmptyComponent={
            <Text className="mt-8 text-center text-slate-400">No reviews.</Text>
          }
          renderItem={({ item: r }) => (
            <View className="gap-1.5 rounded-xl border border-slate-200 bg-white p-4">
              <View className="flex-row items-center justify-between">
                <Text className="font-semibold text-slate-900">
                  {r.profiles?.display_name ?? 'Anonymous'}
                </Text>
                <View className="flex-row items-center gap-2">
                  {r.is_flagged && (
                    <View className="rounded bg-red-100 px-2 py-0.5">
                      <Text className="text-xs font-semibold text-red-600">
                        {r.flag_reason ? `Flagged: ${r.flag_reason}` : 'Flagged'}
                      </Text>
                    </View>
                  )}
                  <Text className="text-yellow-500">{'★'.repeat(r.rating)}</Text>
                </View>
              </View>
              {r.text ? (
                <Text className="text-sm text-slate-600" numberOfLines={3}>
                  {r.text}
                </Text>
              ) : null}
              <View className="mt-1 flex-row items-center justify-between">
                <Text className="text-xs text-slate-400">
                  {new Date(r.created_at).toLocaleDateString()}
                </Text>
                <View className="flex-row gap-2">
                  {r.is_flagged ? (
                    <Pressable
                      onPress={() => unflag.mutate(r.id)}
                      disabled={unflag.isPending}
                      className="flex-row items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5"
                    >
                      <FontAwesome name="flag-o" size={11} color="#d97706" />
                      <Text className="text-xs font-semibold text-amber-700">Unflag</Text>
                    </Pressable>
                  ) : null}
                  <Pressable
                    onPress={() => del.mutate(r.id)}
                    disabled={del.isPending}
                    className="flex-row items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5"
                  >
                    <FontAwesome name="trash" size={11} color="#dc2626" />
                    <Text className="text-xs font-semibold text-red-600">Delete</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
