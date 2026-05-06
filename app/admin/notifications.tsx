import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { broadcastNotification } from '@/lib/notifications';

export default function AdminNotificationsScreen() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  async function handleBroadcast() {
    if (!title.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      await broadcastNotification(title.trim(), body.trim());
      setResult({ ok: true, msg: 'Sent to all users.' });
      setTitle('');
      setBody('');
    } catch (e: any) {
      setResult({ ok: false, msg: e?.message ?? 'Failed to send.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-slate-50 px-4 pt-6" style={{ gap: 16 }}>
      <Text className="text-lg font-bold text-slate-900">Broadcast Notification</Text>
      <Text className="text-sm text-slate-500">
        Sends a "message" category notification to every registered user.
      </Text>

      <View style={{ gap: 8 }}>
        <Text className="text-sm font-medium text-slate-700">Title *</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Notification title"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
        />
      </View>

      <View style={{ gap: 8 }}>
        <Text className="text-sm font-medium text-slate-700">Body</Text>
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="Optional message body"
          multiline
          numberOfLines={3}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
          style={{ minHeight: 72, textAlignVertical: 'top' }}
        />
      </View>

      <Pressable
        onPress={handleBroadcast}
        disabled={loading || !title.trim()}
        className={`flex-row items-center justify-center gap-2 rounded-xl py-3 ${
          loading || !title.trim() ? 'bg-slate-300' : 'bg-blue-600'
        }`}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <FontAwesome name="send" size={14} color="#fff" />
        )}
        <Text className="text-sm font-semibold text-white">Send to All Users</Text>
      </Pressable>

      {result && (
        <View
          className={`rounded-lg px-4 py-3 ${result.ok ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
        >
          <Text className={`text-sm font-medium ${result.ok ? 'text-green-700' : 'text-red-700'}`}>
            {result.msg}
          </Text>
        </View>
      )}
    </View>
  );
}
