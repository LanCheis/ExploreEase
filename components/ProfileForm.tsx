import FontAwesome from '@expo/vector-icons/FontAwesome';
import { zodResolver } from '@hookform/resolvers/zod';
import { ComponentProps, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { z } from 'zod';

import { InputField } from '@/components/InputField';
import { pickAndUploadAvatar } from '@/lib/avatars';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import {
  type Gender,
  INTERESTS,
  type Interest,
  type TravelStyle,
} from '@/types/profile';

type IconName = ComponentProps<typeof FontAwesome>['name'];

const TRAVEL_STYLES: { value: TravelStyle; icon: IconName; label: string }[] = [
  { value: 'solo', icon: 'user', label: 'Solo' },
  { value: 'family', icon: 'home', label: 'Family' },
  { value: 'group', icon: 'users', label: 'Group' },
];

const GENDERS: { value: Gender; icon: IconName; label: string }[] = [
  { value: 'male', icon: 'mars', label: 'Male' },
  { value: 'female', icon: 'venus', label: 'Female' },
  { value: 'other', icon: 'transgender', label: 'Other' },
  { value: 'prefer_not_to_say', icon: 'question-circle', label: 'Prefer not to say' },
];

const INTEREST_ICONS: Record<Interest, IconName> = {
  food: 'cutlery',
  culture: 'university',
  shopping: 'shopping-cart',
  nature: 'leaf',
  adventure: 'rocket',
};

const profileFormSchema = z.object({
  display_name: z.string().trim().min(1, 'Required').max(50),
  age: z.string().refine(
    (v) => v === '' || (/^\d+$/.test(v) && +v >= 13 && +v <= 120),
    'Age must be 13–120',
  ),
  gender: z.string(),
  travel_style: z.string().refine(
    (v) => TRAVEL_STYLES.map((t) => t.value).includes(v as TravelStyle),
    'Pick a travel style',
  ),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  submitLabel?: string;
  onSaved?: () => void;
  onCancel?: () => void;
}

export function ProfileForm({
  submitLabel = 'Save',
  onSaved,
  onCancel,
}: ProfileFormProps) {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const currentInterests = useAuthStore((s) => s.interests);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);

  const userId = session?.user.id;

  // Fallbacks from OAuth providers (e.g. Google) so first-time social sign-in
  // users don't have to retype their name or pick a photo.
  const oauthName =
    (session?.user.user_metadata?.full_name as string | undefined) ||
    (session?.user.user_metadata?.name as string | undefined) ||
    '';
  const oauthAvatar =
    (session?.user.user_metadata?.avatar_url as string | undefined) ||
    (session?.user.user_metadata?.picture as string | undefined) ||
    null;

  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    profile?.avatar_url ?? oauthAvatar,
  );
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>(currentInterests);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: 'onChange',
    defaultValues: {
      display_name: profile?.display_name ?? oauthName,
      age: profile?.age != null ? String(profile.age) : '',
      gender: profile?.gender ?? '',
      travel_style: profile?.travel_style ?? '',
    },
  });

  const toggleInterest = (interest: Interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    );
  };

  const handlePickAvatar = async () => {
    if (!userId) return;
    setServerError(null);
    setUploading(true);
    try {
      const url = await pickAndUploadAvatar(userId);
      if (url) setAvatarUrl(url);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Avatar upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    if (!userId) return;
    setServerError(null);
    setSubmitting(true);

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        display_name: values.display_name.trim(),
        age: values.age ? parseInt(values.age, 10) : null,
        gender: values.gender ? (values.gender as Gender) : null,
        travel_style: values.travel_style as TravelStyle,
        avatar_url: avatarUrl,
      })
      .eq('id', userId);

    if (profileError) {
      setSubmitting(false);
      setServerError(profileError.message);
      return;
    }

    const { error: deleteError } = await supabase
      .from('user_interests')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      setSubmitting(false);
      setServerError(deleteError.message);
      return;
    }

    if (selectedInterests.length > 0) {
      const { error: insertError } = await supabase
        .from('user_interests')
        .insert(selectedInterests.map((interest) => ({ user_id: userId, interest })));

      if (insertError) {
        setSubmitting(false);
        setServerError(insertError.message);
        return;
      }
    }

    await refreshProfile();
    setSubmitting(false);
    onSaved?.();
  };

  const canSubmit =
    isValid && selectedInterests.length > 0 && !submitting && !uploading;

  return (
    <ScrollView
      className="bg-slate-50"
      contentContainerStyle={{ padding: 16, alignItems: 'center' }}
    >
      <View className="w-full max-w-xl gap-6 rounded-2xl border border-slate-200 bg-white p-6">
        <View className="items-center gap-2">
          <Pressable onPress={handlePickAvatar} disabled={uploading} className="relative">
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: 112, height: 112, borderRadius: 56 }}
              />
            ) : (
              <View className="h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-slate-100">
                {uploading ? (
                  <ActivityIndicator />
                ) : (
                  <FontAwesome name="user" size={40} color="#94a3b8" />
                )}
              </View>
            )}
            <View className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-600">
              <FontAwesome name="camera" size={14} color="white" />
            </View>
          </Pressable>
          <Text className="text-sm font-medium text-blue-600">
            {avatarUrl ? 'Change photo' : 'Add photo'}
          </Text>
        </View>

        <FieldGroup icon="user-circle" label="Display name" error={errors.display_name?.message}>
          <Controller
            control={control}
            name="display_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                icon="pencil"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="What should we call you?"
              />
            )}
          />
        </FieldGroup>

        <FieldGroup
          icon="birthday-cake"
          label="Age"
          hint="optional"
          error={errors.age?.message}
        >
          <Controller
            control={control}
            name="age"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                icon="hashtag"
                keyboardType="number-pad"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="13–120"
              />
            )}
          />
        </FieldGroup>

        <FieldGroup icon="venus-mars" label="Gender" hint="optional">
          <Controller
            control={control}
            name="gender"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row flex-wrap gap-2">
                {GENDERS.map((g) => (
                  <Chip
                    key={g.value}
                    icon={g.icon}
                    label={g.label}
                    selected={value === g.value}
                    onPress={() => onChange(value === g.value ? '' : g.value)}
                  />
                ))}
              </View>
            )}
          />
        </FieldGroup>

        <FieldGroup
          icon="compass"
          label="Travel style"
          error={errors.travel_style?.message}
        >
          <Controller
            control={control}
            name="travel_style"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row flex-wrap gap-2">
                {TRAVEL_STYLES.map((s) => (
                  <Chip
                    key={s.value}
                    icon={s.icon}
                    label={s.label}
                    selected={value === s.value}
                    onPress={() => onChange(s.value)}
                  />
                ))}
              </View>
            )}
          />
        </FieldGroup>

        <FieldGroup icon="heart" label="Interests" hint="pick at least one">
          <View className="flex-row flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <Chip
                key={i}
                icon={INTEREST_ICONS[i]}
                label={i.charAt(0).toUpperCase() + i.slice(1)}
                selected={selectedInterests.includes(i)}
                onPress={() => toggleInterest(i)}
              />
            ))}
          </View>
        </FieldGroup>

        {serverError && (
          <View className="flex-row items-center gap-2 rounded-lg bg-red-50 p-3">
            <FontAwesome name="exclamation-circle" size={14} color="#dc2626" />
            <Text className="flex-1 text-sm text-red-700">{serverError}</Text>
          </View>
        )}

        <View className="gap-2">
          <Pressable
            disabled={!canSubmit}
            onPress={handleSubmit(onSubmit)}
            className={`h-12 flex-row items-center justify-center gap-2 rounded-lg ${
              canSubmit ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <FontAwesome name="check" size={16} color="white" />
                <Text className="text-base font-semibold text-white">{submitLabel}</Text>
              </>
            )}
          </Pressable>
          {onCancel && (
            <Pressable
              onPress={onCancel}
              disabled={submitting}
              className="h-12 items-center justify-center rounded-lg bg-slate-100"
            >
              <Text className="font-medium text-slate-700">Cancel</Text>
            </Pressable>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function FieldGroup({
  icon,
  label,
  hint,
  error,
  children,
}: {
  icon: IconName;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-2">
        <FontAwesome name={icon} size={14} color="#475569" />
        <Text className="text-sm font-semibold text-slate-700">{label}</Text>
        {hint && <Text className="text-xs text-slate-500">({hint})</Text>}
      </View>
      {children}
      {error && <Text className="text-xs text-red-600">{error}</Text>}
    </View>
  );
}

function Chip({
  icon,
  label,
  selected,
  onPress,
}: {
  icon: IconName;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-2 rounded-full border px-4 py-2 ${
        selected ? 'border-blue-600 bg-blue-600' : 'border-slate-200 bg-slate-50'
      }`}
    >
      <FontAwesome name={icon} size={13} color={selected ? 'white' : '#475569'} />
      <Text
        className={`text-sm ${
          selected ? 'font-semibold text-white' : 'text-slate-700'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
