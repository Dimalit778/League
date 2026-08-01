import { Platform, View } from 'react-native';
import { useIsRTL } from '@/providers/LanguageProvider';
import { DrawerToggleButton } from './DrawerHeader';
import { HeaderChrome } from './HeaderChrome';
import { TopTabBar } from './TopTabBar';

type TabsHeaderProps = {
  title?: string;
};

export function TabsHeader({ title }: TabsHeaderProps) {
  const isWeb = Platform.OS === 'web';
  const isRTL = useIsRTL();

  return (
    <HeaderChrome>
      <View
        className="w-full flex-row items-center gap-3"
        style={{ direction: 'ltr', flexDirection: isRTL ? 'row-reverse' : 'row' }}
      >
        {isWeb && <DrawerToggleButton />}
        <View className="min-w-0 flex-1">
          <TopTabBar title={title} />
        </View>
      </View>
    </HeaderChrome>
  );
}
