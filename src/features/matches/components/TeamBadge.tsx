import Svg, { Circle, G, Line, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import { TeamType } from '../types';
type TeamBadgeProps = {
  teamId?: number | string;
  name?: string | null;
  shortName?: string | null;
  logo?: string | null;
  tla?: string | null;
  size?: number;
  isWorldCup?: boolean;
};

type BadgeShape = 'shield' | 'circle' | 'hexagon' | 'diamond';
type BadgePattern = 'stripes' | 'dots' | 'diagonal' | 'centerStripe';

const COLORS = [
  '#2563EB',
  '#DC2626',
  '#059669',
  '#7C3AED',
  '#D97706',
  '#0891B2',
  '#BE123C',
  '#4F46E5',
  '#15803D',
  '#9333EA',
  '#0F766E',
  '#B45309',
];

const SECONDARY_COLORS = ['#F8FAFC', '#FEF3C7', '#DBEAFE', '#DCFCE7', '#FCE7F3', '#E0E7FF', '#CCFBF1', '#FEE2E2'];

const SHAPES: BadgeShape[] = ['shield', 'circle', 'hexagon', 'diamond'];
const PATTERNS: BadgePattern[] = ['stripes', 'dots', 'diagonal', 'centerStripe'];

export function hashTeamSeed(seed: string): number {
  let hash = 2166136261;

  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function getTeamInitials({ tla, shortName, name }: Pick<TeamBadgeProps, 'tla' | 'shortName' | 'name'>): string {
  const cleanTla = tla?.replace(/[^a-zA-Z0-9]/g, '').trim();
  if (cleanTla) return cleanTla.slice(0, 3).toUpperCase();

  const source = shortName || name || 'FC';
  const words = source
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return 'FC';
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();

  return words
    .slice(0, 3)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export function getTeamBadgeConfig({
  teamId,
  name,
  shortName,
  tla,
}: Pick<TeamBadgeProps, 'teamId' | 'name' | 'shortName' | 'tla'>) {
  const initials = getTeamInitials({ tla, shortName, name });
  const seed = `${teamId ?? 'unknown'}-${tla ?? ''}-${shortName ?? ''}-${name ?? ''}`;
  const hash = hashTeamSeed(seed);
  const primary = COLORS[hash % COLORS.length];
  const secondary = SECONDARY_COLORS[Math.floor(hash / COLORS.length) % SECONDARY_COLORS.length];
  const shape = SHAPES[Math.floor(hash / 97) % SHAPES.length];
  const pattern = PATTERNS[Math.floor(hash / 389) % PATTERNS.length];

  return { hash, initials, primary, secondary, shape, pattern };
}

const Shape = ({ shape, fill, stroke }: { shape: BadgeShape; fill: string; stroke: string }) => {
  if (shape === 'circle') {
    return <Circle cx="50" cy="50" r="43" fill={fill} stroke={stroke} strokeWidth="5" />;
  }

  if (shape === 'hexagon') {
    return <Polygon points="50,5 87,27 87,73 50,95 13,73 13,27" fill={fill} stroke={stroke} strokeWidth="5" />;
  }

  if (shape === 'diamond') {
    return <Polygon points="50,5 92,50 50,95 8,50" fill={fill} stroke={stroke} strokeWidth="5" />;
  }

  return <Path d="M18 10H82V47C82 69 68 86 50 94C32 86 18 69 18 47V10Z" fill={fill} stroke={stroke} strokeWidth="5" />;
};

const Pattern = ({ pattern, color }: { pattern: BadgePattern; color: string }) => {
  if (pattern === 'dots') {
    return (
      <G opacity="0.22">
        <Circle cx="31" cy="31" r="5" fill={color} />
        <Circle cx="69" cy="31" r="5" fill={color} />
        <Circle cx="31" cy="69" r="5" fill={color} />
        <Circle cx="69" cy="69" r="5" fill={color} />
      </G>
    );
  }

  if (pattern === 'diagonal') {
    return <Path d="M10 86L86 10H100V28L28 100H10Z" fill={color} opacity="0.22" />;
  }

  if (pattern === 'centerStripe') {
    return <Rect x="40" y="8" width="20" height="84" fill={color} opacity="0.24" />;
  }

  return (
    <G opacity="0.22">
      <Line x1="28" y1="12" x2="28" y2="88" stroke={color} strokeWidth="8" />
      <Line x1="50" y1="8" x2="50" y2="94" stroke={color} strokeWidth="8" />
      <Line x1="72" y1="12" x2="72" y2="88" stroke={color} strokeWidth="8" />
    </G>
  );
};

export default function TeamBadge({
  team,
  teamId,
  name,
  shortName,
  tla,
  logo,
  size = 34,
}: TeamBadgeProps & {
  team?: TeamType | null;
}) {
  const resolvedTeam: TeamType | null =
    team ??
    (teamId != null
      ? ({
          id: Number(teamId),
          name: name ?? '',
          shortName: shortName ?? null,
          tla: tla ?? null,
          logo: logo ?? '',
          venue: null,
          created_at: '',
          updated_at: '',
        } satisfies TeamType)
      : null);

  if (!resolvedTeam?.id) return null;

  const { initials, primary, secondary, shape, pattern } = getTeamBadgeConfig({
    teamId: resolvedTeam.id,
    name: resolvedTeam.name,
    shortName: resolvedTeam.shortName,
    tla: resolvedTeam.tla,
  });
  const fontSize = initials.length > 2 ? 26 : 31;
  const { name: teamName, shortName: teamShortName } = resolvedTeam;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      accessibilityRole="image"
      accessibilityLabel={`${teamName || teamShortName || initials} badge`}
    >
      <Shape shape={shape} fill={primary} stroke={secondary} />
      <Pattern pattern={pattern} color={secondary} />
      <Circle cx="50" cy="50" r="26" fill="#0F172A" opacity="0.2" />
      <SvgText
        x="50"
        y="59"
        fill={secondary}
        fontSize={fontSize}
        fontWeight="800"
        textAnchor="middle"
        fontFamily="System"
      >
        {initials}
      </SvgText>
    </Svg>
  );
}
