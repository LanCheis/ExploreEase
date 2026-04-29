import FontAwesome from '@expo/vector-icons/FontAwesome';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { z } from 'zod';

import { InputField } from '@/components/InputField';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';

const resetSchema = z.object({
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Za-z]/, 'Must contain a letter')
    .regex(/\d/, 'Must contain a digit'),
});

type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    mode: 'onChange',
    defaultValues: { password: '' },
  });

  const onSubmit = async ({ password }: ResetForm) => {
    setServerError(null);
    setSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setSubmitting(false);
        setServerError(error.message);
        return;
      }
    } catch (e) {
      setSubmitting(false);
      setServerError((e as Error)?.message ?? 'Could not update password.');
      return;
    }

    // Best-effort sign-out: drop the recovery session so the user logs in fresh.
    // Swallow lock errors here — the password update already succeeded.
    try {
      await signOut();
    } catch {}

    setSubmitting(false);
    setDone(true);
  };

  if (done) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 p-6">
        <View className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6">
          <View className="mb-6 items-center">
            <View className="mb-3 h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600">
              <FontAwesome name="check" size={28} color="white" />
            </View>
            <Text className="text-3xl font-bold text-slate-900">Password updated</Text>
            <Text className="mt-2 text-center text-base text-slate-500">
              You can sign in with your new password now. Safe to close this tab.
            </Text>
          </View>
          <Pressable
            onPress={() => router.replace('/sign-in')}
            className="h-12 flex-row items-center justify-center gap-2 rounded-lg bg-blue-600"
          >
            <FontAwesome name="sign-in" size={16} color="white" />
            <Text className="text-base font-semibold text-white">Go to sign-in</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-slate-50 p-6">
      <View className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6">
        <View className="mb-6 items-center">
          <View className="mb-3 h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
            <FontAwesome name="lock" size={28} color="white" />
          </View>
          <Text className="text-3xl font-bold text-slate-900">Set a new password</Text>
          <Text className="text-base text-slate-500">Choose something memorable.</Text>
        </View>

        <View className="mb-4 gap-1.5">
          <Text className="text-sm font-semibold text-slate-700">New password</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                icon="lock"
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="At least 8 chars, 1 letter, 1 digit"
              />
            )}
          />
          {errors.password && (
            <Text className="text-xs text-red-600">{errors.password.message}</Text>
          )}
        </View>

        {serverError && (
          <Text className="mb-3 text-sm text-red-600">{serverError}</Text>
        )}

        <Pressable
          disabled={!isValid || submitting}
          onPress={handleSubmit(onSubmit)}
          className={`h-12 flex-row items-center justify-center gap-2 rounded-lg ${
            isValid && !submitting ? 'bg-blue-600' : 'bg-slate-300'
          }`}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <FontAwesome name="check" size={16} color="white" />
              <Text className="text-base font-semibold text-white">Update password</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}
