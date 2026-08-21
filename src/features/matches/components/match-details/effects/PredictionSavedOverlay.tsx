import { animations } from '@/assets/animations';
import { DotLottie } from '@lottiefiles/dotlottie-react-native';
import { View } from 'react-native';

export function PredictionSavedOverlay({ visible, onComplete }: { visible: boolean; onComplete: () => void }) {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 z-50 items-center justify-center bg-black/45" pointerEvents="none">
      <DotLottie
        source={animations.ball}
        autoplay
        loop={false}
        onComplete={onComplete}
        style={{ width: 300, height: 300 }}
      />
    </View>
  );
}
