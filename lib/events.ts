import { supabase } from './supabase';
import type { Event } from '@/types/event';

export interface EventsQueryParams {
  category?: string;
  search?: string;
  page: number;
  pageSize?: number;
}

export interface EventsPage {
  data: Event[];
  nextPage: number | null;
}

export async function getEventsPage(params: EventsQueryParams): Promise<EventsPage> {
  const { category, search, page, pageSize = 10 } = params;
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from('events').select('*');

  if (category) query = query.eq('category', category);
  if (search) query = query.ilike('title', `%${search}%`);

  query = query.order('start_time').range(from, to);

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data ?? []) as Event[];
  return { data: rows, nextPage: rows.length === pageSize ? page + 1 : null };
}

export async function getEventById(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as Event | null) ?? null;
}

export async function getMyRsvpIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('rsvps')
    .select('event_id')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.event_id as string);
}

export async function addRsvp(userId: string, eventId: string): Promise<void> {
  const { error } = await supabase.from('rsvps').insert({ user_id: userId, event_id: eventId });
  if (error) throw error;
}

export async function removeRsvp(userId: string, eventId: string): Promise<void> {
  const { error } = await supabase
    .from('rsvps')
    .delete()
    .eq('user_id', userId)
    .eq('event_id', eventId);
  if (error) throw error;
}
