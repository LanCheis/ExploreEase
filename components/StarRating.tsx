import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, View } from 'react-native';

interface Props {
  value: number;
  interactive?: boolean;
  onChange?: (v: number) => void;
  size?: number;
}

export function StarRating({ value, interactive = false, onChange, size = 20 }: Props) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          onPress={interactive && onChange ? () => onChange(star) : undefined}
          disabled={!interactive}
          hitSlop={4}
        >
          <FontAwesome
            name={star <= value ? 'star' : 'star-o'}
            size={size}
            color={star <= value ? '#f59e0b' : '#cbd5e1'}
          />
        </Pressable>
      ))}
    </View>
  );
}
