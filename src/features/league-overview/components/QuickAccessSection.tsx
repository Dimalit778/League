import { Text } from '@/components/ui/Text';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Link, type Href } from 'expo-router';
import { ChevronRight, Flame, Goal, Podium } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

type Props = {
  title: string;
  icon: React.ReactNode;
  href: Href;
};

function QuickAccessItem({ title, icon, href }: Props) {
  const { colors } = useThemeTokens();
  return (
    <Link href={href} asChild>
      <Pressable className="flex-1 rounded-2xl  bg-surface  py-2 px-3 justify-center gap-2">
        <View className="flex-row items-center justify-between">
          <View className="p-1 items-center justify-center">{icon}</View>

          <ChevronRight size={20} color={colors.muted} />
        </View>

        <Text semibold>{title}</Text>
      </Pressable>
    </Link>
  );
}
export function QuickAccessSection() {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  return (
    <View className="flex-row gap-3 mt-5">
      <QuickAccessItem
        title={t('Matches')}
        icon={<Goal size={30} color={colors.primary} strokeWidth={1.5} />}
        href="/(app)/(league)/(tabs)/Matches"
      />

      <QuickAccessItem
        title={t('Table')}
        icon={<Podium size={30} color={colors.primary} strokeWidth={1.5} />}
        href="/(app)/(league)/(tabs)/Leaderboard"
      />

      <QuickAccessItem
        title={t('Stats')}
        icon={<Flame size={30} color={colors.primary} strokeWidth={1.5} />}
        href="/(app)/(league)/(tabs)/Profile"
      />
    </View>
  );
}
