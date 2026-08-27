import { Text, type AppTextProps } from '@/components/ui/Text';
import { cn } from '@/lib/nativewind/nativeWind';
import { type ReactNode } from 'react';

const BOLD_MARK = /\*\*(.+?)\*\*/g;

export type BoldMarkPart = { type: 'text' | 'bold'; value: string };

export const parseBoldMarks = (text: string): BoldMarkPart[] => {
  const parts: BoldMarkPart[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(BOLD_MARK)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, index) });
    }
    parts.push({ type: 'bold', value: match[1] ?? '' });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return parts;
};

export type FormattedTextProps = AppTextProps & {
  children: string;
};

export const FormattedText = ({ children, className, variant, tone, ...rest }: FormattedTextProps) => {
  const nodes: ReactNode[] = parseBoldMarks(children).map((part, index) =>
    part.type === 'bold' ? (
      <Text key={index} variant={variant} tone={tone} className={cn(className, 'font-semibold')}>
        {part.value}
      </Text>
    ) : (
      part.value
    ),
  );

  return (
    <Text variant={variant} tone={tone} className={className} {...rest}>
      {nodes}
    </Text>
  );
};
