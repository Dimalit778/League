import { BackButton } from '@/components/ui';
import { ScrollView, Text, View } from 'react-native';

const HelpScreen = () => {
  return (
    <View className="flex-1 bg-background">
      <BackButton title="Help" />
      <ScrollView className="flex-1 p-4">
        <Text>Help</Text>
      </ScrollView>
    </View>
  );
};

export default HelpScreen;

