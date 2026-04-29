import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ComponentProps, forwardRef } from 'react';
import { TextInput, View } from 'react-native';

type IconName = ComponentProps<typeof FontAwesome>['name'];

interface InputFieldProps extends ComponentProps<typeof TextInput> {
  icon?: IconName;
}

export const InputField = forwardRef<TextInput, InputFieldProps>(
  ({ icon, ...props }, ref) => (
    <View className="h-12 flex-row items-center rounded-lg border border-slate-300 bg-white px-3">
      {icon && <FontAwesome name={icon} size={16} color="#94a3b8" />}
      <TextInput
        ref={ref}
        placeholderTextColor="#94a3b8"
        {...props}
        // @ts-expect-error className passthrough is supported by NativeWind on TextInput
        className={`flex-1 text-base text-slate-900 ${icon ? 'ml-3' : ''}`}
      />
    </View>
  ),
);

InputField.displayName = 'InputField';
