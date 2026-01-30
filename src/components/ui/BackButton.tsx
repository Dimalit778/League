import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useIsRTL } from '@/providers/LanguageProvider';
import { ArrowLeftIcon, ArrowRightIcon } from '@assets/icons';
import { useRouter } from 'expo-router';
import { Platform, Pressable, View } from 'react-native';
import { CText } from './CText';

interface BackButtonProps {
  title?: string;
  textColor?: 'text-text' | 'text-primary' | 'text-secondary';
  includeSafeArea?: boolean;
}

export const BackButton = ({ title, textColor = 'text-text' }: BackButtonProps) => {
  const { colors } = useThemeTokens();
  const router = useRouter();
  const isRTL = useIsRTL();
  const ArrowIcon = isRTL ? ArrowRightIcon : ArrowLeftIcon;

  const headerHeight = Platform.OS === 'ios' ? 44 : 56;
  const isWeb = Platform.OS === 'web';
  if (isWeb) {
    return null;
  }

  return (
    <View style={{ height: headerHeight, justifyContent: 'center', width: '100%' }}>
      <Pressable
        style={{
          position: 'absolute',
          left: -10,
          zIndex: 1000,
          height: '100%',
          width: 60,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={() => router.back()}
      >
        <ArrowIcon color={colors.text} size={28} />
      </Pressable>

      {title && (
        <CText variant="body" bold style={{ textAlign: 'center' }} className={`${textColor}`}>
          {title}
        </CText>
      )}
    </View>
  );
};
