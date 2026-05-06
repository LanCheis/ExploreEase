import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { useMarkAllNotificationsRead, useMarkNotificationRead } from '@/hooks/useMarkNotificationRead';
import { useNotifications, type AppNotification } from '@/hooks/useNotifications';

type Category = 'all' | 'alert' | 'offer' | 'message';

const TABS: { key: Category; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'alert', label: 'Alerts' },
  { key: 'offer', label: 'Offers' },
  { key: 'message', label: 'Messages' },
];

const CATEGORY_COLOR: Record<string, string> = {
  alert: '#ef4444',
  offer: '#16a34a',
  message: '#2563eb',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsScreen() {
  const [activeTab, setActiveTab] = useState<Category>('all');
  const { notifications, unreadCount, isLoading, error } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const router = useRouter();

  const filtered =
    activeTab === 'all' ? notifications : notifications.filter((n) => n.category === activeTab);

  function handlePress(n: AppNotification) {
    if (!n.read_at) markRead.mutate(n.id);
    const deeplink = n.data?.deeplink;
    if (deeplink && typeof deeplink === 'string') {
      router.push(deeplink as any);
    } else if (n.category === 'alert') {
      router.back();
      router.push('/(tabs)/events' as any);
    } else if (n.category === 'offer') {
      router.back();
      router.push('/(tabs)/discover' as any);
    }
    // message category: mark read only, no navigation
  }

  return (
    <View className="flex-1 bg-slate-50">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center justify-between px-4 pt-12 pb-2">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <FontAwesome name="arrow-left" size={18} color="#374151" />
          </Pressable>
          <Text className="text-xl font-bold text-slate-900">Notifications</Text>
        </View>
        {unreadCount > 0 && (
          <Pressable onPress={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
            <Text className="text-sm font-medium text-blue-600">Mark all read</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-2"
        contentContainerStyle={{ gap: 8 }}
      >
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-1.5 border ${
              activeTab === tab.key ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                activeTab === tab.key ? 'text-white' : 'text-slate-700'
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-slate-500 text-center">Failed to load notifications.</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <FontAwesome name="bell-slash" size={40} color="#cbd5e1" />
          <Text className="mt-3 text-slate-400 text-center">No notifications yet.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(n) => n.id}
          renderItem={({ item }) => (
            <NotificationRow
              n={item}
              onPress={handlePress}
              onMarkRead={(id) => markRead.mutate(id)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

function NotificationRow({
  n,
  onPress,
  onMarkRead,
}: {
  n: AppNotification;
  onPress: (n: AppNotification) => void;
  onMarkRead: (id: string) => void;
}) {
  const isUnread = !n.read_at;
  const color = CATEGORY_COLOR[n.category] ?? '#64748b';

  return (
    <Pressable
      onPress={() => onPress(n)}
      className="flex-row items-start gap-3 mx-4 my-1 rounded-xl border border-slate-200 bg-white p-4"
    >
      <View style={{ width: 8, marginTop: 6 }}>
        {isUnread && (
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563eb' }} />
        )}
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-2 mb-0.5">
          <View
            style={{
              backgroundColor: color + '20',
              borderRadius: 6,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '600',
                color,
                textTransform: 'uppercase',
              }}
            >
              {n.category}
            </Text>
          </View>
          <Text className="text-xs text-slate-400">{timeAgo(n.created_at)}</Text>
        </View>
        <Text className="text-sm font-semibold text-slate-900">{n.title}</Text>
        {n.body ? <Text className="text-sm text-slate-500 mt-0.5">{n.body}</Text> : null}
      </View>

      {isUnread && (
        <Pressable onPress={() => onMarkRead(n.id)} hitSlop={8}>
          <Text className="text-xs text-blue-600 font-medium">Read</Text>
        </Pressable>
      )}
    </Pressable>
  );
}
