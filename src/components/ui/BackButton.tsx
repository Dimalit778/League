import { useThemeTokens } from '@/features/settings/hooks/useThemeTokens';
import { ArrowLeftIcon } from '@assets/icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

interface BackButtonProps {
  title?: string;
  textColor?: 'text-text' | 'text-primary' | 'text-secondary';
}

const BackButton = ({ title, textColor = 'text-text' }: BackButtonProps) => {
  const { colors } = useThemeTokens();
  const router = useRouter();

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
        <ArrowLeftIcon color={colors.text} size={28} />
      </TouchableOpacity>

      {title && <Text className={`${textColor} text-xl text-center font-nunito`}>{title}</Text>}
    </View>
  );
};

export default BackButton;
