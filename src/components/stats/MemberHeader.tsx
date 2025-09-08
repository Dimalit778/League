import { Tables } from '@/types/database.types';
import { Image, Text, View } from 'react-native';
import Card from '../ui/Card';

interface MemberHeaderProps {
  member: Tables<'league_members'> | null;
}

const MemberHeader = ({ member }: MemberHeaderProps) => {
  return (
    <Card className="p-4 mb-4">
      <View className="flex-row items-center">
        {member?.avatar_url ? (
          <Image
            source={{ uri: member.avatar_url }}
            className="w-16 h-16 rounded-full mr-4"
          />
        ) : (
          <View className="w-16 h-16 rounded-full bg-background border border-border mr-4 items-center justify-center">
            <Text className="text-primary text-2xl font-bold">
              {member?.nickname?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View>
          <Text className="text-text text-xl font-bold">
            {member?.nickname || 'Member'}
          </Text>
        </View>
      </View>
    </Card>
  );
};

export default MemberHeader;
