import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function AdminIndex() {
  return (
    <ScrollView className="bg-slate-50" contentContainerStyle={{ padding: 16, gap: 12 }}>
      <AdminCard href="/admin/users"         icon="users"     label="Users"         desc="View and manage user profiles"        color="#2563eb" />
      <AdminCard href="/admin/events"        icon="calendar"  label="Events"        desc="Approve, reject, or delete events"    color="#16a34a" />
      <AdminCard href="/admin/reviews"       icon="star"      label="Reviews"       desc="Moderate flagged and all reviews"     color="#d97706" />
      <AdminCard href="/admin/analytics"     icon="bar-chart" label="Analytics"     desc="Usage stats and top places"           color="#7c3aed" />
      <AdminCard href="/admin/notifications" icon="bell"      label="Notifications" desc="Broadcast a message to all users"     color="#db2777" />
    </ScrollView>
  );
}

function AdminCard({
  href,
  icon,
  label,
  desc,
  color,
}: {
  href: string;
  icon: string;
  label: string;
  desc: string;
  color: string;
}) {
  return (
    <Link href={href as any} asChild>
      <Pressable className="flex-row items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <View
          style={{
            backgroundColor: color + '20',
            borderRadius: 12,
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FontAwesome name={icon as any} size={22} color={color} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-slate-900">{label}</Text>
          <Text className="text-sm text-slate-500">{desc}</Text>
        </View>
        <FontAwesome name="chevron-right" size={14} color="#94a3b8" />
      </Pressable>
    </Link>
  );
}
