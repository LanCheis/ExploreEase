import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, UrlTile } from 'react-native-maps';

import { useLocationStore } from '@/hooks/useLocation';
import { usePlacesForMap } from '@/hooks/usePlaces';

const HCM = { latitude: 10.775, longitude: 106.7 };
const DELTA = { latitudeDelta: 0.15, longitudeDelta: 0.15 };

export default function MapScreen() {
  const requestLocation = useLocationStore((s) => s.requestLocation);
  const currentLocation = useLocationStore((s) => s.currentLocation);
  const { data: places = [] } = usePlacesForMap();
  const router = useRouter();

  useEffect(() => {
    requestLocation();
  }, []);

  const center = currentLocation
    ? { latitude: currentLocation.lat, longitude: currentLocation.lng }
    : HCM;

  return (
    <View style={{ flex: 1 }}>
      <MapView style={StyleSheet.absoluteFillObject} initialRegion={{ ...center, ...DELTA }}>
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />
        {places.map((place) =>
          place.lat != null && place.lng != null ? (
            <Marker
              key={place.id}
              coordinate={{ latitude: place.lat, longitude: place.lng }}
              title={place.name}
              onPress={() => router.push(`/place/${place.id}`)}
              onCalloutPress={() => router.push(`/place/${place.id}`)}
            />
          ) : null
        )}
      </MapView>
      <View
        style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          backgroundColor: 'rgba(255,255,255,0.85)',
          paddingHorizontal: 5,
          paddingVertical: 2,
          borderRadius: 4,
        }}
      >
        <Text style={{ fontSize: 10, color: '#555' }}>© OpenStreetMap contributors</Text>
      </View>
    </View>
  );
}
