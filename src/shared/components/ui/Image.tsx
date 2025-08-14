import { Image as ExpoImage, ImageContentFit } from "expo-image";
import { ImageSourcePropType, View } from "react-native";
import { SvgUri } from "react-native-svg";

interface ImageProps {
  source: ImageSourcePropType | string;
  className?: string;
  resizeMode?: "cover" | "contain" | "fill" | "none" | "scale-down";
  width?: number;
  height?: number;
}

const Image = ({
  source,
  className,
  resizeMode = "cover",
  width,
  height,
}: ImageProps) => {
  // Convert resizeMode to contentFit for ExpoImage
  const getContentFit = (): ImageContentFit => {
    switch (resizeMode) {
      case "cover":
        return "cover";
      case "contain":
        return "contain";
      case "fill":
        return "fill";
      case "none":
        return "none";
      case "scale-down":
        return "scale-down";
      default:
        return "cover";
    }
  };
  if (typeof source === "string") {
    if (source.toLowerCase().endsWith(".svg")) {
      return (
        <View className={className} style={{ width, height }}>
          <SvgUri width="100%" height="100%" uri={source} />
        </View>
      );
    }

    return (
      <ExpoImage
        source={{ uri: source }}
        className={className}
        contentFit={getContentFit()}
        style={{ width, height }}
      />
    );
  }

  const imageSource = source;

  return (
    <ExpoImage
      source={imageSource}
      className={className}
      contentFit={getContentFit()}
      style={{ width, height }}
    />
  );
};

export default Image;
