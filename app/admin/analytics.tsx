import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { useAdminAnalytics } from '@/hooks/useAdmin';

export default function AdminAnalytics() {
  const { data, isLoading, error } = useAdminAnalytics();

  if (isLoading) return <ActivityIndicator style={{ marginTop: 32 }} />;
  if (error || !data) {
    return (
      <Text className="mt-8 text-center text-red-500">Failed to load analytics.</Text>
    );
  }

  return (
    <ScrollView className="bg-slate-50" contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text className="text-lg font-bold text-slate-900">Overview</Text>
      <View className="flex-row flex-wrap gap-3">
        <StatCard label="Users"       value={data.total_users}       color="#2563eb" />
        <StatCard label="Places"      value={data.total_places}      color="#0891b2" />
        <StatCard label="Reviews"     value={data.total_reviews}     color="#d97706" />
        <StatCard label="Itineraries" value={data.total_itineraries} color="#7c3aed" />
      </View>

      <Text className="mt-2 text-lg font-bold text-slate-900">Events by Status</Text>
      <View className="flex-row flex-wrap gap-3">
        <StatCard label="Pending"  value={data.total_events_pending}  color="#d97706" />
        <StatCard label="Approved" value={data.total_events_approved} color="#16a34a" />
        <StatCard label="Rejected" value={data.total_events_rejected} color="#dc2626" />
      </View>

      <Text className="mt-2 text-lg font-bold text-slate-900">Top Places by Reviews</Text>
      <View className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {data.top_places.length === 0 ? (
          <Text className="p-4 text-center text-slate-400">No reviews yet.</Text>
        ) : (
          data.top_places.map((p, i) => (
            <View
              key={p.name}
              className={`flex-row items-center px-4 py-3 ${i > 0 ? 'border-t border-slate-100' : ''}`}
            >
              <Text className="w-6 text-sm font-bold text-slate-400">{i + 1}.</Text>
              <Text className="flex-1 font-medium text-slate-900">{p.name}</Text>
              <Text className="text-sm text-slate-500">{p.review_count} reviews</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View
      style={{
        backgroundColor: color + '15',
        borderRadius: 12,
        padding: 16,
        minWidth: 130,
        flex: 1,
      }}
    >
      <Text style={{ color, fontSize: 28, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{label}</Text>
    </View>
  );
}
