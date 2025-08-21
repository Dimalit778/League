import { useThemeStore } from '@/store/ThemeStore';
import { useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { ArrowLeftIcon } from '../../../assets/icons';

export const BackButton = () => {
  const { theme } = useThemeStore();
  const router = useRouter();
  return (
    <View className="bg-background p-2 px-4">
      <TouchableOpacity onPress={() => router.back()}>
        <ArrowLeftIcon color={theme} size={28} />
      </TouchableOpacity>
    </View>
  );
};
