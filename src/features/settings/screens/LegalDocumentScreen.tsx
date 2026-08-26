import { Badge, Card, Row, Screen, Text } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { spacing } from '@/lib/nativewind/spacing';
import { View } from 'react-native';
import { legalContent } from '../content/legalContent';

type LegalDocumentScreenProps = {
  document: 'privacy' | 'terms' | 'accessibility';
};

const LegalDocumentScreen = ({ document }: LegalDocumentScreenProps) => {
  const { language } = useTranslation();
  const content = legalContent[language][document];

  return (
    <Screen scroll padding="all" bottomInset contentClassName={spacing.stack}>
      <Card variant="elevated" contentClassName="gap-3">
        <Badge size="sm" label={content.updatedAt} className="self-center" />
        <Row>
          <Text variant="body" className="leading-7">
            {content.intro}
          </Text>
        </Row>
      </Card>

      {content.sections.map((section, index) => (
        <Card key={section.title} contentClassName="gap-3">
          <Row className="items-start gap-3">
            <View className="size-7 items-center justify-center rounded-full bg-primary">
              <Text variant="label" className="text-center text-on-primary">
                {index + 1}
              </Text>
            </View>
            <Text accessibilityRole="header" variant="subtitle" className="min-w-0 flex-1 pt-0.5">
              {section.title}
            </Text>
          </Row>

          <View className="gap-3">
            {section.body.map((paragraph) => (
              <Row key={paragraph} className="items-start gap-2.5">
                <Text variant="bodySmall" tone="muted" className="mt-0.5 leading-6">
                  •
                </Text>
                <Text variant="bodySmall" tone="secondary" className="min-w-0 flex-1 leading-6">
                  {paragraph}
                </Text>
              </Row>
            ))}
          </View>
        </Card>
      ))}

      <Card variant="soft" contentClassName="gap-1">
        <Text variant="bodySmall" tone="muted" className="leading-6 text-center">
          {content.footer}
        </Text>
      </Card>
    </Screen>
  );
};

export default LegalDocumentScreen;
