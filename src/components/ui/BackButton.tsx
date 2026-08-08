import { useTranslation } from '@/hooks/useTranslation';
import { useIsRTL } from '@/providers/LanguageProvider';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Platform, Pressable } from 'react-native';

interface BackButtonProps {
  title?: string;
  textColor?: 'text-text' | 'text-primary' | 'text-info';
  includeSafeArea?: boolean;
  fallbackHref?: string;
}

export const BackButton = ({ fallbackHref }: BackButtonProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const isRTL = useIsRTL();

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
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('Back')}
      hitSlop={8}
      onPress={onPress}
      className="absolute top-0 z-[1000] size-12 items-center justify-center rounded-full border border-white/20 bg-[#061326]/70 active:opacity-70"
      style={{
        [isRTL ? 'left' : 'right']: 10,
        transform: [{ scaleX: isRTL ? -1 : 1 }],
      }}
    >
      <ChevronLeft size={26} color="#F8FAFC" strokeWidth={2} />
    </Pressable>
  );
};
