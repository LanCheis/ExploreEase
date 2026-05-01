import * as ExpoLocation from 'expo-location';
import { Platform } from 'react-native';

export type Coords = { lat: number; lng: number };

export async function requestLocationPermission(): Promise<ExpoLocation.PermissionStatus> {
  if (Platform.OS === 'web') return 'granted' as ExpoLocation.PermissionStatus;
  const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
  return status;
}

export async function getCurrentPosition(): Promise<Coords | null> {
  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 10000 }
      );
    });
  }
  try {
    const loc = await ExpoLocation.getCurrentPositionAsync({
      accuracy: ExpoLocation.Accuracy.Balanced,
    });
    return { lat: loc.coords.latitude, lng: loc.coords.longitude };
  } catch {
    return null;
  }
}

export async function getLastKnownPosition(): Promise<Coords | null> {
  if (Platform.OS === 'web') return null;
  try {
    const loc = await ExpoLocation.getLastKnownPositionAsync();
    if (!loc) return null;
    return { lat: loc.coords.latitude, lng: loc.coords.longitude };
  } catch {
    return null;
  }
}
