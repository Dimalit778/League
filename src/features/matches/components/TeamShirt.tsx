import { useId } from 'react';
import Svg, { ClipPath, Defs, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { TeamType } from '../types';
import { getTeamBadgeConfig } from './TeamBadge';

type TeamShirtProps = {
  team?: TeamType | null;
  teamId?: number | string;
  name?: string | null;
  shortName?: string | null;
  tla?: string | null;
  size?: number;
};

const SHIRT_PATH = 'M 38 5 L 12 10 L 0 35 L 14 40 L 14 100 L 86 100 L 86 40 L 100 35 L 88 10 L 62 5 L 50 18 Z';
const LEFT_SLEEVE_PATH = 'M 12 10 L 0 35 L 14 40 L 14 20 Z';
const RIGHT_SLEEVE_PATH = 'M 88 10 L 100 35 L 86 40 L 86 20 Z';
const COLLAR_PATH = 'M 38 5 L 50 18 L 62 5';

type ShirtPattern = 'solid' | 'stripes' | 'hoops' | 'halves' | 'sash';
const SHIRT_PATTERNS: ShirtPattern[] = ['solid', 'stripes', 'hoops', 'halves', 'sash'];

function ShirtPattern({ pattern, color, clipId }: { pattern: ShirtPattern; color: string; clipId: string }) {
  if (pattern === 'solid') return null;

  return (
    <G clipPath={`url(#${clipId})`}>
      {pattern === 'stripes' && (
        <>
          <Rect x="14" y="20" width="8" height="80" fill={color} opacity="0.32" />
          <Rect x="30" y="20" width="8" height="80" fill={color} opacity="0.32" />
          <Rect x="46" y="20" width="8" height="80" fill={color} opacity="0.32" />
          <Rect x="62" y="20" width="8" height="80" fill={color} opacity="0.32" />
          <Rect x="78" y="20" width="8" height="80" fill={color} opacity="0.32" />
        </>
      )}
      {pattern === 'hoops' && (
        <>
          <Rect x="14" y="40" width="72" height="10" fill={color} opacity="0.3" />
          <Rect x="14" y="62" width="72" height="10" fill={color} opacity="0.3" />
          <Rect x="14" y="84" width="72" height="10" fill={color} opacity="0.3" />
        </>
      )}
      {pattern === 'halves' && <Rect x="50" y="20" width="36" height="80" fill={color} opacity="0.42" />}
      {pattern === 'sash' && <Path d="M 14 30 L 86 58 L 86 72 L 14 44 Z" fill={color} opacity="0.38" />}
    </G>
  );
}

function PlaceholderShirt({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityRole="image" accessibilityLabel="Team TBD">
      <Path d={SHIRT_PATH} fill="#334155" opacity={0.45} />
      <Path d={SHIRT_PATH} fill="none" stroke="#94A3B8" strokeWidth="2" opacity={0.5} />
    </Svg>
  );
}

export default function TeamShirt({ team, teamId, name, shortName, tla, size = 80 }: TeamShirtProps) {
  const instanceId = useId().replace(/:/g, '');

  const resolved = team ?? {
    id: teamId != null ? Number(teamId) : undefined,
    name: name ?? '',
    shortName: shortName ?? null,
    tla: tla ?? null,
  };

  if (!resolved.id && !resolved.name && !resolved.tla) {
    return <PlaceholderShirt size={size} />;
  }

  const { hash, initials, primary, secondary } = getTeamBadgeConfig({
    teamId: resolved.id,
    name: resolved.name,
    shortName: resolved.shortName,
    tla: resolved.tla,
  });

  const shirtPattern = SHIRT_PATTERNS[hash % SHIRT_PATTERNS.length];
  const clipId = `shirt-${instanceId}`;
  const fontSize = initials.length > 2 ? 20 : 25;
  const label = resolved.shortName || resolved.name || initials;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      accessibilityRole="image"
      accessibilityLabel={`${label} shirt`}
    >
      <Defs>
        <ClipPath id={clipId}>
          <Path d={SHIRT_PATH} />
        </ClipPath>
      </Defs>

      <Path d={SHIRT_PATH} fill={primary} />
      <ShirtPattern pattern={shirtPattern} color={secondary} clipId={clipId} />
      <Path d={LEFT_SLEEVE_PATH} fill={secondary} opacity={0.28} />
      <Path d={RIGHT_SLEEVE_PATH} fill={secondary} opacity={0.28} />
      <Path d={SHIRT_PATH} fill="none" stroke={secondary} strokeWidth="2" opacity={0.5} />
      <Path d={COLLAR_PATH} fill="none" stroke={secondary} strokeWidth="3" strokeLinejoin="round" opacity={0.9} />
      <SvgText
        x="50"
        y="74"
        fill={secondary}
        fontSize={fontSize}
        fontWeight="900"
        textAnchor="middle"
        fontFamily="System"
        opacity={0.95}
      >
        {initials}
      </SvgText>
    </Svg>
  );
}
