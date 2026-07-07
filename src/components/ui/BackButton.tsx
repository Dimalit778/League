import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useIsRTL } from '@/providers/LanguageProvider';
import { useRouter } from 'expo-router';
import { CircleArrowLeftIcon, CircleArrowRightIcon } from 'lucide-react-native';
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

  const CircleArrowIcon = isRTL ? CircleArrowRightIcon : CircleArrowLeftIcon;

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
          left: 5,
          zIndex: 1000,
          height: '100%',
          width: 60,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={() => router.back()}
      >
        <CircleArrowIcon color={colors.text} size={40} strokeWidth={1} />
      </Pressable>

      {title && <CText className={`text-xl  text-text text-center`}>{title}</CText>}
    </View>
  );
};
