import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, Text, View } from 'react-native';

import { ProfileForm } from '@/components/ProfileForm';
import { useAuthStore } from '@/stores/auth';

export default function ProfileSetupScreen() {
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <View className="flex-1 bg-slate-50">
      <View className="flex-row items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <FontAwesome name="user-circle" size={20} color="white" />
          </View>
          <View>
            <Text className="text-lg font-bold text-slate-900">Set up your profile</Text>
            <Text className="text-xs text-slate-500">Just a few details before you start.</Text>
          </View>
        </View>
        <Pressable
          onPress={signOut}
          className="flex-row items-center gap-1.5 rounded-lg px-3 py-1.5"
        >
          <FontAwesome name="sign-out" size={12} color="#2563eb" />
          <Text className="font-medium text-blue-600">Sign out</Text>
        </Pressable>
      </View>
      <ProfileForm submitLabel="Get started" />
    </View>
  );
}
