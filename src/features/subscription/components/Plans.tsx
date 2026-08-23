import { images } from '@/assets/images';
import { Text } from '@/components';
import { useGetCompetitions } from '@/features/leagues/hooks/useCompetition';
import { useSubscriptionPlans } from '@/features/subscription/hooks/useSubscriptionPlans';
import { useTranslation } from '@/hooks/useTranslation';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

type ComparisonRowProps = {
  label: string;
  freeValue: string;
  proValue: string;
  isRTL: boolean;
  last?: boolean;
};

function ComparisonRow({ label, freeValue, proValue, isRTL, last = false }: ComparisonRowProps) {
  const labelCell = (
    <View key="label" style={styles.comparisonLabelCell}>
      <Text className="text-sm font-semibold leading-5 text-slate-200">{label}</Text>
    </View>
  );
  const freeCell = (
    <View key="free" style={styles.comparisonValueCell}>
      <Text className="text-center text-sm font-bold text-white">{freeValue}</Text>
    </View>
  );
  const proCell = (
    <View key="pro" style={[styles.comparisonValueCell, styles.proCell, last && styles.proCellBottom]}>
      <Text className="text-center text-sm font-black text-[#FFE49A]">{proValue}</Text>
    </View>
  );

  return (
    <View style={[styles.comparisonRow, !last && styles.comparisonDivider]}>
      {isRTL ? [proCell, freeCell, labelCell] : [labelCell, freeCell, proCell]}
    </View>
  );
}

export function Plans() {
  const { t, isRTL } = useTranslation();
  const { data: plans } = useSubscriptionPlans();
  const { data: competitions } = useGetCompetitions();
  const freePlan = plans?.find((plan) => plan.code === 'free');
  const proPlan = plans?.find((plan) => plan.code === 'pro');
  const freeCompetitionCount = competitions?.filter((competition) => competition.is_free).length;
  const totalCompetitionCount = competitions?.length;
  const displayNumber = (value: number | undefined) => value?.toString() ?? '—';

  const freeHeader = (
    <View key="free" style={styles.comparisonValueCell}>
      <Text className="text-center text-sm font-bold text-white">{t('FREE')}</Text>
    </View>
  );
  const proHeader = (
    <View key="pro" style={[styles.comparisonValueCell, styles.proCell, styles.proCellTop]}>
      <Text className="text-center text-sm font-black text-[#FFE49A]">{t('PRO')}</Text>
    </View>
  );

  return (
    <View className="mx-4 mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
      <Image
        testID="comparison-background"
        source={images.seasonPass}
        contentFit="contain"
        accessible={false}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient colors={['rgba(3,11,21,0.9)', 'rgba(3,11,21,0.92)']} style={StyleSheet.absoluteFill} />

      <View
        style={[
          styles.comparisonHeader,
          styles.comparisonDivider,
          { justifyContent: isRTL ? 'flex-start' : 'flex-end' },
        ]}
      >
        {isRTL ? [proHeader, freeHeader] : [freeHeader, proHeader]}
      </View>

      <ComparisonRow
        isRTL={isRTL}
        label={t('Football competitions')}
        freeValue={displayNumber(freePlan?.capabilities.premiumCompetitions ? totalCompetitionCount : freeCompetitionCount)}
        proValue={displayNumber(proPlan?.capabilities.premiumCompetitions ? totalCompetitionCount : freeCompetitionCount)}
      />
      <ComparisonRow
        isRTL={isRTL}
        label={t('Active friend leagues')}
        freeValue={displayNumber(freePlan?.limits.maxActiveLeagues)}
        proValue={displayNumber(proPlan?.limits.maxActiveLeagues)}
      />
      <ComparisonRow
        isRTL={isRTL}
        label={t('Members per league')}
        freeValue={displayNumber(freePlan?.limits.maxMembersPerLeague)}
        proValue={displayNumber(proPlan?.limits.maxMembersPerLeague)}
      />
      <ComparisonRow
        isRTL={isRTL}
        label={t('AI match insights')}
        freeValue={freePlan ? t(freePlan.capabilities.advancedStats ? 'Full' : 'Score') : '—'}
        proValue={proPlan ? t(proPlan.capabilities.advancedStats ? 'Full' : 'Score') : '—'}
        last
      />
    </View>
  );
}

const styles = StyleSheet.create({
  comparisonHeader: { minHeight: 48, flexDirection: 'row', alignItems: 'stretch' },
  comparisonRow: { minHeight: 55, flexDirection: 'row', alignItems: 'stretch' },
  comparisonDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.12)' },
  comparisonLabelCell: { flex: 1, justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 8 },
  comparisonValueCell: { width: 72, justifyContent: 'center', paddingHorizontal: 6, paddingVertical: 8 },
  proCell: { backgroundColor: '#173A60' },
  proCellTop: { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  proCellBottom: { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
});
