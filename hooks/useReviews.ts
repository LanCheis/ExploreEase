import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  flagReview,
  getMyHelpfulIds,
  getRatingDistribution,
  getReviewsForPlace,
  submitReview,
  toggleHelpful,
} from '@/lib/reviews';

export function useReviewsInfinite(placeId: string, sort: 'newest' | 'top' | 'helpful') {
  return useInfiniteQuery({
    queryKey: ['reviews', placeId, sort],
    queryFn: ({ pageParam }) => getReviewsForPlace(placeId, { page: pageParam, sort }),
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    initialPageParam: 0,
    enabled: !!placeId,
  });
}

export function useRatingDistribution(placeId: string) {
  return useQuery({
    queryKey: ['rating-dist', placeId],
    queryFn: () => getRatingDistribution(placeId),
    enabled: !!placeId,
  });
}

export function useMyHelpfulIds(userId: string | undefined) {
  return useQuery({
    queryKey: ['my-helpful', userId],
    queryFn: () => getMyHelpfulIds(userId!),
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useSubmitReview(placeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submitReview,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', placeId] });
      qc.invalidateQueries({ queryKey: ['place', placeId] });
      qc.invalidateQueries({ queryKey: ['rating-dist', placeId] });
    },
  });
}

export function useToggleHelpful(placeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, userId }: { reviewId: string; userId: string }) =>
      toggleHelpful(reviewId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', placeId] });
      qc.invalidateQueries({ queryKey: ['my-helpful'] });
    },
  });
}

export function useFlagReview(placeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => flagReview(reviewId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', placeId] }),
    onError: () => {}, // RLS blocks non-admin flags until FR-11
  });
}
