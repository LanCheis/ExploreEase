export interface Itinerary {
  id: string;
  user_id: string;
  title: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface ItineraryItem {
  id: string;
  itinerary_id: string;
  place_id: string | null;
  event_id: string | null;
  custom_title: string | null;
  day_number: number;
  start_time: string | null;
  notes: string | null;
  sort_order: number;
}

export interface ItineraryItemWithDetails extends ItineraryItem {
  place: { id: string; name: string; category: string; image_url: string | null } | null;
  event: { id: string; title: string; category: string; image_url: string | null } | null;
}
