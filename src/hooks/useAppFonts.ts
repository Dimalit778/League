import { Manrope_400Regular } from "@expo-google-fonts/manrope/400Regular";
import { Manrope_500Medium } from "@expo-google-fonts/manrope/500Medium";
import { Manrope_600SemiBold } from "@expo-google-fonts/manrope/600SemiBold";
import { Manrope_700Bold } from "@expo-google-fonts/manrope/700Bold";

import { Oswald_400Regular } from "@expo-google-fonts/oswald/400Regular";
import { Oswald_700Bold } from "@expo-google-fonts/oswald/700Bold";

import { useFonts } from "expo-font";

export const useAppFonts = () => {
  const [loaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,

    Oswald_400Regular,
    Oswald_700Bold,
  });

  return loaded;
};
