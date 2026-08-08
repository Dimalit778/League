import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Text } from '../ui/Text';
import { Screen } from './Screens';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsRTL } from '@/providers/LanguageProvider';
import { Href, usePathname, useRouter } from 'expo-router';
import { Trophy } from 'lucide-react-native';
import { Platform, Pressable, View } from 'react-native';

type TopTabBarProps = {
  title?: string;
};

type TabRoute = {
  label: string;
  route: string;
  href: Href;
};

const TAB_ROUTES: TabRoute[] = [
  { label: 'Home', route: 'index', href: '/(app)/(league)' as Href },
  { label: 'Matches', route: 'Matches', href: '/(app)/(league)/Matches' as Href },
  { label: 'Leaderboard', route: 'Leaderboard', href: '/(app)/(league)/Leaderboard' as Href },
  { label: 'Profile', route: 'Profile', href: '/(app)/(league)/Profile' as Href },
];

function WebTabLinks() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Screen contentClassName=" flex-1 flex-row items-center gap-1">
      {TAB_ROUTES.map((tab) => {
        const isActive =
          tab.route === 'index' ? pathname === '/' : pathname.toLowerCase().includes(tab.route.toLowerCase());

        return (
          <Pressable
            key={tab.route}
            accessibilityRole="button"
            accessibilityLabel={t(tab.label)}
            accessibilityState={{ selected: isActive }}
            onPress={() => router.push(tab.href)}
            className={`rounded-lg px-3 py-2 ${isActive ? 'bg-surface' : 'bg-transparent'}`}
          >
            <Text className={`text-base ${isActive ? 'text-primary' : 'text-muted'}`}>{t(tab.label)}</Text>
          </Pressable>
        );
      })}
    </Screen>
  );
}

export function TopTabBar({ title }: TopTabBarProps) {
  const { colors } = useThemeTokens();
  const isRTL = useIsRTL();
  const { t } = useTranslation();
  const router = useRouter();
  const isWeb = Platform.OS === 'web';

  return (
    <View
      className="w-full flex-row items-center justify-between gap-3"
      style={{ direction: 'ltr', flexDirection: isRTL ? 'row-reverse' : 'row' }}
    >
      {isWeb ? (
        <WebTabLinks />
      ) : (
        <Text variant="header" numberOfLines={1} className="min-w-0 flex-1">
          {title}
        </Text>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('My leagues')}
        className="h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-subtle"
        hitSlop={4}
        onPress={() => router.replace('/(app)/(user)/leagues/my-leagues')}
      >
        <Trophy color={colors.text} size={23} strokeWidth={1.5} />
      </Pressable>
    </View>
  );
}
