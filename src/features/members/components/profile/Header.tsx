import { Row, Text } from '@/components';
import { router } from 'expo-router';
import { TrophyIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

export const CollapsedHeader = ({ nickname }: { nickname?: string | undefined }) => {
  return (
    <Row className="h-12 items-center justify-between px-4">
      <View className="min-w-0 flex-1 flex-row-reverse items-center gap-2.5">
        <Text variant="titleLarge" className="min-w-0 flex-1 text-white" numberOfLines={1}>
          {nickname}
        </Text>
      </View>
      <Pressable
        hitSlop={10}
        className="h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10"
        onPress={() => {
          router.push('/(app)/(user)/leagues/my-leagues');
        }}
      >
        <TrophyIcon size={24} color="white" strokeWidth={1.5} />
      </Pressable>
    </Row>
  );
};

export const ExpandedHeader = () => {
  return (
    <Row className="items-start justify-end px-4">
      <Pressable
        hitSlop={10}
        className="h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 "
        onPress={() => {
          router.push('/(app)/(user)/leagues/my-leagues');
        }}
      >
        <TrophyIcon size={24} color="white" strokeWidth={1.5} />
      </Pressable>
    </Row>
  );
};
