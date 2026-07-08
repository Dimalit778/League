import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';
import { Text } from './Text';

type Props = {
  visible: boolean;
};

export const UpgardeBadge = ({ visible }: Props) => {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 z-10 overflow-hidden rounded-xl" pointerEvents="none">
      {Platform.OS === 'ios' ? <BlurView intensity={5} tint="dark" style={StyleSheet.absoluteFillObject} /> : null}
      <View
        className="absolute inset-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: Platform.OS === 'ios' ? 'rgba(0, 0, 0, 0.28)' : 'rgba(0, 0, 0, 0.52)' }}
      >
        <View
          className="items-center rounded-2xl border px-5 py-3"
          style={{
            borderColor: 'rgba(250, 204, 21, 0.55)',
            backgroundColor: 'rgba(250, 204, 21, 0.12)',
          }}
        >
          <Text variant="body" bold className=" uppercase tracking-widest text-yellow-400">
            PRO
          </Text>
        </View>
      </View>
    </View>
  );
};
