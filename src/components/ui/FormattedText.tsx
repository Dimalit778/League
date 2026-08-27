import { Text, type AppTextProps } from '@/components/ui/Text';
import { cn } from '@/lib/nativewind/nativeWind';
import { type ReactNode } from 'react';
import { parseBoldMarks } from './parseBoldMarks';

export type FormattedTextProps = AppTextProps & {
  children: string;
};

export const FormattedText = ({ children, className, variant, tone, ...rest }: FormattedTextProps) => {
  // Keys are derived from the source offset (not the array index): each fragment
  // starts at a distinct position, so keys stay stable and unique.
  let offset = 0;
  const nodes: ReactNode[] = parseBoldMarks(children).map((part) => {
    const key = `${part.type}-${offset}`;
    offset += part.type === 'bold' ? part.value.length + 4 : part.value.length;
    return part.type === 'bold' ? (
      <Text key={key} variant={variant} tone={tone} className={cn(className, 'font-semibold')}>
        {part.value}
      </Text>
    ) : (
      part.value
    );
  });

  return (
    <Text variant={variant} tone={tone} className={className} {...rest}>
      {nodes}
    </Text>
  );
};
