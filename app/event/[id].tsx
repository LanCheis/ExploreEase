import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { AddToItineraryButton } from '@/components/AddToItineraryButton';
import MiniMap from '@/components/MiniMap';
import { useEvent, useMyRsvpIds, useToggleRsvp } from '@/hooks/useEvents';
import { useAuthStore } from '@/stores/auth';
import type { EventCategory } from '@/types/event';

const CATEGORY_COLOR: Record<EventCategory, string> = {
  general: '#64748b',
  food: '#ea580c',
  music: '#7c3aed',
  sports: '#16a34a',
  arts: '#db2777',
  festival: '#d97706',
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) +
    ' at ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  );
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useAuthStore((s) => s.session?.user.id);
  const { data: event, isLoading, isError, error } = useEvent(id);
  const { data: rsvpIds = [] } = useMyRsvpIds();
  const { mutate: toggleRsvp, isPending } = useToggleRsvp();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !event) {
    return (
      <View
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}
      >
        <Text style={{ textAlign: 'center', fontSize: 13, color: '#e11d48' }}>
          {(error as Error)?.message ?? 'Event not found.'}
        </Text>
      </View>
    );
  }

  const isRsvpd = rsvpIds.includes(event.id);
  const isFull =
    event.max_attendees != null && event.attendee_count >= event.max_attendees && !isRsvpd;
  const color = CATEGORY_COLOR[event.category as EventCategory] ?? '#64748b';

  return (
    <>
      <Stack.Screen options={{ title: event.title }} />
      <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        {event.image_url ? (
          <Image
            source={{ uri: event.image_url }}
            style={{ width: '100%', height: 200 }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: '100%',
              height: 140,
              backgroundColor: color + '22',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FontAwesome name="calendar" size={48} color={color} />
          </View>
        )}

        {event.lat != null && event.lng != null ? (
          <MiniMap lat={event.lat} lng={event.lng} name={event.title} />
        ) : null}

        <View style={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={{
                backgroundColor: color + '1a',
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}
            >
              <Text
                style={{ fontSize: 11, fontWeight: '600', color, textTransform: 'uppercase' }}
              >
                {event.category}
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: '#94a3b8' }}>
              {event.attendee_count}
              {event.max_attendees ? `/${event.max_attendees}` : ''} attending
            </Text>
          </View>

          <Text style={{ fontSize: 22, fontWeight: '800', color: '#0f172a' }}>{event.title}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
            <FontAwesome name="clock-o" size={14} color="#64748b" style={{ marginTop: 2 }} />
            <View style={{ gap: 2 }}>
              <Text style={{ fontSize: 13, color: '#334155' }}>
                {formatDateTime(event.start_time)}
              </Text>
              {event.end_time ? (
                <Text style={{ fontSize: 12, color: '#64748b' }}>
                  Ends: {formatDateTime(event.end_time)}
                </Text>
              ) : null}
            </View>
          </View>

          {event.location ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <FontAwesome name="map-marker" size={14} color="#64748b" />
              <Text style={{ fontSize: 13, color: '#334155', flex: 1 }}>{event.location}</Text>
            </View>
          ) : null}

          {event.description ? (
            <Text style={{ fontSize: 14, lineHeight: 22, color: '#475569' }}>
              {event.description}
            </Text>
          ) : null}

          {event.lat != null && event.lng != null ? (
            <Pressable
              onPress={() => {
                const url =
                  Platform.OS === 'web'
                    ? `https://maps.google.com/?q=${encodeURIComponent(event.title)}&ll=${event.lat},${event.lng}`
                    : `geo:${event.lat},${event.lng}?q=${event.lat},${event.lng}(${encodeURIComponent(event.title)})`;
                Linking.openURL(url);
              }}
              style={{
                alignItems: 'center',
                borderRadius: 8,
                backgroundColor: '#2563eb',
                paddingVertical: 12,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
                Get Directions
              </Text>
            </Pressable>
          ) : null}

          {userId ? (
            <Pressable
              onPress={() => {
                if (!isPending && !isFull) toggleRsvp({ event, isRsvpd });
              }}
              disabled={isPending || isFull}
              style={{
                alignItems: 'center',
                borderRadius: 8,
                paddingVertical: 12,
                backgroundColor: isFull ? '#f1f5f9' : isRsvpd ? '#fee2e2' : '#16a34a',
                borderWidth: isFull ? 1 : 0,
                borderColor: '#e2e8f0',
              }}
            >
              <Text
                style={{
                  fontWeight: '600',
                  fontSize: 14,
                  color: isFull ? '#94a3b8' : isRsvpd ? '#dc2626' : 'white',
                }}
              >
                {isPending ? '...' : isFull ? 'Event full' : isRsvpd ? 'Cancel RSVP' : 'RSVP'}
              </Text>
            </Pressable>
          ) : (
            <Text style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
              Sign in to RSVP
            </Text>
          )}
          {userId ? (
            <AddToItineraryButton eventId={event.id} eventTitle={event.title} />
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}
