import { CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { ScrollView, View } from 'react-native';
import TeamBadge from '../TeamBadge';
import { ComputedStandingRow } from '../../utils/tournamentMatches';

type Props = {
  rows: ComputedStandingRow[];
  // Qualification zones: { upTo: position, color }
  zones?: { upTo: number; color: string }[];
};

const DEFAULT_CL_ZONES: Props['zones'] = [
  { upTo: 8, color: 'rgba(34,197,94,0.10)' },   // Top 8 — Round of 16
  { upTo: 24, color: 'rgba(234,179,8,0.08)' },  // 9-24 — Playoffs
];

const HeaderCell = ({ label, width }: { label: string; width: number }) => (
  <View style={{ width }} className="items-center">
    <CText variant="small" bold className="text-muted">
      {label}
    </CText>
  </View>
);

const Cell = ({ value, width, bold = false }: { value: string | number; width: number; bold?: boolean }) => (
  <View style={{ width }} className="items-center">
    <CText variant="caption" bold={bold} className="text-text">
      {value}
    </CText>
  </View>
);

const getRowBg = (position: number, zones: Props['zones']) => {
  if (!zones) return 'transparent';
  for (const zone of zones) {
    if (position <= zone.upTo) return zone.color;
  }
  return 'transparent';
};

export default function LeagueStandingsTable({ rows, zones = DEFAULT_CL_ZONES }: Props) {
  const { t } = useTranslation();
  const colW = 26;
  const ptsW = 36;

  if (rows.length === 0) {
    return (
      <View className="mx-3 my-2 rounded-xl border border-border bg-surface px-3 py-4">
        <CText className="text-muted text-center">{t('No standings found')}</CText>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View className="mx-3 my-2 overflow-hidden rounded-xl border border-border bg-surface">
        {/* Header */}
        <View className="flex-row items-center border-b border-border bg-background/40 px-3 py-2">
          <View style={{ width: 22 }} className="items-center">
            <CText variant="small" bold className="text-muted">#</CText>
          </View>
          <View className="flex-1">
            <CText variant="small" bold className="text-muted">{t('Team')}</CText>
          </View>
          <HeaderCell label={t('P')} width={colW} />
          <HeaderCell label={t('W')} width={colW} />
          <HeaderCell label={t('D')} width={colW} />
          <HeaderCell label={t('L')} width={colW} />
          <HeaderCell label={t('GD')} width={colW + 4} />
          <HeaderCell label={t('Pts')} width={ptsW} />
        </View>

        {/* Rows */}
        {rows.map((row) => (
          <View
            key={row.team.id}
            className="flex-row items-center border-b border-border px-3 py-2 last:border-b-0"
            style={{ backgroundColor: getRowBg(row.position, zones) }}
          >
            <View style={{ width: 22 }} className="items-center">
              <CText variant="caption" bold className="text-text">{row.position}</CText>
            </View>
            <View className="flex-1 flex-row items-center gap-2">
              <TeamBadge
                teamId={row.team.id}
                name={row.team.name}
                shortName={row.team.shortName}
                tla={row.team.tla}
                size={20}
              />
              <CText variant="caption" bold className="text-text" numberOfLines={1}>
                {row.team.shortName ?? row.team.tla ?? row.team.name}
              </CText>
            </View>
            <Cell value={row.played} width={colW} />
            <Cell value={row.won} width={colW} />
            <Cell value={row.drawn} width={colW} />
            <Cell value={row.lost} width={colW} />
            <Cell value={row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff} width={colW + 4} />
            <Cell value={row.points} width={ptsW} bold />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
