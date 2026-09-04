import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '../ui/BackButton';
import { Text } from '../ui/Text';

type NavigationHeaderProps = {
  title: string;
  fallbackHref?: string;
};

export function NavigationHeader({ title, fallbackHref }: NavigationHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="w-full bg-background px-4 pb-2" style={{ paddingTop: insets.top }}>
      <View className="h-12 w-full flex-row items-center ">
        <BackButton fallbackHref={fallbackHref} />
        <View className="absolute inset-0 items-center justify-center px-14" style={{ pointerEvents: 'none' }}>
          <Text accessibilityRole="header" variant="title" numberOfLines={1} className="text-center">
            {title}
          </Text>
        </View>
      </View>
    </View>
  );
}
