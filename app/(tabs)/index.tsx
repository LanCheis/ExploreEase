import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ComponentProps } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useAuthStore } from '@/stores/auth';

type IconName = ComponentProps<typeof FontAwesome>['name'];

export default function HomeScreen() {
  const profile = useAuthStore((s) => s.profile);

  return (
    <ScrollView
      className="bg-slate-50"
      contentContainerStyle={{ padding: 16, alignItems: 'center' }}
    >
      <View className="w-full max-w-xl gap-4">
        <View className="rounded-2xl bg-blue-600 p-6">
          <View className="mb-3 h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            <FontAwesome name="paper-plane" size={22} color="white" />
          </View>
          <Text className="text-2xl font-bold text-white">
            Welcome{profile?.display_name ? `, ${profile.display_name}` : ''}!
          </Text>
          <Text className="mt-1 text-sm text-white/80">
            Where would you like to explore today?
          </Text>
        </View>

        <View className="gap-3">
          <Text className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Coming soon
          </Text>
          <ComingSoonCard
            icon="map-marker"
            title="Discover places"
            subtitle="Find attractions near you"
          />
          <ComingSoonCard
            icon="calendar"
            title="Events"
            subtitle="Local happenings and meetups"
          />
          <ComingSoonCard
            icon="suitcase"
            title="Trip planner"
            subtitle="Build your itinerary"
          />
          <ComingSoonCard
            icon="search"
            title="Smart search"
            subtitle="Personalized recommendations"
          />
        </View>
      </View>
    </ScrollView>
  );
}

function ComingSoonCard({
  icon,
  title,
  subtitle,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
}) {
  return (
    <View className="flex-row items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
      <View className="h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
        <FontAwesome name={icon} size={20} color="#2563eb" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-slate-900">{title}</Text>
        <Text className="text-sm text-slate-500">{subtitle}</Text>
      </View>
      <FontAwesome name="chevron-right" size={14} color="#cbd5e1" />
    </View>
  );
}
