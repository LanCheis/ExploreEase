import { Pressable, Text, View } from 'react-native';

import type { PlaceCategory } from '@/types/place';

const TABS: { value: PlaceCategory; label: string }[] = [
  { value: 'attraction', label: 'Attractions' },
  { value: 'cuisine', label: 'Cuisines' },
  { value: 'activity', label: 'Activities' },
];

export function CategoryTabs({
  value,
  onChange,
}: {
  value: PlaceCategory;
  onChange: (next: PlaceCategory) => void;
}) {
  return (
    <View className="flex-row gap-2">
      {TABS.map((tab) => {
        const active = tab.value === value;
        return (
          <Pressable
            key={tab.value}
            onPress={() => onChange(tab.value)}
            className={`flex-1 items-center rounded-xl px-3 py-2 ${
              active ? 'bg-blue-600' : 'border border-slate-200 bg-white'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                active ? 'text-white' : 'text-slate-700'
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
