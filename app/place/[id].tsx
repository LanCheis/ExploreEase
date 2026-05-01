import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Image, Linking, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import MiniMap from '@/components/MiniMap';
import { useFavoriteIds, useToggleFavorite } from '@/hooks/useFavorites';
import { usePlace } from '@/hooks/usePlaces';
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

  const isFavorite = !!id && favoriteIds.includes(id);

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
        </View>
      </ScrollView>
    </>
  );
}
