import { images } from "@/assets/images";
import { Brand, Button, Row, Screen, Text } from "@/components";
import AuthLegalLinks from "@/features/auth/components/AuthLegalLinks";
import { useTranslation } from "@/hooks/useTranslation";
import { container } from "@/lib/nativewind/layout";
import { cn } from "@/lib/nativewind/nativeWind";
import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

export default function LandingScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-[#020A16]">
      <ImageBackground
        source={images.bgWelcome}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="center"
        accessibilityIgnoresInvertColors
      />
      <LinearGradient
        colors={[
          "rgba(1,8,20,0.28)",
          "rgba(2,10,22,0.72)",
          "rgba(2,8,18,0.98)",
        ]}
        locations={[0, 0.5, 1]}
        style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}
      />

      <Screen
        width="full"
        padding="horizontal"
        edges={["top", "bottom"]}
        className="bg-transparent"
      >
        <View className={cn(container.content, "flex-1 justify-between")}>
          <View className="h-1/2 items-center justify-center gap-4 ">
            <Brand size="lg" onBoarding />
            <Text
              accessibilityRole="header"
              className="text-center font-manrope-bold text-3xl pt-8"
              maxFontSizeMultiplier={1.3}
            >
              {t("Every match is a challenge")}
            </Text>

            <View className=" rounded-full border border-white/10 bg-[#07172A]/80 px-5 py-2.5">
              <Text className="text-center font-semibold tracking-wide text-[#FFCB5B]">
                {t("Predict. Compete. Win.")}
              </Text>
            </View>
          </View>
          <View className="gap-8">
            <View className="gap-3 rounded-[24px] border border-white/10 bg-[#07172A]/92 p-4 shadow-2xl shadow-black/40">
              <Link href="/(auth)/signUp" asChild>
                <Button
                  intent="primary"
                  size="lg"
                  fullWidth
                  accessibilityLabel={t("Get Started")}
                  accessibilityHint={t("Create your Champo account")}
                  className="rounded-2xl"
                  label={t("Get Started")}
                />
              </Link>

              <Row className="px-5 justify-center gap-1">
                <Text variant="body" size="sm" className="text-center  text-[#AAB4C6]">
                  {t("Already have an account?")}
                </Text>
                <Link href="/(auth)/signIn" asChild>
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel={t("Sign In")}
                    hitSlop={8}
                    className="min-h-11 justify-center rounded-lg px-1 active:opacity-70"
                  >
                    <Text
                      variant="body" size="sm"
                      className="text-center font-bold text-[#83A7FF]"
                    >
                      {t("Sign In")}
                    </Text>
                  </Pressable>
                </Link>
              </Row>
            </View>

            <AuthLegalLinks />
          </View>
        </View>
      </Screen>
    </View>
  );
}
