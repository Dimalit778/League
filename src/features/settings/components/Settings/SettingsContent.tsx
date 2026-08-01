import { Section } from '@/components/layout';
import { ListItem, Text } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
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
  User,
} from 'lucide-react-native';
import { ReactNode } from 'react';
import { View } from 'react-native';

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
};

const SettingsContent = () => {
  const user = useAuthStore((s) => s.user);
  const subscription = useRevenueCatSubscription();

  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const fullName = formatNameCapitalize(user?.full_name);
  const joinedDate = user?.created_at === 'N/A' ? user?.created_at : new Date(user?.created_at!).toLocaleDateString();
  const subscriptionType = subscription.subscription.isActive ? 'PRO' : 'FREE';

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
      label: t('Notification'),
      icon: <Bell size={iconSize} color={colors.text} strokeWidth={1.5} />,
      rightContent: (
        <Text variant="bodySmall" tone="success">
          {t('Enabled')}
        </Text>
      ),
    },
  ];

  const generalRows: SettingsItem[] = [
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
            onPress={item.path ? () => router.push(item.path!) : undefined}
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
