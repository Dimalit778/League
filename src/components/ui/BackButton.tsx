import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'expo-router';
import { Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowIcon } from './ArrowIcon';
import { Text } from './Text';

interface BackButtonProps {
  title?: string;
  textColor?: 'text-text' | 'text-primary' | 'text-info';
  includeSafeArea?: boolean;
  fallbackHref?: string;
}

const SIZE = 44;

export const BackButton = ({ fallbackHref, title, includeSafeArea = true }: BackButtonProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useThemeTokens();
  if (Platform.OS === 'web') return null;

  const onPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (fallbackHref) {
      router.replace(fallbackHref as never);
    }
  };

  return (
    <View style={{ paddingTop: includeSafeArea ? insets.top : 0 }} className="w-full px-2.5">
      <View className="h-12 w-full flex-row items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('Back')}
          hitSlop={8}
          onPress={onPress}
          className="z-10 items-center justify-center rounded-full border border-white/20 bg-[#061326]/70 active:opacity-70"
          style={{
            width: SIZE,
            height: SIZE,
          }}
        >
          <ArrowIcon size={30} color={colors.text} strokeWidth={2} />
        </Pressable>

        {title ? (
          <View className="absolute inset-0 items-center justify-center px-14" pointerEvents="none">
            <Text variant="title" numberOfLines={1} className="text-center">
              {title}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};
