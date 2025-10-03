import { Screen } from '@/components/layout';
import { BackButton } from '@/components/ui';
import { ScrollView, Text, View } from 'react-native';

const Privacy = () => {
  return (
    <Screen>
      <BackButton />
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-semibold text-white">Policy Terms</Text>
        <Text className="mt-2 text-sm text-zinc-300">
          Last updated: {new Date().toLocaleDateString()}
        </Text>

        {policySections.map((section) => (
          <View key={section.title} className="mt-6">
            <Text className="text-lg font-semibold text-white">
              {section.title}
            </Text>
            {section.body.map((paragraph) => (
              <Text
                key={paragraph}
                className="mt-2 text-base leading-6 text-zinc-300"
              >
                {`• ${paragraph}`}
              </Text>
            ))}
          </View>
        ))}

        <Text className="mt-8 text-xs text-zinc-500">
          By continuing to use League you acknowledge that you have read and
          agree to these policy terms.
        </Text>
      </ScrollView>
    </Screen>
  );
};

export default Privacy;
