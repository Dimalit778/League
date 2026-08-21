import { Image as ExpoImage, ImageContentFit } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { DimensionValue, ImageStyle, StyleProp, View, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

const svgXmlCache = new Map<string, string>();
const svgXmlFetches = new Map<string, Promise<string>>();

async function loadSvgXml(uri: string): Promise<string> {
  const cached = svgXmlCache.get(uri);
  if (cached !== undefined) return cached;

  let request = svgXmlFetches.get(uri);
  if (!request) {
    request = fetch(uri).then(async (response) => {
      if (!response.ok) {
        throw new Error(`SVG fetch failed (${response.status})`);
      }
      return response.text();
    });
    svgXmlFetches.set(uri, request);
  }

  try {
    const xml = await request;
    svgXmlCache.set(uri, xml);
    return xml;
  } finally {
    svgXmlFetches.delete(uri);
  }
}

function useSvgXml(uri: string | undefined) {
  const [xml, setXml] = useState<string | null>(uri ? (svgXmlCache.get(uri) ?? null) : null);

  useEffect(() => {
    if (!uri) {
      setXml(null);
      return;
    }

    const cached = svgXmlCache.get(uri);
    if (cached !== undefined) {
      setXml(cached);
      return;
    }

    let cancelled = false;
    loadSvgXml(uri)
      .then((text) => {
        if (!cancelled) setXml(text);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [uri]);

  return xml;
}

type CachePolicy = 'none' | 'memory' | 'disk' | 'memory-disk';

type Src = string | number | { uri: string; headers?: Record<string, string> }; // supports auth headers

interface ImageCProps {
  source: Src;
  className?: string;
  contentFit?: ImageContentFit;
  width?: DimensionValue;
  height?: DimensionValue;
  transition?: number;
  cachePolicy?: CachePolicy;
  priority?: 'low' | 'normal' | 'high';
  forceSvg?: boolean;
  placeholder?: any;
  fallbackSource?: Src;
  tintColor?: string;
}

export const MyImage = ({
  source,
  className,
  tintColor,
  contentFit,
  width = '100%',
  height = '100%',
  transition = 120,
  cachePolicy = 'disk',
  priority = 'normal',
  forceSvg = false,
  placeholder,
  fallbackSource,
}: ImageCProps) => {
  const [failed, setFailed] = useState(false);

  // Normalize to a URI string when available
  const uri =
    typeof source === 'string' ? source : typeof source === 'object' && 'uri' in source ? source.uri : undefined;

  // ExpoImage's native SVG coders drop percentage-based fills (Brazil flag's
  // green rect uses x/y="-50%"). Prefer SvgUri for .svg URLs; forceSvg still
  // covers non-.svg URIs that need the same path.
  const isSvg =
    typeof uri === 'string' && (forceSvg || uri.toLowerCase().includes('.svg') || uri.startsWith('data:image/svg+xml'));

  // Only inject size style if provided (so NativeWind className can control size)
  const sizeStyle: StyleProp<ImageStyle> = width !== undefined || height !== undefined ? { width, height } : undefined;

  // Build expo-image source without clobbering require(...) or headers
  const expoSource = useMemo(() => {
    if (typeof source === 'string') return { uri: source };
    if (typeof source === 'number') return source as any; // require('...') needs type assertion
    // object with { uri, headers? }
    return source;
  }, [source]);

  // Stable recycling key helps lists (ignore cache-busting query params if you want)
  const recyclingKey = typeof uri === 'string' ? uri /* or uri.split('?')[0] */ : undefined;
  const svgPreserveAspectRatio = contentFit === 'fill' ? 'none' : contentFit === 'cover' ? 'xMidYMid slice' : undefined;

  const svgXml = useSvgXml(isSvg ? uri : undefined);

  if (isSvg && uri) {
    return (
      <View className={className} style={sizeStyle as StyleProp<ViewStyle>}>
        {svgXml ? (
          <SvgXml xml={svgXml} width="100%" height="100%" preserveAspectRatio={svgPreserveAspectRatio} />
        ) : null}
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
      tintColor={tintColor}

      // headers can also be passed inside the { uri, headers } object if needed
    />
  );
};
