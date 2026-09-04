import { TrophyIcon } from '@/assets/icons';
import { LogoBadge, Row, TabButton, Text } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { View } from 'react-native';

export const CollapsedHeader = () => <View className="h-12" />;

export const ExpandedHeader = ({ nickname = 'there' }: { nickname?: string }) => {
  const { t } = useTranslation();

  return (
    <View
      className="flex-1 px-4 items-center"
      style={{
        paddingTop: 48,
        width: '100%',
        maxWidth: 720,
        alignSelf: 'center',
        direction: 'ltr',
      }}
    >
      <Text variant="title" className="max-w-full text-white/80" numberOfLines={1}>
        {t('Hello')}
      </Text>
      <Text variant="heading" size="5xl" className="max-w-full text-white" numberOfLines={1}>
        {nickname}
      </Text>
    </View>
  );
};

export const PersistentHeaderActions = ({
  flagUrl,
  leagueName,
  competitionName,
}: {
  flagUrl: string;
  leagueName: string;
  competitionName: string;
}) => {
  const { t } = useTranslation();
  return (
    <Row className="justify-between px-4" style={{ width: '100%', maxWidth: 720, alignSelf: 'center', gap: 12 }}>
      <Row className="flex-1 min-w-0 gap-2">
        <LogoBadge source={flagUrl} width={36} height={36} className="rounded-md" />
        <View className="gap-1">
          <Text variant="body" className=" text-white font-manrope-bold leading-none">
            {leagueName}
          </Text>
          <Text variant="label" className=" text-white/80 font-manrope leading-none">
            {competitionName}
          </Text>
        </View>
      </Row>

      <TabButton href="/(app)/(user)/leagues/my-leagues" icon={TrophyIcon} accessibilityLabel={t('My Leagues')} />
    </Row>
  );
};
