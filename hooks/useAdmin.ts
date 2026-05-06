import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteEvent,
  deleteReview,
  getAdminAnalytics,
  getAdminEvents,
  getAdminReviews,
  getAdminUsers,
  setAdminStatus,
  setEventStatus,
  unflagReview,
} from '@/lib/admin';
import type { EventStatus } from '@/types/event';

export function useAdminUsers() {
  return useQuery({ queryKey: ['admin', 'users'], queryFn: getAdminUsers, staleTime: 30_000 });
}

export function useSetAdminStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) =>
      setAdminStatus(userId, isAdmin),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useAdminEvents(status?: EventStatus) {
  return useQuery({
    queryKey: ['admin', 'events', status ?? 'all'],
    queryFn: () => getAdminEvents(status),
    staleTime: 30_000,
  });
}

export function useSetEventStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, status }: { eventId: string; status: EventStatus }) =>
      setEventStatus(eventId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'events'] }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => deleteEvent(eventId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'events'] }),
  });
}

export function useAdminReviews(flaggedOnly?: boolean) {
  return useQuery({
    queryKey: ['admin', 'reviews', flaggedOnly ?? false],
    queryFn: () => getAdminReviews(flaggedOnly),
    staleTime: 30_000,
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }),
  });
}

export function useUnflagReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => unflagReview(reviewId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }),
  });
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: getAdminAnalytics,
    staleTime: 60_000,
  });
}
