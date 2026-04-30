import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search places…' }: Props) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; });

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChangeRef.current(local), 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [local]);

  return (
    <View className="flex-row items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
      <FontAwesome name="search" size={14} color="#94a3b8" />
      <TextInput
        value={local}
        onChangeText={setLocal}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        className="flex-1 text-sm text-slate-900"
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
    </View>
  );
}
