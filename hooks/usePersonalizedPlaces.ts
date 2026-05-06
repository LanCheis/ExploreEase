import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { INTEREST_TO_CATEGORIES, getCategoriesForInterests } from '@/lib/interestMap';
import { useAuthStore } from '@/stores/auth';
import type { Place } from '@/types/place';
import { useUserInterests } from './useUserInterests';

const ALL_CATEGORIES = ['cuisine', 'activity', 'attraction'];

export function usePersonalizedPlaces() {
  const userId = useAuthStore((s) => s.session?.user.id);
  const { data: interests = [], isLoading: interestsLoading } = useUserInterests();

  const categories = interests.length > 0 ? getCategoriesForInterests(interests) : ALL_CATEGORIES;

  return useQuery({
    queryKey: ['personalized_places', userId, [...interests].sort()],
    queryFn: async () => {
      let query = supabase
        .from('places')
        .select('*')
        .in('category', categories)
        .order('rating', { ascending: false, nullsFirst: false })
        .limit(50);

      const { data, error } = await query;
      if (error) throw error;

      const places = (data ?? []) as Place[];

      if (interests.length === 0) return places;

      // Score each place by how many user interests map to its category
      const scoreMap: Record<string, number> = {};
      for (const place of places) {
        let score = 0;
        for (const interest of interests) {
          const cats = INTEREST_TO_CATEGORIES[interest] ?? ALL_CATEGORIES;
          if (cats.includes(place.category)) score++;
        }
        scoreMap[place.id] = score;
      }

      return places.sort((a, b) => {
        const diff = (scoreMap[b.id] ?? 0) - (scoreMap[a.id] ?? 0);
        if (diff !== 0) return diff;
        return (b.rating ?? 0) - (a.rating ?? 0);
      });
    },
    enabled: !!userId && !interestsLoading,
    staleTime: 5 * 60 * 1000,
  });
}
