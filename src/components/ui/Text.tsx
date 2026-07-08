import { cn } from '@/lib/nativeWind';
import { Text as RNText, TextProps } from 'react-native';

type Variant = 'title' | 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'small';

type FontFamily = 'system' | 'teko' | 'teko-bold';

type Weight = 'regular' | 'semibold' | 'bold';

type VariantShortcutProps = Partial<Record<Variant, boolean>>;

type AppTextProps = TextProps &
  VariantShortcutProps & {
    children: React.ReactNode;
    variant?: Variant;
    weight?: Weight;
    bold?: boolean;
    semibold?: boolean;
    font?: FontFamily;
    className?: string;
  };

const variantClasses: Record<Variant, string> = {
  title: 'text-5xl sm:text-6xl lg:text-7xl leading-[1.15]',

  h1: 'text-3xl sm:text-4xl lg:text-5xl leading-tight',
  h2: 'text-2xl sm:text-3xl lg:text-4xl leading-snug',
  h3: 'text-xl sm:text-2xl lg:text-3xl leading-snug',

  body: 'text-base sm:text-lg leading-6 sm:leading-7',
  caption: 'text-sm sm:text-base leading-5 sm:leading-6',
  small: 'text-xs sm:text-sm leading-4 sm:leading-5',
};

const systemWeightClasses: Record<Weight, string> = {
  regular: 'font-normal',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const customFontClasses: Record<Exclude<FontFamily, 'system'>, string> = {
  teko: 'font-teko',
  'teko-bold': 'font-teko-bold',
};

const variants: Variant[] = ['title', 'h1', 'h2', 'h3', 'body', 'caption', 'small'];

const getVariant = (props: AppTextProps): Variant => {
  return variants.find((variant) => props[variant]) ?? props.variant ?? 'body';
};

export const Text = ({
  children,
  variant,
  title,
  h1,
  h2,
  h3,
  body,
  caption,
  small,
  bold = false,
  semibold = false,
  weight = 'regular',
  font = 'system',
  className,
  style,
  ...rest
}: AppTextProps) => {
  const selectedVariant = getVariant({
    children,
    variant,
    title,
    h1,
    h2,
    h3,
    body,
    caption,
    small,
  });

  const selectedWeight: Weight = bold ? 'bold' : semibold ? 'semibold' : weight;

  const sizeClass = variantClasses[selectedVariant];

  const fontClass = font === 'system' ? systemWeightClasses[selectedWeight] : customFontClasses[font];

  return (
    <RNText {...rest} className={cn('text-text text-left', sizeClass, fontClass, className)} style={style}>
      {children}
    </RNText>
  );
};
