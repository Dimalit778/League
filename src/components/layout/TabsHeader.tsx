import { useIsRTL } from '@/providers/LanguageProvider';
import { View } from 'react-native';
import { HeaderChrome } from './HeaderChrome';
import { TopTabBar } from './TopTabBar';

type TabsHeaderProps = {
  title?: string;
};

export function TabsHeader({ title }: TabsHeaderProps) {
  const isRTL = useIsRTL();

  return (
    <HeaderChrome>
      <View
        className="w-full flex-row items-center gap-3"
        style={{ direction: 'ltr', flexDirection: isRTL ? 'row-reverse' : 'row' }}
      >
        <View className="min-w-0 flex-1">
          <TopTabBar title={title} />
        </View>
      </View>
    </HeaderChrome>
  );
}
