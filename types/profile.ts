export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type TravelStyle = 'solo' | 'family' | 'group';
export type Interest = 'food' | 'culture' | 'shopping' | 'nature' | 'adventure';

export const INTERESTS: Interest[] = ['food', 'culture', 'shopping', 'nature', 'adventure'];

export interface Profile {
  id: string;
  display_name: string | null;
  age: number | null;
  gender: Gender | null;
  travel_style: TravelStyle | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
