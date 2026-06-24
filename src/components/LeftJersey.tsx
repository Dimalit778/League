import { TeamJerseyColors } from '@/utils/teamColors';
import { Canvas, Group, Image, Mask, Path, Rect, Text, useFont, useImage } from '@shopify/react-native-skia';

const jersey = require('@assets/short-jersey.png');
const oswaldFont = require('@assets/fonts/Oswald.ttf');

type LeftJerseyProps = {
  teamName: string;
  jerseyColors?: TeamJerseyColors;
  size?: number;
};

const defaultJerseyColors: TeamJerseyColors = {
  teamName: '',
  primaryColor: '#2563eb',
  secondaryColor: '#ffffff',
  thirdColor: '#111827',
  textColor: '#ffffff',
  pattern: 'solid',
  stripeCount: 5,
};

function getReadableTextColor(bg: string) {
  const hex = bg.replace('#', '');

  if (hex.length !== 6) return '#ffffff';

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 150 ? '#111827' : '#ffffff';
}

function normalizeTeamName(teamName: string) {
  return teamName
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, ' ');
}
const DEBUG_BODY_PATH = true;
function getBodyPath(size: number) {
  const left = size * 0.11;
  const right = size * 0.77;
  const shoulderY = size * 0.08;
  const bottom = size * 0.99;

  const neckStartLeftX = size * 0.02;
  const neckStartRightX = size * 0.71;
  const neckTopY = size * 0.105;
  const neckBottomY = size * 0.21;

  return `
    M ${left} ${shoulderY}
    L ${neckStartLeftX} ${neckTopY}
    C ${size * 0.43} ${size * 0.125},
      ${size * 0.455} ${size * 0.18},
      ${size * 0.5} ${neckBottomY}
    C ${size * 0.545} ${size * 0.18},
      ${size * 0.57} ${size * 0.125},
      ${neckStartRightX} ${neckTopY}
    L ${right} ${shoulderY}
    L ${right} ${bottom}
    L ${left} ${bottom}
    Z
  `;
}

