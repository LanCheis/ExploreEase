import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { Image, Modal, Pressable, Text, View } from 'react-native';

import { ReviewReplies } from '@/components/ReviewReplies';
import { StarRating } from '@/components/StarRating';
import type { ReviewWithProfile } from '@/types/review';

const FLAG_REASONS = [
  'Sexual content',
  'Spam or advertising',
  'Harassment or hate speech',
  'Misinformation',
  'Violence',
  'Other',
];

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
  onFlag: (reason: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ReviewCard({
  review,
  currentUserId,
  helpfulByMe,
  onHelpful,
  onFlag,
  onEdit,
  onDelete,
}: Props) {
  const authorName = review.profiles?.display_name ?? 'Anonymous';
  const isOwn = currentUserId === review.user_id;
  const [photoExpanded, setPhotoExpanded] = useState(false);
  const [flagModal, setFlagModal] = useState(false);
  const [reported, setReported] = useState(false);

  const isReported = reported || review.is_flagged;

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
      {review.is_flagged ? (
        <View
          style={{
            backgroundColor: '#fef3c7',
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 5,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <FontAwesome name="flag" size={11} color="#d97706" />
          <Text style={{ fontSize: 11, color: '#92400e' }}>Under review</Text>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <StarRating value={review.rating} size={14} />
        <Text style={{ fontSize: 11, color: '#94a3b8' }}>{timeAgo(review.created_at)}</Text>
      </View>

      <Text style={{ fontSize: 14, color: '#1e293b', lineHeight: 20 }}>{review.text}</Text>

      {review.photo_url ? (
        <>
          <Pressable onPress={() => setPhotoExpanded(true)}>
            <Image
              source={{ uri: review.photo_url }}
              style={{ width: '100%', height: 100, borderRadius: 8 }}
              resizeMode="cover"
            />
          </Pressable>
          <Modal
            visible={photoExpanded}
            transparent
            animationType="fade"
            onRequestClose={() => setPhotoExpanded(false)}
          >
            <Pressable
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.92)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => setPhotoExpanded(false)}
            >
              <Image
                source={{ uri: review.photo_url }}
                style={{ width: '92%', height: '72%' }}
                resizeMode="contain"
              />
              <Text style={{ color: 'rgba(255,255,255,0.5)', marginTop: 14, fontSize: 12 }}>
                Tap anywhere to close
              </Text>
            </Pressable>
          </Modal>
        </>
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
          {isOwn ? (
            <>
              <Pressable onPress={onEdit} hitSlop={6}>
                <FontAwesome name="pencil" size={13} color="#64748b" />
              </Pressable>
              <Pressable onPress={onDelete} hitSlop={6}>
                <FontAwesome name="trash-o" size={13} color="#e11d48" />
              </Pressable>
            </>
          ) : isReported ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <FontAwesome name="flag" size={12} color="#f59e0b" />
              <Text style={{ fontSize: 11, color: '#f59e0b' }}>Reported</Text>
            </View>
          ) : (
            <Pressable onPress={() => setFlagModal(true)} hitSlop={6}>
              <FontAwesome name="flag-o" size={13} color="#94a3b8" />
            </Pressable>
          )}
        </View>
      </View>

      <ReviewReplies reviewId={review.id} currentUserId={currentUserId} />

      {/* Flag reason picker */}
      <Modal
        visible={flagModal}
        transparent
        animationType="fade"
        onRequestClose={() => setFlagModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <View
            style={{ backgroundColor: 'white', borderRadius: 16, padding: 20, gap: 10 }}
          >
            {reported ? (
              <View style={{ alignItems: 'center', gap: 12, paddingVertical: 8 }}>
                <FontAwesome name="check-circle" size={40} color="#22c55e" />
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a', textAlign: 'center' }}>
                  Report submitted
                </Text>
                <Text style={{ fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 19 }}>
                  This post has been reported and will be reviewed by our team.
                </Text>
                <Pressable onPress={() => setFlagModal(false)} style={{ marginTop: 4 }}>
                  <Text style={{ color: '#2563eb', fontSize: 13, fontWeight: '600' }}>Close</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a' }}>
                  Report this review
                </Text>
                <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 2 }}>
                  Why are you reporting this?
                </Text>
                {FLAG_REASONS.map((reason) => (
                  <Pressable
                    key={reason}
                    onPress={() => {
                      onFlag(reason);
                      setReported(true);
                    }}
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      backgroundColor: '#f8fafc',
                      borderWidth: 1,
                      borderColor: '#e2e8f0',
                    }}
                  >
                    <Text style={{ fontSize: 14, color: '#334155' }}>{reason}</Text>
                  </Pressable>
                ))}
                <Pressable
                  onPress={() => setFlagModal(false)}
                  style={{ alignItems: 'center', paddingTop: 2 }}
                >
                  <Text style={{ fontSize: 13, color: '#94a3b8' }}>Cancel</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
