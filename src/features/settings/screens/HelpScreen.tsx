import { Screen, Section } from '@/components/layout';
import { Button, Card, Text } from '@/components/ui';

import { useTranslation } from '@/hooks/useTranslation';
import { spacing } from '@/lib/nativewind/spacing';
import FontAwesome6 from '@expo/vector-icons/build/FontAwesome6';
import { Linking, View } from 'react-native';

const SUPPORT_EMAIL = 'support@champoapp.com';
const HelpScreen = () => {
  const handleEmailPress = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Help Request`);
  };
  const { t } = useTranslation();
  const helpSections = [
    {
      title: 'Getting Started',
      items: [
        {
          question: 'How do I create an account?',
          answer:
            'You can sign up using your email address or sign in with Google. After creating your account, verify your email address to get started.',
        },
        {
          question: 'How do I join a league?',
          answer:
            'Navigate to the "My Leagues" tab and tap the "+" button. You can either create a new league or join an existing one using a league code.',
        },
        {
          question: 'What is a league?',
          answer:
            'A league is a group where you compete with other users by making predictions on football matches. Each league tracks points and rankings.',
        },
      ],
    },
    {
      title: 'Making Predictions',
      items: [
        {
          question: 'How do I make a prediction?',
          answer:
            'Go to the "Matches" tab, select a match, and enter your predicted score for both teams. You can update your prediction until the match starts.',
        },
        {
          question: 'When can I make predictions?',
          answer:
            'You can make or update predictions anytime before a match kicks off. Once the match starts, predictions are locked and cannot be changed.',
        },
        {
          question: 'How are points calculated?',
          answer:
            'Points are awarded based on the accuracy of your prediction. Exact score predictions earn the most points, followed by correct result (win/draw), and correct goal difference.',
        },
      ],
    },
    {
      title: 'Leagues & Rankings',
      items: [
        {
          question: 'How do I create my own league?',
          answer:
            'Tap the "+" button in "My Leagues", select "Create League", choose a competition, and invite friends using the league code.',
        },
        {
          question: 'How do I view the leaderboard?',
          answer:
            'Open any league from "My Leagues" to see the current rankings. Points are updated automatically after matches finish.',
        },
        {
          question: 'Can I leave a league?',
          answer:
            'Yes, you can leave a league at any time from the league details screen. Note that your predictions and points will remain in the league history.',
        },
      ],
    },
    {
      title: 'Matches & Fixtures',
      items: [
        {
          question: 'How do I view upcoming matches?',
          answer:
            'Go to the "Matches" tab to see all upcoming fixtures for your leagues. You can filter by round or competition.',
        },
        {
          question: 'What match information is available?',
          answer:
            'For each match, you can see team lineups, live scores, match events (goals, cards, substitutions), and detailed statistics.',
        },
        {
          question: 'How often are match results updated?',
          answer:
            'Match results and scores are updated in real-time during live matches and automatically finalized when matches end.',
        },
      ],
    },
    {
      title: 'Account & Settings',
      items: [
        {
          question: 'How do I change my profile information?',
          answer:
            'Go to Settings and tap the edit icon next to your name. You can update your display name and profile photo.',
        },
        {
          question: 'How do I change my password?',
          answer:
            'If you signed up with email, go to Settings and use the password reset option. You will receive a reset link via email.',
        },
        {
          question: 'Can I change my email address?',
          answer:
            'Email addresses cannot be changed from within the app. Please contact support if you need to update your email address.',
        },
        {
          question: 'How do I manage notifications?',
          answer:
            'Open Settings and tap Match reminders. Champo explains how reminders work before requesting permission. You can change permission later in your device settings.',
        },
      ],
    },
    {
      title: 'Subscription & Premium',
      items: [
        {
          question: 'What are the subscription benefits?',
          answer:
            'Premium subscriptions offer priority support, access to additional leagues, advanced statistics, and exclusive features.',
        },
        {
          question: 'How do I subscribe?',
          answer:
            'Navigate to Settings and tap on "Subscription" to view available plans and manage your subscription.',
        },
        {
          question: 'How do I cancel my subscription?',
          answer:
            "Subscriptions are managed through your device's app store (App Store for iOS, Play Store for Android). You can cancel anytime from your account settings.",
        },
      ],
    },
  ];
  return (
    <Screen scroll padding="all" bottomInset contentClassName={spacing.stack}>
      {/* Welcome Section */}
      <Card variant="elevated" contentClassName="gap-3">
        <Text variant="title" className="text-center text-primary">
          {t('Welcome to League Champion')}
        </Text>
        <Text variant="body" className=" text-center">
          {t(
            'League is a football prediction app where you compete with friends by predicting match results. Create or join leagues, make predictions, and climb the leaderboard!',
          )}
        </Text>
      </Card>

      {/* Help Sections */}
      {helpSections.map((section) => (
        <Section key={section.title} title={t(section.title)}>
          {section.items.map((item, index) => (
            <Card key={index} className="mb-3" contentClassName="gap-2">
              <Text variant="title" tone="primary">
                {t(item.question)}
              </Text>
              <Text variant="body" tone="muted" className="leading-6">
                {t(item.answer)}
              </Text>
            </Card>
          ))}
        </Section>
      ))}

      {/* Contact Support */}
      <Card className="mb-6">
        <Text className="text-xl mb-3">{t('Contact Support')}</Text>
        <Text className="text-base leading-6 text-muted mb-4">
          {t(
            "Still have questions? Our support team is here to help. Reach out to us and we'll get back to you as soon as possible.",
          )}
        </Text>
        <Button
          onPress={handleEmailPress}
          label={t('Email Support')}
          leftIcon={<FontAwesome6 name="envelope" size={16} color="white" />}
          fullWidth
        />
        <Text className="text-xs text-muted mt-2 text-center">{SUPPORT_EMAIL}</Text>
      </Card>

      {/* App Information */}
      <View className="mb-6">
        <Text className="text-xl mb-3">{t('App Information')}</Text>
        <Card>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base text-muted">{t('Version')}</Text>
            <Text className="text-base text-text">1.0.0</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-base text-muted">{t('Platform')}</Text>
            <Text className="text-base text-text">{t('iOS & Android')}</Text>
          </View>
        </Card>
      </View>

      <Text className="text-xs text-muted">
        {t("Thank you for using League! We're constantly working to improve your experience.")}
      </Text>
    </Screen>
  );
};

export default HelpScreen;
