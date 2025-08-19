import { useAppStore } from '@/store/useAppStore';
import { Link, router } from 'expo-router';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const { primaryLeague } = useAppStore();

  const { theme } = useAppStore();
  return (
    <SafeAreaView className="bg-background">
      <View className="flex-row justify-between items-center ">
        <View className="flex-1 justify-center items-start">
          {showBackButton ? (
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => router.back()}
            >
              <ArrowLeftIcon width={30} height={30} color={theme} />
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
                <TrophyIcon
                  width={25}
                  height={25}
                  color={theme === 'dark' ? '#fff' : '#000'}
                />
              </Pressable>
            </Link>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TopBar;
