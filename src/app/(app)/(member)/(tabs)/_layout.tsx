import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';

// Constants
const IS_IOS = Platform.OS === 'ios';

export default function TabLayout() {
  const { colors } = useThemeTokens();
  return (
    <NativeTabs
      blurEffect={IS_IOS ? 'systemChromeMaterial' : undefined}
      backgroundColor={IS_IOS ? null : colors.surface}
      iconColor={colors.text}
      labelStyle={{ fontSize: 12, color: colors.text }}
      labelVisibilityMode={IS_IOS ? undefined : 'labeled'}
      indicatorColor={IS_IOS ? undefined : colors.border}
      backBehavior={IS_IOS ? undefined : 'initialRoute'}
    >
      <NativeTabs.Trigger name="League">
        <Label>League</Label>

        <Icon
          sf={{ default: 'trophy', selected: 'trophy.fill' }}
          androidSrc={{
            default: require('@assets/images/trophy-icon.png'),
            selected: require('@assets/images/trophy-icon-filled.png'),
          }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="Matches">
        <Label>Matches</Label>
        <Icon
          sf={{ default: 'sportscourt', selected: 'sportscourt.fill' }}
          androidSrc={{
            default: require('@assets/images/field-icon.png'),
            selected: require('@assets/images/field-icon-filled.png'),
          }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="Stats">
        <Label>Stats</Label>
        <Icon
          sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }}
          androidSrc={{
            default: require('@assets/images/chart-icon.png'),
            selected: require('@assets/images/chart-icon-filled.png'),
          }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="Profile">
        <Label>Profile</Label>
        <Icon
          sf={{ default: 'person', selected: 'person.fill' }}
          androidSrc={{
            default: require('@assets/images/profile-icon.png'),
            selected: require('@assets/images/profile-icon-filled.png'),
          }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
