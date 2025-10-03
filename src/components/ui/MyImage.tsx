import { Image as ExpoImage, ImageContentFit } from 'expo-image';
import { useMemo, useState } from 'react';
import {
  DimensionValue,
  ImageStyle,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { SvgUri } from 'react-native-svg';

type CachePolicy = 'none' | 'memory' | 'disk' | 'memory-disk';

type Src = string | number | { uri: string; headers?: Record<string, string> }; // supports auth headers

interface ImageCProps {
  source: Src;
  className?: string;
  resizeMode?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  width?: DimensionValue;
  height?: DimensionValue;
  transition?: number;
  cachePolicy?: CachePolicy;
  priority?: 'low' | 'normal' | 'high';
  forceSvg?: boolean;
  placeholder?: any;
  fallbackSource?: Src;
}

const MyImage = ({
  source,
  className,
  resizeMode = 'contain',
  width,
  height,
  transition = 120,
  cachePolicy = 'disk',
  priority = 'normal',
  forceSvg = false,
  placeholder,
  fallbackSource,
}: ImageCProps) => {
  const [failed, setFailed] = useState(false);

  const contentFit: ImageContentFit = useMemo(() => {
    switch (resizeMode) {
      case 'contain':
      case 'cover':
      case 'fill':
      case 'none':
      case 'scale-down':
        return resizeMode;
      default:
        return 'cover';
    }
  }, [resizeMode]);

  // Normalize to a URI string when available
  const uri =
    typeof source === 'string'
      ? source
      : typeof source === 'object' && 'uri' in source
        ? source.uri
        : undefined;

  // Robust SVG detection (string URL, {uri}, or data URI)
  const isSvg =
    forceSvg ||
    (typeof uri === 'string' &&
      (uri.toLowerCase().includes('.svg') ||
        uri.startsWith('data:image/svg+xml')));

  // Only inject size style if provided (so NativeWind className can control size)
  const sizeStyle: StyleProp<ImageStyle> =
    width !== undefined || height !== undefined ? { width, height } : undefined;

  // Build expo-image source without clobbering require(...) or headers
  const expoSource = useMemo(() => {
    if (typeof source === 'string') return { uri: source };
    if (typeof source === 'number') return source as any; // require('...') needs type assertion
    // object with { uri, headers? }
    return source;
  }, [source]);

  // Stable recycling key helps lists (ignore cache-busting query params if you want)
  const recyclingKey =
    typeof uri === 'string' ? uri /* or uri.split('?')[0] */ : undefined;

  if (isSvg && uri) {
    // Render SVG via react-native-svg (no caching; wrap to size)
    return (
      <View className={className} style={sizeStyle as StyleProp<ViewStyle>}>
        <SvgUri uri={uri} width="100%" height="100%" />
      </View>
    );
  }

  // Fallback if the first render failed
  const finalSource = failed && fallbackSource ? fallbackSource : expoSource;

  return (
    <ExpoImage
      source={finalSource}
      className={className}
      contentFit={contentFit}
      transition={transition}
      cachePolicy={cachePolicy}
      priority={priority}
      recyclingKey={recyclingKey}
      placeholder={placeholder}
      onError={() => setFailed(true)}
      style={sizeStyle}
      // headers can also be passed inside the { uri, headers } object if needed
    />
  );
};

export default MyImage;
