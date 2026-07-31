import { Screen } from '@/components/layout';
import { BackButton, Card, Text } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { legalContent } from '../content/legalContent';

type LegalDocumentScreenProps = {
  document: 'privacy' | 'terms';
};

const LegalDocumentScreen = ({ document }: LegalDocumentScreenProps) => {
  const { language, isRTL } = useTranslation();
  const { colors } = useThemeTokens();
  const edges = useSafeAreaInsets();
  const content = legalContent[language][document];
  const textAlignClass = isRTL ? 'text-right' : 'text-left';
  const directionClass = isRTL ? 'flex-row-reverse' : 'flex-row';
  const iconMarginClass = isRTL ? 'ml-3' : 'mr-3';

  return (
    <Screen edges={['top', 'bottom']}>
      <BackButton title={content.title} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: edges.bottom + 24, paddingHorizontal: 10 }}
      >
        <View className="mb-5 mt-3">
          <Text className={cn('text-2xl', textAlignClass)}>{content.title}</Text>
          <Text className={`text-sm mt-1 text-muted ${textAlignClass}`}>{content.updatedAt}</Text>
          <Text className={`text-base mt-4 text-muted ${textAlignClass}`}>{content.intro}</Text>
        </View>

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
      </ScrollView>
    </Screen>
  );
};

export default LegalDocumentScreen;
