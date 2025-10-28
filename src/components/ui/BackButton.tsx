import { useThemeTokens } from '@/hooks/useThemeTokens';
import { ArrowLeftIcon } from '@assets/icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

interface BackButtonProps {
  title?: string;
  className?: string;
}

const BackButton = ({ title, className }: BackButtonProps) => {
  const { colors } = useThemeTokens();
  const router = useRouter();

  return (
    <View
      className={` flex-row h-14 items-center justify-center py-3  relative w-full${className}`}
    >
      <TouchableOpacity
        className="absolute left-4 z-10"
        onPress={() => router.back()}
      >
        <ArrowLeftIcon color="#fff" size={28} />
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
