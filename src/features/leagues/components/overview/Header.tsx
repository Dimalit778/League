import { LogoBadge, Row, Text } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { TrophyIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

export const CollapsedHeader = ({
  avatarUrl,
  nickname,
  logoUrl,
}: {
  avatarUrl?: string | null;
  nickname?: string;
  logoUrl: string;
}) => {
  return (
    <Row className="h-12 items-center justify-between px-4">
      <LogoBadge source={logoUrl} width={40} height={40} />
      <View className="min-w-0 items-center justify-center ">
        <Text variant="subtitle" numberOfLines={1}>
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

export const ExpandedHeader = ({ nickname = 'there', logoUrl }: { nickname?: string; logoUrl: string }) => {
  const { t } = useTranslation();

  return (
    <Row className="items-start justify-between px-4">
      <LogoBadge source={logoUrl} width={40} height={40} />

      <View className="flex-1 items-center justify-center pt-8">
        <Text variant="title" className="text-white/80" numberOfLines={1}>
          {t('Hello')}
        </Text>
        <Text variant="display" className="text-white " numberOfLines={1}>
          {nickname}
        </Text>
      </View>
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
