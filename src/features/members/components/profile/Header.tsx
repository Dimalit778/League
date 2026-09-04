import { TrophyIcon } from '@/assets/icons';
import { ScreenHeader, TabButton, Text } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';

export const ProfileHeader = ({ nickname }: { nickname?: string | undefined }) => {
  const { t } = useTranslation();

  return (
    <ScreenHeader
      left={
        <Text variant="title" numberOfLines={1} className="min-w-0 flex-1">
          {nickname}
        </Text>
      }
      right={
        <TabButton href="/(app)/(user)/leagues/my-leagues" icon={TrophyIcon} accessibilityLabel={t('My Leagues')} />
      }
    />
  );
};
