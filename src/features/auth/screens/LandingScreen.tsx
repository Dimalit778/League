import { images } from '@/assets/images';
import { Screen } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { ImageBackground } from 'expo-image';
import { Link } from 'expo-router';
import { View } from 'react-native';

export default function LandingScreen() {
  const { t } = useTranslation();
  return (
    <>
      <ImageBackground
        source={images.bgWelcome}
        style={{ flex: 1, width: '100%', height: '100%', position: 'absolute' }}
        contentFit="cover"
      />
      <Screen
        width="compact"
        padding="horizontal"
        edges={['top', 'bottom']}
        className="bg-transparent"
        contentClassName="bg-transparent"
      >
        <View className="flex-1 justify-center py-4">
          <View className="min-h-[350px] items-center justify-center">
            <View className="mt-2 rounded-2xl border border-primary px-3 py-1 ">
              <Text tone="primary" className="text-[72px] font-bold font-teko-bold uppercase leading-1">
                Champo
              </Text>
            </View>

            <Text variant="subtitle" className="w-full pt-3 text-center">
              {t('Predict. Compete. Win.')}
            </Text>
          </View>

          <View className={cn('mt-auto', spacing.stack)}>
            <Link href="/(auth)/signIn" asChild>
              <Button variant="primary" size="lg" label={t('Get Started')} fullWidth />
            </Link>
          </View>
        </View>
      </Screen>
    </>
  );
}
