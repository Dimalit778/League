import stadiumBg from '@assets/images/fieldImage.jpg';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { View } from 'react-native';

export function HeaderSection({ children }: { children: ReactNode }) {
  return (
    <View className="mx-3 mt-1 rounded-2xl border border-border ">
      <LinearGradient
        colors={['#0B1B33', '#081325']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 18,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOpacity: 0.35,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        }}
      >
        <ExpoImage
          source={stadiumBg}
          contentFit="cover"
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.22 }}
        />
        <LinearGradient
          colors={['rgba(6,12,24,0.3)', 'rgba(6,12,24,0.55)', 'rgba(6,12,24,0.75)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
        />
        {children}
      </LinearGradient>
    </View>
  );
}
