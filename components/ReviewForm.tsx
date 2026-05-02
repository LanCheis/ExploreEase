import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { z } from 'zod';

import { StarRating } from '@/components/StarRating';
import { useSubmitReview } from '@/hooks/useReviews';

const schema = z.object({
  rating: z.number().min(1, 'Select a rating'),
  text: z.string().min(10, 'At least 10 characters'),
});
type FormData = z.infer<typeof schema>;

interface Props {
  placeId: string;
  onClose: () => void;
}

export function ReviewForm({ placeId, onClose }: Props) {
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const { mutateAsync, isPending } = useSubmitReview(placeId);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 0, text: '' },
  });

  const rating = watch('rating');

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await mutateAsync({ placeId, rating: data.rating, text: data.text, photoUri });
      onClose();
    } catch (e) {
      Alert.alert('Error', (e as Error).message ?? 'Failed to submit review.');
    }
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
      >
        <View
          style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            gap: 16,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a' }}>
              Write a Review
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={{ fontSize: 18, color: '#64748b' }}>✕</Text>
            </Pressable>
          </View>

          <Controller
            control={control}
            name="rating"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: 13, color: '#475569', fontWeight: '500' }}>Rating</Text>
                <StarRating value={value} interactive onChange={onChange} size={28} />
                {error ? (
                  <Text style={{ fontSize: 12, color: '#e11d48' }}>{error.message}</Text>
                ) : null}
              </View>
            )}
          />

          <Controller
            control={control}
            name="text"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: 13, color: '#475569', fontWeight: '500' }}>Review</Text>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Share your experience (min 10 characters)..."
                  multiline
                  style={{
                    borderWidth: 1,
                    borderColor: errors.text ? '#fca5a5' : '#e2e8f0',
                    borderRadius: 8,
                    padding: 10,
                    fontSize: 14,
                    minHeight: 100,
                    textAlignVertical: 'top',
                    color: '#0f172a',
                  }}
                />
                {errors.text ? (
                  <Text style={{ fontSize: 12, color: '#e11d48' }}>{errors.text.message}</Text>
                ) : null}
              </View>
            )}
          />

          <View style={{ gap: 8 }}>
            <Pressable
              onPress={pickPhoto}
              style={{
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: '#94a3b8',
                borderRadius: 8,
                padding: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#64748b', fontSize: 13 }}>
                {photoUri ? 'Change photo' : 'Add photo (optional)'}
              </Text>
            </Pressable>
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={{ height: 100, borderRadius: 8 }}
                resizeMode="cover"
              />
            ) : null}
          </View>

          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isPending || rating === 0}
            style={{
              backgroundColor: isPending || rating === 0 ? '#94a3b8' : '#2563eb',
              borderRadius: 10,
              padding: 14,
              alignItems: 'center',
            }}
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>
                Submit Review
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
