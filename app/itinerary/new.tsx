import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { useState } from 'react';

import { useCreateItinerary, useItinerary, useUpdateItinerary } from '@/hooks/useItineraries';

const schema = z
  .object({
    title: z.string().min(1, 'Title required'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  });

type FormData = z.infer<typeof schema>;

export default function ItineraryFormScreen() {
  const router = useRouter();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEdit = !!edit;
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: existing } = useItinerary(edit ?? '');
  const { mutate: create, isPending: isCreating } = useCreateItinerary();
  const { mutate: update, isPending: isUpdating } = useUpdateItinerary();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: existing
      ? { title: existing.title, startDate: existing.start_date, endDate: existing.end_date }
      : undefined,
    defaultValues: { title: '', startDate: '', endDate: '' },
  });

  const isPending = isCreating || isUpdating;

  function onSubmit(data: FormData) {
    setSubmitError(null);
    if (isEdit && edit) {
      update(
        { id: edit, title: data.title, startDate: data.startDate, endDate: data.endDate },
        {
          onSuccess: () => router.back(),
          onError: (e) => setSubmitError((e as Error).message),
        },
      );
    } else {
      create(
        { title: data.title, startDate: data.startDate, endDate: data.endDate },
        {
          onSuccess: (itinerary) => router.replace(`/itinerary/${itinerary.id}` as never),
          onError: (e) => setSubmitError((e as Error).message),
        },
      );
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: isEdit ? 'Edit Itinerary' : 'New Itinerary' }} />
      <View style={{ flex: 1, backgroundColor: '#f8fafc', padding: 16, gap: 16 }}>
        <Field label="Title" error={errors.title?.message}>
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder="e.g. Ho Chi Minh City Trip"
                style={inputStyle}
              />
            )}
          />
        </Field>

        <Field label="Start date" error={errors.startDate?.message}>
          <Controller
            control={control}
            name="startDate"
            render={({ field }) => (
              <DatePicker value={field.value} onChange={field.onChange} />
            )}
          />
        </Field>

        <Field label="End date" error={errors.endDate?.message}>
          <Controller
            control={control}
            name="endDate"
            render={({ field }) => (
              <DatePicker value={field.value} onChange={field.onChange} />
            )}
          />
        </Field>

        {submitError ? (
          <Text style={{ fontSize: 13, color: '#e11d48', textAlign: 'center' }}>{submitError}</Text>
        ) : null}

        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
          style={{
            backgroundColor: isPending ? '#93c5fd' : '#2563eb',
            borderRadius: 8,
            padding: 14,
            alignItems: 'center',
            marginTop: 8,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>
            {isPending ? '...' : isEdit ? 'Save Changes' : 'Create Itinerary'}
          </Text>
        </Pressable>
      </View>
    </>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: '#334155' }}>{label}</Text>
      {children}
      {error ? <Text style={{ fontSize: 12, color: '#e11d48' }}>{error}</Text> : null}
    </View>
  );
}

function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  if (Platform.OS === 'web') {
    return (
      // @ts-ignore — web-only HTML element
      <input
        type="date"
        value={value}
        onChange={(e: { target: { value: string } }) => onChange(e.target.value)}
        style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          paddingLeft: 12,
          paddingRight: 12,
          paddingTop: 10,
          paddingBottom: 10,
          fontSize: 14,
          color: value ? '#0f172a' : '#94a3b8',
          width: '100%',
          outline: 'none',
          cursor: 'pointer',
          boxSizing: 'border-box',
        }}
      />
    );
  }
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder="YYYY-MM-DD"
      style={inputStyle}
    />
  );
}

const inputStyle = {
  backgroundColor: 'white',
  borderWidth: 1,
  borderColor: '#e2e8f0',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 14,
  color: '#0f172a',
} as const;
