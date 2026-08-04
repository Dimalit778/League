import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useIsRTL } from '@/providers/LanguageProvider';
import { View } from 'react-native';
import { computeTieBracketGeometry } from './tieBracketGeometry';

type Props = {
  cardHeight: number;
  cardsGap: number;
  /** Distance from card outer edge to the list/screen edge on the exit side */
  railWidth: number;
};

export function TieBracketConnector({ cardHeight, cardsGap, railWidth }: Props) {
  const isRTL = useIsRTL();
  const { colors } = useThemeTokens();
  const geometry = computeTieBracketGeometry({ isRTL, cardHeight, cardsGap });
  const usableWidth = Math.max(0, railWidth - geometry.gapFromCard);

  if (usableWidth <= 0) return null;

  const stubWidth = Math.min(geometry.stubLength, usableWidth);
  const spineCenterX = geometry.gapFromCard + stubWidth;
  const exitWidth = Math.max(0, railWidth - spineCenterX);
  const spineHeight = geometry.bottomStubCenterY - geometry.topStubCenterY;
  const bar = (style: object) => ({
    position: 'absolute' as const,
    backgroundColor: colors.border,
    ...style,
  });
  const containerSide = geometry.side === 'right' ? { right: 0 } : { left: 0 };
  const stubSide =
    geometry.side === 'right'
      ? { left: geometry.gapFromCard }
      : { right: geometry.gapFromCard };
  const spineSide =
    geometry.side === 'right'
      ? { left: spineCenterX - geometry.strokeWidth / 2 }
      : { right: spineCenterX - geometry.strokeWidth / 2 };
  const exitSide = geometry.side === 'right' ? { right: 0 } : { left: 0 };

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
        containerSide,
      ]}
    >
      <View
        style={bar({
          top: geometry.topStubCenterY - geometry.strokeWidth / 2,
          height: geometry.strokeWidth,
          width: stubWidth,
          ...stubSide,
        })}
      />
      <View
        style={bar({
          top: geometry.bottomStubCenterY - geometry.strokeWidth / 2,
          height: geometry.strokeWidth,
          width: stubWidth,
          ...stubSide,
        })}
      />
      <View
        style={bar({
          top: geometry.topStubCenterY,
          height: spineHeight,
          width: geometry.strokeWidth,
          ...spineSide,
        })}
      />
      {exitWidth > 0 ? (
        <View
          style={bar({
            top: geometry.mergeY - geometry.strokeWidth / 2,
            height: geometry.strokeWidth,
            width: exitWidth,
            ...exitSide,
          })}
        />
      ) : null}
    </View>
  );
}
