import { Screen } from '@/components/layout';
import { BackButton } from '@/components/ui';
import { ScrollView, Text } from 'react-native';

const Privacy = () => {
  return (
    <Screen>
      <BackButton />
      <ScrollView className="flex-1 p-4">
        <Text>Privacy</Text>
      </ScrollView>
    </Screen>
  );
};

export default Privacy;
