export interface ReviewWithProfile {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  text: string;
  photo_url: string | null;
  helpful_count: number;
  is_flagged: boolean;
  created_at: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}
