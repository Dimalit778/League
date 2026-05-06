import { CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { View } from 'react-native';
import { WCMatch, WCMatchday } from '../types';
import WCMatchCard from './WCMatchCard';

type Props = {
  matchday: WCMatchday;
  matches: WCMatch[];
};

export default function MatchdaySection({ matchday, matches }: Props) {
  const { t } = useTranslation();
  return (
    <View className="mx-2 mt-3">
      <View className="px-2 mb-1">
        <CText variant="caption" bold className="text-muted">
          {t('Matchday')} {matchday}
        </CText>
      </View>
      <View className="flex-row flex-wrap">
        {matches.map((m) => (
          <WCMatchCard key={m.id} match={m} layout="grid" />
        ))}
      </View>
    </View>
  );
}
