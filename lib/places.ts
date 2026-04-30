import { supabase } from './supabase';
import type { Place, PlaceCategory } from '@/types/place';

export interface PlacesQueryParams {
  category?: PlaceCategory;
  search?: string;
  minRating?: number;
  maxPriceLevel?: number;
  sort?: 'relevance' | 'top-rated' | 'a-z';
  page: number;
  pageSize?: number;
}

export interface PlacesPage {
  data: Place[];
  nextPage: number | null;
}

export async function getPlacesPage(params: PlacesQueryParams): Promise<PlacesPage> {
  const {
    category,
    search,
    minRating,
    maxPriceLevel,
    sort = 'relevance',
    page,
    pageSize = 10,
  } = params;
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from('places').select('*');

  if (category) query = query.eq('category', category);
  if (search) query = query.ilike('name', `%${search}%`);
  if (maxPriceLevel != null) query = query.lte('price_level', maxPriceLevel);
  if (minRating != null) query = query.gte('rating', minRating);

  if (sort === 'a-z') {
    query = query.order('name');
  } else if (sort === 'top-rated') {
    query = query.order('rating', { ascending: false, nullsFirst: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  query = query.range(from, to);

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data ?? []) as Place[];
  return {
    data: rows,
    nextPage: rows.length === pageSize ? page + 1 : null,
  };
}

export async function getPlaceById(id: string): Promise<Place | null> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as Place | null) ?? null;
}

export async function getFavoriteIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('place_id')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((f) => f.place_id as string);
}

export async function getFavoritePlaces(userId: string): Promise<Place[]> {
  const { data: favs, error: favErr } = await supabase
    .from('favorites')
    .select('place_id')
    .eq('user_id', userId);
  if (favErr) throw favErr;

  const placeIds = (favs ?? []).map((f) => f.place_id as string);
  if (placeIds.length === 0) return [];

  const { data, error } = await supabase
    .from('places')
    .select('*')
    .in('id', placeIds)
    .order('name');
  if (error) throw error;
  return (data ?? []) as Place[];
}

export async function addFavorite(userId: string, placeId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, place_id: placeId });
  if (error) throw error;
}

export async function removeFavorite(userId: string, placeId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('place_id', placeId);
  if (error) throw error;
}
