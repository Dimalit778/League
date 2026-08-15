import { BackButton, Brand } from '@/components';
import { View } from 'react-native';

type HeaderProps = {
  fallbackHref?: string;
  showBack?: boolean;
};

export function Header({ fallbackHref, showBack = true }: HeaderProps) {
  return (
    <View className="h-12 w-full justify-center bg-transparent">
      {showBack ? (
        <View className="absolute start-0 z-10">
          <BackButton fallbackHref={fallbackHref} variant="onImage" />
        </View>
      ) : null}
      <View className="items-center px-14" pointerEvents="none">
        <Brand size="md" onBoarding />
      </View>
    </View>
  );
}
