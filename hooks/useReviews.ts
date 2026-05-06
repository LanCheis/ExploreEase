import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteOwnReply,
  deleteOwnReview,
  editReview,
  flagReview,
  getMyHelpfulIds,
  getMyReviewForPlace,
  getRatingDistribution,
  getReviewReplies,
  getReviewsForPlace,
  submitReply,
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
    mutationFn: ({ reviewId, reason }: { reviewId: string; reason: string }) =>
      flagReview(reviewId, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', placeId] }),
  });
}

export function useMyReviewForPlace(placeId: string, userId?: string) {
  return useQuery({
    queryKey: ['my-review', placeId, userId],
    queryFn: () => getMyReviewForPlace(placeId, userId!),
    enabled: !!placeId && !!userId,
  });
}

export function useEditReview(placeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, rating, text }: { reviewId: string; rating: number; text: string }) =>
      editReview(reviewId, rating, text),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', placeId] });
      qc.invalidateQueries({ queryKey: ['place', placeId] });
      qc.invalidateQueries({ queryKey: ['rating-dist', placeId] });
      qc.invalidateQueries({ queryKey: ['my-review', placeId] });
    },
  });
}

export function useDeleteOwnReview(placeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => deleteOwnReview(reviewId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', placeId] });
      qc.invalidateQueries({ queryKey: ['place', placeId] });
      qc.invalidateQueries({ queryKey: ['rating-dist', placeId] });
      qc.invalidateQueries({ queryKey: ['my-review', placeId] });
    },
  });
}

export function useReviewReplies(reviewId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['replies', reviewId],
    queryFn: () => getReviewReplies(reviewId),
    enabled: !!reviewId && enabled,
    staleTime: 30_000,
  });
}

export function useSubmitReply(reviewId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ text }: { reviewId: string; text: string }) => submitReply(reviewId, text),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['replies', reviewId] }),
  });
}

export function useDeleteReply(reviewId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (replyId: string) => deleteOwnReply(replyId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['replies', reviewId] }),
  });
}
