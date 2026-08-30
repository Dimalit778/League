import { Badge, Card, Row, Text } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { View } from 'react-native';
const steps = [
  'Get the 7-digit invite code from the league owner.',
  'Enter the code above to find the league.',
  'Choose your nickname for the league.',
  'Tap "Join League" to become a member.',
];
export function GuideSteps() {
  const { t } = useTranslation();
  return (
    <Card padding="md" contentClassName="gap-4">
      <Text variant="title" className="text-center">
        {t('How to Join a League')}
      </Text>
      <View className="gap-3">
        {steps.map((step, index) => (
          <Row key={index} className="flex-row gap-3">
            <Badge variant="primary" label={(index + 1).toString()} size="md" />
            <Text tone="muted" className="flex-1 font-medium">
              {t(step)}
            </Text>
          </Row>
        ))}
      </View>
    </Card>
  );
}
