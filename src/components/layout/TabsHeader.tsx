import { Platform, View } from 'react-native';
import { DrawerToggleButton } from './DrawerHeader';
import { HeaderChrome } from './HeaderChrome';
import { TopTabBar } from './TopTabBar';

type TabsHeaderProps = {
  title?: string;
};

export function TabsHeader({ title }: TabsHeaderProps) {
  const isWeb = Platform.OS === 'web';

  return (
    <HeaderChrome>
      <View className="w-full flex-row items-center gap-3">
        {isWeb && <DrawerToggleButton />}
        <View className="min-w-0 flex-1">
          <TopTabBar title={title} />
        </View>
      </View>
    </HeaderChrome>
  );
}
