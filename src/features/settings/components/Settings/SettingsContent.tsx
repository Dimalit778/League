import { ListItem, Section, Text } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useNotificationPermission } from '@/providers/NotificationProvider';
import { RelativePathString, useRouter } from 'expo-router';
import {
  Bell,
  Calendar,
  CreditCard,
  FileQuestionMark,
  Globe,
  Info,
  Mail,
  Palette,
  ReceiptText,
  ShieldBan,
  User,
} from 'lucide-react-native';
import { ReactNode } from 'react';
import { Alert, Linking, View } from 'react-native';

import { useRevenueCatSubscription } from '@/lib/revenuecat/purchases';
import { useAuthStore } from '@/store/AuthStore';
import { formatNameCapitalize } from '@/utils/formats';
import LanguageToggle from '../LanguageToggle';
import ThemeToggle from '../ThemeToggle';

type SettingsItem = {
  key: string;
  label: string;
  icon: ReactNode;
  rightContent?: ReactNode;
  path?: RelativePathString;
  onPress?: () => void;
};

const SettingsContent = () => {
  const user = useAuthStore((s) => s.user);
  const subscription = useRevenueCatSubscription();
  const { permission, isRequesting, requestPermission } = useNotificationPermission();

  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const fullName = formatNameCapitalize(user?.full_name);
  const joinedDate = user?.created_at === 'N/A' ? user?.created_at : new Date(user?.created_at!).toLocaleDateString();
  const subscriptionType = subscription.subscription.isActive ? 'PRO' : 'FREE';

  const notificationStatus = (() => {
    if (isRequesting || permission.status === 'loading') return { label: t('Checking...'), tone: 'muted' as const };
    if (permission.status === 'granted') return { label: t('Enabled'), tone: 'success' as const };
    if (permission.status === 'denied') return { label: t('Blocked'), tone: 'error' as const };
    if (permission.status === 'undetermined') return { label: t('Not requested'), tone: 'muted' as const };
    return { label: t('Unavailable'), tone: 'muted' as const };
  })();

  const openNotificationSettings = () => {
    void Linking.openSettings().catch(() => Alert.alert(t('Error'), t('Unable to open device settings.')));
  };

  const requestNotificationsAfterExplanation = () => {
    void requestPermission()
      .then((nextPermission) => {
        if (nextPermission.status === 'granted') {
          Alert.alert(t('Notifications enabled'), t('Match reminders will be scheduled for upcoming matches.'));
        } else if (nextPermission.status === 'denied') {
          Alert.alert(t('Permission required'), t('Enable notifications from your device settings to receive match reminders.'), [
            { text: t('Cancel'), style: 'cancel' },
            { text: t('Open Settings'), onPress: openNotificationSettings },
          ]);
        }
      })
      .catch(() => Alert.alert(t('Error'), t('Unable to update notification permission. Please try again.')));
  };

  const handleNotificationPress = () => {
    if (permission.status === 'granted') {
      Alert.alert(t('Match reminders'), t('Notifications are enabled. You can change this permission in device settings.'), [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Open Settings'), onPress: openNotificationSettings },
      ]);
      return;
    }

    if (permission.status === 'denied' && !permission.canAskAgain) {
      Alert.alert(t('Permission required'), t('Enable notifications from your device settings to receive match reminders.'), [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Open Settings'), onPress: openNotificationSettings },
      ]);
      return;
    }

    if (permission.status === 'unavailable') {
      Alert.alert(t('Match reminders'), t('Notifications are unavailable on this device.'));
      return;
    }

    if (permission.status === 'loading' || isRequesting) return;

    Alert.alert(
      t('Never miss a prediction'),
      t(
        'Get a reminder one hour before upcoming matches so you have time to enter your prediction. Notifications are optional and can be changed at any time.',
      ),
      [
        { text: t('Not now'), style: 'cancel' },
        { text: t('Enable reminders'), onPress: requestNotificationsAfterExplanation },
      ],
    );
  };

  const iconSize = 24;

  const accountRows: SettingsItem[] = [
    {
      key: 'name',
      label: t('Name'),
      icon: <User size={iconSize} color={colors.text} strokeWidth={1.5} />,
      rightContent: fullName,
    },
    {
      key: 'email',
      label: t('Email'),
      icon: <Mail size={iconSize} color={colors.text} strokeWidth={1.5} />,
      rightContent: user?.email!,
    },
    {
      key: 'joined',
      label: t('Joined'),
      icon: <Calendar size={iconSize} color={colors.text} strokeWidth={1.5} />,
      rightContent: joinedDate,
    },
    {
      key: 'plan',
      label: t('Plan'),
      icon: <CreditCard size={iconSize} color={colors.text} strokeWidth={1.5} />,
      rightContent: subscriptionType,
    },
  ];

  const preferenceRows: SettingsItem[] = [
    {
      key: 'theme',
      label: t('Theme'),
      icon: <Palette size={iconSize} color={colors.text} strokeWidth={1.5} />,
      rightContent: <ThemeToggle />,
    },
    {
      key: 'language',
      label: t('Language'),
      icon: <Globe size={iconSize} color={colors.text} strokeWidth={1.5} />,
      rightContent: <LanguageToggle />,
    },
    {
      key: 'notification',
      label: t('Match reminders'),
      icon: <Bell size={iconSize} color={colors.text} strokeWidth={1.5} />,
      onPress: handleNotificationPress,
      rightContent: (
        <Text variant="bodySmall" tone={notificationStatus.tone}>
          {notificationStatus.label}
        </Text>
      ),
    },
  ];

  const generalRows: SettingsItem[] = [
    {
      key: 'blocked-users',
      label: t('Blocked users'),
      path: '/settings/blocked-users' as RelativePathString,
      icon: <ShieldBan size={iconSize} color={colors.text} strokeWidth={1.5} />,
    },
    {
      key: 'privacy',
      label: t('Privacy Policy'),
      path: '/settings/privacy' as RelativePathString,
      icon: <Info size={iconSize} color={colors.text} strokeWidth={1.5} />,
    },
    {
      key: 'terms',
      label: t('Terms of Service'),
      path: '/settings/terms' as RelativePathString,
      icon: <ReceiptText size={iconSize} color={colors.text} strokeWidth={1.5} />,
    },
    {
      key: 'help',
      label: t('Help & Support'),
      path: '/settings/help' as RelativePathString,
      icon: <FileQuestionMark size={iconSize} color={colors.text} strokeWidth={1.5} />,
    },
  ];

  const renderSection = (items: SettingsItem[], title?: string) => (
    <Section title={title} contentClassName="overflow-hidden rounded-xl border border-border bg-surface ">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <ListItem
            key={item.key}
            leading={<View className="items-center justify-center rounded-md bg-subtle p-2">{item.icon}</View>}
            title={item.label}
            trailing={item.rightContent}
            right={item.path ? 'chevron' : 'none'}
            divider={!isLast}
            className="px-3"
            disabled={item.key === 'notification' && (permission.status === 'loading' || isRequesting)}
            onPress={item.onPress ?? (item.path ? () => router.push(item.path!) : undefined)}
          />
        );
      })}
    </Section>
  );

  return (
    <View className="gap-4">
      {renderSection(accountRows)}
      {renderSection(preferenceRows, t('Preferences'))}
      {renderSection(generalRows, t('General'))}
    </View>
  );
};

export default SettingsContent;
