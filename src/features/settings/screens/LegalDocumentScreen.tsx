import { Badge, Button, Card, FormattedText, Row, Screen, Section } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { spacing } from '@/lib/nativewind/spacing';
import { Mail } from 'lucide-react-native';
import { Linking, View } from 'react-native';
import { legalContent } from '../content/legal-content';

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
          <FormattedText variant="body" className="leading-7">
            {content.intro}
          </FormattedText>
        </Row>
      </Card>

      {content.sections.map((section, index) => (
        <Section key={section.title} title={section.title} accent contentClassName="gap-3">
          <Card variant="elevated" contentClassName="gap-2">
            {section.body.map((paragraph) => (
              <Row key={paragraph} className="items-start gap-2.5">
                <View className="h-6 w-1.5 items-center justify-center">
                  <View className="size-1.5 rounded-full bg-primary" />
                </View>
                <FormattedText variant="bodySmall" tone="secondary" className="min-w-0 flex-1 leading-6">
                  {paragraph}
                </FormattedText>
              </Row>
            ))}
          </Card>
        </Section>
      ))}

      <Section accent title={content.footer} contentClassName="p-2">
        <Button
          label={content.emailLink}
          leftIcon={<Mail size={22} strokeWidth={2} />}
          onPress={() => Linking.openURL(`mailto:${content.emailLink}`)}
        />
      </Section>
    </Screen>
  );
};

export default LegalDocumentScreen;
