import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { ArrowIcon } from './ArrowIcon';

interface BackButtonProps {
  fallbackHref?: string;
  onPress?: () => void;
  variant?: 'default' | 'onImage';
}

const SIZE = 40;

export const BackButton = ({ fallbackHref, onPress, variant = 'default' }: BackButtonProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useThemeTokens();
  const isOnImage = variant === 'onImage';

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (fallbackHref) {
      router.replace(fallbackHref as never);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('Back')}
      hitSlop={8}
      onPress={handlePress}
      className={`z-10 pe-1 items-center justify-center rounded-full border active:opacity-70  ${
        isOnImage ? 'border-white/20 bg-[#061326]/70' : 'border-border bg-subtle'
      }`}
      style={{ width: SIZE, height: SIZE }}
    >
      <ArrowIcon size={30} color={isOnImage ? '#FFFFFF' : colors.text} strokeWidth={2} />
    </Pressable>
  );
};
