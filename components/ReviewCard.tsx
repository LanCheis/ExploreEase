import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image, Linking, Pressable, Text, View } from 'react-native';

import { StarRating } from '@/components/StarRating';
import type { ReviewWithProfile } from '@/types/review';

function timeAgo(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return '1 month ago';
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

interface Props {
  review: ReviewWithProfile;
  currentUserId?: string;
  helpfulByMe: boolean;
  onHelpful: () => void;
  onFlag: () => void;
}

export function ReviewCard({ review, currentUserId, helpfulByMe, onHelpful, onFlag }: Props) {
  const authorName = review.profiles?.display_name ?? 'Anonymous';
  const isOwn = currentUserId === review.user_id;

  return (
    <View
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <StarRating value={review.rating} size={14} />
        <Text style={{ fontSize: 11, color: '#94a3b8' }}>{timeAgo(review.created_at)}</Text>
      </View>
      <Text style={{ fontSize: 14, color: '#1e293b', lineHeight: 20 }}>{review.text}</Text>
      {review.photo_url ? (
        <Pressable onPress={() => Linking.openURL(review.photo_url!)}>
          <Image
            source={{ uri: review.photo_url }}
            style={{ width: '100%', height: 160, borderRadius: 8 }}
            resizeMode="cover"
          />
        </Pressable>
      ) : null}
      <View
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Text style={{ fontSize: 12, color: '#64748b' }}>by {authorName}</Text>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Pressable
            onPress={onHelpful}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            hitSlop={6}
          >
            <FontAwesome
              name={helpfulByMe ? 'thumbs-up' : 'thumbs-o-up'}
              size={14}
              color={helpfulByMe ? '#2563eb' : '#94a3b8'}
            />
            {review.helpful_count > 0 ? (
              <Text style={{ fontSize: 12, color: '#64748b' }}>{review.helpful_count}</Text>
            ) : null}
          </Pressable>
          {!isOwn ? (
            <Pressable onPress={onFlag} hitSlop={6}>
              <FontAwesome name="flag-o" size={13} color="#94a3b8" />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}
