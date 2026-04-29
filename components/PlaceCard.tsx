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
}: {
  place: Place;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
    >
      {place.image_url ? (
        <Image
          source={{ uri: place.image_url }}
          className="h-44 w-full"
          resizeMode="cover"
        />
      ) : (
        <View className="h-44 w-full bg-slate-100" />
      )}
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
        <Text className="text-base font-semibold text-slate-900">
          {place.name}
        </Text>
      </View>
    </Pressable>
  );
}
