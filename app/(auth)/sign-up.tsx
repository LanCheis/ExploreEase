import FontAwesome from '@expo/vector-icons/FontAwesome';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';
import { z } from 'zod';

import { InputField } from '@/components/InputField';
import { signInWithGoogle, supabase } from '@/lib/supabase';

const signUpSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Za-z]/, 'Must contain a letter')
    .regex(/\d/, 'Must contain a digit'),
});

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUpScreen() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async ({ email, password }: SignUpForm) => {
    setServerError(null);
    setSubmitting(true);

    const emailRedirectTo =
      typeof window !== 'undefined' ? `${window.location.origin}/sign-in` : undefined;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo },
    });

    setSubmitting(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    if (!data.session) {
      router.replace({ pathname: '/verify-email', params: { email } });
    }
  };

  const onGoogle = async () => {
    setServerError(null);
    setGoogleSubmitting(true);
    try {
      await signInWithGoogle();
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
            <FontAwesome name="user-plus" size={28} color="white" />
          </View>
          <Text className="text-3xl font-bold text-slate-900">Create account</Text>
          <Text className="text-base text-slate-500">Join ExploreEase</Text>
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
          {errors.email && (
            <Text className="text-xs text-red-600">{errors.email.message}</Text>
          )}
        </View>

        <View className="mb-4 gap-1.5">
          <Text className="text-sm font-semibold text-slate-700">Password</Text>
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
          {errors.password ? (
            <Text className="text-xs text-red-600">{errors.password.message}</Text>
          ) : (
            <Text className="text-xs text-slate-500">
              8+ chars, with a letter and a digit
            </Text>
          )}
        </View>

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
              <FontAwesome name="check" size={16} color="white" />
              <Text className="text-base font-semibold text-white">Sign up</Text>
            </>
          )}
        </Pressable>

        <View className="flex-row justify-center">
          <Text className="text-sm text-slate-600">Have an account? </Text>
          <Link href="/sign-in" className="text-sm font-semibold text-blue-600">
            Sign in
          </Link>
        </View>
      </View>
    </View>
  );
}
