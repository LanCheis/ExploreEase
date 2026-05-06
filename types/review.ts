export interface ReviewReply {
  id: string;
  review_id: string;
  user_id: string;
  text: string;
  created_at: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface ReviewWithProfile {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  text: string;
  photo_url: string | null;
  helpful_count: number;
  is_flagged: boolean;
  flag_reason: string | null;
  created_at: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}
