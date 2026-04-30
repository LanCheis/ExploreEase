export type PlaceCategory = 'attraction' | 'cuisine' | 'activity';

export interface Place {
  id: string;
  name: string;
  description: string | null;
  category: PlaceCategory;
  address: string | null;
  lat: number | null;
  lng: number | null;
  price_level: number | null;
  rating: number | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}
