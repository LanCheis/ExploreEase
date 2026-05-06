import { supabase } from './supabase';
import type { Profile } from '@/types/profile';
import type { Event, EventStatus } from '@/types/event';
import type { ReviewWithProfile } from '@/types/review';

// ---- Users ----

export async function getAdminUsers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function setAdminStatus(userId: string, isAdmin: boolean): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_admin: isAdmin })
    .eq('id', userId);
  if (error) throw error;
}

// ---- Events ----

export async function getAdminEvents(status?: EventStatus): Promise<Event[]> {
  let query = supabase.from('events').select('*').order('start_time', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Event[];
}

export async function setEventStatus(eventId: string, status: EventStatus): Promise<void> {
  const { error } = await supabase.from('events').update({ status }).eq('id', eventId);
  if (error) throw error;
}

export async function deleteEvent(eventId: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', eventId);
  if (error) throw error;
}

// ---- Reviews ----

export async function getAdminReviews(flaggedOnly?: boolean): Promise<ReviewWithProfile[]> {
  let query = supabase
    .from('reviews')
    .select('*, profiles(display_name, avatar_url)')
    .order('created_at', { ascending: false });
  if (flaggedOnly) query = query.eq('is_flagged', true);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ReviewWithProfile[];
}

export async function deleteReview(reviewId: string): Promise<void> {
  const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
  if (error) throw error;
}

export async function unflagReview(reviewId: string): Promise<void> {
  const { error } = await supabase.rpc('unflag_review', { p_review_id: reviewId });
  if (error) throw error;
}

// ---- Analytics ----

export interface AdminAnalytics {
  total_users: number;
  total_events_pending: number;
  total_events_approved: number;
  total_events_rejected: number;
  total_reviews: number;
  total_places: number;
  total_itineraries: number;
  top_places: { name: string; review_count: number }[];
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const { data, error } = await supabase.rpc('get_admin_analytics');
  if (error) throw error;
  return data as AdminAnalytics;
}
