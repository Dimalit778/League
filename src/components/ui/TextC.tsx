import { useColorScheme } from "@/context/useColorSchema";
import { Text as RNText, TextProps } from "react-native";

const TextC = ({ children, className, ...props }: TextProps) => {
  const { colorScheme } = useColorScheme();

  return (
    <RNText
      className={`${colorScheme === "dark" ? "text-white" : "text-black"} ${className}`}
      {...props}
    >
      {children}
    </RNText>
  );
};

export default TextC;
