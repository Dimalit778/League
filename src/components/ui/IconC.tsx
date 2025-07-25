import React from "react";
import { Image, StyleSheet } from "react-native";

interface MyIconProps {
  icon: any; // You might want to use a more specific type here
  color?: string;
  size: number;
  bRadius?: number;
}
interface CustomIconProps {
  size?: number;
  round?: boolean;
  style?: any; // Replace with a more specific type if available
  [key: string]: any; // This allows for any additional props
}
const CustomIcon: React.FC<CustomIconProps> = ({
  size,
  round,
  style,
  ...props
}) => {
  const iconStyle = StyleSheet.create({
    icon: {
      width: size,
      height: size,
      borderRadius: round ? size! / 2 : 0,
    },
  });

  return <Image style={[iconStyle.icon, style]} {...props} />;
};

const IconC: React.FC<MyIconProps> = ({ icon, color, size, bRadius }) => (
  <CustomIcon
    source={icon}
    resizeMode="contain"
    style={{
      width: size,
      height: size,
      borderRadius: bRadius,
      ...(color && { tintColor: color }),
    }}
  />
);

export default IconC;
