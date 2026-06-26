import { View } from 'react-native';
import { MyImage } from './MyImage';

type Src = string | number | { uri: string; headers?: Record<string, string> };

type TeamBadgeProps = {
  source: Src;
  width: number;
  height: number;
};

export const TeamBadge = ({ source, width, height }: TeamBadgeProps) => {
  const borderRadius = width / 2;

  return (
    <View
      className="overflow-hidden bg-white/10"
      style={{
        width,
        height,
        borderRadius,
      }}
    >
      <MyImage source={source} width="100%" height="100%" />
    </View>
  );
};
