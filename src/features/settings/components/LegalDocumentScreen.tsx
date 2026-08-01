import { Screen } from '@/components/layout';
import { Card, Text } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { legalContent } from '../content/legalContent';

type LegalDocumentScreenProps = {
  document: 'privacy' | 'terms';
};

const LegalDocumentScreen = ({ document }: LegalDocumentScreenProps) => {
  const { language } = useTranslation();
  const { colors } = useThemeTokens();
  const content = legalContent[language][document];

  return (
    <Screen scroll padding="horizontal">
      <Text variant="title">{content.title}</Text>
      <Text variant="bodySmall" className="text-muted">
        {content.updatedAt}
      </Text>
      <Text variant="body" className="text-muted">
        {content.intro}
      </Text>
      {content.sections.map((section) => (
        <Card key={section.title} className="mb-4">
          <View className="mb-3 flex-row items-center">
            <View
              className="me-3 h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.primary + '18' }}
            >
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            </View>
            <Text variant="title" className="flex-1">
              {section.title}
            </Text>
          </View>

          {section.body.map((paragraph) => (
            <View key={paragraph} className="mb-2 flex-row">
              <Text variant="bodySmall" className="text-muted">
                •
              </Text>
              <Text variant="bodySmall" className="flex-1 text-muted">
                {paragraph}
              </Text>
            </View>
          ))}
        </Card>
      ))}

      <View className="mt-1 rounded-xl p-4" style={{ backgroundColor: colors.primary + '10' }}>
        <Text variant="bodySmall" className="text-muted">
          {content.footer}
        </Text>
      </View>
    </Screen>
  );
};

export default LegalDocumentScreen;
