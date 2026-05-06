import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { useDeleteReply, useReviewReplies, useSubmitReply } from '@/hooks/useReviews';

function timeAgo(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

interface Props {
  reviewId: string;
  currentUserId?: string;
}

export function ReviewReplies({ reviewId, currentUserId }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState('');
  const { data: replies = [], isLoading } = useReviewReplies(reviewId, expanded);
  const { mutate: submit, isPending } = useSubmitReply(reviewId);
  const { mutate: del } = useDeleteReply(reviewId);

  return (
    <View style={{ gap: 6 }}>
      <Pressable onPress={() => setExpanded((v) => !v)} hitSlop={6}>
        <Text style={{ fontSize: 12, color: '#2563eb', fontWeight: '500' }}>
          {expanded ? 'Hide replies' : 'Reply'}
        </Text>
      </Pressable>

      {expanded ? (
        <View
          style={{
            marginLeft: 8,
            paddingLeft: 10,
            borderLeftWidth: 2,
            borderLeftColor: '#e2e8f0',
            gap: 8,
          }}
        >
          {isLoading ? <ActivityIndicator size="small" /> : null}

          {replies.map((r) => (
            <View key={r.id} style={{ gap: 2 }}>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#475569' }}>
                  {r.profiles?.display_name ?? 'Anonymous'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 10, color: '#94a3b8' }}>{timeAgo(r.created_at)}</Text>
                  {currentUserId === r.user_id ? (
                    <Pressable onPress={() => del(r.id)} hitSlop={6}>
                      <FontAwesome name="trash-o" size={11} color="#94a3b8" />
                    </Pressable>
                  ) : null}
                </View>
              </View>
              <Text style={{ fontSize: 12, color: '#334155', lineHeight: 17 }}>{r.text}</Text>
            </View>
          ))}

          {currentUserId ? (
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Write a reply..."
                returnKeyType="send"
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  const trimmed = text.trim();
                  if (!trimmed || isPending) return;
                  submit({ reviewId, text: trimmed }, { onSuccess: () => setText('') });
                }}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                  fontSize: 12,
                  color: '#0f172a',
                }}
              />
              <Pressable
                hitSlop={8}
                onPress={() => {
                  const trimmed = text.trim();
                  if (!trimmed || isPending) return;
                  submit({ reviewId, text: trimmed }, { onSuccess: () => setText('') });
                }}
                style={{
                  backgroundColor: text.trim() && !isPending ? '#2563eb' : '#cbd5e1',
                  borderRadius: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                }}
              >
                <Text style={{ fontSize: 12, color: 'white', fontWeight: '600' }}>
                  {isPending ? '...' : 'Post'}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
