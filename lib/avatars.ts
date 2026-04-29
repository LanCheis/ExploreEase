import * as ImagePicker from 'expo-image-picker';

import { supabase } from './supabase';

export async function pickAndUploadAvatar(userId: string): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    throw new Error('Permission to access photos was denied');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.7,
    allowsEditing: true,
    aspect: [1, 1],
  });
  if (result.canceled) return null;

  const asset = result.assets[0];
  const ext = (asset.uri.split('.').pop() || 'jpg').split('?')[0].toLowerCase();
  const path = `${userId}/avatar.${ext}`;

  const response = await fetch(asset.uri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, blob, {
      contentType: blob.type || `image/${ext}`,
      upsert: true,
    });
  if (error) throw error;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  // Cache-bust so the new image shows immediately after re-upload.
  return `${data.publicUrl}?t=${Date.now()}`;
}
