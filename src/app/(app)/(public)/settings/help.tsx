import { Screen } from '@/components/layout';
import { BackButton } from '@/components/ui';
import { ScrollView, Text } from 'react-native';

const Help = () => {
  return (
    <Screen>
      <BackButton />
      <ScrollView className="flex-1 p-4">
        <Text>Help</Text>
      </ScrollView>
    </Screen>
  );
};

export default Help;
