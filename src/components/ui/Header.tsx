import { useTheme } from "@/context/ThemeContext";
import ThemeToggle from "@/context/ThemeToggle";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeftIcon } from "../../../assets/icons";

type HeaderProps = {
  title: string;
  showBackButton?: boolean;
  rightElement?: React.ReactNode;
  backgroundColor?: string;
  titleColor?: string;
  onBackPress?: () => void;
};

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  rightElement,

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
          {rightElement || <ThemeToggle />}
        </View>
      </View>
    </View>
  );
};

export default Header;
