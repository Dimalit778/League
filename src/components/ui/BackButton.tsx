import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeftIcon } from '../../../assets/icons';

interface BackButtonProps {
  title?: string;
}

const BackButton = ({ title }: BackButtonProps) => {
  const { colors } = useThemeTokens();
  const router = useRouter();

  return (
    <View className="flex-row h-14 items-center justify-center py-3  relative w-full border-b border-border">
      <TouchableOpacity
        className="absolute left-4 z-10"
        onPress={() => router.back()}
      >
        <ArrowLeftIcon color={colors.text} size={28} />
      </TouchableOpacity>

      {title && (
        <Text className="text-text text-lg text-center flex-1 px-16">
          {title}
        </Text>
      )}
    </View>
  );
};

export default BackButton;
