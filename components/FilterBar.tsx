import { Pressable, ScrollView, Text, View } from 'react-native';

import { useEffectiveLocation, useLocationStore } from '@/hooks/useLocation';

export interface FilterState {
  sort: 'relevance' | 'top-rated' | 'a-z' | 'nearby';
  maxPriceLevel: number | undefined;
  minRating: number | undefined;
}

export const DEFAULT_FILTERS: FilterState = {
  sort: 'relevance',
  maxPriceLevel: undefined,
  minRating: undefined,
};

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full border px-3 py-1 ${
        active ? 'border-blue-600 bg-blue-600' : 'border-slate-200 bg-white'
      }`}
    >
      <Text
        className={`text-xs font-medium ${active ? 'text-white' : 'text-slate-600'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface Props {
  value: FilterState;
  onChange: (f: FilterState) => void;
}

export function FilterBar({ value, onChange }: Props) {
  const effectiveLocation = useEffectiveLocation();
  const requestLocation = useLocationStore((s) => s.requestLocation);

  const hasFilters =
    value.sort !== 'relevance' ||
    value.maxPriceLevel !== undefined ||
    value.minRating !== undefined;

  return (
    <View style={{ gap: 4 }}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 6, alignItems: 'center', paddingRight: 16 }}
    >
      <Text className="text-xs font-semibold text-slate-400">Sort</Text>
      {(['relevance', 'top-rated', 'a-z', 'nearby'] as const).map((s) => (
        <Chip
          key={s}
          label={
            s === 'a-z'
              ? 'A–Z'
              : s === 'top-rated'
              ? 'Top rated'
              : s === 'nearby'
              ? 'Nearby'
              : 'Relevance'
          }
          active={value.sort === s}
          onPress={() => onChange({ ...value, sort: s })}
        />
      ))}

      <View className="mx-1 w-px self-stretch bg-slate-200" />

      <Text className="text-xs font-semibold text-slate-400">Price</Text>
      {([1, 2, 3, 4] as const).map((p) => (
        <Chip
          key={p}
          label={'$'.repeat(p)}
          active={value.maxPriceLevel === p}
          onPress={() =>
            onChange({ ...value, maxPriceLevel: value.maxPriceLevel === p ? undefined : p })
          }
        />
      ))}

      <View className="mx-1 w-px self-stretch bg-slate-200" />

      <Text className="text-xs font-semibold text-slate-400">Rating</Text>
      {([1, 2, 3, 4, 5] as const).map((r) => (
        <Chip
          key={r}
          label={`${r}+`}
          active={value.minRating === r}
          onPress={() =>
            onChange({ ...value, minRating: value.minRating === r ? undefined : r })
          }
        />
      ))}

      {hasFilters && (
        <>
          <View className="mx-1 w-px self-stretch bg-slate-200" />
          <Pressable
            onPress={() => onChange(DEFAULT_FILTERS)}
            className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1"
          >
            <Text className="text-xs font-medium text-rose-600">Reset</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
    {value.sort === 'nearby' && !effectiveLocation ? (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 4,
          paddingTop: 2,
        }}
      >
        <Text style={{ fontSize: 12, color: '#64748b', flex: 1 }}>
          Enable location to sort by distance
        </Text>
        <Pressable
          onPress={requestLocation}
          style={{
            borderRadius: 6,
            backgroundColor: '#eff6ff',
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text style={{ fontSize: 12, color: '#2563eb', fontWeight: '600' }}>
            Request location
          </Text>
        </Pressable>
      </View>
    ) : null}
    </View>
  );
}
