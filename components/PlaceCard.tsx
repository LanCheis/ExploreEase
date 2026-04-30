import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image, Pressable, Text, View } from 'react-native';

import type { Place, PlaceCategory } from '@/types/place';

const CATEGORY_LABEL: Record<PlaceCategory, string> = {
  attraction: 'Attraction',
  cuisine: 'Cuisine',
  activity: 'Activity',
};

export function PlaceCard({
  place,
  onPress,
  isFavorite,
  onToggleFavorite,
}: {
  place: Place;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
    >
      <View>
        {place.image_url ? (
          <Image
            source={{ uri: place.image_url }}
            className="h-44 w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-44 w-full bg-slate-100" />
        )}
        {onToggleFavorite != null && (
          <Pressable
            onPress={onToggleFavorite}
            className="absolute right-3 top-3 rounded-full bg-white/80 p-2"
            hitSlop={8}
          >
            <FontAwesome
              name={isFavorite ? 'heart' : 'heart-o'}
              size={16}
              color={isFavorite ? '#e11d48' : '#64748b'}
            />
          </Pressable>
        )}
      </View>
      <View className="gap-1 p-4">
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
        <Text className="text-base font-semibold text-slate-900">{place.name}</Text>
      </View>
    </Pressable>
  );
}
