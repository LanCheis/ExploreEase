import { Text, View } from 'react-native';

export default function MapScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ textAlign: 'center', color: '#64748b', fontSize: 16, lineHeight: 26 }}>
        {'Map view is available on the mobile app.\nUse the Discover tab to browse places on web.'}
      </Text>
    </View>
  );
}
