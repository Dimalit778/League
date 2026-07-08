import { Teko_400Regular, Teko_700Bold } from '@expo-google-fonts/teko';
import { useFonts } from 'expo-font';

export const useAppFonts = () => {
  const [loaded] = useFonts({
    Teko_400Regular,
    Teko_700Bold,
  });

  return loaded;
};
