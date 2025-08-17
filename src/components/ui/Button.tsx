import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
}

const Button = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
}: ButtonProps) => {
  const handlePress = () => {
    if (!loading && !disabled) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      className={`px-4 py-2 bg-${variant} rounded-md ${
        disabled || loading ? "opacity-50" : ""
      }`}
      style={[
        styles.button,
        styles[size],
        (disabled || loading) && styles.disabled,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text className="text-background text-base font-bold">{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  sm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 32,
  },
  md: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  lg: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 52,
  },
  disabled: {
    opacity: 0.8,
  },
});

export default Button;
