import { useLeagueStore } from '@/store/LeagueStore';
import { useThemeStore } from '@/store/ThemeStore';
import { Link, router } from 'expo-router';
import {
  Pressable,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ArrowLeftIcon, TrophyIcon } from '../../../assets/icons';

type TopBarProps = {
  showTitle?: boolean;
  showLeaguesIcon?: boolean;
  showBackButton?: boolean;
  backgroundColor?: string;
  titleColor?: string;
  onBackPress?: () => void;
};

const TopBar = ({
  showTitle = false,
  showLeaguesIcon = false,
  showBackButton = false,
}: TopBarProps) => {
  const { primaryLeague } = useLeagueStore();
  const { theme } = useThemeStore();

  return (
    <SafeAreaView className="bg-background">
      <View className="flex-row justify-between items-center px-5 py-2">
        <View className="flex-1 justify-center items-start">
          {showBackButton ? (
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => router.back()}
            >
              <ArrowLeftIcon size={24} color={theme} />
            </TouchableOpacity>
          ) : (
            <View className="flex-1" />
          )}
        </View>

        {/* Center - Title */}
        <View className="flex-grow justify-center items-center">
          {showTitle && (
            <Text
              className="text-3xl font-semibold text-primary"
              numberOfLines={1}
            >
              {primaryLeague?.name}
            </Text>
          )}
        </View>

        {/* Right side - Custom element or spacer */}
        <View className="flex-grow justify-center items-end">
          {showLeaguesIcon && (
            <Link href="/myLeagues" asChild>
              <Pressable>
                <TrophyIcon size={24} color={theme} />
              </Pressable>
            </Link>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TopBar;