export default function LeftJersey({ teamName, jerseyColors = defaultJerseyColors, size = 92 }: LeftJerseyProps) {
  const shirt = useImage(jersey);

  const firstColor = jerseyColors.primaryColor;
  const secondColor = jerseyColors.secondaryColor;

  const pattern = jerseyColors.pattern ?? 'solid';
  const safeStripeCount = Math.max(1, jerseyColors.stripeCount ?? 5);

  const name = normalizeTeamName(teamName);

  const fontSize = size * 0.23;
  const font = useFont(oswaldFont, fontSize);

  const textY = size * 0.5;

  const textColor = jerseyColors.textColor ?? getReadableTextColor(firstColor);
  const outlineColor = textColor.toLowerCase() === '#ffffff' ? '#111827' : '#ffffff';
  const outline = size * 0.007;

  const outlineOffsets = [
    [-outline, 0],
    [outline, 0],
    [0, -outline],
    [0, outline],
    [-outline, -outline],
    [outline, -outline],
    [-outline, outline],
    [outline, outline],
  ];

  if (!shirt) {
    return <Canvas style={{ width: size, height: size }} />;
  }

  const bodyPath = getBodyPath(size);

  const bodyLeft = size * 0.18;
  const bodyRight = size * 0.82;
  const bodyTop = size * 0.105;
  const bodyBottom = size * 0.93;

  const bodyWidth = bodyRight - bodyLeft;
  const bodyHeight = bodyBottom - bodyTop;

  const renderCodeText = () => {
    if (!font) return null;

    const textWidth = font.measureText(name).width;
    const textX = size / 2 - textWidth / 2;

    return (
      <Group>
        {/* צל */}
        <Text x={textX + size * 0.008} y={textY + size * 0.01} text={name} font={font} color="rgba(0,0,0,0.35)" />

        {/* מסגרת */}
        {outlineOffsets.map(([dx, dy], index) => (
          <Text key={`outline-${index}`} x={textX + dx} y={textY + dy} text={name} font={font} color={outlineColor} />
        ))}

        {/* טקסט */}
        <Text x={textX} y={textY} text={name} font={font} color={textColor} />
      </Group>
    );
  };

  return (
    <Canvas pointerEvents="none" style={{ width: size, height: size }}>
      {/* צל של החולצה */}
      <Mask mode="alpha" mask={<Image image={shirt} x={0} y={0} width={size} height={size} fit="contain" />}>
        <Rect x={size * 0.03} y={size * 0.04} width={size} height={size} color="rgba(0,0,0,0.25)" />
      </Mask>
      {DEBUG_BODY_PATH && <Path path={bodyPath} color="rgba(255,0,0,0.35)" />}
      {/* צבעים / דוגמת חולצה */}
      <Mask mode="alpha" mask={<Image image={shirt} x={0} y={0} width={size} height={size} fit="contain" />}>
        {/* צבע בסיס לכל החולצה */}
        <Rect x={0} y={0} width={size} height={size} color={firstColor} />

        {/* פסים אנכיים */}
        {pattern === 'vertical_stripes' && (
          <Group clip={bodyPath}>
            <Rect x={bodyLeft} y={bodyTop} width={bodyWidth} height={bodyHeight} color={firstColor} />

            {Array.from({ length: safeStripeCount }).map((_, index) => {
              const stripeWidth = bodyWidth / safeStripeCount;

              if (index % 2 !== 0) return null;

              return (
                <Rect
                  key={`vertical-stripe-${index}`}
                  x={bodyLeft + index * stripeWidth}
                  y={bodyTop}
                  width={stripeWidth}
                  height={bodyHeight}
                  color={secondColor}
                />
              );
            })}
          </Group>
        )}

        {/* פסים אופקיים */}
        {pattern === 'horizontal_stripes' && (
          <Group clip={bodyPath}>
            <Rect x={bodyLeft} y={bodyTop} width={bodyWidth} height={bodyHeight} color={firstColor} />

            {Array.from({ length: safeStripeCount }).map((_, index) => {
              const stripeHeight = bodyHeight / safeStripeCount;

              if (index % 2 !== 0) return null;

              return (
                <Rect
                  key={`horizontal-stripe-${index}`}
                  x={bodyLeft}
                  y={bodyTop + index * stripeHeight}
                  width={bodyWidth}
                  height={stripeHeight}
                  color={secondColor}
                />
              );
            })}
          </Group>
        )}

        {/* חצי חצי */}
        {pattern === 'half' && (
          <Group clip={bodyPath}>
            <Rect x={bodyLeft} y={bodyTop} width={bodyWidth / 2} height={bodyHeight} color={firstColor} />
            <Rect
              x={bodyLeft + bodyWidth / 2}
              y={bodyTop}
              width={bodyWidth / 2}
              height={bodyHeight}
              color={secondColor}
            />
          </Group>
        )}

        {/* פס חזה */}
        {pattern === 'chest_band' && (
          <Group clip={bodyPath}>
            <Rect x={bodyLeft} y={size * 0.38} width={bodyWidth} height={size * 0.14} color={secondColor} />
          </Group>
        )}

        {/* פס אלכסוני */}
        {pattern === 'diagonal_sash' && (
          <Group clip={bodyPath}>
            <Group
              transform={[
                { translateX: size * 0.5 },
                { translateY: size * 0.5 },
                { rotate: -0.65 },
                { translateX: -size * 0.5 },
                { translateY: -size * 0.5 },
              ]}
            >
              <Rect x={size * 0.04} y={size * 0.42} width={size * 0.95} height={size * 0.16} color={secondColor} />
            </Group>
          </Group>
        )}
      </Mask>

      {/* טקסטורת חולצה */}
      <Image image={shirt} x={0} y={0} width={size} height={size} fit="contain" opacity={0.28} />

      {/* שם הקבוצה */}
      {renderCodeText()}

      {/* שכבת בד עדינה */}
      <Image image={shirt} x={0} y={0} width={size} height={size} fit="contain" opacity={0.05} />
    </Canvas>
  );
}
