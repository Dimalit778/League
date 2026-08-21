import { Oswald_400Regular } from '@expo-google-fonts/oswald/400Regular';
import { Oswald_700Bold } from '@expo-google-fonts/oswald/700Bold';
import { useFonts } from 'expo-font';

export const useAppFonts = () => {
  const [loaded] = useFonts({
    Oswald_400Regular,
    Oswald_700Bold,
  });

  return loaded;
};
