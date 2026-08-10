import { images } from '@/assets/images';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useTranslation } from '@/hooks/useTranslation';
import NetInfo from '@react-native-community/netinfo';
import { ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { WifiOff } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Full-screen block shown whenever the device has no network — replaces the app Stack so nothing underneath can attempt (and fail) to fetch. */
export function OfflineScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [isChecking, setIsChecking] = useState(false);

  const handleRetry = async () => {
    setIsChecking(true);
    try {
      await NetInfo.refresh();
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <View className="flex-1 bg-[#030B18]">
      <ImageBackground
        source={images.stadium}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="center"
        accessibilityIgnoresInvertColors
      />
      <LinearGradient
        colors={['rgba(1,8,20,0.55)', 'rgba(1,9,22,0.82)', 'rgba(2,8,18,0.97)']}
        locations={[0, 0.5, 1]}
        style={[StyleSheet.absoluteFill, styles.nonInteractive]}
      />

      <View
        className="flex-1 items-center justify-center px-8"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <View className="h-20 w-20 items-center justify-center rounded-3xl border border-white/15 bg-white/5">
          <WifiOff size={36} color="#FFB31A" strokeWidth={1.75} />
        </View>

        <Text className="mt-6 text-center font-teko-bold text-[32px] leading-[36px] text-white">
          {t("You're offline")}
        </Text>

        <Text className="mt-3 max-w-[320px] text-center text-[15px] leading-[21px] text-[#B6C0D2]">
          {t(
            'Champo needs an internet connection to load matches, predictions, and leaderboards. Check your connection and try again.',
          )}
        </Text>

        <Button
          variant="primary"
          size="lg"
          loading={isChecking}
          onPress={handleRetry}
          className="mt-8 min-w-[180px] rounded-2xl border border-[#FFD566] bg-[#FFB31A]"
        >
          <Text className="text-center text-lg font-black text-[#081322]">
            {isChecking ? t('Checking...') : t('Try Again')}
          </Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nonInteractive: { pointerEvents: 'none' },
});
