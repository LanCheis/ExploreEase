import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { getPlaceById, getPlacesForMap, getPlacesPage } from '@/lib/places';
import type { PlacesQueryParams } from '@/lib/places';

export function usePlacesInfinite(params: Omit<PlacesQueryParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['places', params],
    queryFn: ({ pageParam }) => getPlacesPage({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    initialPageParam: 0,
  });
}

export function usePlace(id: string | undefined) {
  return useQuery({
    queryKey: ['place', id],
    queryFn: () => getPlaceById(id as string),
    enabled: !!id,
  });
}

export function usePlacesForMap() {
  return useQuery({
    queryKey: ['places-map'],
    queryFn: getPlacesForMap,
    staleTime: 5 * 60 * 1000,
  });
}
