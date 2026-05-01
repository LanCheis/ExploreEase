import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';

interface Props {
  lat: number | null;
  lng: number | null;
  name: string;
}

export default function MiniMap({ lat, lng, name }: Props) {
  if (lat == null || lng == null) return null;
  return (
    <View style={{ height: 180, overflow: 'hidden' }}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />
        <Marker coordinate={{ latitude: lat, longitude: lng }} title={name} />
      </MapView>
      <View
        style={{
          position: 'absolute',
          bottom: 4,
          right: 4,
          backgroundColor: 'rgba(255,255,255,0.85)',
          paddingHorizontal: 4,
          paddingVertical: 2,
          borderRadius: 4,
        }}
      >
        <Text style={{ fontSize: 9, color: '#555' }}>© OpenStreetMap contributors</Text>
      </View>
    </View>
  );
}
