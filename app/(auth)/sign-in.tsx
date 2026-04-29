import FontAwesome from '@expo/vector-icons/FontAwesome';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';
import { z } from 'zod';

import { InputField } from '@/components/InputField';
import { signInWithGoogle, supabase } from '@/lib/supabase';

const signInSchema = z.object({
  email: z.string().min(1, 'Required'),
  password: z.string().min(1, 'Required'),
});

type SignInForm = z.infer<typeof signInSchema>;

export default function SignInScreen() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async ({ email, password }: SignInForm) => {
    setServerError(null);
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) setServerError(error.message);
  };

  const onGoogle = async () => {
    setServerError(null);
    setGoogleSubmitting(true);
    try {
      await signInWithGoogle();
      // On web the browser is about to redirect — no further action.
    } catch (e) {
      setGoogleSubmitting(false);
      setServerError(e instanceof Error ? e.message : 'Google sign-in failed');
    }
  };

  const canSubmit = isValid && !submitting && !googleSubmitting;

  return (
    <View className="flex-1 items-center justify-center bg-slate-50 p-6">
      <View className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6">
        <View className="mb-6 items-center">
          <View className="mb-3 h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
            <FontAwesome name="compass" size={32} color="white" />
          </View>
          <Text className="text-3xl font-bold text-slate-900">ExploreEase</Text>
          <Text className="text-base text-slate-500">Discover where to go next</Text>
        </View>

        {Platform.OS === 'web' && (
          <>
            <Pressable
              disabled={googleSubmitting || submitting}
              onPress={onGoogle}
              className="mb-4 h-12 flex-row items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white"
            >
              {googleSubmitting ? (
                <ActivityIndicator />
              ) : (
                <>
                  <FontAwesome name="google" size={16} color="#ea4335" />
                  <Text className="font-semibold text-slate-700">Continue with Google</Text>
                </>
              )}
            </Pressable>

            <View className="mb-4 flex-row items-center gap-3">
              <View className="h-px flex-1 bg-slate-200" />
              <Text className="text-xs font-medium text-slate-400">OR</Text>
              <View className="h-px flex-1 bg-slate-200" />
            </View>
          </>
        )}

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
        </View>

        <View className="mb-2 gap-1.5">
          <Text className="text-sm font-semibold text-slate-700">Password</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                icon="lock"
                secureTextEntry
                autoCapitalize="none"
                autoComplete="current-password"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Your password"
              />
            )}
          />
        </View>

        <Link href="/forgot-password" className="mb-4 self-end text-sm font-medium text-blue-600">
          Forgot password?
        </Link>

        {serverError && (
          <Text className="mb-3 text-sm text-red-600">{serverError}</Text>
        )}

        <Pressable
          disabled={!canSubmit}
          onPress={handleSubmit(onSubmit)}
          className={`mb-4 h-12 flex-row items-center justify-center gap-2 rounded-lg ${
            canSubmit ? 'bg-blue-600' : 'bg-slate-300'
          }`}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <FontAwesome name="sign-in" size={16} color="white" />
              <Text className="text-base font-semibold text-white">Sign in</Text>
            </>
          )}
        </Pressable>

        <View className="flex-row justify-center">
          <Text className="text-sm text-slate-600">No account? </Text>
          <Link href="/sign-up" className="text-sm font-semibold text-blue-600">
            Sign up
          </Link>
        </View>
      </View>
    </View>
  );
}
