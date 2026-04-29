import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { supabase } from '@/lib/supabase';

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email) return;
    setError(null);
    setMessage(null);
    setResending(true);

    const emailRedirectTo =
      typeof window !== 'undefined' ? `${window.location.origin}/sign-in` : undefined;

    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo },
    });

    setResending(false);
    if (resendError) setError(resendError.message);
    else setMessage('Email resent. Check your inbox.');
  };

  return (
    <View className="flex-1 items-center justify-center bg-slate-50 p-6">
      <View className="w-full max-w-md items-center rounded-2xl border border-slate-200 bg-white p-6">
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-blue-100">
          <FontAwesome name="envelope-o" size={36} color="#2563eb" />
        </View>

        <Text className="mb-2 text-3xl font-bold text-slate-900">Check your email</Text>
        <Text className="mb-6 text-center text-base text-slate-600">
          We sent a verification link{email ? ` to ${email}` : ''}. Click it to finish
          setting up your account.
        </Text>

        {email && (
          <Pressable
            disabled={resending}
            onPress={handleResend}
            className="mb-3 h-11 flex-row items-center justify-center gap-2 rounded-lg bg-slate-100 px-6"
          >
            {resending ? (
              <ActivityIndicator />
            ) : (
              <>
                <FontAwesome name="refresh" size={14} color="#334155" />
                <Text className="font-medium text-slate-800">Resend email</Text>
              </>
            )}
          </Pressable>
        )}

        {message && (
          <View className="mb-3 flex-row items-center gap-2">
            <FontAwesome name="check-circle" size={14} color="#059669" />
            <Text className="text-sm text-green-700">{message}</Text>
          </View>
        )}
        {error && <Text className="mb-3 text-sm text-red-600">{error}</Text>}

        <Link href="/sign-in" className="text-sm font-semibold text-blue-600">
          Back to sign in
        </Link>
      </View>
    </View>
  );
}
