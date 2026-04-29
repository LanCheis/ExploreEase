import FontAwesome from '@expo/vector-icons/FontAwesome';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';
import { z } from 'zod';

import { InputField } from '@/components/InputField';
import { supabase } from '@/lib/supabase';

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordScreen() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  const onSubmit = async ({ email }: ForgotForm) => {
    setServerError(null);
    setSubmitting(true);

    const redirectTo =
      Platform.OS === 'web' && typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : 'exploreease://reset-password';

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setSubmitting(false);
    if (error) {
      setServerError(error.message);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 p-6">
        <View className="w-full max-w-md items-center rounded-2xl border border-slate-200 bg-white p-6">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <FontAwesome name="check" size={36} color="#059669" />
          </View>
          <Text className="mb-2 text-3xl font-bold text-slate-900">Check your email</Text>
          <Text className="mb-6 text-center text-base text-slate-600">
            If an account exists for that email, we sent a link to reset your password.
          </Text>
          <Link href="/sign-in" className="text-sm font-semibold text-blue-600">
            Back to sign in
          </Link>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-slate-50 p-6">
      <View className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6">
        <View className="mb-6 items-center">
          <View className="mb-3 h-16 w-16 items-center justify-center rounded-2xl bg-amber-500">
            <FontAwesome name="key" size={28} color="white" />
          </View>
          <Text className="text-3xl font-bold text-slate-900">Forgot password</Text>
          <Text className="text-base text-slate-500">We&apos;ll email you a reset link.</Text>
        </View>

        <View className="mb-4 gap-1.5">
          <Text className="text-sm font-semibold text-slate-700">Email</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                icon="envelope"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="you@example.com"
              />
            )}
          />
          {errors.email && (
            <Text className="text-xs text-red-600">{errors.email.message}</Text>
          )}
        </View>

        {serverError && (
          <Text className="mb-3 text-sm text-red-600">{serverError}</Text>
        )}

        <Pressable
          disabled={!isValid || submitting}
          onPress={handleSubmit(onSubmit)}
          className={`mb-4 h-12 flex-row items-center justify-center gap-2 rounded-lg ${
            isValid && !submitting ? 'bg-blue-600' : 'bg-slate-300'
          }`}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <FontAwesome name="paper-plane" size={14} color="white" />
              <Text className="text-base font-semibold text-white">Send reset link</Text>
            </>
          )}
        </Pressable>

        <Link href="/sign-in" className="self-center text-sm font-semibold text-blue-600">
          Back to sign in
        </Link>
      </View>
    </View>
  );
}
