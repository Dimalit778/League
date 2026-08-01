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
  const { language, isRTL } = useTranslation();
  const { colors } = useThemeTokens();
  const content = legalContent[language][document];
  const textAlignClass = isRTL ? 'text-right' : 'text-left';
  const directionClass = isRTL ? 'flex-row-reverse' : 'flex-row';
  const iconMarginClass = isRTL ? 'ml-3' : 'mr-3';

  return (
    <Screen scroll padding="horizontal">
      <Text variant="title" className={textAlignClass}>
        {content.title}
      </Text>
      <Text variant="bodySmall" className={`text-muted ${textAlignClass}`}>
        {content.updatedAt}
      </Text>
      <Text variant="body" className={`text-muted ${textAlignClass}`}>
        {content.intro}
      </Text>
      {content.sections.map((section) => (
        <Card key={section.title} className="mb-4">
          <View className={`mb-3 items-center ${directionClass}`}>
            <View
              className={`h-10 w-10 items-center justify-center rounded-full ${iconMarginClass}`}
              style={{ backgroundColor: colors.primary + '18' }}
            >
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            </View>
            <Text className={`text-xl flex-1 ${textAlignClass}`}>{section.title}</Text>
          </View>

          {section.body.map((paragraph) => (
            <View key={paragraph} className={`mb-2 ${directionClass}`}>
              <Text className={`text-base text-muted ${isRTL ? 'ml-2' : 'mr-2'}`}>•</Text>
              <Text className={`text-base flex-1 text-muted ${textAlignClass}`}>{paragraph}</Text>
            </View>
          ))}
        </Card>
      ))}

      <View className="mt-1 rounded-xl p-4" style={{ backgroundColor: colors.primary + '10' }}>
        <Text className={`text-sm text-muted ${textAlignClass}`}>{content.footer}</Text>
      </View>
    </Screen>
  );
};

export default LegalDocumentScreen;
