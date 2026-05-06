import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

import { useAdminUsers, useSetAdminStatus } from '@/hooks/useAdmin';

export default function AdminUsers() {
  const { data: users = [], isLoading, refetch } = useAdminUsers();
  const setAdmin = useSetAdminStatus();

  if (isLoading) return <ActivityIndicator style={{ marginTop: 32 }} />;

  return (
    <FlatList
      className="bg-slate-50"
      contentContainerStyle={{ padding: 16, gap: 8 }}
      data={users}
      keyExtractor={(u) => u.id}
      refreshing={isLoading}
      onRefresh={refetch}
      ListEmptyComponent={
        <Text className="mt-8 text-center text-slate-400">No users found.</Text>
      }
      renderItem={({ item: u }) => (
        <View className="flex-row items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            <FontAwesome name="user" size={18} color="#64748b" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-slate-900">
              {u.display_name ?? '(no name)'}
            </Text>
            <Text className="font-mono text-xs text-slate-400">{u.id.slice(0, 8)}…</Text>
          </View>
          <Pressable
            onPress={() => setAdmin.mutate({ userId: u.id, isAdmin: !u.is_admin })}
            disabled={setAdmin.isPending}
            className={`rounded-lg px-3 py-1.5 ${u.is_admin ? 'bg-blue-600' : 'bg-slate-100'}`}
          >
            <Text
              className={`text-xs font-semibold ${u.is_admin ? 'text-white' : 'text-slate-600'}`}
            >
              {u.is_admin ? 'Admin' : 'User'}
            </Text>
          </Pressable>
        </View>
      )}
    />
  );
}
