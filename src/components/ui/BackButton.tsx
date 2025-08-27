import { useThemeStore } from '@/store/ThemeStore';
import { useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { ArrowLeftIcon } from '../../../assets/icons';

const BackButton = () => {
  const { theme } = useThemeStore();
  const router = useRouter();
  return (
    <View className="flex-row justify-start">
      <TouchableOpacity className=" ps-4 my-3" onPress={() => router.back()}>
        <ArrowLeftIcon color={theme} size={30} />
      </TouchableOpacity>
    </View>
  );
};

export default BackButton;
