import { ListItem, Section, Text, type TextTone } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { clearPushToken, registerPushToken } from '@/lib/notifications/pushToken';
import { useNotificationPermission } from '@/providers/NotificationProvider';
import { RelativePathString, useRouter } from 'expo-router';
import {
  Bell,
  Accessibility,
  Calendar,
  CreditCard,
  FileQuestionMark,
  Globe,
  Info,
  LogOut,
  Mail,
  Palette,
  ReceiptText,
  ShieldBan,
  Smartphone,
  Trash,
  User,
} from 'lucide-react-native';
import { ReactNode } from 'react';
import { Alert, Linking, View } from 'react-native';
import { version as appVersion } from '../../../../../package.json';

import { useSubscriptionAccess } from '@/features/subscription/hooks/useSubscriptionAccess';
import { SUBSCRIPTIONS_ENABLED } from '@/features/subscription/subscriptionMode';
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
  titleTone?: TextTone;
  chevron?: boolean;
};

type SettingsContentProps = {
  onSignOut: () => void;
  onDeleteAccount: () => void;
};

const SettingsContent = ({ onSignOut, onDeleteAccount }: SettingsContentProps) => {
  const user = useAuthStore((s) => s.user);
  const subscriptionAccess = useSubscriptionAccess(SUBSCRIPTIONS_ENABLED);
  const { permission, isRequesting, requestPermission } = useNotificationPermission();

  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const fullName = formatNameCapitalize(user?.full_name);
  const joinedDate = user?.created_at === 'N/A' ? user?.created_at : new Date(user?.created_at!).toLocaleDateString();
  const subscriptionType = subscriptionAccess.data?.planCode === 'pro' ? 'PRO' : 'FREE';

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
          void registerPushToken();
          Alert.alert(t('Notifications enabled'), t('Match reminders will be scheduled for upcoming matches.'));
        } else if (nextPermission.status === 'denied') {
          void clearPushToken();
          Alert.alert(
            t('Permission required'),
            t('Enable notifications from your device settings to receive match reminders.'),
            [
              { text: t('Cancel'), style: 'cancel' },
              { text: t('Open Settings'), onPress: openNotificationSettings },
            ],
          );
        }
      })
      .catch(() => Alert.alert(t('Error'), t('Unable to update notification permission. Please try again.')));
  };

  const handleNotificationPress = () => {
    if (permission.status === 'granted') {
      Alert.alert(
        t('Match reminders'),
        t('Notifications are enabled. You can change this permission in device settings.'),
        [
          { text: t('Cancel'), style: 'cancel' },
          { text: t('Open Settings'), onPress: openNotificationSettings },
        ],
      );
      return;
    }

    if (permission.status === 'denied' && !permission.canAskAgain) {
      Alert.alert(
        t('Permission required'),
        t('Enable notifications from your device settings to receive match reminders.'),
        [
          { text: t('Cancel'), style: 'cancel' },
          { text: t('Open Settings'), onPress: openNotificationSettings },
        ],
      );
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

  const infoRows: SettingsItem[] = [
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
    ...(SUBSCRIPTIONS_ENABLED
      ? [
          {
            key: 'plan',
            label: t('Plan'),
            icon: <CreditCard size={iconSize} color={colors.text} strokeWidth={1.5} />,
            rightContent: subscriptionType,
            path: '/settings/subscription' as RelativePathString,
          },
        ]
      : []),
    {
      key: 'version',
      label: t('Version'),
      icon: <Smartphone size={iconSize} color={colors.text} strokeWidth={1.5} />,
      rightContent: appVersion,
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
      key: 'accessibility',
      label: t('Accessibility Statement'),
      path: '/settings/accessibility' as RelativePathString,
      icon: <Accessibility size={iconSize} color={colors.text} strokeWidth={1.5} />,
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
  const accountRows: SettingsItem[] = [
    {
      key: 'sign-out',
      label: t('Sign Out'),
      icon: <LogOut size={iconSize} color={colors.text} strokeWidth={1.5} />,
      onPress: onSignOut,
      chevron: true,
    },
    {
      key: 'delete-account',
      label: t('Delete Account'),
      titleTone: 'error',
      icon: <Trash size={iconSize} color={colors.error} strokeWidth={1.5} />,
      onPress: onDeleteAccount,
      chevron: true,
    },
  ];
  const renderSection = (items: SettingsItem[], title?: string) => (
    <Section title={title} contentClassName="overflow-hidden rounded-xl border border-border bg-surface">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <ListItem
            key={item.key}
            leading={<View className="items-center justify-center rounded-md bg-subtle p-2">{item.icon}</View>}
            title={item.label}
            titleTone={item.titleTone}
            trailing={item.rightContent}
            right={item.path || item.chevron ? 'chevron' : 'none'}
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
      {renderSection(infoRows)}
      {renderSection(preferenceRows, t('Preferences'))}
      {renderSection(generalRows, t('General'))}
      {renderSection(accountRows, t('Account'))}
    </View>
  );
};

export default SettingsContent;
