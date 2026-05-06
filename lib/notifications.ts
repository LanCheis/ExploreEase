import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

export async function requestPermissionsAsync(): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof Notification === 'undefined') return;
    try { await Notification.requestPermission(); } catch {}
    return;
  }
  await Notifications.requestPermissionsAsync();
}

export async function scheduleLocal(opts: {
  title: string;
  body: string;
  triggerDate: Date;
  data?: Record<string, unknown>;
}): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  const secondsUntil = Math.floor((opts.triggerDate.getTime() - Date.now()) / 1000);
  if (secondsUntil <= 0) return null;
  return Notifications.scheduleNotificationAsync({
    content: { title: opts.title, body: opts.body, data: opts.data },
    trigger: { seconds: secondsUntil },
  });
}

export async function notifyInApp(opts: {
  userId: string;
  category: 'alert' | 'offer' | 'message';
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}): Promise<void> {
  await supabase.from('notifications').insert({
    user_id: opts.userId,
    category: opts.category,
    title: opts.title,
    body: opts.body ?? null,
    data: opts.data ?? null,
  });
}

export async function broadcastNotification(title: string, body: string): Promise<void> {
  await supabase.rpc('broadcast_notification', { p_title: title, p_body: body });
}
