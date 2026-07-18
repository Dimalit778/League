import { View } from 'react-native';

const LINE = 2;
const STUB = 12;
const STRIP_WIDTH = 28;

type BracketConnectorProps = {
  height: number;
  topCenterY: number;
  bottomCenterY: number;
  isRTL?: boolean;
};

export function BracketConnector({ height, topCenterY, bottomCenterY, isRTL = false }: BracketConnectorProps) {
  const mergeX = STUB;
  const midY = (topCenterY + bottomCenterY) / 2;
  const verticalTop = Math.min(topCenterY, bottomCenterY);
  const verticalHeight = Math.abs(bottomCenterY - topCenterY);

  return (
    <View
      style={{
        width: STRIP_WIDTH,
        height,
        transform: isRTL ? [{ scaleX: -1 }] : undefined,
      }}
    >
      <View
        className="absolute bg-border"
        style={{ left: 0, top: topCenterY - LINE / 2, width: STUB, height: LINE }}
      />
      <View
        className="absolute bg-border"
        style={{ left: 0, top: bottomCenterY - LINE / 2, width: STUB, height: LINE }}
      />
      <View
        className="absolute bg-border"
        style={{
          left: mergeX - LINE / 2,
          top: verticalTop,
          width: LINE,
          height: verticalHeight,
        }}
      />
      <View
        className="absolute bg-border"
        style={{
          left: mergeX,
          top: midY - LINE / 2,
          width: STRIP_WIDTH - mergeX,
          height: LINE,
        }}
      />
    </View>
  );
}
