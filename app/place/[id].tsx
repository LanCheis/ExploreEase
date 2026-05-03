import { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { AddToItineraryButton } from '@/components/AddToItineraryButton';
import MiniMap from '@/components/MiniMap';
import { ReviewCard } from '@/components/ReviewCard';
import { ReviewForm } from '@/components/ReviewForm';
import { StarRating } from '@/components/StarRating';
import { useFavoriteIds, useToggleFavorite } from '@/hooks/useFavorites';
import { usePlace } from '@/hooks/usePlaces';
import {
  useFlagReview,
  useMyHelpfulIds,
  useRatingDistribution,
  useReviewsInfinite,
  useToggleHelpful,
} from '@/hooks/useReviews';
import { useAuthStore } from '@/stores/auth';
import type { PlaceCategory } from '@/types/place';

const CATEGORY_LABEL: Record<PlaceCategory, string> = {
  attraction: 'Attraction',
  cuisine: 'Cuisine',
  activity: 'Activity',
};

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useAuthStore((s) => s.session?.user.id);
  const { data: place, isLoading, isError, error } = usePlace(id);
  const { data: favoriteIds = [] } = useFavoriteIds();
  const { mutate: toggleFavorite } = useToggleFavorite();

  const [reviewSort, setReviewSort] = useState<'newest' | 'top' | 'helpful'>('newest');
  const [showForm, setShowForm] = useState(false);

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useReviewsInfinite(id ?? '', reviewSort);
  const { data: dist } = useRatingDistribution(id ?? '');
  const { data: helpfulIds = [] } = useMyHelpfulIds(userId);
  const { mutate: doToggleHelpful } = useToggleHelpful(id ?? '');
  const { mutate: doFlagReview } = useFlagReview(id ?? '');

  const isFavorite = !!id && favoriteIds.includes(id);
  const reviews = reviewsData?.pages.flatMap((p) => p.data) ?? [];
  const distTotal = Object.values(dist ?? {}).reduce((s, v) => s + v, 0);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !place) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Text className="text-center text-sm text-rose-600">
          {(error as Error)?.message ?? 'Place not found.'}
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: place.name,
          headerRight: userId
            ? () => (
                <Pressable
                  onPress={() => toggleFavorite({ placeId: place.id, isFav: isFavorite })}
                  style={{ marginRight: 4 }}
                  hitSlop={8}
                >
                  <FontAwesome
                    name={isFavorite ? 'heart' : 'heart-o'}
                    size={20}
                    color={isFavorite ? '#e11d48' : '#64748b'}
                  />
                </Pressable>
              )
            : undefined,
        }}
      />
      <ScrollView className="flex-1 bg-slate-50">
        {place.image_url ? (
          <Image
            source={{ uri: place.image_url }}
            className="h-64 w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-64 w-full bg-slate-100" />
        )}
        <MiniMap lat={place.lat} lng={place.lng} name={place.name} />
        <View className="gap-3 p-4">
          <View className="flex-row items-center justify-between">
            <View className="rounded-md bg-blue-50 px-2 py-0.5">
              <Text className="text-xs font-semibold uppercase text-blue-700">
                {CATEGORY_LABEL[place.category]}
              </Text>
            </View>
            {place.price_level ? (
              <Text className="text-sm font-semibold text-slate-500">
                {'$'.repeat(place.price_level)}
              </Text>
            ) : null}
          </View>
          <Text className="text-2xl font-bold text-slate-900">{place.name}</Text>
          {place.address ? (
            <Text className="text-sm text-slate-500">{place.address}</Text>
          ) : null}
          {place.description ? (
            <Text className="text-base leading-6 text-slate-700">{place.description}</Text>
          ) : null}
          {place.lat != null && place.lng != null ? (
            <Pressable
              onPress={() => {
                const url =
                  Platform.OS === 'web'
                    ? `https://maps.google.com/?q=${encodeURIComponent(place.name)}&ll=${place.lat},${place.lng}`
                    : `geo:${place.lat},${place.lng}?q=${place.lat},${place.lng}(${encodeURIComponent(place.name)})`;
                Linking.openURL(url);
              }}
              className="items-center rounded-lg bg-blue-600 px-4 py-3"
            >
              <Text className="font-semibold text-white">Get Directions</Text>
            </Pressable>
          ) : null}
          {userId ? (
            <AddToItineraryButton placeId={place.id} placeName={place.name} />
          ) : null}
        </View>

        {/* Reviews section */}
        <View style={{ padding: 16, gap: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a' }}>Reviews</Text>

          {/* Rating summary */}
          <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
            <View style={{ alignItems: 'center', minWidth: 56 }}>
              <Text style={{ fontSize: 36, fontWeight: '800', color: '#0f172a' }}>
                {place.rating != null ? place.rating.toFixed(1) : '—'}
              </Text>
              {place.rating != null ? (
                <StarRating value={Math.round(place.rating)} size={12} />
              ) : null}
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = dist?.[star] ?? 0;
                const pct = distTotal > 0 ? count / distTotal : 0;
                return (
                  <View
                    key={star}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                  >
                    <Text style={{ fontSize: 11, color: '#64748b', width: 8 }}>{star}</Text>
                    <View
                      style={{
                        flex: 1,
                        height: 6,
                        backgroundColor: '#f1f5f9',
                        borderRadius: 3,
                      }}
                    >
                      <View
                        style={{
                          width: `${Math.round(pct * 100)}%`,
                          height: '100%',
                          backgroundColor: '#f59e0b',
                          borderRadius: 3,
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 11,
                        color: '#94a3b8',
                        width: 18,
                        textAlign: 'right',
                      }}
                    >
                      {count}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Sort chips */}
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {(['newest', 'top', 'helpful'] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => setReviewSort(s)}
                style={{
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  backgroundColor: reviewSort === s ? '#2563eb' : '#f1f5f9',
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: reviewSort === s ? 'white' : '#64748b',
                  }}
                >
                  {s === 'newest' ? 'Newest' : s === 'top' ? 'Top rated' : 'Most helpful'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Write a review */}
          {userId ? (
            <Pressable
              onPress={() => setShowForm(true)}
              style={{
                borderWidth: 1,
                borderColor: '#2563eb',
                borderRadius: 8,
                padding: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#2563eb', fontWeight: '600', fontSize: 14 }}>
                Write a Review
              </Text>
            </Pressable>
          ) : null}

          {/* Review list */}
          {reviewsLoading ? (
            <ActivityIndicator style={{ paddingVertical: 16 }} />
          ) : (
            <>
              {reviews.length === 0 ? (
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 13,
                    color: '#94a3b8',
                    paddingVertical: 16,
                  }}
                >
                  No reviews yet. Be the first!
                </Text>
              ) : (
                reviews.map((r) => (
                  <ReviewCard
                    key={r.id}
                    review={r}
                    currentUserId={userId}
                    helpfulByMe={helpfulIds.includes(r.id)}
                    onHelpful={() => {
                      if (userId) doToggleHelpful({ reviewId: r.id, userId });
                    }}
                    onFlag={() => {
                      if (userId) doFlagReview(r.id);
                    }}
                  />
                ))
              )}
              {hasNextPage ? (
                <Pressable
                  onPress={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  style={{ alignItems: 'center', paddingVertical: 8 }}
                >
                  {isFetchingNextPage ? (
                    <ActivityIndicator />
                  ) : (
                    <Text style={{ color: '#2563eb', fontSize: 13, fontWeight: '500' }}>
                      Load more
                    </Text>
                  )}
                </Pressable>
              ) : reviews.length > 0 ? (
                <Text style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>
                  No more reviews
                </Text>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>

      {showForm ? (
        <ReviewForm placeId={id ?? ''} onClose={() => setShowForm(false)} />
      ) : null}
    </>
  );
}
