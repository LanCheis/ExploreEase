import { useQuery } from '@tanstack/react-query';

import { getPlaceById, getPlaces } from '@/lib/places';

export function usePlaces() {
  return useQuery({
    queryKey: ['places'],
    queryFn: getPlaces,
  });
}

export function usePlace(id: string | undefined) {
  return useQuery({
    queryKey: ['places', id],
    queryFn: () => getPlaceById(id as string),
    enabled: !!id,
  });
}
