import { cn } from '@/lib/nativeWind';
import { Text, TextProps } from 'react-native';

type Variant = 'hero' | 'h1' | 'h2' | 'h3' | 'body' | 'bodyBold' | 'caption' | 'small';

const variantClasses: Record<Variant, string> = {
  // Headings
  hero: 'text-4xl sm:text-5xl lg:text-6xl leading-tight',
  h1: 'text-3xl lg:text-4xl leading-tight',
  h2: 'text-2xl lg:text-3xl leading-snug',
  h3: 'text-xl lg:text-2xl leading-snug',

  // Body
  body: 'text-base lg:text-lg leading-[1.65]',
  bodyBold: 'text-base lg:text-lg leading-[1.65]',

  // Secondary
  caption: 'text-sm lg:text-base leading-[1.4]',
  small: 'text-xs lg:text-xs leading-normal',
};

const variantFontClasses: Record<Variant, string> = {
  hero: 'font-nunito-black',
  h1: 'font-nunito-bold',
  h2: 'font-nunito-bold',
  h3: 'font-nunito-bold',
  body: 'font-nunito',
  bodyBold: 'font-nunito-bold',
  caption: 'font-nunito',
  small: 'font-nunito',
};

export const CText = ({
  children,
  variant = 'body',
  bold = false,
  className,
  style,
  ...rest
}: TextProps & {
  children: React.ReactNode;
  variant?: Variant;
  bold?: boolean;
  className?: string;
}) => {
  const sizeClass = variantClasses[variant];
  const fontClass = bold ? 'font-nunito-bold' : variantFontClasses[variant];

  return (
    <Text {...rest} className={cn('text-text text-left', sizeClass, fontClass, className)} style={style}>
      {children}
    </Text>
  );
};
