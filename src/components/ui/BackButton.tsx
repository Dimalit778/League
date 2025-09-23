import { useThemeStore } from '@/store/ThemeStore';
import { useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from '../../../assets/icons';

const BackButton = () => {
  const { theme } = useThemeStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top }} className="bg-background">
      <View className="flex-row justify-start">
        <TouchableOpacity className=" ps-4 my-3" onPress={() => router.back()}>
          <ArrowLeftIcon color={theme} size={30} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BackButton;
