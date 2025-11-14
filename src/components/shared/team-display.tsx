import { Tables } from '@/types/database.types';
import { Image as ExpoImage } from 'expo-image';
import { memo } from 'react';
import { Text, View } from 'react-native';

type Team = Tables<'teams'>;

interface TeamDisplayProps {
  team: Team;
  logoSize: number;
  textSize?: 'xs' | 'sm';
  marginBottom?: 'sm' | 'md';
}

const TeamDisplay = memo(
  ({
    team,
    logoSize,
    textSize = 'sm',
    marginBottom = 'md',
  }: TeamDisplayProps) => {
    const textSizeClass = textSize === 'xs' ? 'text-xs' : 'text-sm';
    const marginBottomClass = marginBottom === 'sm' ? 'mb-1.5' : 'mb-2';

    return (
      <View className="flex-1 items-center">
        <View className={marginBottomClass}>
          <ExpoImage
            source={team.logo}
            style={{ width: logoSize, height: logoSize }}
            cachePolicy="memory-disk"
            contentFit="contain"
            transition={0}
            priority="high"
          />
        </View>
        <Text
          className={`text-text ${textSizeClass} font-semibold text-center px-1`}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {team.shortName}
        </Text>
      </View>
    );
  }
);

TeamDisplay.displayName = 'TeamDisplay';

export default TeamDisplay;
