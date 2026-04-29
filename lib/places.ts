import { supabase } from './supabase';
import type { Place } from '@/types/place';

export async function getPlaces(): Promise<Place[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .order('name');
  if (error) throw error;
  return (data ?? []) as Place[];
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
