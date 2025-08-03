import { useColorScheme } from "@/hooks/useColorSchema";
import { Text as RNText, TextProps } from "react-native";

const TextC = ({ children, className, ...props }: TextProps) => {
  const { colorScheme, isDarkColorScheme } = useColorScheme();

  return (
    <RNText
      className={`${isDarkColorScheme ? "text-white" : "text-black"} ${className}`}
      {...props}
    >
      {children}
    </RNText>
  );
};

export default TextC;
