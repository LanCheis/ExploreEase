import { Pressable, Text, View } from 'react-native';

import type { Event, EventCategory } from '@/types/event';

const CATEGORY_COLOR: Record<EventCategory, string> = {
  general: '#64748b',
  food: '#ea580c',
  music: '#7c3aed',
  sports: '#16a34a',
  arts: '#db2777',
  festival: '#d97706',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  );
}

interface Props {
  event: Event;
  onPress: () => void;
}

export function EventCard({ event, onPress }: Props) {
  const color = CATEGORY_COLOR[event.category as EventCategory] ?? '#64748b';
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        gap: 8,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View
          style={{
            backgroundColor: color + '1a',
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 2,
          }}
        >
          <Text
            style={{ fontSize: 11, fontWeight: '600', color, textTransform: 'uppercase' }}
          >
            {event.category}
          </Text>
        </View>
        <Text style={{ fontSize: 11, color: '#94a3b8' }}>
          {event.attendee_count}
          {event.max_attendees ? `/${event.max_attendees}` : ''} attending
        </Text>
      </View>
      <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a' }} numberOfLines={2}>
        {event.title}
      </Text>
      <Text style={{ fontSize: 12, color: '#2563eb', fontWeight: '500' }}>
        {formatDate(event.start_time)}
      </Text>
      {event.location ? (
        <Text style={{ fontSize: 12, color: '#64748b' }} numberOfLines={1}>
          {event.location}
        </Text>
      ) : null}
    </Pressable>
  );
}
