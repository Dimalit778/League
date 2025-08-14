import { themes } from "@/styles/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { colorScheme } from "nativewind";
import React, { createContext, useContext, useEffect, useState } from "react";
import { View } from "react-native";

interface ThemeProviderProps {
  children: React.ReactNode;
}

type ThemeContextType = {
  theme: "light" | "dark";
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme");
        if (savedTheme === "light" || savedTheme === "dark") {
          setCurrentTheme(savedTheme);
          colorScheme.set(savedTheme);
        }
      } catch (error) {
        console.error("Failed to load theme from storage:", error);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    try {
      await AsyncStorage.setItem("theme", newTheme);
      setCurrentTheme(newTheme);
      colorScheme.set(newTheme);
    } catch (error) {
      console.error("Failed to save theme to storage:", error);
      setCurrentTheme(newTheme);
      colorScheme.set(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
      <StatusBar style={currentTheme === "dark" ? "light" : "dark"} />
      <View style={themes[currentTheme]} className="flex-1 ">
        {children}
      </View>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
