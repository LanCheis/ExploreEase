import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addRsvp, getEventById, getEventsPage, getMyRsvpIds, removeRsvp } from '@/lib/events';
import type { EventsQueryParams } from '@/lib/events';
import { useAuthStore } from '@/stores/auth';
import type { Event } from '@/types/event';

async function scheduleRsvpReminder(event: Event): Promise<void> {
  if (Platform.OS === 'web') return;
  const triggerMs = new Date(event.start_time).getTime() - 60 * 60 * 1000;
  const secondsUntil = Math.floor((triggerMs - Date.now()) / 1000);
  if (secondsUntil <= 0) return;
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;
  const id = await Notifications.scheduleNotificationAsync({
    content: { title: 'Event starting soon', body: `${event.title} starts in 1 hour` },
    trigger: { seconds: secondsUntil },
  });
  await AsyncStorage.setItem(`rsvp_notif_${event.id}`, id);
}

export function useEventsInfinite(params: Omit<EventsQueryParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['events', params],
    queryFn: ({ pageParam }) => getEventsPage({ ...params, page: pageParam as number }),
    getNextPageParam: (last) => last.nextPage ?? undefined,
    initialPageParam: 0,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => getEventById(id),
    enabled: !!id,
  });
}

export function useMyRsvpIds() {
  const userId = useAuthStore((s) => s.session?.user.id);
  return useQuery({
    queryKey: ['rsvpIds'],
    queryFn: () => getMyRsvpIds(userId!),
    enabled: !!userId,
    initialData: [] as string[],
  });
}

export function useToggleRsvp() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.session?.user.id);

  return useMutation({
    mutationFn: async ({ event, isRsvpd }: { event: Event; isRsvpd: boolean }) => {
      if (!userId) throw new Error('Not authenticated');
      if (isRsvpd) {
        await removeRsvp(userId, event.id);
      } else {
        await addRsvp(userId, event.id);
        await scheduleRsvpReminder(event);
      }
    },
    onMutate: async ({ event, isRsvpd }) => {
      await queryClient.cancelQueries({ queryKey: ['rsvpIds'] });
      const prev = queryClient.getQueryData<string[]>(['rsvpIds']) ?? [];
      queryClient.setQueryData<string[]>(
        ['rsvpIds'],
        isRsvpd ? prev.filter((id) => id !== event.id) : [...prev, event.id],
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx) queryClient.setQueryData(['rsvpIds'], ctx.prev);
    },
    onSettled: (_d, _e, { event }) => {
      queryClient.invalidateQueries({ queryKey: ['event', event.id] });
    },
  });
}
