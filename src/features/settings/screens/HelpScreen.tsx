import { Brand, Button, Card, FormattedText, Row, Screen, Section, Text } from '@/components';
import { SUBSCRIPTIONS_ENABLED } from '@/features/subscription/subscriptionMode';
import { useTranslation } from '@/hooks/useTranslation';
import { spacing } from '@/lib/nativewind/spacing';
import { Mail } from 'lucide-react-native';
import { Linking } from 'react-native';
import { version as appVersion } from '../../../../package.json';
import { FOOTBALL_DATA_URL, helpContent, SUPPORT_EMAIL } from '../content/help-content';

const HelpScreen = () => {
  const handleEmailPress = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Help Request`);
  };
  const { t } = useTranslation();
  return (
    <Screen scroll padding="all" bottomInset contentClassName={spacing.stack}>
      {/* Welcome Section */}
      <Card variant="elevated" contentClassName="gap-3">
        <Brand size="sm" />
        <Text variant="body" className="font-medium text-center">
          {t(
            'League is a football prediction app where you compete with friends by predicting match results. Create or join leagues, make predictions, and climb the leaderboard!',
          )}
        </Text>
      </Card>

      {/* Help Sections */}
      {helpContent
        .filter((section) => SUBSCRIPTIONS_ENABLED || section.title !== 'Subscription & Premium')
        .map((section) => (
          <Section key={section.title} title={t(section.title)} accent>
            {section.items.map((item) => (
              <Card key={`${section.title}-${item.question}`} className="mb-3" contentClassName="gap-2">
                <Row>
                  <Text variant="title" tone="primary">
                    {t(item.question)}
                  </Text>
                </Row>
                <Row>
                  <FormattedText variant="body" tone="muted" className="leading-6">
                    {t(item.answer)}
                  </FormattedText>
                </Row>
              </Card>
            ))}
          </Section>
        ))}

      {/* Contact Support */}
      <Section title={t('Contact Support')} accent contentClassName="gap-2">
        <Card contentClassName="gap-3">
          <Row>
            <Text variant="body">
              {t(
                "Still have questions? Our support team is here to help. Reach out to us and we'll get back to you as soon as possible.",
              )}
            </Text>
          </Row>
          <Button
            onPress={handleEmailPress}
            label="support@champoapp.com"
            leftIcon={<Mail size={22} strokeWidth={2} />}
            fullWidth
          />
        </Card>
      </Section>

      {/* App Information */}
      <Section title={t('App Information')} accent contentClassName="gap-2">
        <Card contentClassName="gap-2">
          <Row className="justify-between">
            <Text variant="body">{t('Version')}</Text>
            <Text variant="body">{appVersion}</Text>
          </Row>
          <Row className="justify-between">
            <Text variant="body">{t('Platform')}</Text>
            <Text variant="body">{t('iOS & Android')}</Text>
          </Row>
          <Row>
            <Text
              accessibilityRole="link"
              className="text-sm text-muted underline"
              onPress={() => void Linking.openURL(FOOTBALL_DATA_URL)}
            >
              {t('Football data provided by the Football-Data.org API')}
            </Text>
          </Row>
        </Card>
      </Section>
      <Row className="justify-center my-2 mx-1">
        <Text variant="label" className="text-muted">
          {t("Thank you for using League! We're constantly working to improve your experience.")}
        </Text>
      </Row>
    </Screen>
  );
};

export default HelpScreen;
