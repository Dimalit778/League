import { CText } from '@/components/ui';
import { AvatarImage } from '@/components/ui/AvatarImage';
import { Card } from '@/components/ui/Card';
import { useTranslation } from '@/hooks/useTranslation';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { WCLeaderboardMember } from '../types';

type Props = {
  members: WCLeaderboardMember[];
};

const Row = ({ item, position }: { item: WCLeaderboardMember; position: number }) => {
  const { t } = useTranslation();
  return (
    <Card className={`${item.is_current_user ? 'border-primary' : ''} px-3 py-1 my-1`}>
      <View className="flex-row items-center gap-3">
        <View className="w-8 h-8 rounded-full items-center justify-center bg-background">
          <CText variant="caption" bold className="text-text">
            {position}
          </CText>
        </View>
        <View className="w-10 h-10 rounded-full overflow-hidden">
          <AvatarImage nickname={item.nickname} path={item.avatar_url} />
        </View>
        <View className="flex-1 items-start">
          <CText variant="body" bold className="text-text" numberOfLines={1}>
            {item.nickname}
          </CText>
        </View>
        <View className="items-center pr-2">
          <CText variant="body" bold>
            {item.total_points.toLocaleString()}
          </CText>
          <CText variant="caption" className="text-muted">
            {t('pts')}
          </CText>
        </View>
      </View>
    </Card>
  );
};

export default function WCLeaderboardPreview({ members }: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? members : members.slice(0, 3);

  return (
    <View className="mx-3 mt-2">
      <View className="flex-row items-center justify-between px-1 mb-1">
        <CText variant="bodyBold" className="text-text">
          {t('Leaderboard')}
        </CText>
        {members.length > 3 && (
          <Pressable onPress={() => setExpanded((v) => !v)}>
            <CText variant="caption" className="text-primary">
              {expanded ? t('Show less') : t('View all')}
            </CText>
          </Pressable>
        )}
      </View>
      {visible.map((m, i) => (
        <Row key={m.member_id} item={m} position={i + 1} />
      ))}
    </View>
  );
}
