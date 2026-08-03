import { Teko_400Regular } from '@expo-google-fonts/teko/400Regular';
import { Teko_700Bold } from '@expo-google-fonts/teko/700Bold';
import { useFonts } from 'expo-font';

export const useAppFonts = () => {
  const [loaded] = useFonts({
    Teko_400Regular,
    Teko_700Bold,
  });

  return loaded;
};
