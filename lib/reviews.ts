import { supabase } from './supabase';
import type { ReviewReply, ReviewWithProfile } from '@/types/review';

export interface ReviewsQueryParams {
  page: number;
  pageSize?: number;
  sort: 'newest' | 'top' | 'helpful';
}

export interface ReviewsPage {
  data: ReviewWithProfile[];
  nextPage: number | null;
}

export async function getReviewsForPlace(
  placeId: string,
  { page, pageSize = 10, sort }: ReviewsQueryParams
): Promise<ReviewsPage> {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('reviews')
    .select('*, profiles(display_name, avatar_url)')
    .eq('place_id', placeId);

  if (sort === 'newest') query = query.order('created_at', { ascending: false });
  else if (sort === 'top') query = query.order('rating', { ascending: false });
  else query = query.order('helpful_count', { ascending: false });

  query = query.range(from, to);

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data ?? []) as ReviewWithProfile[];
  return { data: rows, nextPage: rows.length === pageSize ? page + 1 : null };
}

export async function submitReview({
  placeId,
  rating,
  text,
  photoUri,
}: {
  placeId: string;
  rating: number;
  text: string;
  photoUri?: string;
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const reviewId = crypto.randomUUID();
  let photoUrl: string | null = null;
  if (photoUri) {
    photoUrl = await uploadReviewPhoto(photoUri, reviewId);
  }
  const { error } = await supabase.from('reviews').insert({
    id: reviewId,
    place_id: placeId,
    user_id: user.id,
    rating,
    text,
    photo_url: photoUrl,
  });
  if (error) throw error;
}

export async function toggleHelpful(reviewId: string, userId: string): Promise<void> {
  const { data } = await supabase
    .from('review_helpful')
    .select('review_id')
    .eq('review_id', reviewId)
    .eq('user_id', userId)
    .maybeSingle();

  if (data) {
    const { error } = await supabase
      .from('review_helpful')
      .delete()
      .eq('review_id', reviewId)
      .eq('user_id', userId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('review_helpful')
      .insert({ review_id: reviewId, user_id: userId });
    if (error) throw error;
  }
}

export async function editReview(reviewId: string, rating: number, text: string): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .update({ rating, text })
    .eq('id', reviewId);
  if (error) throw error;
}

export async function deleteOwnReview(reviewId: string): Promise<void> {
  const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
  if (error) throw error;
}

export async function flagReview(reviewId: string, reason: string): Promise<void> {
  const { error } = await supabase.rpc('flag_review', { p_review_id: reviewId, p_reason: reason });
  if (error) throw error;
}

export async function getMyReviewForPlace(
  placeId: string,
  userId: string
): Promise<ReviewWithProfile | null> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(display_name, avatar_url)')
    .eq('place_id', placeId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as ReviewWithProfile | null;
}

export async function getReviewReplies(reviewId: string): Promise<ReviewReply[]> {
  const { data, error } = await supabase
    .from('review_replies')
    .select('*, profiles(display_name, avatar_url)')
    .eq('review_id', reviewId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ReviewReply[];
}

export async function submitReply(reviewId: string, text: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('review_replies')
    .insert({ review_id: reviewId, user_id: user.id, text });
  if (error) throw error;
}

export async function deleteOwnReply(replyId: string): Promise<void> {
  const { error } = await supabase.from('review_replies').delete().eq('id', replyId);
  if (error) throw error;
}

export async function uploadReviewPhoto(uri: string, reviewId: string): Promise<string> {
  const path = `reviews/${reviewId}/${Date.now()}.jpg`;
  const response = await fetch(uri);
  const blob = await response.blob();
  const { error } = await supabase.storage
    .from('place-images')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
  if (error) throw error;
  return supabase.storage.from('place-images').getPublicUrl(path).data.publicUrl;
}

export async function getRatingDistribution(placeId: string): Promise<Record<number, number>> {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('place_id', placeId)
    .eq('is_flagged', false);
  if (error) throw error;
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  (data ?? []).forEach((r) => {
    dist[r.rating] = (dist[r.rating] ?? 0) + 1;
  });
  return dist;
}

export async function getMyHelpfulIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('review_helpful')
    .select('review_id')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.review_id as string);
}
