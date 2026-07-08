import { Text } from '@/components/ui/Text';
import { useTranslation } from '@/hooks/useTranslation';
import { Link, type Href } from 'expo-router';
import { BarChart3, ChevronRight, Goal, List } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

type Props = {
  title: string;
  icon: React.ReactNode;
  href: Href;
};

function QuickAccessItem({ title, icon, href }: Props) {
  return (
    <Link href={href} asChild>
      <Pressable className="flex-1 h-24 rounded-2xl border border-cardBorder bg-card px-4 justify-center">
        <View className="flex-row items-center justify-between">
          <View className="w-12 h-12 rounded-full bg-goldSoft items-center justify-center">{icon}</View>

          <ChevronRight size={22} color="#8A94A6" />
        </View>

        <Text className="text-white font-semibold mt-3">{title}</Text>
      </Pressable>
    </Link>
  );
}
export function QuickAccessSection() {
  const { t } = useTranslation();

  return (
    <View>
      <Text className="text-white text-lg font-bold mb-3">{t('Quick access')}</Text>

      <View className="flex-row gap-3">
        <QuickAccessItem
          title={t('Matches')}
          icon={<Goal size={26} color="#D99A00" />}
          href="/(app)/(league)/(tabs)/Matches"
        />

        <QuickAccessItem
          title={t('Table')}
          icon={<List size={26} color="#D99A00" />}
          href="/(app)/(league)/(tabs)/Rank"
        />

        <QuickAccessItem
          title={t('Stats')}
          icon={<BarChart3 size={26} color="#D99A00" />}
          href="/(app)/(league)/(tabs)/Stats"
        />
      </View>
    </View>
  );
}
