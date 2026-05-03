import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addItem,
  createItinerary,
  deleteItem,
  deleteItinerary,
  getItineraryById,
  getItineraryItems,
  getMyItineraries,
  swapItemOrder,
  updateItinerary,
} from '@/lib/itineraries';
import type { AddItemInput, CreateItineraryInput } from '@/lib/itineraries';
import { useAuthStore } from '@/stores/auth';

export function useMyItineraries() {
  const userId = useAuthStore((s) => s.session?.user.id);
  return useQuery({
    queryKey: ['itineraries', userId],
    queryFn: () => getMyItineraries(userId!),
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useItinerary(id: string) {
  return useQuery({
    queryKey: ['itinerary', id],
    queryFn: () => getItineraryById(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useItineraryItems(itineraryId: string) {
  return useQuery({
    queryKey: ['itinerary-items', itineraryId],
    queryFn: () => getItineraryItems(itineraryId),
    enabled: !!itineraryId,
    staleTime: 30_000,
  });
}

export function useCreateItinerary() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.session?.user.id);
  return useMutation({
    mutationFn: (input: Omit<CreateItineraryInput, 'userId'>) =>
      createItinerary({ ...input, userId: userId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraries', userId] });
    },
  });
}

export function useUpdateItinerary() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.session?.user.id);
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Omit<CreateItineraryInput, 'userId'>) =>
      updateItinerary(id, input),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['itineraries', userId] });
      queryClient.setQueryData(['itinerary', updated.id], updated);
    },
  });
}

export function useDeleteItinerary() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.session?.user.id);
  return useMutation({
    mutationFn: (id: string) => deleteItinerary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraries', userId] });
    },
  });
}

export function useAddItem(itineraryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddItemInput) => addItem(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itinerary-items', itineraryId] });
    },
  });
}

export function useDeleteItem(itineraryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => deleteItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itinerary-items', itineraryId] });
    },
  });
}

export function useMoveItem(itineraryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      itemNewOrder,
      neighborId,
      neighborNewOrder,
    }: {
      itemId: string;
      itemNewOrder: number;
      neighborId: string;
      neighborNewOrder: number;
    }) => swapItemOrder(itemId, itemNewOrder, neighborId, neighborNewOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itinerary-items', itineraryId] });
    },
  });
}
