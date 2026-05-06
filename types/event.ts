export type EventCategory = 'general' | 'food' | 'music' | 'sports' | 'arts' | 'festival';
export type EventStatus = 'pending' | 'approved' | 'rejected';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  lat: number | null;
  lng: number | null;
  start_time: string;
  end_time: string | null;
  category: EventCategory;
  max_attendees: number | null;
  image_url: string | null;
  attendee_count: number;
  status: EventStatus;
  created_at: string;
}
