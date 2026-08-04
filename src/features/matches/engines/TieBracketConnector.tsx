import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useIsRTL } from '@/providers/LanguageProvider';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { buildTieBracketPath, computeTieBracketGeometry } from './tieBracketGeometry';

type Props = {
  cardHeight: number;
  railWidth: number;
};

export function TieBracketConnector({ cardHeight, railWidth }: Props) {
  const isRTL = useIsRTL();
  const { colors } = useThemeTokens();
  const geometry = computeTieBracketGeometry({ isRTL, cardHeight });

  if (railWidth <= geometry.gapFromCard + 8) return null;

  const d = buildTieBracketPath(geometry, railWidth);
  const sideStyle = geometry.side === 'right' ? { right: 0 } : { left: 0 };

  return (
    <View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: 0,
          width: railWidth,
          height: geometry.totalHeight,
        },
        sideStyle,
      ]}
    >
      <Svg width={railWidth} height={geometry.totalHeight}>
        <Path
          d={d}
          stroke={colors.border}
          strokeWidth={geometry.strokeWidth}
          strokeLinecap="square"
          strokeLinejoin="miter"
          fill="none"
        />
      </Svg>
    </View>
  );
}
