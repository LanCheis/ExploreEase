import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addFavorite, getFavoriteIds, getFavoritePlaces, removeFavorite } from '@/lib/places';
import { useAuthStore } from '@/stores/auth';

export function useFavoriteIds() {
  const userId = useAuthStore((s) => s.session?.user.id);
  return useQuery({
    queryKey: ['favoriteIds', userId],
    queryFn: () => getFavoriteIds(userId!),
    enabled: !!userId,
  });
}

export function useFavoritePlaces() {
  const userId = useAuthStore((s) => s.session?.user.id);
  return useQuery({
    queryKey: ['favorites', userId],
    queryFn: () => getFavoritePlaces(userId!),
    enabled: !!userId,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.session?.user.id);

  return useMutation({
    mutationFn: ({ placeId, isFav }: { placeId: string; isFav: boolean }) => {
      if (!userId) throw new Error('Not authenticated');
      return isFav ? removeFavorite(userId, placeId) : addFavorite(userId, placeId);
    },
    onMutate: async ({ placeId, isFav }) => {
      if (!userId) return;
      const key = ['favoriteIds', userId];
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<string[]>(key);
      queryClient.setQueryData<string[]>(key, (old = []) =>
        isFav ? old.filter((id) => id !== placeId) : [...old, placeId],
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined && userId) {
        queryClient.setQueryData(['favoriteIds', userId], ctx.prev);
      }
    },
    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['favoriteIds', userId] });
        queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
      }
    },
  });
}
