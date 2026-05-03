import { supabase } from './supabase';
import type { Itinerary, ItineraryItem, ItineraryItemWithDetails } from '@/types/itinerary';

export async function getMyItineraries(userId: string): Promise<Itinerary[]> {
  const { data, error } = await supabase
    .from('itineraries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Itinerary[];
}

export async function getItineraryById(id: string): Promise<Itinerary | null> {
  const { data, error } = await supabase
    .from('itineraries')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as Itinerary | null) ?? null;
}

export async function getItineraryItems(itineraryId: string): Promise<ItineraryItemWithDetails[]> {
  const { data, error } = await supabase
    .from('itinerary_items')
    .select('*, place:places(id, name, category, image_url), event:events(id, title, category, image_url)')
    .eq('itinerary_id', itineraryId)
    .order('day_number')
    .order('sort_order');
  if (error) throw error;
  return (data ?? []) as ItineraryItemWithDetails[];
}

export interface CreateItineraryInput {
  userId: string;
  title: string;
  startDate: string;
  endDate: string;
}

export async function createItinerary(input: CreateItineraryInput): Promise<Itinerary> {
  const { data, error } = await supabase
    .from('itineraries')
    .insert({ user_id: input.userId, title: input.title, start_date: input.startDate, end_date: input.endDate })
    .select()
    .single();
  if (error) throw error;
  return data as Itinerary;
}

export async function updateItinerary(
  id: string,
  input: Omit<CreateItineraryInput, 'userId'>,
): Promise<Itinerary> {
  const { data, error } = await supabase
    .from('itineraries')
    .update({ title: input.title, start_date: input.startDate, end_date: input.endDate })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Itinerary;
}

export async function deleteItinerary(id: string): Promise<void> {
  const { error } = await supabase.from('itineraries').delete().eq('id', id);
  if (error) throw error;
}

export interface AddItemInput {
  itineraryId: string;
  placeId?: string;
  eventId?: string;
  customTitle?: string;
  dayNumber: number;
  startTime?: string;
  notes?: string;
  sortOrder: number;
}

export async function addItem(input: AddItemInput): Promise<ItineraryItem> {
  const { data, error } = await supabase
    .from('itinerary_items')
    .insert({
      itinerary_id: input.itineraryId,
      place_id: input.placeId ?? null,
      event_id: input.eventId ?? null,
      custom_title: input.customTitle ?? null,
      day_number: input.dayNumber,
      start_time: input.startTime ?? null,
      notes: input.notes ?? null,
      sort_order: input.sortOrder,
    })
    .select()
    .single();
  if (error) throw error;
  return data as ItineraryItem;
}

export async function deleteItem(itemId: string): Promise<void> {
  const { error } = await supabase.from('itinerary_items').delete().eq('id', itemId);
  if (error) throw error;
}

export async function swapItemOrder(
  itemId: string,
  itemNewOrder: number,
  neighborId: string,
  neighborNewOrder: number,
): Promise<void> {
  const { error: e1 } = await supabase
    .from('itinerary_items')
    .update({ sort_order: itemNewOrder })
    .eq('id', itemId);
  if (e1) throw e1;
  const { error: e2 } = await supabase
    .from('itinerary_items')
    .update({ sort_order: neighborNewOrder })
    .eq('id', neighborId);
  if (e2) throw e2;
}
