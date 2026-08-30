import { TrophyIcon } from '@/assets/icons';
import { Row, TabButton, Text } from '@/components';

import { View } from 'react-native';

export const CollapsedHeader = ({ nickname }: { nickname?: string | undefined }) => {
  return (
    <Row className="h-12 items-center justify-between px-4">
      <View className="min-w-0 flex-1 flex-row-reverse items-center gap-2.5">
        <Text variant="heading" size="2xl" className="min-w-0 flex-1" numberOfLines={1}>
          {nickname}
        </Text>
      </View>
      <View className="h-12 w-12 shrink-0" />
    </Row>
  );
};

export const PersistentHeaderAction = () => {
  return (
    <Row className="justify-end px-4">
      <TabButton href="/(app)/(user)/leagues/my-leagues" icon={TrophyIcon} />
    </Row>
  );
};
