import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  const { colors } = useThemeTokens();
  return (
    <NativeTabs blurEffect="systemChromeMaterial" tintColor={colors.primary}>
      <NativeTabs.Trigger name="League">
        <Label>League</Label>
        <Icon sf={{ default: 'trophy', selected: 'trophy.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="Matches">
        <Label>Matches</Label>
        <Icon
          sf={{
            default: 'sportscourt',
            selected: 'sportscourt.fill',
          }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="Stats">
        <Label>Stats</Label>
        <Icon sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="Profile">
        <Label>Profile</Label>
        <Icon sf={{ default: 'person', selected: 'person.fill' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
