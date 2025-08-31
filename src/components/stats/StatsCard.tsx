import { Text } from 'react-native';
import Card from '../ui/Card';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  className?: string;
}

const StatsCard = ({ title, value, subtitle, className }: StatsCardProps) => {
  return (
    <Card className={`p-4 ${className || ''}`}>
      <Text className="text-text text-sm">{title}</Text>
      <Text className="text-secondary text-2xl font-bold mt-1">{value}</Text>
      {subtitle && <Text className="text-muted text-xs mt-1">{subtitle}</Text>}
    </Card>
  );
};

export default StatsCard;
