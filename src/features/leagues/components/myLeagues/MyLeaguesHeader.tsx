import { TabButton, Text } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { Settings } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LeagueCountBadge = ({ count }: { count: string }) => {
  return (
    <View className="flex-row items-center gap-2 bg-subtle rounded-md px-3 py-1">
      <Text variant="body" tone="muted" className=" font-bold tracking-widest">
        {count}
      </Text>
    </View>
  );
};

export default function MyLeaguesHeader({ used, limit }: { used: number; limit: number }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const count = `${used.toString()}/${limit.toString()}`;
  return (
    <View className="w-full px-4 pb-2 sm:px-6 lg:px-8" style={{ paddingTop: insets.top }}>
      <View className="mx-auto w-full max-w-2xl flex-row items-center justify-between gap-3">
        <TabButton href="/(app)/(user)/settings" icon={Settings} accessibilityLabel={t('Settings')} />
        <View className="min-w-0 flex-1 items-center justify-center">
          <Text variant="title" numberOfLines={1}>
            {t('My Leagues')}
          </Text>
        </View>

        <LeagueCountBadge count={count} />
      </View>
    </View>
  );
}
