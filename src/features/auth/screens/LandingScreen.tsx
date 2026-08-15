import { images } from '@/assets/images';
import { Brand, Button, Row, Screen, Text } from '@/components';
import AuthLegalLinks from '@/features/auth/components/AuthLegalLinks';
import { useTranslation } from '@/hooks/useTranslation';
import { ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Trophy } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

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
        colors={['rgba(1,8,20,0.28)', 'rgba(2,10,22,0.72)', 'rgba(2,8,18,0.98)']}
        locations={[0, 0.5, 1]}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />

      <Screen width="full" padding="none" edges={['top', 'bottom']} className="bg-transparent">
        <View className="min-h-0 flex-1 px-5 pb-5 pt-4 sm:px-8">
          <View className="mx-auto w-full max-w-[520px] flex-1">
            <Brand size="lg" onBoarding />

            <View className="flex-1 items-center justify-center py-8">
              <View className="mb-7 size-20 items-center justify-center rounded-[26px] border border-[#FFD36B]/55 bg-[#0B213B]/90 shadow-lg shadow-[#FFB31A]/30">
                <Trophy size={42} color="#FFB31A" strokeWidth={1.7} />
              </View>

              <Text
                accessibilityRole="header"
                className="text-center font-teko-bold text-[44px] leading-[48px] text-white sm:text-[52px] sm:leading-[56px]"
                maxFontSizeMultiplier={1.3}
              >
                {t('Every match is a challenge')}
              </Text>
              <Text
                className="mt-3 max-w-[390px] text-center text-base leading-6 text-[#B6C0D2]"
                maxFontSizeMultiplier={1.4}
              >
                {t('Predict scores, compete with friends, and climb the table.')}
              </Text>

              <View className="mt-6 rounded-full border border-white/10 bg-[#07172A]/80 px-5 py-2.5">
                <Text className="text-center text-sm font-semibold tracking-wide text-[#FFCB5B]">
                  {t('Predict. Compete. Win.')}
                </Text>
              </View>
            </View>

            <View className="gap-3 rounded-[24px] border border-white/10 bg-[#07172A]/92 p-4 shadow-2xl shadow-black/40">
              <Link href="/(auth)/signUp" asChild>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  accessibilityLabel={t('Get Started')}
                  accessibilityHint={t('Create your Champo account')}
                  className="rounded-2xl"
                  label={t('Get Started')}
                />
              </Link>

              <Row className="flex-wrap justify-center gap-1">
                <Text className="text-center text-sm text-[#AAB4C6]">{t('Already have an account?')}</Text>
                <Link href="/(auth)/signIn" asChild>
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel={t('Sign In')}
                    hitSlop={8}
                    className="min-h-11 justify-center rounded-lg px-1 active:opacity-70"
                  >
                    <Text className="text-center text-sm font-bold text-[#83A7FF]">{t('Sign In')}</Text>
                  </Pressable>
                </Link>
              </Row>
            </View>

            <View className="mt-4">
              <AuthLegalLinks />
            </View>
          </View>
        </View>
      </Screen>
    </View>
  );
}
