import { useTheme } from "@/providers/ThemeProvider";
import { Link, router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeftIcon, TrophyIcon } from "../../../../assets/icons";

type TopBarProps = {
  title?: string;
  showBackButton?: boolean;
  backgroundColor?: string;
  titleColor?: string;
  onBackPress?: () => void;
};

const TopBar: React.FC<TopBarProps> = ({
  title,
  showBackButton = false,
  onBackPress,
}) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: theme.theme === "dark" ? "#000" : "#fff",
      }}
    >
      <View className="flex-row justify-between items-center bg-border px-5 py-2">
        <View className="flex-1 justify-center items-start">
          {showBackButton ? (
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => router.back()}
            >
              <ArrowLeftIcon width={30} height={30} color={theme.theme} />
            </TouchableOpacity>
          ) : (
            <View className="flex-1" />
          )}
        </View>

        {/* Center - Title */}
        <View className="flex-1 justify-center items-center">
          <Text className="text-2xl font-semibold text-text" numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Right side - Custom element or spacer */}
        <View className="flex-1 justify-center items-end">
          <Link href="/leagues" asChild>
            <TrophyIcon width={25} height={25} color={theme.theme} />
          </Link>
        </View>
      </View>
    </View>
  );
};

export default TopBar;
