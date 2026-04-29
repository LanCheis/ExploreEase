import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ComponentProps, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import { ProfileForm } from '@/components/ProfileForm';
import { useAuthStore } from '@/stores/auth';

type IconName = ComponentProps<typeof FontAwesome>['name'];

export default function ProfileScreen() {
  const profile = useAuthStore((s) => s.profile);
  const interests = useAuthStore((s) => s.interests);
  const session = useAuthStore((s) => s.session);
  const signOut = useAuthStore((s) => s.signOut);

  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <ProfileForm
        submitLabel="Save changes"
        onSaved={() => setEditing(false)}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <ScrollView
      className="bg-slate-50"
      contentContainerStyle={{ padding: 16, alignItems: 'center' }}
    >
      <View className="w-full max-w-xl gap-5 rounded-2xl border border-slate-200 bg-white p-6">
        <View className="items-center gap-2">
          {profile?.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={{ width: 112, height: 112, borderRadius: 56 }}
            />
          ) : (
            <View className="h-28 w-28 items-center justify-center rounded-full bg-slate-100">
              <FontAwesome name="user" size={40} color="#94a3b8" />
            </View>
          )}
          <Text className="text-2xl font-bold text-slate-900">
            {profile?.display_name ?? '—'}
          </Text>
          <View className="flex-row items-center gap-1.5">
            <FontAwesome name="envelope-o" size={12} color="#64748b" />
            <Text className="text-sm text-slate-500">{session?.user.email}</Text>
          </View>
        </View>

        <View className="gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <ProfileRow
            icon="birthday-cake"
            label="Age"
            value={profile?.age != null ? String(profile.age) : '—'}
          />
          <ProfileRow
            icon="venus-mars"
            label="Gender"
            value={profile?.gender ? profile.gender.replace(/_/g, ' ') : '—'}
          />
          <ProfileRow
            icon="compass"
            label="Travel style"
            value={profile?.travel_style ?? '—'}
          />
          <ProfileRow
            icon="heart"
            label="Interests"
            value={interests.length > 0 ? interests.join(', ') : '—'}
          />
        </View>

        <View className="gap-2">
          <Pressable
            onPress={() => setEditing(true)}
            className="h-12 flex-row items-center justify-center gap-2 rounded-lg bg-blue-600"
          >
            <FontAwesome name="pencil" size={14} color="white" />
            <Text className="text-base font-semibold text-white">Edit profile</Text>
          </Pressable>
          <Pressable
            onPress={signOut}
            className="h-12 flex-row items-center justify-center gap-2 rounded-lg bg-slate-100"
          >
            <FontAwesome name="sign-out" size={14} color="#475569" />
            <Text className="font-medium text-slate-700">Sign out</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-8 w-8 items-center justify-center rounded-full bg-white">
        <FontAwesome name={icon} size={14} color="#2563eb" />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-slate-500">{label}</Text>
        <Text className="text-sm font-semibold capitalize text-slate-900">{value}</Text>
      </View>
    </View>
  );
}
