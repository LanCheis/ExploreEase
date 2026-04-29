import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';

import { usePlace } from '@/hooks/usePlaces';
import type { PlaceCategory } from '@/types/place';

const CATEGORY_LABEL: Record<PlaceCategory, string> = {
  attraction: 'Attraction',
  cuisine: 'Cuisine',
  activity: 'Activity',
};

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: place, isLoading, isError, error } = usePlace(id);

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
      <Stack.Screen options={{ title: place.name }} />
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
            <Text className="text-base leading-6 text-slate-700">
              {place.description}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}
