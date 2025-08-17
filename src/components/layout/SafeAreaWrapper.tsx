import React from "react";
import { SafeAreaView, StatusBar } from "react-native";

const SafeAreaWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="light-content" />
      {children}
    </SafeAreaView>
  );
};

export default SafeAreaWrapper;
