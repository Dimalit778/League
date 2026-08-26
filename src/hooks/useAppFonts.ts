import { Nunito_400Regular } from '@expo-google-fonts/nunito/400Regular';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { Oswald_400Regular } from '@expo-google-fonts/oswald/400Regular';
import { Oswald_700Bold } from '@expo-google-fonts/oswald/700Bold';
import { useFonts } from 'expo-font';

export const useAppFonts = () => {
  const [loaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
    Oswald_400Regular,
    Oswald_700Bold,
  });

  return loaded;
};
