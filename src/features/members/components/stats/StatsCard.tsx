import { Card, Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
}

const StatsCard = ({ title, value = 0, subtitle }: StatsCardProps) => {
  const { t } = useTranslation();
  return (
    <Card className=" flex-1 p-4 justify-center items-center">
      <Text className="text-text text-sm">{t(title)}</Text>
      <Text className="text-secondary text-2xl font-bold mt-1">{value}</Text>
      {subtitle && <Text className="text-muted text-xs mt-1">{t(subtitle)}</Text>}
    </Card>
  );
};

export default StatsCard;
