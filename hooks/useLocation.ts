import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PermissionStatus } from 'expo-location';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getCurrentPosition, requestLocationPermission } from '@/lib/location';
import type { Coords } from '@/lib/location';

interface LocationState {
  currentLocation: Coords | null;
  manualOverride: Coords | null;
  permissionStatus: PermissionStatus | null;
  requestLocation: () => Promise<void>;
  setManualOverride: (coords: Coords) => void;
  clearOverride: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      currentLocation: null,
      manualOverride: null,
      permissionStatus: null,
      requestLocation: async () => {
        const status = await requestLocationPermission();
        set({ permissionStatus: status });
        if (status === 'granted') {
          const coords = await getCurrentPosition();
          set({ currentLocation: coords });
        }
      },
      setManualOverride: (coords) => set({ manualOverride: coords }),
      clearOverride: () => set({ manualOverride: null }),
    }),
    {
      name: 'location-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the manual override — current location re-fetches fresh each session.
      partialize: (state) => ({ manualOverride: state.manualOverride }),
    }
  )
);

export function useEffectiveLocation(): Coords | null {
  const manualOverride = useLocationStore((s) => s.manualOverride);
  const currentLocation = useLocationStore((s) => s.currentLocation);
  return manualOverride ?? currentLocation;
}
