import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';

const IS_IOS = Platform.OS === 'ios';

const fieldIcon = require('@/assets/images/field-icon.png');
const trophyIconFilled = require('@/assets/images/trophy-icon-filled.png');

export function NativeTabLayout() {
  const { colors } = useThemeTokens();

  return (
    <NativeTabs
      blurEffect={IS_IOS ? 'systemChromeMaterial' : undefined}
      backgroundColor={IS_IOS ? null : colors.surface}
      iconColor={colors.text}
      labelStyle={{ fontSize: 12, color: colors.text }}
      labelVisibilityMode={IS_IOS ? undefined : 'labeled'}
      indicatorColor={IS_IOS ? undefined : colors.surface}
      backBehavior={IS_IOS ? undefined : 'initialRoute'}
    >
      <NativeTabs.Trigger name="League">
        <Label>League</Label>
        <Icon
          sf={{ default: 'trophy', selected: 'trophy.fill' }}
          androidSrc={{ default: trophyIconFilled, selected: trophyIconFilled }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="Matches">
        <Label>Matches</Label>
        <Icon
          sf={{ default: 'sportscourt', selected: 'sportscourt.fill' }}
          androidSrc={{ default: fieldIcon, selected: fieldIcon }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="Stats">
        <Label>Stats</Label>
        <Icon
          sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }}
          androidSrc={{ default: fieldIcon, selected: fieldIcon }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="Profile">
        <Label>Profile</Label>
        <Icon
          sf={{ default: 'person', selected: 'person.fill' }}
          androidSrc={{ default: fieldIcon, selected: fieldIcon }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
