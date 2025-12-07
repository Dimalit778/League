import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useIsRTL } from '@/providers/LanguageProvider';
import { ArrowLeftIcon, ArrowRightIcon } from '@assets/icons';
import { useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { CText } from './CText';

interface BackButtonProps {
  title?: string;
  textColor?: 'text-text' | 'text-primary' | 'text-secondary';
}

const BackButton = ({ title, textColor = 'text-text' }: BackButtonProps) => {
  const { colors } = useThemeTokens();
  const router = useRouter();
  const isRTL = useIsRTL();
  const ArrowIcon = isRTL ? ArrowRightIcon : ArrowLeftIcon;

  return (
    <View className=" flex-row h-14 items-center justify-center py-3  relative w-full">
      <TouchableOpacity
        className="absolute left-4 z-10"
        onPress={() => router.back()}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={title ? `Go back from ${title}` : 'Go back'}
        accessibilityHint="Double tap to navigate to the previous screen"
      >
        <ArrowIcon color={colors.text} size={28} />
      </TouchableOpacity>

      {title && <CText className={`${textColor} text-xl text-center font-nunito`}>{title}</CText>}
    </View>
  );
};

export default BackButton;
