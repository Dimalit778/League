import { Text, View } from 'react-native';

interface StatItemProps {
  label: string;
  value: string | number;
  color?:
    | 'text-text'
    | 'text-primary'
    | 'text-success'
    | 'text-error'
    | 'text-muted';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function StatItem({
  label,
  value,
  color = 'text-text',
  size = 'md',
  className,
}: StatItemProps) {
  const textSizeClass =
    size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base';

  return (
    <View
      className={`bg-surface border border-border rounded-lg p-2 items-center justify-center ${
        className || ''
      }`}
    >
      <Text className="text-muted text-xs font-semibold uppercase tracking-wide mb-1">
        {label}
      </Text>
      <Text className={`${color} ${textSizeClass} font-bold`}>{value}</Text>
    </View>
  );
}
