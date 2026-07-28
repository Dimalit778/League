import { Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { Image as ExpoImage } from 'expo-image';
import { View } from 'react-native';
import { WCStandingRow } from '../types';

type Props = {
  rows: WCStandingRow[];
};

const HeaderCell = ({ label, w }: { label: string; w: number }) => (
  <View style={{ width: w }} className="items-center">
    <Text className="text-xs font-bold text-muted">
      {label}
    </Text>
  </View>
);

const Cell = ({ value, w, bold = false }: { value: string | number; w: number; bold?: boolean }) => (
  <View style={{ width: w }} className="items-center">
    <Text className={`text-sm text-text${bold ? ' font-bold' : ''}`}>
      {value}
    </Text>
  </View>
);

export default function GroupStandingsTable({ rows }: Props) {
  const { t } = useTranslation();
  const colW = 26;
  const ptsW = 36;
  return (
    <View className="mx-3 my-2 rounded-xl border border-border bg-surface overflow-hidden">
      <View className="flex-row items-center px-3 py-2 border-b border-border bg-background/40">
        <View style={{ width: 22 }} className="items-center">
          <Text className="text-xs font-bold text-muted">
            #
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs font-bold text-muted">
            {t('Team')}
          </Text>
        </View>
        <HeaderCell label={t('P')} w={colW} />
        <HeaderCell label={t('W')} w={colW} />
        <HeaderCell label={t('D')} w={colW} />
        <HeaderCell label={t('L')} w={colW} />
        <HeaderCell label={t('GD')} w={colW + 4} />
        <HeaderCell label={t('Pts')} w={ptsW} />
      </View>

      {rows.map((row, idx) => {
        const qualified = idx < 2;
        return (
          <View
            key={row.team.id}
            className="flex-row items-center px-3 py-2 border-b border-border last:border-b-0"
            style={{ backgroundColor: qualified ? 'rgba(34,197,94,0.08)' : 'transparent' }}
          >
            <View style={{ width: 22 }} className="items-center">
              <Text className="text-sm font-bold text-text">
                {idx + 1}
              </Text>
            </View>
            <View className="flex-1 flex-row items-center gap-2">
              <ExpoImage
                source={row.team.logo}
                style={{ width: 18, height: 18, borderRadius: 2 }}
                cachePolicy="memory-disk"
                contentFit="contain"
              />
              <Text className="text-sm font-bold text-text">
                {row.team.tla}
              </Text>
            </View>
            <Cell value={row.played} w={colW} />
            <Cell value={row.won} w={colW} />
            <Cell value={row.drawn} w={colW} />
            <Cell value={row.lost} w={colW} />
            <Cell value={row.gd > 0 ? `+${row.gd}` : row.gd} w={colW + 4} />
            <Cell value={row.points} w={ptsW} bold />
          </View>
        );
      })}
    </View>
  );
}
