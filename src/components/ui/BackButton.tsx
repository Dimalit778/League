import { useThemeStore } from '@/store/ThemeStore';
import { useRouter } from 'expo-router';
import { SafeAreaView, TouchableOpacity } from 'react-native';
import { ArrowLeftIcon } from '../../../assets/icons';

export const BackButton = () => {
  const { theme } = useThemeStore();
  const router = useRouter();
  return (
    <SafeAreaView className="bg-background">
      <TouchableOpacity className="p-2 px-4" onPress={() => router.back()}>
        <ArrowLeftIcon color={theme} size={28} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};
